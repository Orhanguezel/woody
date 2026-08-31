-- 042_woody_acik_adres.sql
-- Acik adres KVKK aydinlatma metninde zaten kayitliydi; ticari yasal sayfalarda
-- yalnizca "Yenişehir / MERSİN 33000" kisaltmasi vardi. Mesafeli Sozlesmeler
-- Yonetmeligi acik adres zorunlu kiliyor, PayTR canli mod denetimi de ariyor.
-- Tek kaynak: KVKK sayfasindaki adres.
-- Idempotent: kisa surum kalmadiginda hicbir satiri degistirmez.

UPDATE `custom_pages_i18n`
   SET `content` = REPLACE(
         `content`,
         'Yenişehir / MERSİN 33000, Türkiye',
         'Akkent Mah. 7. Cadde, Bilimkent Sitesi, Balım Apt. altı No: 7, 33000 Yenişehir / Mersin'
       )
 WHERE `content` LIKE '%Yenişehir / MERSİN 33000, Türkiye%';

-- Iletisim ayari: adres alani "Türkiye Geneli" idi -> gercek acik adres.
-- Iletisim sayfasi, footer ve schema.org LocalBusiness bu anahtardan besleniyor.
UPDATE `site_settings`
   SET `value` = JSON_SET(
         `value`,
         '$.address.streetAddress', 'Akkent Mah. 7. Cadde, Bilimkent Sitesi, Balım Apt. altı No: 7',
         '$.address.postalCode', '33000',
         '$.address.addressLocality', 'Yenişehir',
         '$.address.addressRegion', 'Mersin',
         '$.address.addressCountry', 'TR'
       ),
       `updated_at` = CURRENT_TIMESTAMP(3)
 WHERE `key` = 'contact_info'
   AND JSON_VALID(`value`);
