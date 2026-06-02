// src/modules/progress/schema.ts
import {
  mysqlTable, int, char, datetime, date, uniqueIndex, index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const userStats = mysqlTable('user_stats', {
  userId:           char('user_id', { length: 36 }).notNull().primaryKey(),
  totalXp:          int('total_xp', { unsigned: true }).notNull().default(0),
  level:            int('level', { unsigned: true }).notNull().default(1),
  streakDays:       int('streak_days', { unsigned: true }).notNull().default(0),
  longestStreak:    int('longest_streak', { unsigned: true }).notNull().default(0),
  lastActivityDate: date('last_activity_date'),
  totalQuestions:   int('total_questions', { unsigned: true }).notNull().default(0),
  totalCorrect:     int('total_correct', { unsigned: true }).notNull().default(0),
  totalSessions:    int('total_sessions', { unsigned: true }).notNull().default(0),
  updatedAt:        datetime('updated_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
});

export const userTopicProgress = mysqlTable('user_topic_progress', {
  id:               int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  userId:           char('user_id', { length: 36 }).notNull(),
  topicId:          int('topic_id', { unsigned: true }).notNull(),
  subjectId:        int('subject_id', { unsigned: true }),
  sessionsCount:    int('sessions_count', { unsigned: true }).notNull().default(0),
  questionsSeen:    int('questions_seen', { unsigned: true }).notNull().default(0),
  questionsCorrect: int('questions_correct', { unsigned: true }).notNull().default(0),
  bestScore:        int('best_score', { unsigned: true }).notNull().default(0),
  lastSessionAt:    datetime('last_session_at', { fsp: 3 }),
}, (t) => [
  uniqueIndex('user_topic_progress_uq').on(t.userId, t.topicId, t.subjectId),
  index('user_topic_progress_user_idx').on(t.userId),
]);

export type UserStatsRow         = typeof userStats.$inferSelect;
export type UserTopicProgressRow = typeof userTopicProgress.$inferSelect;
