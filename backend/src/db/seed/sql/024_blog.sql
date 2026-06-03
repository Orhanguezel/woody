-- =============================================================
-- 024 — Woody dinamik blog zemini (shared blog)
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` CHAR(36) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'genel',
  `author` VARCHAR(128) DEFAULT NULL,
  `image_url` VARCHAR(512) DEFAULT NULL,
  `rss_source_url` VARCHAR(768) DEFAULT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'draft',
  `published_at` DATETIME(3) DEFAULT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `blog_posts_category_idx` (`category`),
  KEY `blog_posts_status_idx` (`status`),
  KEY `blog_posts_published_idx` (`published_at`),
  KEY `blog_posts_active_idx` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts_i18n` (
  `blog_post_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT 'tr',
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`blog_post_id`, `locale`),
  UNIQUE KEY `blog_posts_i18n_slug_locale_uq` (`slug`, `locale`),
  KEY `blog_posts_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_blog_posts_i18n_post` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `blog_posts` (`id`, `category`, `author`, `image_url`, `status`, `published_at`, `is_active`, `display_order`) VALUES
('24111111-1111-4111-8111-000000000001', 'okul-oncesi', 'Woody Editör Ekibi', '/assets/woody/blog/preschool-english.svg', 'published', '2026-06-03 09:00:00.000', 1, 10),
('24111111-1111-4111-8111-000000000002', 'aile', 'Woody Editör Ekibi', '/assets/woody/blog/home-routine.svg', 'published', '2026-06-03 09:10:00.000', 1, 20),
('24111111-1111-4111-8111-000000000003', 'dijital-icerik', 'Woody Editör Ekibi', '/assets/woody/blog/digital-learning.svg', 'published', '2026-06-03 09:20:00.000', 1, 30)
ON DUPLICATE KEY UPDATE
  `category` = VALUES(`category`),
  `author` = VALUES(`author`),
  `image_url` = VALUES(`image_url`),
  `status` = VALUES(`status`),
  `published_at` = VALUES(`published_at`),
  `is_active` = VALUES(`is_active`),
  `display_order` = VALUES(`display_order`);

INSERT INTO `blog_posts_i18n` (`blog_post_id`, `locale`, `title`, `slug`, `excerpt`, `content`, `meta_title`, `meta_description`) VALUES
('24111111-1111-4111-8111-000000000001', 'tr', 'Okul öncesi İngilizcede hikaye neden işe yarar?', 'okul-oncesi-ingilizcede-hikaye-neden-ise-yarar', 'Hikaye temelli öğrenme çocukların kelime, ritim ve bağlamı birlikte kurmasına yardımcı olur.', '<p>Hikaye temelli İngilizce öğrenme, çocukların dili ezberden çok bağlam içinde duymasını sağlar. Woody içerikleri kısa sahneler, tekrar eden kalıplar ve görsel ipuçlarıyla okul öncesi yaş grubu için güvenli bir öğrenme ritmi kurar.</p>', 'Okul öncesi İngilizcede hikaye temelli öğrenme', 'Hikaye temelli okul öncesi İngilizce öğrenmenin çocuklar için avantajları.'),
('24111111-1111-4111-8111-000000000001', 'en', 'Why stories work in preschool English', 'why-stories-work-in-preschool-english', 'Story-led learning helps children build vocabulary, rhythm, and context together.', '<p>Story-led English learning lets children hear language in context rather than as isolated words. Woody content uses short scenes, repeated patterns, and visual cues to create a steady preschool learning rhythm.</p>', 'Why stories work in preschool English', 'The advantages of story-led preschool English learning for children.'),
('24111111-1111-4111-8111-000000000002', 'tr', 'Evde İngilizce rutini nasıl küçük kalır?', 'evde-ingilizce-rutini-nasil-kucuk-kalir', 'Kısa, tekrar edilebilir ve neşeli rutinler evde İngilizceyi sürdürülebilir kılar.', '<p>Evde İngilizce rutini büyük bir ders saatine dönüşmek zorunda değildir. Beş dakikalık şarkı, iki kart oyunu veya yatmadan önce bir mini hikaye çocukların dili gündelik hayatın içinde duymasını sağlar.</p>', 'Evde çocuk İngilizcesi rutini', 'Aileler için kısa ve sürdürülebilir İngilizce rutin önerileri.'),
('24111111-1111-4111-8111-000000000002', 'en', 'How to keep home English routines small', 'how-to-keep-home-english-routines-small', 'Short, repeatable, cheerful routines make English sustainable at home.', '<p>A home English routine does not need to become a full lesson. A five-minute song, two card games, or a mini story before bed helps children hear the language inside everyday life.</p>', 'Home English routines for children', 'Short and sustainable English routine ideas for families.'),
('24111111-1111-4111-8111-000000000003', 'tr', 'Dijital içerik okulda nasıl güvenli açılır?', 'dijital-icerik-okulda-nasil-guvenli-acilir', 'Okul hesabı, içerik ataması ve korumalı erişim dijital içerikleri kontrollü hale getirir.', '<p>Woody dijital içerikleri public tanıtım sayfalarında anlatılır, gerçek dosya erişimi ise okul hesabı ve içerik atamasıyla açılır. Bu model öğretmenin sadece okuluna tanımlanan içeriği görmesini sağlar.</p>', 'Okulda güvenli dijital içerik erişimi', 'Okul hesabı ve içerik atamasıyla güvenli dijital içerik erişimi.'),
('24111111-1111-4111-8111-000000000003', 'en', 'How schools can open digital content safely', 'how-schools-can-open-digital-content-safely', 'School accounts, content assignment, and protected access keep digital content controlled.', '<p>Woody digital content is introduced on public pages, while actual file access opens through school accounts and content assignments. This model ensures teachers only see the material assigned to their school.</p>', 'Safe school access to digital content', 'Safe digital content access through school accounts and assignments.')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `excerpt` = VALUES(`excerpt`),
  `content` = VALUES(`content`),
  `meta_title` = VALUES(`meta_title`),
  `meta_description` = VALUES(`meta_description`);
