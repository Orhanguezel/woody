// src/modules/questions/schema.ts
import {
  mysqlTable, int, text, tinyint, datetime, varchar, index, customType,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

const json = customType<{ data: unknown; driverData: string }>({
  dataType() { return 'json'; },
  fromDriver(v) { return typeof v === 'string' ? JSON.parse(v) : v; },
});

export const questions = mysqlTable('questions', {
  id:            int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  topicId:       int('topic_id', { unsigned: true }).notNull(),
  subjectId:     int('subject_id', { unsigned: true }).notNull(),
  question:      text('question').notNull(),
  options:       json('options').notNull(),
  correctAnswer: int('correct_answer', { unsigned: true }).notNull(),
  explanation:   text('explanation'),
  weekTag:       varchar('week_tag', { length: 100 }),
  difficulty:    tinyint('difficulty', { unsigned: true }).notNull().default(1),
  isActive:      tinyint('is_active', { unsigned: true }).notNull().default(1),
  displayOrder:  int('display_order', { unsigned: true }).notNull().default(0),
  sourceId:      int('source_id'),
  createdAt:     datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  index('questions_topic_idx').on(t.topicId),
  index('questions_subject_idx').on(t.subjectId),
]);

export type QuestionRow = typeof questions.$inferSelect;
