-- =============================================================
-- 028 — Woody Digital header menu + home layout entry
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `menu_items` (`id`, `parent_id`, `type`, `location`, `order_num`, `is_active`)
VALUES
  ('11111111-1111-4111-8111-000000000012', NULL, 'custom', 'header', 75, 1)
ON DUPLICATE KEY UPDATE
  `parent_id` = VALUES(`parent_id`),
  `order_num` = VALUES(`order_num`),
  `is_active` = VALUES(`is_active`);

INSERT INTO `menu_items_i18n` (`id`, `menu_item_id`, `locale`, `title`, `url`) VALUES
  ('22222222-2222-4222-8222-000000000012', '11111111-1111-4111-8111-000000000012', 'tr', 'Woody Dijital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000112', '11111111-1111-4111-8111-000000000012', 'en', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000212', '11111111-1111-4111-8111-000000000012', 'de', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000312', '11111111-1111-4111-8111-000000000012', 'fr', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000412', '11111111-1111-4111-8111-000000000012', 'es', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000512', '11111111-1111-4111-8111-000000000012', 'it', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000612', '11111111-1111-4111-8111-000000000012', 'nl', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000712', '11111111-1111-4111-8111-000000000012', 'ru', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000812', '11111111-1111-4111-8111-000000000012', 'ar', 'Woody Digital', '/digital-content'),
  ('22222222-2222-4222-8222-000000000912', '11111111-1111-4111-8111-000000000012', 'pt-BR', 'Woody Digital', '/digital-content')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `url` = VALUES(`url`);

INSERT INTO `home_sections` (`id`, `slug`, `label`, `component_key`, `order_index`, `is_active`, `config`)
VALUES
  ('home-digital-content', 'digital-content', 'Woody Dijital', 'WoodyDigitalEntry', 35, 1, NULL)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `component_key` = VALUES(`component_key`),
  `order_index` = VALUES(`order_index`),
  `is_active` = VALUES(`is_active`);
