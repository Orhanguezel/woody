-- =============================================================
-- 035 — İletişim formu (contact form) mesajları
-- Frontend kontratı: src/integrations/shared/contacts.types.ts (ContactDto)
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new','in_progress','closed') NOT NULL DEFAULT 'new',
  `is_resolved` TINYINT(1) NOT NULL DEFAULT 0,
  `admin_note` TEXT DEFAULT NULL,
  `ip` VARCHAR(64) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `contact_messages_status_idx` (`status`),
  KEY `contact_messages_email_idx` (`email`),
  KEY `contact_messages_resolved_idx` (`is_resolved`),
  KEY `contact_messages_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
