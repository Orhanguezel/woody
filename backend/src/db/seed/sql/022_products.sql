-- =============================================================
-- 022 — Woody mağaza ürünleri (shared products)
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` CHAR(36) NOT NULL,
  `item_type` ENUM('product','sparepart','bereketfide') NOT NULL DEFAULT 'product',
  `category_id` CHAR(36) NOT NULL,
  `sub_category_id` CHAR(36) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `image_url` LONGTEXT DEFAULT NULL,
  `storage_asset_id` CHAR(36) DEFAULT NULL,
  `images` JSON DEFAULT (JSON_ARRAY()),
  `storage_image_ids` JSON DEFAULT (JSON_ARRAY()),
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `is_featured` TINYINT NOT NULL DEFAULT 0,
  `order_num` INT NOT NULL DEFAULT 0,
  `product_code` VARCHAR(64) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `review_count` INT NOT NULL DEFAULT 0,
  `botanical_name` VARCHAR(255) DEFAULT NULL,
  `planting_seasons` JSON DEFAULT (JSON_ARRAY()),
  `harvest_days` INT DEFAULT NULL,
  `climate_zones` JSON DEFAULT (JSON_ARRAY()),
  `soil_types` JSON DEFAULT (JSON_ARRAY()),
  `water_need` VARCHAR(16) DEFAULT NULL,
  `sun_exposure` VARCHAR(16) DEFAULT NULL,
  `min_temp` DECIMAL(5,2) DEFAULT NULL,
  `max_temp` DECIMAL(5,2) DEFAULT NULL,
  `germination_days` INT DEFAULT NULL,
  `seed_depth_cm` DECIMAL(5,2) DEFAULT NULL,
  `row_spacing_cm` INT DEFAULT NULL,
  `plant_spacing_cm` INT DEFAULT NULL,
  `yield_per_sqm` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_code_uq` (`product_code`),
  KEY `products_item_type_idx` (`item_type`),
  KEY `products_category_id_idx` (`category_id`),
  KEY `products_sub_category_id_idx` (`sub_category_id`),
  KEY `products_active_idx` (`is_active`),
  KEY `products_asset_idx` (`storage_asset_id`),
  KEY `products_order_idx` (`order_num`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_products_subcategory` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_i18n` (
  `product_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT 'tr',
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `alt` VARCHAR(255) DEFAULT NULL,
  `tags` JSON DEFAULT (JSON_ARRAY()),
  `specifications` JSON DEFAULT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`product_id`, `locale`),
  UNIQUE KEY `product_i18n_locale_slug_uq` (`locale`, `slug`),
  KEY `product_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_product_i18n_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_specs` (
  `id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT 'tr',
  `name` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `category` ENUM('physical','material','service','custom') NOT NULL DEFAULT 'custom',
  `order_num` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `product_specs_product_id_idx` (`product_id`),
  KEY `product_specs_product_locale_idx` (`product_id`, `locale`),
  KEY `product_specs_locale_idx` (`locale`),
  CONSTRAINT `fk_product_specs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_faqs` (
  `id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT 'tr',
  `question` VARCHAR(500) NOT NULL,
  `answer` TEXT NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `product_faqs_product_id_idx` (`product_id`),
  KEY `product_faqs_order_idx` (`display_order`),
  KEY `product_faqs_product_locale_idx` (`product_id`, `locale`),
  KEY `product_faqs_locale_idx` (`locale`),
  CONSTRAINT `fk_product_faqs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) DEFAULT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `customer_name` VARCHAR(255) DEFAULT NULL,
  `review_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `product_reviews_product_id_idx` (`product_id`),
  KEY `product_reviews_approved_idx` (`product_id`, `is_active`),
  KEY `product_reviews_rating_idx` (`rating`),
  CONSTRAINT `fk_product_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_options` (
  `id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `option_name` VARCHAR(100) NOT NULL,
  `option_values` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `product_options_product_id_idx` (`product_id`),
  CONSTRAINT `fk_product_options_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_stock` (
  `id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `stock_content` VARCHAR(255) NOT NULL,
  `is_used` TINYINT NOT NULL DEFAULT 0,
  `used_at` DATETIME(3) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `order_item_id` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_stock_product_id_idx` (`product_id`),
  KEY `product_stock_is_used_idx` (`product_id`, `is_used`),
  KEY `product_stock_order_item_id_idx` (`order_item_id`),
  CONSTRAINT `fk_product_stock_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT 'tr',
  `image_url` LONGTEXT NOT NULL,
  `image_asset_id` CHAR(36) DEFAULT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `alt` VARCHAR(255) DEFAULT NULL,
  `caption` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_idx` (`product_id`),
  KEY `product_images_product_locale_idx` (`product_id`, `locale`),
  KEY `product_images_order_idx` (`product_id`, `display_order`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `item_type`, `category_id`, `sub_category_id`, `price`, `image_url`, `images`, `is_active`, `is_featured`, `order_num`, `product_code`, `stock_quantity`) VALUES
('22111111-1111-4111-8111-000000000001', 'product', '21111111-1111-4111-8111-000000000001', '21211111-1111-4111-8111-000000000001', 480.00, '/assets/woody/store/storyland-basic.svg', JSON_ARRAY('/assets/woody/store/storyland-basic.svg'), 1, 1, 10, 'WOODY-STORY-BASIC', 100),
('22111111-1111-4111-8111-000000000002', 'product', '21111111-1111-4111-8111-000000000002', '21211111-1111-4111-8111-000000000002', 360.00, '/assets/woody/store/activity-cards.svg', JSON_ARRAY('/assets/woody/store/activity-cards.svg'), 1, 1, 20, 'WOODY-CARDS-CLASS', 100),
('22111111-1111-4111-8111-000000000003', 'product', '21111111-1111-4111-8111-000000000003', '21211111-1111-4111-8111-000000000003', 1250.00, '/assets/woody/store/starter-set.svg', JSON_ARRAY('/assets/woody/store/starter-set.svg'), 1, 1, 30, 'WOODY-STARTER-SET', 50)
ON DUPLICATE KEY UPDATE
  `category_id` = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
  `price` = VALUES(`price`),
  `image_url` = VALUES(`image_url`),
  `images` = VALUES(`images`),
  `is_active` = VALUES(`is_active`),
  `is_featured` = VALUES(`is_featured`),
  `order_num` = VALUES(`order_num`),
  `stock_quantity` = VALUES(`stock_quantity`);

INSERT INTO `product_i18n` (`product_id`, `locale`, `title`, `slug`, `description`, `alt`, `tags`, `specifications`, `meta_title`, `meta_description`) VALUES
('22111111-1111-4111-8111-000000000001', 'tr', 'Storyland Basic Hikaye Kitabı', 'storyland-basic-hikaye-kitabi', 'Basic seviye çocuklar için resimli İngilizce hikaye kitabı.', 'Storyland Basic hikaye kitabı', JSON_ARRAY('basic','storyland','kitap'), JSON_OBJECT('Seviye','Basic','Tür','Basılı kitap'), 'Storyland Basic Hikaye Kitabı', 'Basic seviye için Woody Storyland hikaye kitabı.'),
('22111111-1111-4111-8111-000000000001', 'en', 'Storyland Basic Story Book', 'storyland-basic-story-book', 'Illustrated English story book for children at Basic level.', 'Storyland Basic story book', JSON_ARRAY('basic','storyland','book'), JSON_OBJECT('Level','Basic','Type','Printed book'), 'Storyland Basic Story Book', 'Woody Storyland story book for Basic level.'),
('22111111-1111-4111-8111-000000000002', 'tr', 'Woody Sınıf Etkinlik Kartları', 'woody-sinif-etkinlik-kartlari', 'Öğretmenler için konuşma, eşleştirme ve oyun kartları.', 'Woody sınıf etkinlik kartları', JSON_ARRAY('kart','sinif','aktivite'), JSON_OBJECT('İçerik','Kart seti','Kullanım','Sınıf ve atölye'), 'Woody Sınıf Etkinlik Kartları', 'Çocuk İngilizcesi için sınıf etkinlik kartları.'),
('22111111-1111-4111-8111-000000000002', 'en', 'Woody Classroom Activity Cards', 'woody-classroom-activity-cards', 'Speaking, matching, and play cards for teachers.', 'Woody classroom activity cards', JSON_ARRAY('cards','classroom','activity'), JSON_OBJECT('Content','Card set','Use','Classroom and workshop'), 'Woody Classroom Activity Cards', 'Classroom activity cards for children English.'),
('22111111-1111-4111-8111-000000000003', 'tr', 'Woody Başlangıç Öğrenme Seti', 'woody-baslangic-ogrenme-seti', 'Kitap, kart ve öğretmen notlarıyla başlangıç paketi.', 'Woody başlangıç öğrenme seti', JSON_ARRAY('set','baslangic','okul'), JSON_OBJECT('İçerik','Kitap + kart + notlar','Seviye','Basic/Junior'), 'Woody Başlangıç Öğrenme Seti', 'Okullar ve aileler için Woody başlangıç seti.'),
('22111111-1111-4111-8111-000000000003', 'en', 'Woody Starter Learning Set', 'woody-starter-learning-set', 'Starter pack with book, cards, and teacher notes.', 'Woody starter learning set', JSON_ARRAY('set','starter','school'), JSON_OBJECT('Content','Book + cards + notes','Level','Basic/Junior'), 'Woody Starter Learning Set', 'Woody starter set for schools and families.')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `alt` = VALUES(`alt`),
  `tags` = VALUES(`tags`),
  `specifications` = VALUES(`specifications`),
  `meta_title` = VALUES(`meta_title`),
  `meta_description` = VALUES(`meta_description`);
