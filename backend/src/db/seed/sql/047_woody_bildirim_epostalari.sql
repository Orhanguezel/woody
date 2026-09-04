-- =============================================================
-- 047 — Yonetici bildirim e-postalari
--
-- Bildirim alicilari .env ADMIN_EMAIL'den site_settings'e tasindi:
-- adres degistirmek icin artik sunucuya girip deploy gerekmiyor,
-- Site Ayarlari > Bildirim E-postalari'ndan yonetiliyor.
--
-- notify_emails: virgulle ayrilmis liste (birden fazla alici).
-- notify_on_*  : her bildirim turu ayri acilip kapatilabilir.
--
-- Not: gonderen adresi (smtp_from_email) DEGISMEDI —
-- noreply@woodyvearkadaslari.com olarak kalir; DKIM o alan adina
-- imzalidir, Gmail adresine cevrilirse SPF/DKIM uyusmaz ve mailler
-- spam'e duser.
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`) VALUES
  ('ss-woody-notify-emails',  'notify_emails',    '*', '"minayayinevi@gmail.com, orhanguzell@gmail.com"'),
  ('ss-woody-notify-order',   'notify_on_order',  '*', 'true'),
  ('ss-woody-notify-quote',   'notify_on_quote',  '*', 'true'),
  ('ss-woody-notify-contact', 'notify_on_contact','*', 'true')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
