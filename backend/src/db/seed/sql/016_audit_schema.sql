-- =============================================================
-- FILE: src/db/seed/sql/108_audit_schema.sql
-- DESCRIPTION: audit_request_logs + audit_auth_events
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_request_logs` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `req_id`           VARCHAR(64)     NOT NULL,
  `method`           VARCHAR(16)     NOT NULL,
  `url`              LONGTEXT        NOT NULL,
  `path`             VARCHAR(255)    NOT NULL,
  `status_code`      INT             NOT NULL,
  `response_time_ms` INT             NOT NULL DEFAULT 0,
  `ip`               VARCHAR(64)     NOT NULL,
  `user_agent`       LONGTEXT        DEFAULT NULL,
  `referer`          LONGTEXT        DEFAULT NULL,
  `user_id`          VARCHAR(64)     DEFAULT NULL,
  `is_admin`         INT             NOT NULL DEFAULT 0,
  `country`          VARCHAR(8)      DEFAULT NULL,
  `city`             VARCHAR(64)     DEFAULT NULL,
  `error_message`    VARCHAR(512)    DEFAULT NULL,
  `error_code`       VARCHAR(64)     DEFAULT NULL,
  `request_body`     LONGTEXT        DEFAULT NULL,
  `gclid`            VARCHAR(255)    DEFAULT NULL,
  `utm_source`       VARCHAR(255)    DEFAULT NULL,
  `utm_medium`       VARCHAR(255)    DEFAULT NULL,
  `utm_campaign`     VARCHAR(255)    DEFAULT NULL,
  `utm_content`      VARCHAR(255)    DEFAULT NULL,
  `created_at`       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_request_logs_created_idx` (`created_at`),
  KEY `audit_request_logs_user_idx`    (`user_id`),
  KEY `audit_request_logs_path_idx`    (`path`),
  KEY `audit_request_logs_ip_idx`      (`ip`),
  KEY `audit_request_logs_status_idx`  (`status_code`),
  KEY `audit_request_logs_method_idx`  (`method`),
  KEY `audit_request_logs_gclid_idx`     (`gclid`),
  KEY `audit_request_logs_utm_source_idx` (`utm_source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_auth_events` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event`      VARCHAR(32)     NOT NULL,
  `user_id`    VARCHAR(64)     DEFAULT NULL,
  `email`      VARCHAR(255)    DEFAULT NULL,
  `ip`         VARCHAR(64)     NOT NULL,
  `user_agent` LONGTEXT        DEFAULT NULL,
  `country`    VARCHAR(8)      DEFAULT NULL,
  `city`       VARCHAR(64)     DEFAULT NULL,
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_auth_events_created_idx` (`created_at`),
  KEY `audit_auth_events_event_idx`   (`event`),
  KEY `audit_auth_events_user_idx`    (`user_id`),
  KEY `audit_auth_events_ip_idx`      (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
