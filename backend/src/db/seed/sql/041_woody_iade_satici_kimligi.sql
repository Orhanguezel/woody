-- 041_woody_iade_satici_kimligi.sql
-- "Iptal, Iade ve Geri Odeme Kosullari" sayfasinda satici kimligi hic yoktu; diger uc
-- ticari yasal sayfada var. PayTR canli mod denetimi satici bilgisinin sitede gorunur
-- olmasini istiyor, iade sayfasi da o listede. Iletisim bolumunun ustune eklenir.
-- Idempotent: blok zaten varsa hicbir satiri degistirmez.
UPDATE `custom_pages_i18n` i
  JOIN `custom_pages` cp ON cp.id = i.page_id
   SET i.`content` = REPLACE(
         i.`content`,
         '<h2>8. İletişim</h2>',
         '<h2>8. Satıcı Bilgileri</h2>\n<ul>\n  <li><strong>Satıcı Unvanı:</strong> Ayşe Polat Karakuş – Mina Yayınevi (&ldquo;Woody and Friends&rdquo;)</li>\n  <li><strong>Adres:</strong> Yenişehir / MERSİN 33000, Türkiye</li>\n</ul>\n\n<h2>9. İletişim</h2>'
       )
 WHERE cp.`module_key` = 'refund'
   AND i.`content` LIKE '%<h2>8. İletişim</h2>%';
