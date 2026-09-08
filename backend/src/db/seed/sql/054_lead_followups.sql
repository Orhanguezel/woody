CREATE TABLE IF NOT EXISTS lead_followups (
  record_kind VARCHAR(16) NOT NULL,
  record_id VARCHAR(64) NOT NULL,
  stage VARCHAR(24) NOT NULL DEFAULT 'new',
  responsible VARCHAR(180) NOT NULL DEFAULT '',
  purpose VARCHAR(24) NOT NULL DEFAULT 'unknown',
  next_action_at DATETIME(3) NULL,
  loss_reason VARCHAR(500) NOT NULL DEFAULT '',
  note TEXT NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY(record_kind, record_id),
  INDEX lead_followups_due(stage, next_action_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
