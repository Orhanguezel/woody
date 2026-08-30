-- =============================================================
-- 023 — Woody sipariş ve ödeme zemini (shared orders + Iyzipay attempts)
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` CHAR(36) NOT NULL,
  `dealer_id` CHAR(36) NOT NULL,
  `seller_id` CHAR(36) DEFAULT NULL,
  `status` ENUM('pending','confirmed','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(32) DEFAULT NULL,
  `payment_status` ENUM('unpaid','pending','paid','failed','refunded') NOT NULL DEFAULT 'unpaid',
  `payment_ref` CHAR(36) DEFAULT NULL,
  `shipping_name` VARCHAR(160) DEFAULT NULL,
  `shipping_phone` VARCHAR(32) DEFAULT NULL,
  `shipping_address` VARCHAR(500) DEFAULT NULL,
  `shipping_city` VARCHAR(100) DEFAULT NULL,
  `shipping_district` VARCHAR(100) DEFAULT NULL,
  `shipping_postal_code` VARCHAR(16) DEFAULT NULL,
  `shipping_country` VARCHAR(64) DEFAULT 'TR',
  `shipping_carrier` VARCHAR(64) DEFAULT NULL,
  `shipping_tracking_no` VARCHAR(128) DEFAULT NULL,
  `shipped_at` DATETIME(3) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `orders_dealer_id_idx` (`dealer_id`),
  KEY `orders_seller_id_idx` (`seller_id`),
  KEY `orders_status_idx` (`status`),
  KEY `orders_created_at_idx` (`created_at`),
  KEY `orders_payment_ref_idx` (`payment_ref`),
  CONSTRAINT `fk_orders_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_idx` (`order_id`),
  KEY `order_items_product_id_idx` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_attempts` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `payment_ref` CHAR(36) NOT NULL,
  `provider` VARCHAR(32) NOT NULL,
  `status` ENUM('pending','succeeded','failed','cancelled') NOT NULL DEFAULT 'pending',
  `amount` DECIMAL(12,2) NOT NULL,
  `request_payload` JSON DEFAULT NULL,
  `response_payload` JSON DEFAULT NULL,
  `callback_payload` JSON DEFAULT NULL,
  `last_error` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_attempts_ref_uq` (`payment_ref`),
  KEY `payment_attempts_order_id_idx` (`order_id`),
  KEY `payment_attempts_provider_idx` (`provider`),
  KEY `payment_attempts_status_idx` (`status`),
  KEY `payment_attempts_created_at_idx` (`created_at`),
  CONSTRAINT `fk_payment_attempts_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PayTR server-to-server callback denetim kaydi (REVIZE 2026-08-30).
-- Her deneme loglanir (hash dogrulanamayan dahil) — admin panelden SSH'siz izlenir.
CREATE TABLE IF NOT EXISTS `paytr_callback_logs` (
  `id` CHAR(36) NOT NULL,
  `merchant_oid` VARCHAR(64) DEFAULT NULL,
  `status` VARCHAR(32) DEFAULT NULL,
  `total_amount` DECIMAL(12,2) DEFAULT NULL,
  `source_ip` VARCHAR(64) DEFAULT NULL,
  `outcome` VARCHAR(32) NOT NULL DEFAULT 'received',
  `detail` VARCHAR(500) DEFAULT NULL,
  `payload` JSON DEFAULT NULL,
  `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `paytr_cb_logs_oid_idx` (`merchant_oid`),
  KEY `paytr_cb_logs_outcome_idx` (`outcome`),
  KEY `paytr_cb_logs_received_at_idx` (`received_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
