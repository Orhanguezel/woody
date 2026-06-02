import { db, pool } from '@/db/client';
import { achievements, userAchievements } from './schema';
import { eq } from 'drizzle-orm';

export async function findAllAchievements() {
  return db.select().from(achievements);
}

type UserAchRow = {
  id: number;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  slug: string;
  name: string;
  description: string | null;
  icon_emoji: string | null;
  xp_reward: number;
};

export async function findUserAchievements(userId: string) {
  const [rows] = await pool.query(
    `SELECT ua.id, ua.user_id, ua.achievement_id, ua.earned_at,
            a.slug, a.name, a.description, a.icon_emoji, a.xp_reward
     FROM user_achievements ua
     JOIN achievements a ON a.id = ua.achievement_id
     WHERE ua.user_id = ?
     ORDER BY ua.earned_at DESC`,
    [userId],
  );
  return rows as UserAchRow[];
}
