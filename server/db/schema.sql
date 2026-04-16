-- -------------------------------------------------------------
-- TablePlus 6.7.7(649)
--
-- https://tableplus.com/
--
-- Database: unzxode1655kmrsz
-- Generation Time: 2026-04-16 15:10:47.4240
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


CREATE TABLE `ai_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL DEFAULT '',
  `provider` varchar(20) NOT NULL DEFAULT 'openai',
  `api_key` varchar(500) NOT NULL,
  `custom_endpoint` varchar(500) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ai_keys_tenant` (`tenant_id`),
  CONSTRAINT `ai_keys_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `ai_models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `ai_key_id` int(11) NOT NULL,
  `model` varchar(100) NOT NULL,
  `label` varchar(255) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `ai_key_id` (`ai_key_id`),
  KEY `idx_ai_models_tenant` (`tenant_id`),
  CONSTRAINT `ai_models_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `ai_models_ibfk_2` FOREIGN KEY (`ai_key_id`) REFERENCES `ai_keys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `ai_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `model` varchar(100) NOT NULL,
  `input_tokens` int(11) NOT NULL DEFAULT 0,
  `output_tokens` int(11) NOT NULL DEFAULT 0,
  `total_tokens` int(11) NOT NULL DEFAULT 0,
  `cost_estimate` double NOT NULL DEFAULT 0,
  `request_type` varchar(50) NOT NULL DEFAULT 'chat',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ai_usage_tenant_date` (`tenant_id`,`created_at`),
  CONSTRAINT `ai_usage_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `conversation_id` int(11) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `contact_name` varchar(255) DEFAULT '',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 60,
  `status` varchar(20) NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_by` varchar(20) NOT NULL DEFAULT 'bot',
  `created_by_user_id` int(11) DEFAULT NULL,
  `reminder_sent` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `confirm_token` varchar(64) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `reminder_24h_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_1h_sent` tinyint(1) NOT NULL DEFAULT 0,
  `service_type_id` int(11) DEFAULT NULL,
  `recurrence_type` varchar(20) DEFAULT NULL,
  `recurrence_interval` int(11) DEFAULT 1,
  `recurrence_end_date` date DEFAULT NULL,
  `parent_appointment_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  KEY `idx_appointments_tenant_date` (`tenant_id`,`date`),
  KEY `idx_appointments_phone` (`tenant_id`,`phone_number`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `business_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` mediumtext DEFAULT NULL,
  `address` mediumtext DEFAULT NULL,
  `phone` varchar(50) DEFAULT '',
  `hours` mediumtext DEFAULT NULL,
  `policies` mediumtext DEFAULT NULL,
  `extra_info` mediumtext DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `business_info_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `client_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_client_notes_client` (`client_id`),
  CONSTRAINT `client_notes_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `client_notes_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `client_notes_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT '',
  `email` varchar(255) DEFAULT '',
  `notes` mediumtext DEFAULT NULL,
  `tags` varchar(500) DEFAULT '',
  `total_conversations` int(11) NOT NULL DEFAULT 0,
  `total_orders` int(11) NOT NULL DEFAULT 0,
  `last_contact_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `segment` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client_tenant_phone` (`tenant_id`,`phone_number`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `contact_name` varchar(255) DEFAULT '',
  `status` varchar(20) NOT NULL DEFAULT 'bot',
  `topic` mediumtext DEFAULT NULL,
  `assigned_agent_id` int(11) DEFAULT NULL,
  `last_message_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_read_message_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_conversations_tenant_phone` (`tenant_id`,`phone_number`),
  KEY `assigned_agent_id` (`assigned_agent_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`assigned_agent_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `follow_up_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `message_sent` text NOT NULL,
  `sent_at` datetime NOT NULL DEFAULT current_timestamp(),
  `response_received` tinyint(1) NOT NULL DEFAULT 0,
  `response_received_at` datetime DEFAULT NULL,
  `variant_used` varchar(1) DEFAULT 'A',
  PRIMARY KEY (`id`),
  KEY `rule_id` (`rule_id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `idx_follow_up_log_tenant` (`tenant_id`,`sent_at`),
  CONSTRAINT `follow_up_log_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `follow_up_log_ibfk_2` FOREIGN KEY (`rule_id`) REFERENCES `follow_up_rules` (`id`),
  CONSTRAINT `follow_up_log_ibfk_3` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `follow_up_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `trigger_type` varchar(50) NOT NULL DEFAULT 'days_after_last_contact',
  `delay_days` int(11) NOT NULL DEFAULT 15,
  `message_template` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `target_audience` varchar(30) NOT NULL DEFAULT 'all',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `allowed_days` varchar(50) DEFAULT '1,2,3,4,5',
  `allowed_hour_start` int(11) DEFAULT 9,
  `allowed_hour_end` int(11) DEFAULT 18,
  `variant_b` text DEFAULT NULL,
  `ab_test_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `total_sent` int(11) NOT NULL DEFAULT 0,
  `total_responded` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `follow_up_rules_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `follow_up_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'general',
  `message_template` text NOT NULL,
  `trigger_type` varchar(50) NOT NULL DEFAULT 'days_after_last_contact',
  `delay_days` int(11) NOT NULL DEFAULT 15,
  `target_audience` varchar(30) NOT NULL DEFAULT 'all',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_follow_up_templates_tenant` (`tenant_id`),
  CONSTRAINT `follow_up_templates_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `mcp_servers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `transport` varchar(20) NOT NULL DEFAULT 'stdio',
  `command` varchar(500) DEFAULT '',
  `args` text DEFAULT NULL,
  `url` varchar(500) DEFAULT '',
  `env_vars` text DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `disabled_tools` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `mcp_servers_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `sender` varchar(20) NOT NULL,
  `sender_name` varchar(255) DEFAULT '',
  `content` mediumtext NOT NULL,
  `message_type` varchar(20) NOT NULL DEFAULT 'text',
  `image_data` longtext DEFAULT NULL,
  `audio_data` longtext DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `file_url` text DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_mimetype` varchar(100) DEFAULT NULL,
  `is_internal` tinyint(1) NOT NULL DEFAULT 0,
  `delivery_status` varchar(20) NOT NULL DEFAULT 'sent',
  `emoji_reaction` varchar(20) DEFAULT NULL,
  `wa_message_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation` (`conversation_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `old_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_order_history_order` (`order_id`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `order_status_history_ibfk_3` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `conversation_id` int(11) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `contact_name` varchar(255) DEFAULT '',
  `items` text NOT NULL,
  `total` double NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `idx_orders_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT '',
  `price_adjustment` double NOT NULL DEFAULT 0,
  `cost_adjustment` double NOT NULL DEFAULT 0,
  `stock` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `idx_variants_product` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `price` double NOT NULL DEFAULT 0,
  `category` varchar(255) DEFAULT NULL,
  `image_url` mediumtext DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `cost_price` double DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quick_replies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `shortcut` varchar(50) DEFAULT '',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_quick_replies_tenant` (`tenant_id`),
  CONSTRAINT `quick_replies_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `quote_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `notes` text DEFAULT NULL,
  `valid_days` int(11) NOT NULL DEFAULT 15,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_quote_templates_tenant` (`tenant_id`),
  CONSTRAINT `quote_templates_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `quotes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `conversation_id` int(11) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `contact_name` varchar(255) DEFAULT '',
  `items` text NOT NULL,
  `total` double NOT NULL DEFAULT 0,
  `valid_days` int(11) NOT NULL DEFAULT 15,
  `notes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `idx_quotes_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `quotes_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `quotes_ibfk_2` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `service_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 60,
  `buffer_minutes` int(11) NOT NULL DEFAULT 0,
  `price` double DEFAULT NULL,
  `color` varchar(20) DEFAULT '#3b82f6',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_service_types_tenant` (`tenant_id`),
  CONSTRAINT `service_types_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `bot_name` varchar(255) NOT NULL DEFAULT 'SellMate',
  `friendliness` int(11) NOT NULL DEFAULT 7,
  `greeting_message` text DEFAULT NULL,
  `farewell_message` text DEFAULT NULL,
  `ai_provider` varchar(20) NOT NULL DEFAULT 'openai',
  `ai_api_key` varchar(500) DEFAULT '',
  `ai_model` varchar(100) DEFAULT 'gpt-4o-mini',
  `ai_custom_endpoint` varchar(500) DEFAULT '',
  `whatsapp_connected` tinyint(1) NOT NULL DEFAULT 0,
  `whitelist_mode` varchar(20) NOT NULL DEFAULT 'all',
  `online_status` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `business_type` varchar(50) DEFAULT NULL,
  `setup_completed` tinyint(1) NOT NULL DEFAULT 0,
  `bot_always_on` tinyint(1) NOT NULL DEFAULT 0,
  `currency` varchar(10) DEFAULT 'MXN',
  `timezone` varchar(100) DEFAULT 'America/Mexico_City',
  `ai_connection_mode` varchar(20) DEFAULT 'proxy',
  `subscription_tier` varchar(20) DEFAULT 'free',
  `subscription_start` date DEFAULT NULL,
  `monthly_token_budget` bigint(20) DEFAULT 0,
  `monthly_tokens_used` bigint(20) DEFAULT 0,
  `monthly_conversations_used` int(11) DEFAULT 0,
  `billing_cycle_start` date DEFAULT NULL,
  `appointment_buffer_minutes` int(11) NOT NULL DEFAULT 0,
  `business_hours` text DEFAULT NULL,
  `monthly_spending_limit` double DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `tenant_modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `module_key` varchar(50) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `config` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_module` (`tenant_id`,`module_key`),
  CONSTRAINT `tenant_modules_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner_user_id` int(11) DEFAULT NULL,
  `plan` varchar(20) NOT NULL DEFAULT 'free',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'agent',
  `super_admin` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `tenant_id` (`tenant_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `wa_auth_state` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `data_key` varchar(255) NOT NULL,
  `data_value` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_key` (`tenant_id`,`data_key`),
  CONSTRAINT `wa_auth_state_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1188 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `webhooks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  `event` varchar(50) NOT NULL,
  `label` varchar(255) DEFAULT '',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_webhooks_tenant` (`tenant_id`),
  CONSTRAINT `webhooks_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `whatsapp_session` (
  `id` varchar(255) NOT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `white_label_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `app_name` varchar(255) NOT NULL DEFAULT 'SellMate',
  `logo_url` text DEFAULT NULL,
  `primary_color` varchar(20) DEFAULT '#6366f1',
  `accent_color` varchar(20) DEFAULT '#f59e0b',
  `favicon_url` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `white_label_settings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE `whitelist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `label` varchar(255) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_whitelist_tenant_phone` (`tenant_id`,`phone_number`),
  CONSTRAINT `whitelist_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;