require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Allowed origins: production domain or localhost in dev
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map(o => o.trim());

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'], credentials: true }
});

app.set('io', io);

// Middleware
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Init database (async) then start server
const { initDb } = require('./config/database');

initDb().then(() => {
  console.log('Database initialized');

  // API Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/business', require('./routes/business'));
  app.use('/api/settings', require('./routes/settings'));
  app.use('/api/conversations', require('./routes/conversations'));
  app.use('/api/copilot', require('./routes/copilot'));
  app.use('/api/appointments', require('./routes/appointments'));
  app.use('/api/followups', require('./routes/followups'));
  app.use('/api/modules', require('./routes/modules'));
  app.use('/api/usage', require('./routes/usage'));
  app.use('/api/clients', require('./routes/clients'));
  app.use('/api/orders', require('./routes/orders'));

  // WhatsApp routes (tenant-aware)
  const { authMiddleware, adminOnly, requireTenant } = require('./middleware/auth');
  const { whatsappManager } = require('./services/whatsapp');

  app.post('/api/whatsapp/connect', authMiddleware, adminOnly, requireTenant, (req, res) => {
    try {
      // freshStart: true clears stale auth files so Baileys generates a new QR
      whatsappManager.connectWhatsApp(req.tenantId, { freshStart: true });
      res.json({ status: 'connecting' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/whatsapp/disconnect', authMiddleware, adminOnly, requireTenant, async (req, res) => {
    try {
      await whatsappManager.disconnect(req.tenantId);
      res.json({ status: 'disconnected' });
    } catch (err) {
      res.json({ status: 'disconnected' });
    }
  });

  app.get('/api/whatsapp/status', authMiddleware, requireTenant, (req, res) => {
    res.json({ status: whatsappManager.getStatus(req.tenantId) });
  });

  app.get('/api/whatsapp/qr', authMiddleware, requireTenant, (req, res) => {
    const qr = whatsappManager.getLastQr(req.tenantId);
    res.json({ qr: qr || '' });
  });

  // Socket.IO
  const { setupSocket } = require('./services/socket');
  whatsappManager.setIO(io);
  setupSocket(io);

  // Initialize MCP servers for all active tenants
  const { mcpManager } = require('./services/mcp');
  mcpManager.initAll().then(() => {
    console.log('MCP servers initialized');
  }).catch(err => {
    console.warn('MCP initialization error (non-fatal):', err.message);
  });

  // Auto-reconnect WhatsApp for tenants that were connected
  whatsappManager.autoReconnectAll();

  // Follow-up cron: run every hour to check and send follow-ups
  const { processAllFollowUps } = require('./services/followups');
  setInterval(async () => {
    try {
      const sent = await processAllFollowUps();
      if (sent > 0) console.log(`Follow-up cron: sent ${sent} messages`);
    } catch (err) {
      console.error('Follow-up cron error:', err.message);
    }
  }, 60 * 60 * 1000); // Every hour

  // Serve Vue.js frontend in production
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`SellMate server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
