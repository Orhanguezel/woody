// src/modules/sessions/schema.ts
import {
  mysqlTable, int, char, tinyint, datetime, varchar, index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const quiz_sessions = mysqlTable('quiz_sessions', {
  id:             int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  userId:         char('user_id', { length: 36 }).notNull(),
  sessionType:    varchar('session_type', { length: 20 }).notNull().default('subject'),
  topicId:        int('topic_id', { unsigned: true }),
  subjectId:      int('subject_id', { unsigned: true }),
  totalQuestions: int('total_questions', { unsigned: true }).notNull().default(10),
  correct:        int('correct', { unsigned: true }).notNull().default(0),
  score:          int('score', { unsigned: true }).notNull().default(0),
  xpEarned:       int('xp_earned', { unsigned: true }).notNull().default(0),
  status:         varchar('status', { length: 20 }).notNull().default('pending'),
  startedAt:      datetime('started_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  completedAt:    datetime('completed_at', { fsp: 3 }),
}, (t) => [
  index('sessions_user_idx').on(t.userId),
]);

export const session_answers = mysqlTable('session_answers', {
  id:         int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  sessionId:  int('session_id', { unsigned: true }).notNull(),
  questionId: int('question_id', { unsigned: true }).notNull(),
  userAnswer: int('user_answer'),
  isCorrect:  tinyint('is_correct', { unsigned: true }).notNull().default(0),
  answeredAt: datetime('answered_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  index('answers_session_idx').on(t.sessionId),
]);

export type QuizSessionRow   = typeof quiz_sessions.$inferSelect;
export type SessionAnswerRow = typeof session_answers.$inferSelect;
