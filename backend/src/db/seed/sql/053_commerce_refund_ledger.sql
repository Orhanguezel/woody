-- Durable, per-operation refund evidence. No existing order/schema rewrite.
CREATE TABLE IF NOT EXISTS commerce_refunds (
 id CHAR(36) NOT NULL PRIMARY KEY,
 order_id CHAR(36) NOT NULL,
 amount DECIMAL(12,2) NOT NULL,
 status ENUM('processing','succeeded','failed','uncertain') NOT NULL,
 reason VARCHAR(500) DEFAULT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 completed_at DATETIME(3) DEFAULT NULL,
 KEY refund_order_status (order_id,status),
 CONSTRAINT fk_commerce_refund_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
