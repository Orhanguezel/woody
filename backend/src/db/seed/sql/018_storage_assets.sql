-- storage_assets.sql — Medya/dosya kayitlari (shared storage modulu)
-- provider=local|cloudinary; bucket=default/public/avatars...
-- path = LOCAL_STORAGE_ROOT altindaki goreli yol
-- url  = LOCAL_STORAGE_BASE_URL + '/' + path  (yerelde goreli; publicApiBase ile mutlaklasir)
-- NOT: markadan bagimsiz sablon — seed verisi yok, tablo bos baslar.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `storage_assets` (
  `id`         CHAR(36)        NOT NULL,
  `user_id`    CHAR(36)        DEFAULT NULL,
  `name`       VARCHAR(255)    NOT NULL,
  `bucket`     VARCHAR(64)     NOT NULL,
  `path`       VARCHAR(512)    NOT NULL,
  `folder`     VARCHAR(255)    DEFAULT NULL,
  `mime`       VARCHAR(127)    NOT NULL,
  `size`       BIGINT UNSIGNED NOT NULL,
  `width`      INT UNSIGNED    DEFAULT NULL,
  `height`     INT UNSIGNED    DEFAULT NULL,
  `url`        TEXT            DEFAULT NULL,
  `hash`       VARCHAR(64)     DEFAULT NULL,
  `provider`               VARCHAR(16)  NOT NULL DEFAULT 'local',
  `provider_public_id`     VARCHAR(255) DEFAULT NULL,
  `provider_resource_type` VARCHAR(16)  DEFAULT NULL,
  `provider_format`        VARCHAR(32)  DEFAULT NULL,
  `provider_version`       INT UNSIGNED DEFAULT NULL,
  `etag`                   VARCHAR(64)  DEFAULT NULL,
  `metadata`   JSON            DEFAULT NULL,
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_bucket_path` (`bucket`, `path`),
  KEY `idx_storage_bucket`  (`bucket`),
  KEY `idx_storage_folder`  (`folder`),
  KEY `idx_storage_created` (`created_at`),
  KEY `idx_provider_pubid`  (`provider_public_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Woody marka varlıkları (backend/uploads/brand/* → storage) ──────────────────
INSERT INTO `storage_assets` (`id`,`name`,`bucket`,`path`,`folder`,`mime`,`size`,`url`,`provider`) VALUES
('sa-woody-logo-primary-svg','logo-primary.svg','brand','brand/logo-primary.svg','brand','image/svg+xml',26742,'/uploads/brand/logo-primary.svg','local'),
('sa-woody-logo-white-svg','logo-white.svg','brand','brand/logo-white.svg','brand','image/svg+xml',17691,'/uploads/brand/logo-white.svg','local'),
('sa-woody-logo-dark-svg','logo-dark.svg','brand','brand/logo-dark.svg','brand','image/svg+xml',8865,'/uploads/brand/logo-dark.svg','local'),
('sa-woody-logo-icon-svg','logo-icon.svg','brand','brand/logo-icon.svg','brand','image/svg+xml',2341,'/uploads/brand/logo-icon.svg','local'),
('sa-woody-logo-primary-1024','logo-primary-1024.png','brand','brand/logo-primary-1024.png','brand','image/png',60199,'/uploads/brand/logo-primary-1024.png','local'),
('sa-woody-logo-primary-512','logo-primary-512.png','brand','brand/logo-primary-512.png','brand','image/png',26062,'/uploads/brand/logo-primary-512.png','local'),
('sa-woody-logo-white-1024','logo-white-1024.png','brand','brand/logo-white-1024.png','brand','image/png',36641,'/uploads/brand/logo-white-1024.png','local'),
('sa-woody-favicon-512','favicon-512.png','brand','brand/favicon-512.png','brand','image/png',19317,'/uploads/brand/favicon-512.png','local'),
('sa-woody-favicon-64','favicon-64.png','brand','brand/favicon-64.png','brand','image/png',2036,'/uploads/brand/favicon-64.png','local')
ON DUPLICATE KEY UPDATE `url`=VALUES(`url`), `size`=VALUES(`size`), `mime`=VALUES(`mime`);
