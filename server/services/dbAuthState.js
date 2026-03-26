const { proto, initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys');
const { dbRun, dbGet, dbAll } = require('../config/database');

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  await dbRun(`CREATE TABLE IF NOT EXISTS wa_auth_state (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    data_key VARCHAR(255) NOT NULL,
    data_value LONGTEXT NOT NULL,
    UNIQUE KEY uq_tenant_key (tenant_id, data_key),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  )`);
  tableCreated = true;
}

async function useDbAuthState(tenantId) {
  await ensureTable();

  // Read or init creds
  const credsRow = await dbGet(
    'SELECT data_value FROM wa_auth_state WHERE tenant_id = ? AND data_key = ?',
    [tenantId, 'creds']
  );
  let creds = credsRow
    ? JSON.parse(credsRow.data_value, BufferJSON.reviver)
    : initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const result = {};
          for (const id of ids) {
            const row = await dbGet(
              'SELECT data_value FROM wa_auth_state WHERE tenant_id = ? AND data_key = ?',
              [tenantId, `${type}-${id}`]
            );
            if (row) {
              let value = JSON.parse(row.data_value, BufferJSON.reviver);
              if (type === 'app-state-sync-key') {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              result[id] = value;
            }
          }
          return result;
        },
        set: async (data) => {
          for (const [type, entries] of Object.entries(data)) {
            for (const [id, value] of Object.entries(entries)) {
              const key = `${type}-${id}`;
              if (value) {
                const json = JSON.stringify(value, BufferJSON.replacer);
                await dbRun(
                  'INSERT INTO wa_auth_state (tenant_id, data_key, data_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)',
                  [tenantId, key, json]
                );
              } else {
                await dbRun(
                  'DELETE FROM wa_auth_state WHERE tenant_id = ? AND data_key = ?',
                  [tenantId, key]
                );
              }
            }
          }
        }
      }
    },
    saveCreds: async () => {
      const json = JSON.stringify(creds, BufferJSON.replacer);
      await dbRun(
        'INSERT INTO wa_auth_state (tenant_id, data_key, data_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)',
        [tenantId, 'creds', json]
      );
    }
  };
}

module.exports = { useDbAuthState };
