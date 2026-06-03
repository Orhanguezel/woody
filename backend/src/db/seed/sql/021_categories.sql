-- =============================================================
-- 021 — Woody katalog kategorileri (shared categories/subcategories)
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` CHAR(36) NOT NULL,
  `module_key` VARCHAR(64) NOT NULL DEFAULT 'general',
  `image_url` LONGTEXT DEFAULT NULL,
  `storage_asset_id` CHAR(36) DEFAULT NULL,
  `alt` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `is_featured` TINYINT NOT NULL DEFAULT 0,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `categories_active_idx` (`is_active`),
  KEY `categories_order_idx` (`display_order`),
  KEY `categories_module_idx` (`module_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `category_i18n` (
  `category_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT 'tr',
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `alt` VARCHAR(255) DEFAULT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `category_i18n_slug_locale_uq` (`slug`, `locale`),
  KEY `category_i18n_locale_idx` (`locale`),
  KEY `category_i18n_category_idx` (`category_id`),
  CONSTRAINT `fk_category_i18n_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sub_categories` (
  `id` CHAR(36) NOT NULL,
  `category_id` CHAR(36) NOT NULL,
  `image_url` LONGTEXT DEFAULT NULL,
  `storage_asset_id` CHAR(36) DEFAULT NULL,
  `alt` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `is_featured` TINYINT NOT NULL DEFAULT 0,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `sub_categories_category_id_idx` (`category_id`),
  KEY `sub_categories_active_idx` (`is_active`),
  CONSTRAINT `fk_sub_categories_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sub_category_i18n` (
  `sub_category_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT 'tr',
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `sub_category_i18n_slug_locale_uq` (`slug`, `locale`),
  KEY `sub_category_i18n_locale_idx` (`locale`),
  KEY `sub_category_i18n_sub_category_idx` (`sub_category_id`),
  CONSTRAINT `fk_sub_category_i18n_sub_category_id` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `module_key`, `image_url`, `alt`, `icon`, `is_active`, `is_featured`, `display_order`) VALUES
('21111111-1111-4111-8111-000000000001', 'store', '/assets/woody/store-books.svg', 'Woody hikaye kitapları', 'BookOpen', 1, 1, 10),
('21111111-1111-4111-8111-000000000002', 'store', '/assets/woody/store-cards.svg', 'Woody etkinlik kartları', 'Layers', 1, 1, 20),
('21111111-1111-4111-8111-000000000003', 'store', '/assets/woody/store-sets.svg', 'Woody öğrenme setleri', 'Package', 1, 1, 30)
ON DUPLICATE KEY UPDATE
  `module_key` = VALUES(`module_key`),
  `image_url` = VALUES(`image_url`),
  `alt` = VALUES(`alt`),
  `icon` = VALUES(`icon`),
  `is_active` = VALUES(`is_active`),
  `is_featured` = VALUES(`is_featured`),
  `display_order` = VALUES(`display_order`);

INSERT INTO `category_i18n` (`category_id`, `locale`, `name`, `slug`, `description`, `alt`, `meta_title`, `meta_description`) VALUES
('21111111-1111-4111-8111-000000000001', 'tr', 'Hikaye Kitapları', 'hikaye-kitaplari', 'Okul öncesi İngilizce için hikaye odaklı basılı ürünler.', 'Woody hikaye kitapları', 'Woody hikaye kitapları', 'Çocuklar için İngilizce hikaye kitapları.'),
('21111111-1111-4111-8111-000000000001', 'en', 'Story Books', 'story-books', 'Story-led printed products for preschool English.', 'Woody story books', 'Woody story books', 'English story books for children.'),
('21111111-1111-4111-8111-000000000002', 'tr', 'Etkinlik Kartları', 'etkinlik-kartlari', 'Sınıf, ev ve atölye çalışmaları için kart setleri.', 'Woody etkinlik kartları', 'Woody etkinlik kartları', 'Çocuklar için İngilizce etkinlik kartları.'),
('21111111-1111-4111-8111-000000000002', 'en', 'Activity Cards', 'activity-cards', 'Card sets for classroom, home, and workshop use.', 'Woody activity cards', 'Woody activity cards', 'English activity cards for children.'),
('21111111-1111-4111-8111-000000000003', 'tr', 'Öğrenme Setleri', 'ogrenme-setleri', 'Kitap, kart ve destek materyallerinden oluşan setler.', 'Woody öğrenme setleri', 'Woody öğrenme setleri', 'Woody İngilizce öğrenme setleri.'),
('21111111-1111-4111-8111-000000000003', 'en', 'Learning Sets', 'learning-sets', 'Sets made of books, cards, and support materials.', 'Woody learning sets', 'Woody learning sets', 'Woody English learning sets.')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `alt` = VALUES(`alt`),
  `meta_title` = VALUES(`meta_title`),
  `meta_description` = VALUES(`meta_description`);

INSERT INTO `sub_categories` (`id`, `category_id`, `image_url`, `alt`, `icon`, `is_active`, `is_featured`, `display_order`) VALUES
('21211111-1111-4111-8111-000000000001', '21111111-1111-4111-8111-000000000001', '/assets/woody/basic-books.svg', 'Basic hikaye kitapları', 'Book', 1, 1, 10),
('21211111-1111-4111-8111-000000000002', '21111111-1111-4111-8111-000000000002', '/assets/woody/classroom-cards.svg', 'Sınıf etkinlik kartları', 'PanelsTopLeft', 1, 1, 20),
('21211111-1111-4111-8111-000000000003', '21111111-1111-4111-8111-000000000003', '/assets/woody/starter-set.svg', 'Başlangıç öğrenme seti', 'Sparkles', 1, 1, 30)
ON DUPLICATE KEY UPDATE
  `category_id` = VALUES(`category_id`),
  `image_url` = VALUES(`image_url`),
  `alt` = VALUES(`alt`),
  `icon` = VALUES(`icon`),
  `is_active` = VALUES(`is_active`),
  `is_featured` = VALUES(`is_featured`),
  `display_order` = VALUES(`display_order`);

INSERT INTO `sub_category_i18n` (`sub_category_id`, `locale`, `name`, `slug`, `description`) VALUES
('21211111-1111-4111-8111-000000000001', 'tr', 'Basic Seviye', 'basic-seviye', 'Basic seviye için hikaye ve okuma ürünleri.'),
('21211111-1111-4111-8111-000000000001', 'en', 'Basic Level', 'basic-level', 'Story and reading products for the Basic level.'),
('21211111-1111-4111-8111-000000000002', 'tr', 'Sınıf Etkinlikleri', 'sinif-etkinlikleri', 'Öğretmenlerin sınıfta kullanabileceği kart ürünleri.'),
('21211111-1111-4111-8111-000000000002', 'en', 'Classroom Activities', 'classroom-activities', 'Card products teachers can use in class.'),
('21211111-1111-4111-8111-000000000003', 'tr', 'Başlangıç Setleri', 'baslangic-setleri', 'Woody dünyasına giriş için karma öğrenme setleri.'),
('21211111-1111-4111-8111-000000000003', 'en', 'Starter Sets', 'starter-sets', 'Mixed learning sets for entering the Woody world.')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`);
