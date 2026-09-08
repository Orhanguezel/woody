-- PayTR iade sonucu payment_attempts tablosuna yazilabilsin.
-- Uygulama tam ve kismi iadelerde bu iki durumu kullaniyor.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `payment_attempts`
  MODIFY COLUMN `status`
    ENUM('pending','succeeded','failed','cancelled','refunded','partially_refunded')
    NOT NULL DEFAULT 'pending';
