-- 043_woody_footer_odeme_rozeti.sql
-- Footer odeme guven seridi metinleri. Saglayici adi/logosu KODDA DEGIL burada:
-- baska bir firma icin seed'lendiginde bu satirlar degistirilir, kodda marka kalmaz.
-- Ayarlanmazsa frontend saglayici blogunu hic gostermez (notr yedek).
-- Idempotent: JSON_MERGE_PATCH ile mevcut ui_footer anahtarlari korunur.

UPDATE `site_settings`
   SET `value` = JSON_MERGE_PATCH(
         `value`,
         JSON_OBJECT(
           'ui_footer_payment_secure',         '256-bit SSL ile güvenli ödeme',
           'ui_footer_payment_provider_label', 'Ödeme altyapısı',
           'ui_footer_payment_provider_name',  'PayTR',
           'ui_footer_payment_provider_logo',  '/assets/payment/paytr-logo-white.svg',
           'ui_footer_payment_cards',          'Visa, Mastercard, Troy'
         )
       ),
       `updated_at` = CURRENT_TIMESTAMP(3)
 WHERE `key` = 'ui_footer' AND `locale` = 'tr' AND JSON_VALID(`value`);

UPDATE `site_settings`
   SET `value` = JSON_MERGE_PATCH(
         `value`,
         JSON_OBJECT(
           'ui_footer_payment_secure',         'Secure payment with 256-bit SSL',
           'ui_footer_payment_provider_label', 'Payment infrastructure',
           'ui_footer_payment_provider_name',  'PayTR',
           'ui_footer_payment_provider_logo',  '/assets/payment/paytr-logo-white.svg',
           'ui_footer_payment_cards',          'Visa, Mastercard, Troy'
         )
       ),
       `updated_at` = CURRENT_TIMESTAMP(3)
 WHERE `key` = 'ui_footer' AND `locale` = 'en' AND JSON_VALID(`value`);

UPDATE `site_settings`
   SET `value` = JSON_MERGE_PATCH(
         `value`,
         JSON_OBJECT(
           'ui_footer_payment_secure',         'Sichere Zahlung mit 256-Bit-SSL',
           'ui_footer_payment_provider_label', 'Zahlungsinfrastruktur',
           'ui_footer_payment_provider_name',  'PayTR',
           'ui_footer_payment_provider_logo',  '/assets/payment/paytr-logo-white.svg',
           'ui_footer_payment_cards',          'Visa, Mastercard, Troy'
         )
       ),
       `updated_at` = CURRENT_TIMESTAMP(3)
 WHERE `key` = 'ui_footer' AND `locale` = 'de' AND JSON_VALID(`value`);

-- ui_footer yalniz tr/en/de'de vardi; kalan dillerde satir YOKTU, o yuzden
-- saglayici blogu hic gorunmuyordu. Odeme anahtarlariyla satir acilir.
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`) VALUES
('ss-woody-ui-footer-ar', 'ui_footer', 'ar', '{"ui_footer_payment_secure":"الدفع الآمن بتشفير SSL 256 بت","ui_footer_payment_provider_label":"البنية التحتية للدفع","ui_footer_payment_provider_name":"PayTR","ui_footer_payment_provider_logo":"/assets/payment/paytr-logo-white.svg","ui_footer_payment_cards":"Visa, Mastercard, Troy"}'),
('ss-woody-ui-footer-es', 'ui_footer', 'es', '{"ui_footer_payment_secure":"Pago seguro con SSL de 256 bits","ui_footer_payment_provider_label":"Infraestructura de pago","ui_footer_payment_provider_name":"PayTR","ui_footer_payment_provider_logo":"/assets/payment/paytr-logo-white.svg","ui_footer_payment_cards":"Visa, Mastercard, Troy"}'),
('ss-woody-ui-footer-fr', 'ui_footer', 'fr', '{"ui_footer_payment_secure":"Paiement sécurisé en SSL 256 bits","ui_footer_payment_provider_label":"Infrastructure de paiement","ui_footer_payment_provider_name":"PayTR","ui_footer_payment_provider_logo":"/assets/payment/paytr-logo-white.svg","ui_footer_payment_cards":"Visa, Mastercard, Troy"}'),
('ss-woody-ui-footer-it', 'ui_footer', 'it', '{"ui_footer_payment_secure":"Pagamento sicuro con SSL a 256 bit","ui_footer_payment_provider_label":"Infrastruttura di pagamento","ui_footer_payment_provider_name":"PayTR","ui_footer_payment_provider_logo":"/assets/payment/paytr-logo-white.svg","ui_footer_payment_cards":"Visa, Mastercard, Troy"}'),
('ss-woody-ui-footer-nl', 'ui_footer', 'nl', '{"ui_footer_payment_secure":"Veilig betalen met 256-bits SSL","ui_footer_payment_provider_label":"Betaalinfrastructuur","ui_footer_payment_provider_name":"PayTR","ui_footer_payment_provider_logo":"/assets/payment/paytr-logo-white.svg","ui_footer_payment_cards":"Visa, Mastercard, Troy"}'),
('ss-woody-ui-footer-pt-br', 'ui_footer', 'pt-br', '{"ui_footer_payment_secure":"Pagamento seguro com SSL de 256 bits","ui_footer_payment_provider_label":"Infraestrutura de pagamento","ui_footer_payment_provider_name":"PayTR","ui_footer_payment_provider_logo":"/assets/payment/paytr-logo-white.svg","ui_footer_payment_cards":"Visa, Mastercard, Troy"}'),
('ss-woody-ui-footer-ru', 'ui_footer', 'ru', '{"ui_footer_payment_secure":"Безопасная оплата с 256-битным SSL","ui_footer_payment_provider_label":"Платёжная инфраструктура","ui_footer_payment_provider_name":"PayTR","ui_footer_payment_provider_logo":"/assets/payment/paytr-logo-white.svg","ui_footer_payment_cards":"Visa, Mastercard, Troy"}')
ON DUPLICATE KEY UPDATE `value` = JSON_MERGE_PATCH(`value`, VALUES(`value`)), `updated_at` = CURRENT_TIMESTAMP(3);
