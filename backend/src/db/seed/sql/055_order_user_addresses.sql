-- =============================================================
-- 055: Sipariş teslimat/fatura adresleri + üyenin kayıtlı adresleri (2026-09-26)
-- Sepet → üyelik → checkout akışı: fatura bilgisi (bireysel/kurumsal, TC/vergi no)
-- siparişe ayrı satır olarak yazılır; orders tablosundaki düz shipping_* kolonları
-- geriye uyum için doldurulmaya devam eder.
-- ALTER YOK: yeni tablolar; canlıya `mysql < 055_order_user_addresses.sql` ile uygulanır.
-- =============================================================
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_addresses` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `type` ENUM('shipping','billing') NOT NULL,
  `invoice_type` ENUM('individual','corporate') NULL,
  `full_name` VARCHAR(191) NULL,
  `company_name` VARCHAR(255) NULL,
  `tax_office` VARCHAR(191) NULL,
  `tax_number` VARCHAR(20) NULL,
  `identity_number` VARCHAR(11) NULL,
  `phone` VARCHAR(40) NULL,
  `email` VARCHAR(191) NULL,
  `address` VARCHAR(500) NULL,
  `district` VARCHAR(120) NULL,
  `city` VARCHAR(120) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` CHAR(2) NOT NULL DEFAULT 'TR',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_addresses_order_type_uq` (`order_id`, `type`),
  CONSTRAINT `fk_order_addresses_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Üye başına bir teslimat ve bir fatura adresi (checkout'ta otomatik doldurma).
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `type` ENUM('shipping','billing') NOT NULL,
  `invoice_type` ENUM('individual','corporate') NULL,
  `full_name` VARCHAR(191) NULL,
  `company_name` VARCHAR(255) NULL,
  `tax_office` VARCHAR(191) NULL,
  `tax_number` VARCHAR(20) NULL,
  `identity_number` VARCHAR(11) NULL,
  `phone` VARCHAR(40) NULL,
  `address` VARCHAR(500) NULL,
  `district` VARCHAR(120) NULL,
  `city` VARCHAR(120) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` CHAR(2) NOT NULL DEFAULT 'TR',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_addresses_user_type_uq` (`user_id`, `type`),
  CONSTRAINT `fk_user_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
