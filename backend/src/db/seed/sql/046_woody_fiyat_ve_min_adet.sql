-- 046_woody_fiyat_ve_min_adet.sql
-- Musteri talebi (WhatsApp, 2026-09-02):
--   1) Mini School "Senior Ogretmen Seti"  3.750 -> 4.650 TL
--   2) Ev & Ozel Ders "Senior Level Set Ogrenci Seti"  4.250 -> 4.750 TL
--   3) Mini School ogrenci setleri en az 3 adet alinabilir (min adet kurali
--      artik metin degil, `products.min_quantity` verisi — sepet/odeme dogrular).
--
-- Kolon tanimi 022_products.sql icinde (fresh kurulumda gelir). CANLI DB'de bir
-- kereye mahsus elle eklenir (MySQL 8 ADD COLUMN IF NOT EXISTS desteklemez):
--   ALTER TABLE products ADD COLUMN min_quantity INT NOT NULL DEFAULT 1 AFTER stock_quantity;
-- Idempotent: asagidaki UPDATE'ler tekrar calisabilir.

-- Mini School Senior Ogretmen Seti
UPDATE `products` SET `price` = 4650.00 WHERE `id` = 'e0000000000000000009';

-- Ev & Ozel Ders Senior Level Set Ogrenci Seti
UPDATE `products` SET `price` = 4750.00 WHERE `id` = 'e000000000000000000f';

-- Mini School ogrenci setleri: en az 3 adet
UPDATE `products`
   SET `min_quantity` = 3
 WHERE `id` IN ('e0000000000000000013', 'e0000000000000000014', 'e0000000000000000015');
