-- 036_custom_pages_schema.sql
-- CMS "Custom Pages" modulu: yasal metinler (kvkk, privacy, cookies, terms) ve
-- diger kurumsal sayfalar admin panelden yonetilir. shared-backend/modules/customPages
-- ile birebir. Icerik govdesi custom_pages_i18n.content (HTML) alanindadir.

CREATE TABLE IF NOT EXISTS `custom_pages` (
  `id` CHAR(36) NOT NULL,
  `module_key` VARCHAR(100) NOT NULL DEFAULT 'kurumsal',
  `is_published` TINYINT NOT NULL DEFAULT 0,
  `display_order` INT NOT NULL DEFAULT 0,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `storage_asset_id` CHAR(36) DEFAULT NULL,
  `images` JSON DEFAULT (JSON_ARRAY()),
  `storage_image_ids` JSON DEFAULT (JSON_ARRAY()),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `custom_pages_module_idx` (`module_key`),
  KEY `custom_pages_published_idx` (`is_published`),
  KEY `custom_pages_order_idx` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `custom_pages_i18n` (
  `page_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(10) NOT NULL DEFAULT 'tr',
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `summary` LONGTEXT DEFAULT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`page_id`, `locale`),
  UNIQUE KEY `ux_cp_i18n_locale_slug` (`locale`, `slug`),
  CONSTRAINT `fk_cp_i18n_page` FOREIGN KEY (`page_id`) REFERENCES `custom_pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
