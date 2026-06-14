-- =============================================================
-- 032 — Platform bazlı sosyal içerik planı (social_content_plans)
-- Satırlar opsiyoneldir; içerik motoru / admin panelden doldurulur.
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `social_content_plans` (
  `id`                CHAR(36)     NOT NULL,
  `platform`          VARCHAR(24)  NOT NULL,
  `slot_key`          VARCHAR(64)  NOT NULL,
  `day_of_week`       INT          NOT NULL,
  `hour`              INT          NOT NULL,
  `minute`            INT          NOT NULL DEFAULT 0,
  `template`          VARCHAR(50)  NOT NULL,
  `pillar`            VARCHAR(100) DEFAULT NULL,
  `topic`             VARCHAR(255) DEFAULT NULL,
  `preferred_product` VARCHAR(120) DEFAULT NULL,
  `post_format`       VARCHAR(16)  NOT NULL DEFAULT 'post',
  `media_required`    INT          NOT NULL DEFAULT 0,
  `is_active`         INT          NOT NULL DEFAULT 1,
  `order_index`       INT          NOT NULL DEFAULT 0,
  `created_at`        DATETIME     NOT NULL,
  `updated_at`        DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_scp_platform_slot` (`platform`, `slot_key`),
  KEY `idx_scp_platform_active` (`platform`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
