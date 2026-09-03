-- Search Console URL indeksleme durumu onbellegi.

CREATE TABLE IF NOT EXISTS `gsc_url_index` (
  `url` VARCHAR(512) NOT NULL,
  `verdict` VARCHAR(64) DEFAULT NULL,
  `coverage_state` VARCHAR(255) DEFAULT NULL,
  `last_crawl` DATETIME(3) DEFAULT NULL,
  `checked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`url`),
  KEY `gsc_url_index_checked_idx` (`checked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
