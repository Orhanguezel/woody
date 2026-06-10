-- =============================================================
-- 027 — Subscription skeleton schema
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `name_tr` VARCHAR(160) NOT NULL,
  `name_en` VARCHAR(160) NOT NULL,
  `price_minor` INT NOT NULL DEFAULT 0,
  `currency` CHAR(3) NOT NULL DEFAULT 'TRY',
  `period` ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_plans_code_uq` (`code`),
  KEY `subscription_plans_active_idx` (`is_active`),
  KEY `subscription_plans_period_idx` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `plan_id` CHAR(36) NOT NULL,
  `status` ENUM('pending','active','canceled','expired') NOT NULL DEFAULT 'pending',
  `started_at` DATETIME(3) DEFAULT NULL,
  `expires_at` DATETIME(3) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `user_subscriptions_user_id_idx` (`user_id`),
  KEY `user_subscriptions_plan_id_idx` (`plan_id`),
  KEY `user_subscriptions_status_idx` (`status`),
  KEY `user_subscriptions_expires_at_idx` (`expires_at`),
  CONSTRAINT `fk_user_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `subscription_plans` (`id`, `code`, `name_tr`, `name_en`, `price_minor`, `currency`, `period`, `is_active`)
VALUES
  ('7fd25bba-2026-4f2b-9f1b-000000000001', 'library-monthly', 'Library Aylık', 'Library Monthly', 0, 'TRY', 'monthly', 0),
  ('7fd25bba-2026-4f2b-9f1b-000000000002', 'library-yearly', 'Library Yıllık', 'Library Yearly', 0, 'TRY', 'yearly', 0)
ON DUPLICATE KEY UPDATE
  `name_tr` = VALUES(`name_tr`),
  `name_en` = VALUES(`name_en`),
  `period` = VALUES(`period`);
