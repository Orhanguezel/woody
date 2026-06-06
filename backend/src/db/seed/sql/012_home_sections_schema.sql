-- =============================================================
-- 012 — Anasayfa bölümleri (admin: sıra, aktif/pasif, component)
-- Public: GET /api/v1/home/layout → yalnızca is_active=1, order_index sırası
-- =============================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `home_sections` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `component_key` VARCHAR(100) NOT NULL,
  `order_index` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `config` JSON DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `home_sections_slug_uq` (`slug`),
  KEY `home_sections_order_idx` (`order_index`),
  KEY `home_sections_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `home_sections` WHERE `component_key` = 'TrustSection';

INSERT INTO `home_sections` (`id`, `slug`, `label`, `component_key`, `order_index`, `is_active`, `config`) VALUES
('home-hero', 'hero', 'Hero', 'WoodyHomeHero', 10, 1, NULL),
('home-gray-banner', 'gray-banner', 'Ogrenme Vurgulari', 'WoodyGrayBanner', 20, 1, NULL),
('home-setler', 'setler', 'Woody Setleri', 'WoodySetZigzag', 30, 1, NULL),
('home-neden', 'neden', 'Neden AppName', 'WoodyWhyCambridge', 40, 1, NULL),
('home-sertifikalar', 'sertifikalar', 'Sertifikalar', 'CertificationSection', 50, 1, NULL),
('home-yenilikler', 'yenilikler', 'Woody Yenilikler', 'WoodyNewsCarousel', 60, 1, NULL)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `component_key` = VALUES(`component_key`),
  `order_index` = VALUES(`order_index`),
  `is_active` = VALUES(`is_active`),
  `config` = VALUES(`config`);
