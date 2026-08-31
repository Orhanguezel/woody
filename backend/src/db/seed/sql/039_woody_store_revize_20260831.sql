-- 039_woody_store_revize_20260831.sql
-- Musteri revizyonu (2026-08-31, WhatsApp + PDF):
--  1) Magazada 9 urun kalir: Mini School 6 (3 ogretmen + 3 ogrenci) + Ev & Ozel Ders 3.
--     "Hikaye Kitaplari" 3 urunu PASIFE alinir — SILINMEZ ("sonra koyacagiz" dedi),
--     admin panelden is_active=1 yapilinca geri gelir.
--  2) Bolum basliklarinin altindaki aciklama satirlari (PDF s.1 alt serit).
--  3) "Ev-Ozel Ders Serisi" adi PDF'teki gibi "Ev & Ozel Ders Serisi".
-- Idempotent: tekrar calistirilabilir.

-- 1) Hikaye Kitaplari urunleri pasif
UPDATE `products`
   SET `is_active` = 0, `updated_at` = CURRENT_TIMESTAMP(3)
 WHERE `product_code` IN ('WOODY-STORY-BASIC', 'WOODY-CARDS-CLASS', 'WOODY-STARTER-SET');

-- 2a) Mini School Serisi aciklamasi (c0000000000000000002 = tr/de/fr/..., 21111111-...-0002 = en)
UPDATE `category_i18n`
   SET `description` = 'Kurs, atölye ve küçük grup eğitimleri için.'
 WHERE `category_id` = 'c0000000000000000002' AND `locale` <> 'de';

UPDATE `category_i18n`
   SET `description` = 'Für Kurse, Workshops und Kleingruppen.'
 WHERE `category_id` = 'c0000000000000000002' AND `locale` = 'de';

UPDATE `category_i18n`
   SET `description` = 'For courses, workshops and small group lessons.'
 WHERE `category_id` = '21111111-1111-4111-8111-000000000002'
   AND `locale` = 'en' AND `slug` = 'workshop-series';

-- 2b) Ev & Ozel Ders Serisi aciklamasi (c0000000000000000003)
UPDATE `category_i18n`
   SET `description` = 'Birebir ve 1–2 öğrencili dersler için.'
 WHERE `category_id` = 'c0000000000000000003' AND `locale` NOT IN ('de', 'en');

UPDATE `category_i18n`
   SET `description` = 'Für Einzelunterricht und Gruppen mit 1–2 Schülern.'
 WHERE `category_id` = 'c0000000000000000003' AND `locale` = 'de';

UPDATE `category_i18n`
   SET `description` = 'For one-to-one lessons and groups of 1–2 students.'
 WHERE `category_id` = 'c0000000000000000003' AND `locale` = 'en';

-- 3) Ad guncellemesi — PDF'te "Ev & Özel Ders Serisi"
UPDATE `category_i18n`
   SET `name` = 'Ev & Özel Ders Serisi'
 WHERE `category_id` = 'c0000000000000000003' AND `name` = 'Ev-Özel Ders Serisi';
