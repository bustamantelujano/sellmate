const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

let pool = null;
let initPromise = null;

async function initDb() {
  if (pool) return pool;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Heroku JawsDB provides JAWSDB_MARIA_URL
    const dbUrl = process.env.JAWSDB_MARIA_URL || process.env.DATABASE_URL;

    if (dbUrl) {
      pool = mysql.createPool(dbUrl + '?waitForConnections=true&connectionLimit=5&multipleStatements=true&dateStrings=true&charset=utf8mb4');
    } else {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sellmate',
        waitForConnections: true,
        connectionLimit: 5,
        multipleStatements: true,
        dateStrings: true,
        charset: 'utf8mb4',
      });
    }

    // Run schema
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const statements = schema.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      try { await pool.execute(stmt + ';'); } catch (e) { /* ignore already exists */ }
    }

    // ===== MIGRATIONS for existing databases =====
    const migrations = [
      "ALTER TABLE settings ADD COLUMN whitelist_mode VARCHAR(20) NOT NULL DEFAULT 'all'",
      "ALTER TABLE conversations ADD COLUMN topic TEXT DEFAULT NULL",
      "ALTER TABLE messages ADD COLUMN image_data LONGTEXT DEFAULT NULL",
      "ALTER TABLE settings ADD COLUMN online_status TINYINT(1) NOT NULL DEFAULT 1",
      // Multi-tenant migrations
      "ALTER TABLE users ADD COLUMN tenant_id INT, ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
      "ALTER TABLE users ADD COLUMN super_admin TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE products ADD COLUMN tenant_id INT, ADD CONSTRAINT fk_products_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
      "ALTER TABLE whitelist ADD COLUMN tenant_id INT, ADD CONSTRAINT fk_whitelist_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
      "ALTER TABLE conversations ADD COLUMN tenant_id INT, ADD CONSTRAINT fk_conversations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
      "ALTER TABLE mcp_servers ADD COLUMN tenant_id INT, ADD CONSTRAINT fk_mcp_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
      "ALTER TABLE settings ADD COLUMN tenant_id INT, ADD CONSTRAINT fk_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
      "ALTER TABLE business_info ADD COLUMN tenant_id INT, ADD CONSTRAINT fk_biz_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)",
      // Module system migrations
      "ALTER TABLE settings ADD COLUMN business_type VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE settings ADD COLUMN setup_completed TINYINT(1) NOT NULL DEFAULT 0",
      // utf8mb4 for emoji support
      "ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE conversations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE business_info CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE clients CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE settings ADD COLUMN bot_always_on TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE appointments ADD COLUMN confirm_token VARCHAR(64) DEFAULT NULL",
      "ALTER TABLE appointments ADD COLUMN confirmed_at DATETIME DEFAULT NULL",
      // AI keys migration
      `CREATE TABLE IF NOT EXISTS ai_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        label VARCHAR(255) NOT NULL DEFAULT '',
        provider VARCHAR(20) NOT NULL DEFAULT 'openai',
        api_key VARCHAR(500) NOT NULL,
        custom_endpoint VARCHAR(500) DEFAULT '',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        INDEX idx_ai_keys_tenant (tenant_id)
      )`,
      // AI favorite models
      `CREATE TABLE IF NOT EXISTS ai_models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        ai_key_id INT NOT NULL,
        model VARCHAR(100) NOT NULL,
        label VARCHAR(255) NOT NULL DEFAULT '',
        is_active TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (ai_key_id) REFERENCES ai_keys(id) ON DELETE CASCADE,
        INDEX idx_ai_models_tenant (tenant_id)
      )`,
      // Migrate old ai_keys data (if model column exists) to new ai_models table
      // Drop old columns from ai_keys if they exist
      "ALTER TABLE ai_keys DROP COLUMN model",
      "ALTER TABLE ai_keys DROP COLUMN is_active",
      // Refresh tokens for secure session management
      `CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tenant_id INT DEFAULT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_rt_token (token),
        INDEX idx_rt_user (user_id)
      )`,
    ];
    for (const sql of migrations) {
      try { await pool.execute(sql); } catch (e) { /* already exists */ }
    }

    // Migrate existing single-tenant data to multi-tenant
    try {
      await migrateToMultiTenant();
    } catch (e) {
      console.error('Migration error (non-fatal):', e.message);
    }

    return pool;
  })();

  return initPromise;
}

/**
 * Migrates existing single-tenant data to multi-tenant format.
 * Creates a "default" tenant and assigns all orphaned data to it.
 * Safe to run multiple times - idempotent.
 */
async function migrateToMultiTenant() {
  const orphanUsers = await dbAll('SELECT id, name, email, role FROM users WHERE tenant_id IS NULL');
  if (orphanUsers.length === 0) return;

  console.log(`Found ${orphanUsers.length} orphan user(s), starting multi-tenant migration...`);

  let tenant = await dbGet("SELECT id FROM tenants WHERE slug = 'mi-negocio'");
  let tenantId;

  if (tenant) {
    tenantId = tenant.id;
    console.log(`Using existing default tenant ID: ${tenantId}`);
  } else {
    let oldBusiness = null;
    try { oldBusiness = await dbGet('SELECT * FROM business_info WHERE id = 1'); } catch (e) {}

    const admin = (await dbGet("SELECT id, name, email FROM users WHERE role = 'admin' LIMIT 1")) || orphanUsers[0];

    const tenantResult = await dbRun(
      "INSERT INTO tenants (slug, name, owner_user_id) VALUES (?, ?, ?)",
      ['mi-negocio', oldBusiness?.name || 'Mi Negocio', admin.id]
    );
    tenantId = tenantResult.lastInsertRowid;
    console.log(`Created default tenant ID: ${tenantId}`);
  }

  const admin = await dbGet("SELECT id FROM users WHERE role = 'admin' AND tenant_id IS NULL LIMIT 1");
  if (admin) {
    try { await dbRun('UPDATE users SET super_admin = 1, tenant_id = ? WHERE id = ?', [tenantId, admin.id]); } catch (e) {}
  }
  try { await dbRun('UPDATE users SET tenant_id = ? WHERE tenant_id IS NULL', [tenantId]); } catch (e) {}

  const tables = ['products', 'conversations', 'whitelist', 'mcp_servers'];
  for (const table of tables) {
    try { await dbRun(`UPDATE ${table} SET tenant_id = ? WHERE tenant_id IS NULL`, [tenantId]); } catch (e) {}
  }

  try {
    const settingsWithTenant = await dbGet('SELECT id FROM settings WHERE tenant_id = ?', [tenantId]);
    if (!settingsWithTenant) {
      const oldSettings = await dbGet('SELECT id FROM settings WHERE tenant_id IS NULL LIMIT 1');
      if (oldSettings) {
        await dbRun('UPDATE settings SET tenant_id = ? WHERE id = ?', [tenantId, oldSettings.id]);
        console.log('Migrated existing settings row to tenant');
      } else {
        await dbRun('INSERT INTO settings (tenant_id) VALUES (?)', [tenantId]);
        console.log('Created new settings for tenant');
      }
    }
  } catch (e) {
    console.warn('Settings migration:', e.message);
  }

  try {
    const bizWithTenant = await dbGet('SELECT id FROM business_info WHERE tenant_id = ?', [tenantId]);
    if (!bizWithTenant) {
      const oldBiz = await dbGet('SELECT id FROM business_info WHERE tenant_id IS NULL LIMIT 1');
      if (oldBiz) {
        await dbRun('UPDATE business_info SET tenant_id = ? WHERE id = ?', [tenantId, oldBiz.id]);
        console.log('Migrated existing business_info row to tenant');
      } else {
        await dbRun('INSERT INTO business_info (tenant_id, name) VALUES (?, ?)', [tenantId, 'Mi Negocio']);
        console.log('Created new business_info for tenant');
      }
    }
  } catch (e) {
    console.warn('Business info migration:', e.message);
  }

  console.log(`Migration complete. Default tenant ID: ${tenantId}`);
}

// saveDb is a no-op for MariaDB (persistence is automatic)
function saveDb() {}

async function dbRun(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return { lastInsertRowid: result.insertId || 0, changes: result.affectedRows || 0 };
}

async function dbGet(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
}

async function dbAll(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { initDb, saveDb, dbRun, dbGet, dbAll };
