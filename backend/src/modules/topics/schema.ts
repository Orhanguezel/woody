// src/modules/topics/schema.ts
import { mysqlTable, int, varchar, text, tinyint, datetime, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const topics = mysqlTable('topics', {
  id:            int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  slug:          varchar('slug', { length: 100 }).notNull().unique(),
  name:          varchar('name', { length: 255 }).notNull(),
  description:   text('description'),
  iconEmoji:     varchar('icon_emoji', { length: 10 }),
  questionCount: int('question_count', { unsigned: true }).notNull().default(0),
  displayOrder:  int('display_order', { unsigned: true }).notNull().default(0),
  isActive:      tinyint('is_active', { unsigned: true }).notNull().default(1),
  createdAt:     datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  index('topics_slug_idx').on(t.slug),
]);

export type TopicRow = typeof topics.$inferSelect;
