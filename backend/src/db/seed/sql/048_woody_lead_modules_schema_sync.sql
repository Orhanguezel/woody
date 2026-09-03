-- 048 — Teklif ve iletişim modüllerini eski production şemalarıyla eşitle.
-- Idempotent: no-drop seed sırasında tekrar çalıştırılabilir.

SET @quote_product_id_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'product_id'
);
SET @quote_product_id_sql := IF(
  @quote_product_id_exists = 0,
  'ALTER TABLE quote_requests ADD COLUMN product_id CHAR(36) NULL AFTER phone',
  'SELECT 1'
);
PREPARE quote_product_id_stmt FROM @quote_product_id_sql;
EXECUTE quote_product_id_stmt;
DEALLOCATE PREPARE quote_product_id_stmt;

SET @quote_product_index_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quote_requests' AND INDEX_NAME = 'quote_requests_product_idx'
);
SET @quote_product_index_sql := IF(
  @quote_product_index_exists = 0,
  'ALTER TABLE quote_requests ADD INDEX quote_requests_product_idx (product_id)',
  'SELECT 1'
);
PREPARE quote_product_index_stmt FROM @quote_product_index_sql;
EXECUTE quote_product_index_stmt;
DEALLOCATE PREPARE quote_product_index_stmt;

SET @quote_admin_note_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quote_requests' AND COLUMN_NAME = 'admin_note'
);
SET @quote_admin_note_sql := IF(
  @quote_admin_note_exists = 0,
  'ALTER TABLE quote_requests ADD COLUMN admin_note TEXT NULL AFTER message',
  'SELECT 1'
);
PREPARE quote_admin_note_stmt FROM @quote_admin_note_sql;
EXECUTE quote_admin_note_stmt;
DEALLOCATE PREPARE quote_admin_note_stmt;

ALTER TABLE `quote_requests`
  MODIFY COLUMN `level` ENUM('basic','junior','senior','pro','mixed') NOT NULL DEFAULT 'mixed';
