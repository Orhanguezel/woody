-- =============================================================
-- 010 — Opsiyonel quiz tablolari: topics, subjects, questions, sessions,
--       user_stats, user_topic_progress, achievements
-- =============================================================

SET NAMES utf8mb4;

-- ============================================================
-- TOPICS
-- ============================================================

CREATE TABLE IF NOT EXISTS `topics` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon_emoji` VARCHAR(10) DEFAULT NULL,
  `question_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `topics_slug_uq` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SUBJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `topic_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `question_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subjects_topic_slug_uq` (`topic_id`, `slug`),
  CONSTRAINT `fk_subjects_topic_id`
    FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- QUESTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `topic_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `question` TEXT NOT NULL,
  `options` JSON NOT NULL,
  `correct_answer` INT UNSIGNED NOT NULL,
  `explanation` TEXT DEFAULT NULL,
  `week_tag` VARCHAR(100) DEFAULT NULL,
  `difficulty` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `source_id` INT DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `questions_topic_id_idx` (`topic_id`),
  KEY `questions_subject_id_idx` (`subject_id`),
  UNIQUE KEY `questions_source_subject_uq` (`source_id`, `subject_id`),
  CONSTRAINT `fk_questions_topic_id`
    FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_questions_subject_id`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- QUIZ SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS `quiz_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `session_type` ENUM('daily','topic','subject','practice','exam') NOT NULL DEFAULT 'subject',
  `topic_id` INT UNSIGNED DEFAULT NULL,
  `subject_id` INT UNSIGNED DEFAULT NULL,
  `total_questions` INT UNSIGNED NOT NULL DEFAULT 10,
  `correct` INT UNSIGNED NOT NULL DEFAULT 0,
  `score` INT UNSIGNED NOT NULL DEFAULT 0,
  `xp_earned` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('pending','completed','abandoned') NOT NULL DEFAULT 'pending',
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completed_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_sessions_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SESSION ANSWERS
-- ============================================================

CREATE TABLE IF NOT EXISTS `session_answers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` INT UNSIGNED NOT NULL,
  `question_id` INT UNSIGNED NOT NULL,
  `user_answer` INT DEFAULT NULL,
  `is_correct` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `answered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `session_answers_session_id_idx` (`session_id`),
  CONSTRAINT `fk_session_answers_session_id`
    FOREIGN KEY (`session_id`) REFERENCES `quiz_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USER STATS
-- ============================================================

CREATE TABLE IF NOT EXISTS `user_stats` (
  `user_id` CHAR(36) NOT NULL,
  `total_xp` INT UNSIGNED NOT NULL DEFAULT 0,
  `level` INT UNSIGNED NOT NULL DEFAULT 1,
  `streak_days` INT UNSIGNED NOT NULL DEFAULT 0,
  `longest_streak` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_activity_date` DATE DEFAULT NULL,
  `total_questions` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_correct` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_sessions` INT UNSIGNED NOT NULL DEFAULT 0,
  `updated_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USER TOPIC PROGRESS
-- ============================================================

CREATE TABLE IF NOT EXISTS `user_topic_progress` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `topic_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED DEFAULT NULL,
  `sessions_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `questions_seen` INT UNSIGNED NOT NULL DEFAULT 0,
  `questions_correct` INT UNSIGNED NOT NULL DEFAULT 0,
  `best_score` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_session_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_topic_progress_uq` (`user_id`, `topic_id`, `subject_id`),
  KEY `user_topic_progress_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS `achievements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon_emoji` VARCHAR(10) DEFAULT NULL,
  `xp_reward` INT UNSIGNED NOT NULL DEFAULT 0,
  `condition_type` ENUM('streak','sessions','correct','score','total_xp') NOT NULL,
  `condition_value` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `achievements_slug_uq` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS `user_achievements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `achievement_id` INT UNSIGNED NOT NULL,
  `earned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_achievements_uq` (`user_id`, `achievement_id`),
  CONSTRAINT `fk_user_achievements_achievement_id`
    FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DEFAULT ACHIEVEMENTS
-- ============================================================

INSERT INTO `achievements` (`slug`, `name`, `description`, `icon_emoji`, `xp_reward`, `condition_type`, `condition_value`) VALUES
('ilk-quiz',         'Ilk Quiz',           'Ilk quiz oturumunu tamamladiniz',        '🎯', 50,  'sessions',  1),
('on-soru-dogru',    '10 Dogru Cevap',     'Toplam 10 dogru cevap verdiniz',         '✅', 100, 'correct',   10),
('yuz-soru-dogru',   '100 Dogru Cevap',    'Toplam 100 dogru cevap verdiniz',        '🏅', 250, 'correct',   100),
('bes-gun-seri',     '5 Gun Serisi',       '5 gun ust uste quiz cozdiniz',           '🔥', 150, 'streak',    5),
('on-gun-seri',      '10 Gun Serisi',      '10 gun ust uste quiz cozdiniz',          '💪', 300, 'streak',    10),
('mukemmel-skor',    'Mukemmel Skor',       'Bir oturumda %100 basari elde ettiniz',  '🌟', 200, 'score',     100),
('bin-xp',           '1000 XP',            'Toplam 1000 XP kazandiniz',              '💎', 100, 'total_xp',  1000),
('on-session',       '10 Oturum',          'Toplam 10 quiz oturumu tamamladiniz',     '📚', 150, 'sessions',  10);

-- ============================================================
-- DEFAULT TOPICS
-- ============================================================

INSERT INTO `topics` (`slug`, `name`, `icon_emoji`, `display_order`) VALUES
('sebzecilik',   'Sebze Yetistiriciligi', '🥬', 1),
('bagcilik',     'Bagcilik',              '🍇', 2),
('meyvecilik',   'Meyvecilik',            '🍎', 3);

-- ============================================================
-- DEFAULT SUBJECTS
-- ============================================================

INSERT INTO `subjects` (`topic_id`, `slug`, `name`, `display_order`) VALUES
((SELECT id FROM topics WHERE slug='sebzecilik'), 'domates',         'Domates',         1),
((SELECT id FROM topics WHERE slug='sebzecilik'), 'biber',           'Biber',            2),
((SELECT id FROM topics WHERE slug='sebzecilik'), 'patlican',        'Patlican',         3),
((SELECT id FROM topics WHERE slug='bagcilik'),   'bagcilik-genel',  'Bagcilik Genel',   1),
((SELECT id FROM topics WHERE slug='meyvecilik'), 'aronya',          'Aronya',           1),
((SELECT id FROM topics WHERE slug='meyvecilik'), 'cilek',           'Cilek',            2),
((SELECT id FROM topics WHERE slug='meyvecilik'), 'maviyemis',       'Maviyemis',        3),
((SELECT id FROM topics WHERE slug='meyvecilik'), 'budama',          'Budama',           4);
