-- 037_gsc_url_index.sql
-- Search Console URL indeksleme durumu onbellegi. Admin panel "index/refresh"
-- GSC urlInspection sonuclarini burada saklar. shared-backend/searchConsole/indexing.service
-- raw SQL ile kullanir (Drizzle semasi yok). Tablo yoksa POST index/refresh 500 (ER_NO_SUCH_TABLE).

CREATE TABLE IF NOT EXISTS `gsc_url_index` (
  `url` VARCHAR(512) NOT NULL,
  `verdict` VARCHAR(64) DEFAULT NULL,
  `coverage_state` VARCHAR(255) DEFAULT NULL,
  `last_crawl` DATETIME(3) DEFAULT NULL,
  `checked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`url`),
  KEY `gsc_url_index_checked_idx` (`checked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
