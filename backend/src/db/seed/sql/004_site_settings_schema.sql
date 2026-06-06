-- =============================================================
-- 004 — site_settings schema + sablon marka varsayilanlari
-- Tema katalogu: 013_theme_presets_seed.sql
-- Marka metni: AppName tokeni — scripts/apply-brand.py ile proje adina cevrilir
-- =============================================================

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `site_settings`;

CREATE TABLE `site_settings` (
  `id` VARCHAR(64) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT '*',
  `value` MEDIUMTEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_locale_uq` (`key`, `locale`),
  KEY `site_settings_key_idx` (`key`),
  KEY `site_settings_locale_idx` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`) VALUES
('ss-brand-name',        'brand_name',        '*', '"AppName"'),
('ss-brand-subtitle',    'brand_subtitle',    '*', '"Kurumsal web, icerik ve yonetim"'),
('ss-brand-short-name',  'brand_short_name',  '*', '"AppName"'),
('ss-topbar-slogan',     'topbar_slogan',     '*', '"Guvenilir icerik ve hizmet"'),
('ss-app-name',          'app_name',          '*', '"AppName"'),
('ss-app-version',       'app_version',       '*', '"0.1.0"'),
('ss-default-locale',    'default_locale',    '*', '"tr"'),
('ss-available-locales', 'available_locales', '*', '["tr"]'),
('ss-footer-copyright',  'footer_copyright',  '*', '"© 2026 AppName. Tum haklari saklidir."'),
('ss-footer-keywords',   'footer_keywords',   '*', '["web","icerik","yonetim","AppName"]'),
('ss-developer-branding','developer_branding','*', '{"name":"GWD","full_name":"Guzel Web Design","url":"https://guezelwebdesign.com"}'),
('ss-storage-driver',    'storage_driver',    '*', '"local"'),
('ss-app-locales',       'app_locales',       '*', '[{"code":"tr","label":"TR","is_default":true,"is_active":true}]'),
('ss-facebook-pixel-id', 'facebook_pixel_id', '*', '""'),
('ss-ga4-measurement-id', 'ga4_measurement_id', '*', '""'),
('ss-google-site-verification', 'google_site_verification', '*', '""'),
('ss-gtm-container-id', 'gtm_container_id', '*', '""'),
('ss-site-logo',         'site_logo',         '*', '"/uploads/brand/woody-and-friends-optimized.webp"'),
('ss-site-logo-dark',    'site_logo_dark',    '*', '"/uploads/brand/woody-and-friends-optimized.webp"'),
('ss-site-logo-light',   'site_logo_light',   '*', '"/assets/woody/woody-footer-v2.png"'),
('ss-contact-info',      'contact_info',      '*', '{}'),
('ss-socials',           'socials',           '*', '{}'),
('ss-company-brand',     'company_brand',     '*', '{"name":"AppName","website":"","phone":"","email":"","socials":{}}'),
('ss-cookie-consent',    'cookie_consent',    '*', '{"consent_version":1,"ui":{"enabled":true,"position":"bottom","show_reject_all":true},"defaults":{"necessary":true,"analytics":false,"marketing":false},"texts":{"title":"Cerezler","description":"Deneyimi gelistirmek icin cerezler kullaniyoruz."}}'),
('ss-chat-widget-enabled', 'chat_widget_enabled', '*', 'false'),
('ss-chat-ai-welcome-message-loc-tr', 'chat_ai_welcome_message', 'tr', '""'),
('ss-chat-ai-welcome-message-loc-all', 'chat_ai_welcome_message', '*', '""'),
('ss-ui-support-ai-image', 'ui_support_ai_image', '*', '""'),
('ss-ui-admin-config', 'ui_admin_config', '*', '{"branding":{"app_name":"AppName Admin","app_copyright":"AppName","html_lang":"tr","theme_color":"#15803d","favicon_16":"/favicon/favicon-16.svg","favicon_32":"/favicon/favicon-32.svg","favicon_url":"/favicon.ico","logo_url":"","apple_touch_icon":"/favicon/apple-touch-icon.svg","admin_login_quote":"Site ayarlarini ve icerigi buradan yonetin.","admin_login_heading":"","admin_login_background_url":"/img/admin_login_bg.png","meta":{"title":"AppName Admin","description":"Yonetim paneli.","og_url":"http://localhost:3096","og_title":"AppName Admin","og_description":"Yonetim paneli.","og_image":"/favicon.svg","twitter_card":"summary_large_image"}}}');
