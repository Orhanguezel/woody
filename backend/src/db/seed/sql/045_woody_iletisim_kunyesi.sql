-- 045_woody_iletisim_kunyesi.sql
-- `contact_info` ayarinda yalnizca marka adi vardi; fatura unvani ("Mina Yayinevi") ve
-- satici gercek kisi adi iletisim sayfasinin SSR blogunda KODA GOMULUYDU. Marka kurali
-- geregi bu degerler koddan cikarildi, tek kaynak bu ayar oldu.
-- Iletisim sayfasi kunye karti, footer adres blogu ve schema.org LocalBusiness ayni
-- anahtardan beslenir. Mesafeli Satis Yonetmeligi + PayTR denetimi satici unvani ve
-- acik adresin sitede gorunur olmasini istiyor.
-- Idempotent: JSON_SET ayni degerle tekrar calisabilir.

UPDATE `site_settings`
   SET `value` = JSON_SET(
         `value`,
         '$.legalName',  'Mina Yayınevi',
         '$.sellerName', 'Ayşe Polat Karakuş'
       ),
       `updated_at` = CURRENT_TIMESTAMP(3)
 WHERE `key` = 'contact_info'
   AND JSON_VALID(`value`);
