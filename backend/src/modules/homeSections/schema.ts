import {
  mysqlTable,
  varchar,
  int,
  tinyint,
  datetime,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const homeSections = mysqlTable('home_sections', {
  id: varchar('id', { length: 64 }).notNull().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  label: varchar('label', { length: 255 }).notNull(),
  componentKey: varchar('component_key', { length: 100 }).notNull(),
  orderIndex: int('order_index', { unsigned: true }).notNull().default(0),
  isActive: tinyint('is_active', { unsigned: true }).notNull().default(1),
  config: json('config').$type<Record<string, unknown> | null>(),
  createdAt: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  index('home_sections_order_idx').on(t.orderIndex),
  index('home_sections_active_idx').on(t.isActive),
]);

export type HomeSectionRow = typeof homeSections.$inferSelect;
