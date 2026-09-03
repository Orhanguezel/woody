-- =============================================================
-- 049 — Iletisim sayfasi harita ayari
-- Eksik contact_map kaydinin public sayfada 404 uretmesini engeller.
-- =============================================================

SET NAMES utf8mb4;

INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`)
VALUES (
  'ss-woody-contact-map',
  'contact_map',
  '*',
  '{"title":"Woody and Friends","embed_url":"https://www.google.com/maps?q=Akkent%20Mahallesi%207.%20Cadde%20Bilimkent%20Sitesi%20Yeni%C5%9Fehir%20Mersin&output=embed"}'
)
ON DUPLICATE KEY UPDATE `value` = `value`;
