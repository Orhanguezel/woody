// src/modules/achievements/schema.ts
import {
  mysqlTable, int, char, varchar, text, datetime, uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const achievements = mysqlTable('achievements', {
  id:             int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  slug:           varchar('slug', { length: 100 }).notNull().unique(),
  name:           varchar('name', { length: 255 }).notNull(),
  description:    text('description'),
  iconEmoji:      varchar('icon_emoji', { length: 10 }),
  xpReward:       int('xp_reward', { unsigned: true }).notNull().default(0),
  conditionType:  varchar('condition_type', { length: 30 }).notNull(),
  conditionValue: int('condition_value', { unsigned: true }).notNull(),
});

export const userAchievements = mysqlTable('user_achievements', {
  id:            int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  userId:        char('user_id', { length: 36 }).notNull(),
  achievementId: int('achievement_id', { unsigned: true }).notNull(),
  earnedAt:      datetime('earned_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  uniqueIndex('user_achievements_uq').on(t.userId, t.achievementId),
]);

export type AchievementRow     = typeof achievements.$inferSelect;
export type UserAchievementRow = typeof userAchievements.$inferSelect;
