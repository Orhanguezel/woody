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
('c0000000000000000001', 'store', '/assets/woody/store-books.svg', 'Woody Okul Serisi', 'BookOpen', 1, 1, 10),
('c0000000000000000002', 'store', '/assets/woody/store-cards.svg', 'Woody Atölye Serisi', 'Layers', 1, 1, 20),
('c0000000000000000003', 'store', '/assets/woody/store-sets.svg', 'Woody Ev-Özel Ders Serisi', 'Package', 1, 1, 30)
ON DUPLICATE KEY UPDATE
  `module_key` = VALUES(`module_key`),
  `image_url` = VALUES(`image_url`),
  `alt` = VALUES(`alt`),
  `icon` = VALUES(`icon`),
  `is_active` = VALUES(`is_active`),
  `is_featured` = VALUES(`is_featured`),
  `display_order` = VALUES(`display_order`);

INSERT INTO `category_i18n` (`category_id`, `locale`, `name`, `slug`, `description`, `alt`, `meta_title`, `meta_description`) VALUES
('c0000000000000000001', 'tr', 'Okul Serisi', 'okul-serisi', 'Okul öncesi kurumlar için Woody öğrenci setleri.', 'Woody Okul Serisi', 'Woody Okul Serisi', 'Anaokulları için Woody okul serisi öğrenci setleri.'),
('c0000000000000000001', 'en', 'Preschool Series', 'preschool-series', 'Woody student sets for preschool institutions.', 'Woody Preschool Series', 'Woody Preschool Series', 'Woody Preschool Series student sets for schools.'),
('c0000000000000000002', 'tr', 'Atölye Serisi', 'atolye-serisi', 'Atölye ve kurs merkezleri için Woody setleri.', 'Woody Atölye Serisi', 'Woody Atölye Serisi', 'Atölye ve kurslar için Woody İngilizce setleri.'),
('c0000000000000000002', 'en', 'Workshop Series', 'workshop-series', 'Woody sets for workshops and course centers.', 'Woody Workshop Series', 'Woody Workshop Series', 'Woody English sets for workshops and courses.'),
('c0000000000000000003', 'tr', 'Ev-Özel Ders Serisi', 'ev-ozel-ders-serisi', 'Ev ve özel ders öğretmenleri için Woody setleri.', 'Woody Ev-Özel Ders Serisi', 'Woody Ev-Özel Ders Serisi', 'Ev ve özel ders için Woody İngilizce setleri.'),
('c0000000000000000003', 'en', 'Home-Private Lesson Series', 'home-private-lesson-series', 'Woody sets for home and private lesson teachers.', 'Woody Home-Private Lesson Series', 'Woody Home-Private Lesson Series', 'Woody English sets for home and private lessons.')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `alt` = VALUES(`alt`),
  `meta_title` = VALUES(`meta_title`),
  `meta_description` = VALUES(`meta_description`);

INSERT INTO `sub_categories` (`id`, `category_id`, `image_url`, `alt`, `icon`, `is_active`, `is_featured`, `display_order`) VALUES
('d0000000000000000001', 'c0000000000000000001', '/assets/woody/basic-books.svg', 'Basic hikaye kitapları', 'Book', 1, 1, 10),
('d0000000000000000002', 'c0000000000000000002', '/assets/woody/classroom-cards.svg', 'Sınıf etkinlik kartları', 'PanelsTopLeft', 1, 1, 20),
('d0000000000000000003', 'c0000000000000000003', '/assets/woody/starter-set.svg', 'Başlangıç öğrenme seti', 'Sparkles', 1, 1, 30)
ON DUPLICATE KEY UPDATE
  `category_id` = VALUES(`category_id`),
  `image_url` = VALUES(`image_url`),
  `alt` = VALUES(`alt`),
  `icon` = VALUES(`icon`),
  `is_active` = VALUES(`is_active`),
  `is_featured` = VALUES(`is_featured`),
  `display_order` = VALUES(`display_order`);

INSERT INTO `sub_category_i18n` (`sub_category_id`, `locale`, `name`, `slug`, `description`) VALUES
('d0000000000000000001', 'tr', 'Öğrenci Setleri', 'ogrenci-setleri', 'Okul Serisi Basic, Junior ve Senior öğrenci setleri.'),
('d0000000000000000001', 'en', 'Student Sets', 'student-sets', 'Preschool Series Basic, Junior and Senior student sets.'),
('d0000000000000000002', 'tr', 'Atölye Paketleri', 'atolye-paketleri', 'Atölye ve kurs merkezlerine yönelik paketler.'),
('d0000000000000000002', 'en', 'Workshop Packages', 'workshop-packages', 'Packages for workshops and course centers.'),
('d0000000000000000003', 'tr', 'Özel Ders Paketleri', 'ozel-ders-paketleri', 'Ev ve özel ders öğretmenlerine yönelik paketler.'),
('d0000000000000000003', 'en', 'Private Lesson Packages', 'private-lesson-packages', 'Packages for home and private lesson teachers.')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`);
