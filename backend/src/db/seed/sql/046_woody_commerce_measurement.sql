-- Woody commerce attribution + idempotent analytics delivery outbox.
-- Separate tables keep the live orders schema backward compatible.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_attribution` (
  `order_id` CHAR(36) NOT NULL,
  `utm_source` VARCHAR(100) DEFAULT NULL,
  `utm_medium` VARCHAR(100) DEFAULT NULL,
  `utm_campaign` VARCHAR(160) DEFAULT NULL,
  `utm_content` VARCHAR(160) DEFAULT NULL,
  `utm_term` VARCHAR(160) DEFAULT NULL,
  `gclid` VARCHAR(255) DEFAULT NULL,
  `gbraid` VARCHAR(255) DEFAULT NULL,
  `wbraid` VARCHAR(255) DEFAULT NULL,
  `landing_url` VARCHAR(500) DEFAULT NULL,
  `referrer` VARCHAR(500) DEFAULT NULL,
  `ga_client_id` VARCHAR(80) DEFAULT NULL,
  `ga_session_id` VARCHAR(80) DEFAULT NULL,
  `consent_state` ENUM('granted','denied','unknown') NOT NULL DEFAULT 'unknown',
  `captured_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`order_id`),
  KEY `order_attribution_campaign_idx` (`utm_source`, `utm_medium`, `utm_campaign`),
  KEY `order_attribution_gclid_idx` (`gclid`),
  CONSTRAINT `fk_order_attribution_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `commerce_measurement_outbox` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `destination` VARCHAR(32) NOT NULL DEFAULT 'ga4',
  `event_name` VARCHAR(64) NOT NULL DEFAULT 'purchase',
  `status` ENUM('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
  `attempt_count` INT NOT NULL DEFAULT 0,
  `next_attempt_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_error` VARCHAR(500) DEFAULT NULL,
  `sent_at` DATETIME(3) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `commerce_outbox_event_uq` (`order_id`, `destination`, `event_name`),
  KEY `commerce_outbox_pending_idx` (`status`, `next_attempt_at`),
  CONSTRAINT `fk_commerce_outbox_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
