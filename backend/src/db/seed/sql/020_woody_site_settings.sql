-- =============================================================
-- 020 — Woody ve Arkadaşları marka, dil, tema ve menü seed'i
-- Şema değişikliği yoktur; yalnızca site_settings/menu_items içerik seed'i.
-- =============================================================

SET NAMES utf8mb4;

INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`) VALUES
('ss-woody-brand-name', 'brand_name', '*', '"Woody ve Arkadaşları"'),
('ss-woody-brand-subtitle', 'brand_subtitle', '*', '"Çocuklar için İngilizce, hikaye ve dijital öğrenme"'),
('ss-woody-brand-short-name', 'brand_short_name', '*', '"Woody"'),
('ss-woody-topbar-slogan', 'topbar_slogan', '*', '"Çocuklar için neşeli İngilizce öğrenme deneyimi"'),
('ss-woody-app-name', 'app_name', '*', '"Woody ve Arkadaşları"'),
('ss-woody-default-locale', 'default_locale', '*', '"tr"'),
('ss-woody-available-locales', 'available_locales', '*', '["tr","en","de","ar","fr","ru","es","it","nl","pt-br"]'),
('ss-woody-app-locales', 'app_locales', '*', '[{"code":"tr","label":"TR","is_default":true,"is_active":true},{"code":"en","label":"EN","is_default":false,"is_active":true},{"code":"de","label":"DE","is_default":false,"is_active":true},{"code":"ar","label":"AR","is_default":false,"is_active":true},{"code":"fr","label":"FR","is_default":false,"is_active":true},{"code":"ru","label":"RU","is_default":false,"is_active":true},{"code":"es","label":"ES","is_default":false,"is_active":true},{"code":"it","label":"IT","is_default":false,"is_active":true},{"code":"nl","label":"NL","is_default":false,"is_active":true},{"code":"pt-br","label":"PT-BR","is_default":false,"is_active":true}]'),
('ss-woody-footer-copyright', 'footer_copyright', '*', '"© 2026 Woody ve Arkadaşları. Tüm hakları saklıdır."'),
('ss-woody-footer-keywords', 'footer_keywords', '*', '["Woody ve Arkadaşları","okul öncesi İngilizce","çocuk İngilizce","dijital içerik","hikaye"]'),
('ss-woody-ga4', 'ga4_measurement_id', '*', '"G-0D7LYLF51K"'),
('ss-woody-gtm', 'gtm_container_id', '*', '"dogaadmin"'),
('ss-woody-site-logo', 'site_logo', '*', '"/logo/logo.svg"'),
('ss-woody-site-logo-dark', 'site_logo_dark', '*', '"/logo/logo.svg"'),
('ss-woody-site-logo-light', 'site_logo_light', '*', '"/logo/logo.svg"'),
('ss-woody-site-favicon', 'site_favicon', '*', '"/favicon.svg"'),
('ss-woody-site-apple-touch-icon', 'site_apple_touch_icon', '*', '"/favicon/apple-touch-icon.svg"'),
('ss-woody-site-app-icon-512', 'site_app_icon_512', '*', '"/favicon/icon-512.svg"'),
('ss-woody-contact-info', 'contact_info', '*', '{"companyName":"Woody ve Arkadaşları","email":"","phones":[],"address":{},"businessHours":[] }'),
('ss-woody-socials', 'socials', '*', '{}'),
('ss-woody-company-brand', 'company_brand', '*', '{"name":"Woody ve Arkadaşları","website":"https://woodyvearkadaslari.com","phone":"","email":"","socials":{}}'),
('ss-woody-seo', 'seo', '*', '{"site_name":"Woody ve Arkadaşları","title_default":"Woody ve Arkadaşları — Çocuklar için İngilizce ve dijital öğrenme","title_template":"%s | Woody ve Arkadaşları","description":"Woody ve Arkadaşları okul öncesi İngilizce, atölye, ev öğretmeni ve dijital içerik deneyimlerini sunar.","open_graph":{"type":"website","images":["/img/og-default.jpg"]},"twitter":{"card":"summary_large_image"},"robots":{"noindex":false,"index":true,"follow":true}}')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- Tema seed'lerinden sonra Woody Klasik tokenlarının aktif kalmasını garanti eder.
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`) VALUES
('ss-active-theme', 'active_theme_preset', '*', 'woody-klasik'),
('ss-woody-design-tokens', 'design_tokens', '*', '{"version":"2","colors":{"brand_primary":"#2196F3","brand_primary_dark":"#0B5CAD","brand_primary_light":"#8ED1FF","brand_secondary":"#FF6A00","brand_secondary_dim":"#C94F00","brand_secondary_light":"#FFB800","brand_accent":"#F5C518","bg_base":"#F7FBFF","bg_deep":"#EAF6FF","bg_surface":"#FFFFFF","bg_surface_high":"#FFF7DA","text_primary":"#0B1F3A","text_secondary":"#244B72","text_muted":"#61748C","text_muted_soft":"#8A9AAF","border":"rgba(33,150,243,0.24)","border_soft":"rgba(33,150,243,0.12)","success":"#2ECC71","warning":"#FFB800","error":"#D32F2F","info":"#2196F3","level_basic":"#2196F3","level_junior":"#F5C518","level_senior":"#E91E90","level_pro":"#D32F2F","bg_base_dark":"#07182C","bg_deep_dark":"#04101F","bg_surface_dark":"#0B1F3A","bg_surface_high_dark":"#12365F","text_primary_dark":"#F7FBFF","text_secondary_dark":"#D8EAFF","text_muted_dark":"#A8C4DF"},"typography":{"font_display":"var(--font-fredoka), var(--font-inter), system-ui, sans-serif","font_serif":"var(--font-source-serif), Georgia, serif","font_sans":"var(--font-inter), system-ui, sans-serif","font_mono":"var(--font-ibm-mono), ui-monospace, monospace","base_size":"16px"},"radius":{"xs":"4px","sm":"8px","md":"12px","lg":"16px","xl":"24px","pill":"9999px"},"shadows":{"soft":"0 2px 20px rgba(33,150,243,0.10)","card":"0 8px 40px rgba(11,31,58,0.12)","glow_primary":"0 0 60px rgba(33,150,243,0.18)","glow_gold":"0 0 34px rgba(245,197,24,0.22)"},"branding":{"app_name":"Woody ve Arkadaşları","tagline":"Çocuklar için İngilizce, hikaye ve dijital öğrenme deneyimi","tagline_en":"English, stories, and digital learning for children","logo_url":"/uploads/brand/logo-primary.svg","favicon_url":"/uploads/brand/favicon-512.png","theme_color":"#2196F3","theme_color_dark":"#0B1F3A","og_image_url":"/img/og-default.jpg"}}')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `menu_items` (`id`, `parent_id`, `type`, `location`, `order_num`, `is_active`) VALUES
('11111111-1111-4111-8111-000000000001', NULL, 'custom', 'header', 10, 1),
('11111111-1111-4111-8111-000000000002', NULL, 'custom', 'header', 20, 1),
('11111111-1111-4111-8111-000000000003', NULL, 'custom', 'header', 30, 1),
('11111111-1111-4111-8111-000000000004', NULL, 'custom', 'header', 40, 1),
('11111111-1111-4111-8111-000000000005', NULL, 'custom', 'header', 50, 1),
('11111111-1111-4111-8111-000000000006', NULL, 'custom', 'header', 60, 1),
('11111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-000000000006', 'custom', 'header', 10, 1),
('11111111-1111-4111-8111-000000000008', '11111111-1111-4111-8111-000000000006', 'custom', 'header', 20, 1),
('11111111-1111-4111-8111-000000000009', '11111111-1111-4111-8111-000000000006', 'custom', 'header', 30, 1),
('11111111-1111-4111-8111-000000000010', '11111111-1111-4111-8111-000000000006', 'custom', 'header', 40, 1),
('11111111-1111-4111-8111-000000000011', '11111111-1111-4111-8111-000000000006', 'custom', 'header', 50, 1)
ON DUPLICATE KEY UPDATE `parent_id` = VALUES(`parent_id`), `order_num` = VALUES(`order_num`), `is_active` = VALUES(`is_active`);

INSERT INTO `menu_items_i18n` (`id`, `menu_item_id`, `locale`, `title`, `url`) VALUES
('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001', 'tr', 'Ana Sayfa', '/'),
('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000002', 'tr', 'Anaokulu', '/preschool'),
('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000003', 'tr', 'Akademi', '/woody-academy'),
('22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-000000000004', 'tr', 'Dijital İçerik', '/digital-content'),
('22222222-2222-4222-8222-000000000005', '11111111-1111-4111-8111-000000000005', 'tr', 'Mağaza', '/store'),
('22222222-2222-4222-8222-000000000006', '11111111-1111-4111-8111-000000000006', 'tr', 'Keşfet', ''),
('22222222-2222-4222-8222-000000000007', '11111111-1111-4111-8111-000000000007', 'tr', 'Atölye', '/workshop'),
('22222222-2222-4222-8222-000000000008', '11111111-1111-4111-8111-000000000008', 'tr', 'Ev Öğretmeni', '/home-tutor'),
('22222222-2222-4222-8222-000000000009', '11111111-1111-4111-8111-000000000009', 'tr', 'Kütüphane', '/library'),
('22222222-2222-4222-8222-000000000010', '11111111-1111-4111-8111-000000000010', 'tr', 'Blog', '/blog'),
('22222222-2222-4222-8222-000000000011', '11111111-1111-4111-8111-000000000011', 'tr', 'İletişim', '/contact'),
('22222222-2222-4222-8222-000000000101', '11111111-1111-4111-8111-000000000001', 'en', 'Home', '/'),
('22222222-2222-4222-8222-000000000102', '11111111-1111-4111-8111-000000000002', 'en', 'Preschool', '/preschool'),
('22222222-2222-4222-8222-000000000103', '11111111-1111-4111-8111-000000000003', 'en', 'Academy', '/woody-academy'),
('22222222-2222-4222-8222-000000000104', '11111111-1111-4111-8111-000000000004', 'en', 'Digital Content', '/digital-content'),
('22222222-2222-4222-8222-000000000105', '11111111-1111-4111-8111-000000000005', 'en', 'Store', '/store'),
('22222222-2222-4222-8222-000000000106', '11111111-1111-4111-8111-000000000006', 'en', 'Explore', ''),
('22222222-2222-4222-8222-000000000107', '11111111-1111-4111-8111-000000000007', 'en', 'Workshop', '/workshop'),
('22222222-2222-4222-8222-000000000108', '11111111-1111-4111-8111-000000000008', 'en', 'Home Tutor', '/home-tutor'),
('22222222-2222-4222-8222-000000000109', '11111111-1111-4111-8111-000000000009', 'en', 'Library', '/library'),
('22222222-2222-4222-8222-000000000110', '11111111-1111-4111-8111-000000000010', 'en', 'Blog', '/blog'),
('22222222-2222-4222-8222-000000000111', '11111111-1111-4111-8111-000000000011', 'en', 'Contact', '/contact')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `url` = VALUES(`url`);

INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`) VALUES
('ss-woody-ui-header-tr', 'ui_header', 'tr', '{"ui_header_cta":"İletişim","ui_header_close":"Kapat","ui_header_language":"Dil","ui_header_profile":"Profil","ui_header_logout":"Çıkış","ui_header_login":"Giriş","ui_header_register":"Kayıt Ol","ui_header_contact_info":"İletişim"}'),
('ss-woody-ui-header-en', 'ui_header', 'en', '{"ui_header_cta":"Contact","ui_header_close":"Close","ui_header_language":"Language","ui_header_profile":"Profile","ui_header_logout":"Logout","ui_header_login":"Login","ui_header_register":"Register","ui_header_contact_info":"Contact"}'),
('ss-woody-ui-header-de', 'ui_header', 'de', '{"ui_header_cta":"Kontakt","ui_header_close":"Schließen","ui_header_language":"Sprache","ui_header_profile":"Profil","ui_header_logout":"Abmelden","ui_header_login":"Anmelden","ui_header_register":"Registrieren","ui_header_contact_info":"Kontakt"}'),
('ss-woody-ui-footer-tr', 'ui_footer', 'tr', '{"ui_footer_tagline":"Çocuklar için İngilizce, hikaye ve dijital öğrenme deneyimi.","ui_footer_rights":"TÜM HAKLARI SAKLIDIR."}'),
('ss-woody-ui-footer-en', 'ui_footer', 'en', '{"ui_footer_tagline":"English, stories, and digital learning for children.","ui_footer_rights":"ALL RIGHTS RESERVED."}'),
('ss-woody-ui-footer-de', 'ui_footer', 'de', '{"ui_footer_tagline":"Englisch, Geschichten und digitales Lernen für Kinder.","ui_footer_rights":"ALLE RECHTE VORBEHALTEN."}'),
('ss-woody-ui-blog-tr', 'ui_blog', 'tr', '{"ui_blog_page_title":"Blog","ui_blog_meta_title":"Woody Blog","ui_blog_meta_description":"Çocuk İngilizcesi, okul öncesi öğrenme ve dijital içerik notları.","ui_blog_read_more":"Devamını oku","ui_blog_eyebrow":"Woody günlüğü","ui_blog_hero_title":"Çocuk İngilizcesi ve dijital öğrenme yazıları","ui_blog_hero_lead":"Aileler, okullar ve çocuklarla çalışan eğitimciler için kısa notlar.","ui_blog_untitled":"Başlıksız","ui_blog_back_to_list":"Tüm yazılara dön","ui_blog_other_blogs_title":"Diğer yazılar","ui_blog_not_found":"Blog içeriği bulunamadı.","ui_blog_like":"Beğen","ui_blog_liked":"Beğenildi","ui_blog_share":"Paylaş","ui_blog_comments_title":"Yorumlar","ui_blog_contact_cta_title":"Sorunuz mu var?","ui_blog_contact_cta_desc":"Sorularınız veya talepleriniz için bize ulaşabilirsiniz.","ui_blog_contact_phone":"Telefon","ui_blog_contact_whatsapp":"WhatsApp","ui_blog_contact_form":"İletişim formu"}'),
('ss-woody-ui-blog-en', 'ui_blog', 'en', '{"ui_blog_page_title":"Blog","ui_blog_meta_title":"Woody Blog","ui_blog_meta_description":"Notes on children English, preschool learning, and digital content.","ui_blog_read_more":"Read more","ui_blog_eyebrow":"Woody journal","ui_blog_hero_title":"Articles on children English and digital learning","ui_blog_hero_lead":"Short notes for families, schools, and educators working with children.","ui_blog_untitled":"Untitled","ui_blog_back_to_list":"Back to all posts","ui_blog_other_blogs_title":"Other posts","ui_blog_not_found":"Blog post not found.","ui_blog_like":"Like","ui_blog_liked":"Liked","ui_blog_share":"Share","ui_blog_comments_title":"Comments","ui_blog_contact_cta_title":"Have a question?","ui_blog_contact_cta_desc":"If you have any questions, feel free to contact us.","ui_blog_contact_phone":"Phone","ui_blog_contact_whatsapp":"WhatsApp","ui_blog_contact_form":"Contact form"}'),
('ss-woody-ui-blog-de', 'ui_blog', 'de', '{"ui_blog_page_title":"Blog","ui_blog_meta_title":"Woody Blog","ui_blog_meta_description":"Notizen zu Kinderenglisch, Vorschullernen und digitalen Inhalten.","ui_blog_read_more":"Weiterlesen","ui_blog_eyebrow":"Woody Journal","ui_blog_hero_title":"Artikel zu Kinderenglisch und digitalem Lernen","ui_blog_hero_lead":"Kurze Notizen für Familien, Schulen und Pädagoginnen und Pädagogen.","ui_blog_untitled":"Ohne Titel","ui_blog_back_to_list":"Zur Übersicht","ui_blog_other_blogs_title":"Weitere Beiträge","ui_blog_not_found":"Blogbeitrag nicht gefunden.","ui_blog_like":"Gefällt mir","ui_blog_liked":"Gefällt mir","ui_blog_share":"Teilen","ui_blog_comments_title":"Kommentare","ui_blog_contact_cta_title":"Noch Fragen?","ui_blog_contact_cta_desc":"Wenn Sie Fragen haben, kontaktieren Sie uns gern.","ui_blog_contact_phone":"Telefon","ui_blog_contact_whatsapp":"WhatsApp","ui_blog_contact_form":"Kontaktformular"}')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
