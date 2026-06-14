-- =============================================================
-- 026 — B2B quote request schema
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quote_requests` (
  `id` CHAR(36) NOT NULL,
  `org_name` VARCHAR(180) NOT NULL,
  `contact_name` VARCHAR(180) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `product_id` CHAR(36) DEFAULT NULL,
  `student_count` INT NOT NULL DEFAULT 0,
  `level` ENUM('basic','junior','senior','pro','mixed') NOT NULL DEFAULT 'mixed',
  `city` VARCHAR(120) DEFAULT NULL,
  `district` VARCHAR(120) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `status` ENUM('new','contacted','quoted','won','lost') NOT NULL DEFAULT 'new',
  `source` VARCHAR(32) NOT NULL DEFAULT 'website',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `quote_requests_status_idx` (`status`),
  KEY `quote_requests_email_idx` (`email`),
  KEY `quote_requests_product_idx` (`product_id`),
  KEY `quote_requests_created_at_idx` (`created_at`),
  KEY `quote_requests_source_idx` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
