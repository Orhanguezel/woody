-- =============================================================
-- 031 — Twitter/X + sosyal medya gönderi kuyruğu (tweets)
-- status: queued | posting | sent | failed | canceled
-- platform: twitter | facebook | instagram | linkedin | youtube
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tweets` (
  `id`               CHAR(36)     NOT NULL,
  `platform`         VARCHAR(24)  NOT NULL DEFAULT 'twitter',
  `content`          TEXT         NOT NULL,
  `status`           VARCHAR(20)  NOT NULL DEFAULT 'sent',
  `source`           VARCHAR(32)  NOT NULL DEFAULT 'manual',
  `template`         VARCHAR(50)  DEFAULT NULL,
  `post_format`      VARCHAR(16)  NOT NULL DEFAULT 'post',
  `media_url`        TEXT         DEFAULT NULL,
  `source_ref`       VARCHAR(190) DEFAULT NULL,
  `scheduled_at`     DATETIME     DEFAULT NULL,
  `posted_at`        DATETIME     DEFAULT NULL,
  `retry_count`      INT          NOT NULL DEFAULT 0,
  `locked_at`        DATETIME     DEFAULT NULL,
  `x_tweet_id`       VARCHAR(64)  DEFAULT NULL,
  `external_post_id` VARCHAR(128) DEFAULT NULL,
  `error_message`    TEXT         DEFAULT NULL,
  `created_at`       DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tweets_x_tweet_id` (`x_tweet_id`),
  UNIQUE KEY `uq_tweets_source_ref` (`source_ref`),
  KEY `idx_tweets_platform_status_sched` (`platform`, `status`, `scheduled_at`),
  KEY `idx_tweets_status_sched` (`status`, `scheduled_at`),
  KEY `idx_tweets_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
