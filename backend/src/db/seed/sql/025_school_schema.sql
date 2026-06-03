-- =============================================================
-- 025 — Woody okul ve dijital içerik erişim şeması
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `schools` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `contact_email` VARCHAR(255) DEFAULT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `city` VARCHAR(128) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `schools_is_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `school_users` (
  `id` CHAR(36) NOT NULL,
  `school_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `role` ENUM('owner','teacher','student') NOT NULL DEFAULT 'teacher',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_users_unique` (`school_id`, `user_id`),
  KEY `school_users_user_idx` (`user_id`),
  CONSTRAINT `fk_school_users_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_school_users_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `digital_assets` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `asset_type` ENUM('video','pdf','audio','image','other') NOT NULL DEFAULT 'pdf',
  `storage_asset_id` CHAR(36) DEFAULT NULL,
  `level` ENUM('basic','junior','senior') DEFAULT NULL,
  `product` ENUM('storyland','movieland','musicland','library') DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `digital_assets_level_product_idx` (`level`, `product`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `school_content_access` (
  `id` CHAR(36) NOT NULL,
  `school_id` CHAR(36) NOT NULL,
  `digital_asset_id` CHAR(36) NOT NULL,
  `granted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sca_unique` (`school_id`, `digital_asset_id`),
  CONSTRAINT `fk_sca_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sca_asset` FOREIGN KEY (`digital_asset_id`) REFERENCES `digital_assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `schools` (`id`, `name`, `contact_email`, `contact_phone`, `city`, `is_active`) VALUES
('25111111-1111-4111-8111-000000000001', 'Woody Demo Okulu', NULL, NULL, 'İstanbul', 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `contact_email` = VALUES(`contact_email`),
  `contact_phone` = VALUES(`contact_phone`),
  `city` = VALUES(`city`),
  `is_active` = VALUES(`is_active`);

INSERT INTO `digital_assets` (`id`, `title`, `asset_type`, `storage_asset_id`, `level`, `product`, `is_active`) VALUES
('25211111-1111-4111-8111-000000000001', 'Storyland Basic Demo PDF', 'pdf', NULL, 'basic', 'storyland', 1),
('25211111-1111-4111-8111-000000000002', 'Movieland Junior Demo Video', 'video', NULL, 'junior', 'movieland', 1),
('25211111-1111-4111-8111-000000000003', 'Musicland Senior Demo Audio', 'audio', NULL, 'senior', 'musicland', 1)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `asset_type` = VALUES(`asset_type`),
  `storage_asset_id` = VALUES(`storage_asset_id`),
  `level` = VALUES(`level`),
  `product` = VALUES(`product`),
  `is_active` = VALUES(`is_active`);

INSERT INTO `school_content_access` (`id`, `school_id`, `digital_asset_id`) VALUES
('25311111-1111-4111-8111-000000000001', '25111111-1111-4111-8111-000000000001', '25211111-1111-4111-8111-000000000001'),
('25311111-1111-4111-8111-000000000002', '25111111-1111-4111-8111-000000000001', '25211111-1111-4111-8111-000000000002')
ON DUPLICATE KEY UPDATE
  `granted_at` = VALUES(`granted_at`);
