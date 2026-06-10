-- =============================================================
-- 029 — Waitlist signups schema
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `waitlist_signups` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `product_key` VARCHAR(100) NOT NULL,
  `locale` VARCHAR(10) DEFAULT NULL,
  `source` VARCHAR(32) NOT NULL DEFAULT 'website',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `waitlist_email_product_uq` (`email`, `product_key`),
  KEY `waitlist_product_key_idx` (`product_key`),
  KEY `waitlist_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
