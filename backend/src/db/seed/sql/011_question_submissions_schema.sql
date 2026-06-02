-- =============================================================
-- 011 — Kullanici soru onerileri (statik JSON akisi korunur; onaylaninca
--       el ile JSON/DB import veya admin API ile questions tablosuna alinir)
-- =============================================================
-- payload JSON: { "q", "opts", "ans", "exp"?, "cat"?, "zorluk"?, "mufredat"? }
--   mufredat/soru-semasi.json ile uyumlu alanlar eklenebilir.
-- =============================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `question_submissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `status` ENUM('pending','in_review','approved','rejected','merged') NOT NULL DEFAULT 'pending',
  `topic_slug` VARCHAR(100) DEFAULT NULL,
  `subject_slug` VARCHAR(100) DEFAULT NULL,
  `payload` JSON NOT NULL,
  `contributor_note` TEXT DEFAULT NULL,
  `reviewer_note` TEXT DEFAULT NULL,
  `reviewed_by` CHAR(36) DEFAULT NULL,
  `reviewed_at` DATETIME(3) DEFAULT NULL,
  `merged_question_id` INT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `question_submissions_user_id_idx` (`user_id`),
  KEY `question_submissions_status_idx` (`status`),
  KEY `question_submissions_topic_subject_idx` (`topic_slug`, `subject_slug`),
  CONSTRAINT `fk_question_submissions_merged_question`
    FOREIGN KEY (`merged_question_id`) REFERENCES `questions` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_question_submissions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
