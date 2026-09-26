-- =============================================================
-- 056: Üye adres defteri (2026-09-26)
-- Üye birden çok adres kaydeder (Ev, İş, Okul...), checkout'ta teslimat ve fatura
-- için seçer; adres haritadan (OSM) tamamlanır, koordinatı saklanır.
-- Fatura kimliği (bireysel/kurumsal, TCKN/VKN) adrese bağlıdır: aynı adres hem
-- teslimat hem fatura olabilir.
-- 055'teki user_addresses (üye başına tek adres) bunun yerini alır; o tablo boş
-- kaldığı için dokunulmaz. ALTER YOK.
-- =============================================================
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_addresses` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `title` VARCHAR(60) NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(40) NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `district` VARCHAR(120) NULL,
  `city` VARCHAR(120) NOT NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` CHAR(2) NOT NULL DEFAULT 'TR',
  `latitude` DECIMAL(10,7) NULL,
  `longitude` DECIMAL(10,7) NULL,
  `invoice_type` ENUM('individual','corporate') NOT NULL DEFAULT 'individual',
  `identity_number` VARCHAR(11) NULL,
  `company_name` VARCHAR(255) NULL,
  `tax_office` VARCHAR(191) NULL,
  `tax_number` VARCHAR(20) NULL,
  `is_default_shipping` TINYINT(1) NOT NULL DEFAULT 0,
  `is_default_billing` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `customer_addresses_user_idx` (`user_id`),
  CONSTRAINT `fk_customer_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
