const { default: makeWASocket, DisconnectReason, makeCacheableSignalKeyStore, Browsers, downloadMediaMessage, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { dbRun, dbAll, dbGet } = require('../config/database');
const { useDbAuthState } = require('./dbAuthState');
const { handleIncomingMessage } = require('./bot');
const QRCode = require('qrcode');
const pino = require('pino');

const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * WhatsApp Manager - manages per-tenant Baileys connections.
 * Each tenant has its own socket, auth directory, QR state, etc.
 */
class WhatsAppManager {
  constructor() {
    // Map<tenantId, { sock, status, lastQr, reconnectAttempts }>
    this.connections = new Map();
    // Map<tenantId, Map<lid, phoneJid>> - LID to phone number cache
    this.lidCache = new Map();
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  _getConn(tenantId) {
    if (!this.connections.has(tenantId)) {
      this.connections.set(tenantId, {
        sock: null,
        status: 'disconnected',
        lastQr: '',
        reconnectAttempts: 0
      });
    }
    return this.connections.get(tenantId);
  }

  async _clearAuthDb(tenantId) {
    try {
      await dbRun('DELETE FROM wa_auth_state WHERE tenant_id = ?', [tenantId]);
      console.log(`[WA:${tenantId}] Cleared auth state from database`);
      return true;
    } catch (e) {
      console.error(`[WA:${tenantId}] Error clearing auth state:`, e.message);
    }
    return false;
  }

  getStatus(tenantId) {
    return this._getConn(tenantId).status;
  }

  getLastQr(tenantId) {
    return this._getConn(tenantId).lastQr;
  }

  /**
   * Auto-reconnect all tenants that had WhatsApp connected.
   * Uses existing auth files (NOT fresh start).
   */
  async autoReconnectAll() {
    const connectedTenants = await dbAll('SELECT tenant_id FROM settings WHERE whatsapp_connected = 1');
    for (const row of connectedTenants) {
      if (row.tenant_id) {
        console.log(`[WA:${row.tenant_id}] Auto-reconnecting...`);
        this.connectWhatsApp(row.tenant_id, { freshStart: false });
      }
    }
  }

  /**
   * Connect WhatsApp for a tenant.
   * @param {number} tenantId
   * @param {object} options
   * @param {boolean} options.freshStart - if true, clears auth + kills existing socket first
   */
  connectWhatsApp(tenantId, { freshStart = false } = {}) {
    const conn = this._getConn(tenantId);

    // If freshStart, force-kill any existing connection first
    if (freshStart) {
      console.log(`[WA:${tenantId}] Fresh start requested, killing existing connection...`);
      if (conn.sock) {
        try {
          conn.sock.ev.removeAllListeners();
          conn.sock.end();
        } catch (e) {}
        conn.sock = null;
      }
      conn.status = 'disconnected';
      conn.lastQr = '';
      conn.reconnectAttempts = 0;
      this._clearAuthDb(tenantId);
    } else {
      // Not fresh start: skip if already connecting/connected
      if (conn.status === 'connecting' || conn.status === 'connected') {
        console.log(`[WA:${tenantId}] Already ${conn.status}, skipping`);
        return;
      }
    }

    conn.status = 'connecting';
    conn.lastQr = '';
    conn.reconnectAttempts = 0;
    this._emitStatus(tenantId);

    console.log(`[WA:${tenantId}] Starting connection (freshStart=${freshStart})...`);

    this._setupConnection(tenantId).catch(err => {
      console.error(`[WA:${tenantId}] Setup failed:`, err.message);
      conn.status = 'disconnected';
      this._emitStatus(tenantId);
      if (this.io) this.io.to(`tenant:${tenantId}`).emit('whatsapp:error', `Error al conectar: ${err.message}`);
    });
  }

  async _setupConnection(tenantId) {
    const conn = this._getConn(tenantId);
    const logger = pino({ level: 'silent' });

    console.log(`[WA:${tenantId}] Loading auth state from database...`);

    const { state, saveCreds } = await useDbAuthState(tenantId);

    // Fetch latest WhatsApp Web version with fallback
    let version;
    try {
      const result = await fetchLatestBaileysVersion();
      version = result.version;
      console.log(`[WA:${tenantId}] Using WA version: ${version.join('.')}`);
    } catch (e) {
      console.warn(`[WA:${tenantId}] Could not fetch latest version, using default`);
      version = undefined; // Let Baileys use its built-in default
    }

    const socketConfig = {
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      browser: Browsers.macOS('Chrome'),
      logger,
      syncFullHistory: true,
      printQRInTerminal: true
    };
    if (version) socketConfig.version = version;

    console.log(`[WA:${tenantId}] Creating socket...`);
    const sock = makeWASocket(socketConfig);
    conn.sock = sock;

    sock.ev.on('creds.update', saveCreds);

    // Build LID → phone cache from contacts
    if (!this.lidCache.has(tenantId)) this.lidCache.set(tenantId, new Map());
    const cache = this.lidCache.get(tenantId);

    const processContacts = (contacts) => {
      for (const c of contacts) {
        // c.id is the phone JID (@s.whatsapp.net), c.lid is the LID JID (@lid)
        if (c.id && c.lid) {
          const lid = c.lid.replace(/@lid$/, '').split(':')[0];
          const phone = c.id.replace(/@s\.whatsapp\.net$/, '').split(':')[0];
          cache.set(lid, phone);
        }
      }
      if (cache.size > 0) console.log(`[WA:${tenantId}] LID cache: ${cache.size} entries`);
    };

    sock.ev.on('contacts.upsert', processContacts);
    sock.ev.on('contacts.update', processContacts);
    sock.ev.on('contacts.set', ({ contacts: c }) => { if (c) processContacts(c); });
    sock.ev.on('messaging-history.set', ({ contacts: c }) => { if (c) processContacts(c); });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      console.log(`[WA:${tenantId}] Connection update:`, { connection, hasQr: !!qr, statusCode: lastDisconnect?.error?.output?.statusCode });

      if (qr) {
        conn.reconnectAttempts = 0;
        conn.status = 'connecting';
        this._emitStatus(tenantId);
        try {
          const qrDataUrl = await QRCode.toDataURL(qr);
          conn.lastQr = qrDataUrl;
          console.log(`[WA:${tenantId}] QR generated, emitting to tenant room (${qrDataUrl.length} chars)`);
          if (this.io) {
            this.io.to(`tenant:${tenantId}`).emit('whatsapp:qr', qrDataUrl);
          }
        } catch (err) {
          console.error(`[WA:${tenantId}] QR generation error:`, err);
        }
      }

      if (connection === 'open') {
        conn.reconnectAttempts = 0;
        conn.status = 'connected';
        conn.lastQr = '';
        try { await dbRun('UPDATE settings SET whatsapp_connected = 1 WHERE tenant_id = ?', [tenantId]); } catch (e) {}
        this._emitStatus(tenantId);
        console.log(`[WA:${tenantId}] Connected successfully!`);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const errorMsg = lastDisconnect?.error?.message || 'Unknown error';
        console.log(`[WA:${tenantId}] Connection closed: statusCode=${statusCode}, error=${errorMsg}`);

        if (conn.sock) {
          try {
            conn.sock.ev.removeAllListeners();
            conn.sock.end();
          } catch (e) {}
          conn.sock = null;
        }

        conn.status = 'disconnected';
        conn.lastQr = '';
        try { await dbRun('UPDATE settings SET whatsapp_connected = 0 WHERE tenant_id = ?', [tenantId]); } catch (e) {}
        this._emitStatus(tenantId);

        if (statusCode === DisconnectReason.loggedOut) {
          conn.reconnectAttempts = 0;
          await this._clearAuthDb(tenantId);
          if (this.io) this.io.to(`tenant:${tenantId}`).emit('whatsapp:error', 'WhatsApp cerró sesión. Reconecta para escanear un nuevo QR.');
          return;
        }

        // Retry for non-loggedOut disconnects
        conn.reconnectAttempts = (conn.reconnectAttempts || 0) + 1;
        if (conn.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          conn.reconnectAttempts = 0;
          if (this.io) this.io.to(`tenant:${tenantId}`).emit('whatsapp:error', 'No se pudo conectar a WhatsApp después de varios intentos.');
          return;
        }

        console.log(`[WA:${tenantId}] Retrying in 5s (attempt ${conn.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(() => {
          conn.status = 'disconnected';
          this.connectWhatsApp(tenantId);
        }, 5000);
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      console.log(`[WA:${tenantId}] messages.upsert event: type=${type}, count=${messages.length}`);
      if (type !== 'notify') return;

      for (const msg of messages) {
        console.log(`[WA:${tenantId}] Message: fromMe=${msg.key.fromMe}, remoteJid=${msg.key.remoteJid}, hasMessage=${!!msg.message}, keys=${msg.message ? Object.keys(msg.message).join(',') : 'none'}`);
        if (msg.key.fromMe) continue;
        if (!msg.message) continue;

        const remoteJid = msg.key.remoteJid;
        // Skip group messages
        if (remoteJid.endsWith('@g.us')) continue;

        const isLid = remoteJid.endsWith('@lid');
        let phoneNumber = remoteJid.replace(/@(s\.whatsapp\.net|lid)$/, '');
        // Strip :device suffix (e.g. "5216672646767:14" → "5216672646767")
        phoneNumber = phoneNumber.split(':')[0];

        // Resolve LID to real phone number using cache
        if (isLid) {
          const cache = this.lidCache.get(tenantId);
          const resolved = cache?.get(phoneNumber);
          if (resolved) {
            console.log(`[WA:${tenantId}] Resolved LID ${phoneNumber} → ${resolved}`);
            phoneNumber = resolved;
          } else {
            console.log(`[WA:${tenantId}] Could not resolve LID ${phoneNumber}, cache has ${cache?.size || 0} entries`);
          }
        }

        // Resolve LID to real phone using senderPn/participantPn fields
        if (isLid) {
          const pn = msg.key.senderPn || msg.key.participantPn;
          if (pn) {
            phoneNumber = pn.replace(/@s\.whatsapp\.net$/, '').split(':')[0];
            console.log(`[WA:${tenantId}] Resolved LID via senderPn: ${phoneNumber}`);
          }
        }
        console.log(`[WA:${tenantId}] Extracted phone: ${phoneNumber}, pushName: ${msg.pushName}, isLid: ${isLid}`);
        const contactName = msg.pushName || '';

        let content = '';
        let messageType = 'text';
        let imageBase64 = null;

        if (msg.message.conversation) {
          content = msg.message.conversation;
        } else if (msg.message.extendedTextMessage) {
          content = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage) {
          content = msg.message.imageMessage.caption || '[Imagen]';
          messageType = 'image';
          try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, {
              logger: pino({ level: 'silent' }),
              reuploadRequest: sock.updateMediaMessage
            });
            const mimetype = msg.message.imageMessage.mimetype || 'image/jpeg';
            imageBase64 = `data:${mimetype};base64,${buffer.toString('base64')}`;
          } catch (downloadErr) {
            console.error('Error downloading image:', downloadErr.message);
          }
        } else if (msg.message.audioMessage) {
          content = '[Audio]';
          messageType = 'audio';
        } else if (msg.message.documentMessage) {
          content = msg.message.documentMessage.fileName || '[Documento]';
          messageType = 'document';
        } else {
          content = '[Mensaje no soportado]';
        }

        const botResponse = await handleIncomingMessage(
          tenantId, phoneNumber, contactName, content, messageType, this.io, msg.key, imageBase64, { isLid }
        );

        if (botResponse && conn.sock) {
          try {
            await conn.sock.sendMessage(msg.key.remoteJid, { text: botResponse });
          } catch (err) {
            console.error('Error sending WhatsApp message:', err);
          }
        }
      }
    });
  }

  async sendMessage(tenantId, phoneNumber, text) {
    const conn = this._getConn(tenantId);
    if (!conn.sock || conn.status !== 'connected') {
      throw new Error('WhatsApp no está conectado');
    }
    const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    await conn.sock.sendMessage(jid, { text });
  }

  async sendPresence(tenantId, phoneNumber, presence) {
    const conn = this._getConn(tenantId);
    if (!conn.sock || conn.status !== 'connected') return;
    try {
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      await conn.sock.presenceSubscribe(jid);
      await conn.sock.sendPresenceUpdate(presence, jid);
    } catch (err) {
      console.error('Presence update error:', err.message);
    }
  }

  async sendReaction(tenantId, phoneNumber, messageKey, emoji) {
    const conn = this._getConn(tenantId);
    if (!conn.sock || conn.status !== 'connected') return;
    try {
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      await conn.sock.sendMessage(jid, { react: { text: emoji, key: messageKey } });
    } catch (err) {
      console.error('Reaction send error:', err.message);
    }
  }

  async disconnect(tenantId) {
    const conn = this._getConn(tenantId);
    try {
      if (conn.sock) {
        conn.sock.ev.removeAllListeners();
        await conn.sock.logout().catch(() => {});
        conn.sock.end();
      }
    } catch (err) {
      console.error('Error during disconnect:', err.message);
    } finally {
      conn.sock = null;
      conn.status = 'disconnected';
      conn.lastQr = '';
      conn.reconnectAttempts = 0;
      try { await dbRun('UPDATE settings SET whatsapp_connected = 0 WHERE tenant_id = ?', [tenantId]); } catch (e) {}
      await this._clearAuthDb(tenantId);
      this._emitStatus(tenantId);
    }
  }

  _emitStatus(tenantId) {
    const conn = this._getConn(tenantId);
    if (this.io) {
      this.io.to(`tenant:${tenantId}`).emit('whatsapp:status', conn.status);
    }
  }
}

const whatsappManager = new WhatsAppManager();

module.exports = { whatsappManager };
