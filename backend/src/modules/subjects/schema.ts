// src/modules/subjects/schema.ts
import { mysqlTable, int, varchar, text, tinyint, datetime, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const subjects = mysqlTable('subjects', {
  id:            int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  topicId:       int('topic_id', { unsigned: true }).notNull(),
  slug:          varchar('slug', { length: 100 }).notNull(),
  name:          varchar('name', { length: 255 }).notNull(),
  description:   text('description'),
  questionCount: int('question_count', { unsigned: true }).notNull().default(0),
  displayOrder:  int('display_order', { unsigned: true }).notNull().default(0),
  isActive:      tinyint('is_active', { unsigned: true }).notNull().default(1),
  createdAt:     datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  uniqueIndex('subjects_topic_slug_uq').on(t.topicId, t.slug),
  index('subjects_topic_idx').on(t.topicId),
]);

export type SubjectRow = typeof subjects.$inferSelect;
