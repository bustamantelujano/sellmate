-- ===== MULTI-TENANT SCHEMA (MariaDB) =====

-- Tenants (cada negocio es un tenant)
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  owner_user_id INT,
  plan VARCHAR(20) NOT NULL DEFAULT 'free',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users (pertenecen a un tenant, o son super_admin globales)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'agent',
  super_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Products (per-tenant)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DOUBLE NOT NULL DEFAULT 0,
  category VARCHAR(255),
  image_url TEXT,
  stock INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Business info (per-tenant, one row per tenant)
CREATE TABLE IF NOT EXISTS business_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT DEFAULT NULL,
  address TEXT DEFAULT NULL,
  phone VARCHAR(50) DEFAULT '',
  hours TEXT DEFAULT NULL,
  policies TEXT DEFAULT NULL,
  extra_info TEXT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Settings (per-tenant, one row per tenant)
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL UNIQUE,
  bot_name VARCHAR(255) NOT NULL DEFAULT 'SellMate',
  friendliness INT NOT NULL DEFAULT 7,
  greeting_message TEXT DEFAULT NULL,
  farewell_message TEXT DEFAULT NULL,
  ai_provider VARCHAR(20) NOT NULL DEFAULT 'openai' /* openai, anthropic, gemini, custom */,
  ai_api_key VARCHAR(500) DEFAULT '',
  ai_model VARCHAR(100) DEFAULT 'gpt-4o-mini',
  ai_custom_endpoint VARCHAR(500) DEFAULT '',
  whatsapp_connected TINYINT(1) NOT NULL DEFAULT 0,
  whitelist_mode VARCHAR(20) NOT NULL DEFAULT 'all',
  online_status TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Whitelist (per-tenant)
CREATE TABLE IF NOT EXISTS whitelist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  label VARCHAR(255) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_whitelist_tenant_phone (tenant_id, phone_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Conversations (per-tenant)
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  contact_name VARCHAR(255) DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'bot',
  topic TEXT DEFAULT NULL,
  assigned_agent_id INT,
  last_message_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_conversations_tenant_phone (tenant_id, phone_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
);

-- Messages (linked via conversation, no direct tenant_id needed)
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender VARCHAR(20) NOT NULL,
  sender_name VARCHAR(255) DEFAULT '',
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text',
  image_data LONGTEXT DEFAULT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  INDEX idx_messages_conversation (conversation_id)
);

-- WhatsApp session (kept for legacy)
CREATE TABLE IF NOT EXISTS whatsapp_session (
  id VARCHAR(255) PRIMARY KEY,
  data LONGTEXT NOT NULL
);

-- Appointments (citas per-tenant)
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  conversation_id INT,
  phone_number VARCHAR(50) NOT NULL,
  contact_name VARCHAR(255) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  notes TEXT DEFAULT NULL,
  created_by VARCHAR(20) NOT NULL DEFAULT 'bot',
  created_by_user_id INT,
  reminder_sent TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  INDEX idx_appointments_tenant_date (tenant_id, date),
  INDEX idx_appointments_phone (tenant_id, phone_number)
);

-- Follow-ups / Fidelizacion (per-tenant)
CREATE TABLE IF NOT EXISTS follow_up_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL DEFAULT 'days_after_last_contact',
  delay_days INT NOT NULL DEFAULT 15,
  message_template TEXT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  target_audience VARCHAR(30) NOT NULL DEFAULT 'all',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS follow_up_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  rule_id INT NOT NULL,
  conversation_id INT NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  message_sent TEXT NOT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  response_received TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (rule_id) REFERENCES follow_up_rules(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  INDEX idx_follow_up_log_tenant (tenant_id, sent_at)
);

-- MCP Servers (per-tenant)
CREATE TABLE IF NOT EXISTS mcp_servers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  transport VARCHAR(20) NOT NULL DEFAULT 'stdio',
  command VARCHAR(500) DEFAULT '',
  args TEXT DEFAULT NULL,
  url VARCHAR(500) DEFAULT '',
  env_vars TEXT DEFAULT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Tenant modules (which features are enabled per tenant)
CREATE TABLE IF NOT EXISTS tenant_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  module_key VARCHAR(50) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  config TEXT DEFAULT NULL,
  UNIQUE KEY uq_tenant_module (tenant_id, module_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- AI usage tracking per tenant
CREATE TABLE IF NOT EXISTS ai_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  cost_estimate DOUBLE NOT NULL DEFAULT 0,
  request_type VARCHAR(50) NOT NULL DEFAULT 'chat',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  INDEX idx_ai_usage_tenant_date (tenant_id, created_at)
);

-- Clients / Contacts per tenant
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT NULL,
  tags VARCHAR(500) DEFAULT '',
  total_conversations INT NOT NULL DEFAULT 0,
  total_orders INT NOT NULL DEFAULT 0,
  last_contact_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_client_tenant_phone (tenant_id, phone_number),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
