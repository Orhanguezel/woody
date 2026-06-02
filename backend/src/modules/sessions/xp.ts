import { pool } from '@/db/client';

const XP_PER_CORRECT = 10;
const PERFECT_BONUS = 50;

type UserStatsRow = {
  user_id: string;
  total_xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_questions: number;
  total_correct: number;
  total_sessions: number;
};

export function calculateXp(correct: number, total: number, streakDays: number): number {
  let xp = correct * XP_PER_CORRECT;
  if (correct === total && total > 0) xp += PERFECT_BONUS;
  xp += streakDays * 5;
  return xp;
}

export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 500) + 1;
}

export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export async function getUserStats(userId: string): Promise<UserStatsRow | null> {
  const [rows] = await pool.query(
    'SELECT * FROM user_stats WHERE user_id = ?',
    [userId],
  );
  const arr = rows as UserStatsRow[];
  return arr[0] ?? null;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round(Math.abs(db - da) / (1000 * 60 * 60 * 24));
}

export async function updateUserStats(
  userId: string,
  sessionCorrect: number,
  sessionTotal: number,
  xpEarned: number,
): Promise<UserStatsRow> {
  const existing = await getUserStats(userId);
  const todayStr = toDateStr(new Date());

  let streakDays = 1;
  let longestStreak = 1;

  if (existing) {
    const lastDate = existing.last_activity_date;
    if (lastDate) {
      const diff = daysBetween(lastDate, todayStr);
      if (diff === 0) {
        streakDays = existing.streak_days;
      } else if (diff === 1) {
        streakDays = existing.streak_days + 1;
      }
    }
    longestStreak = Math.max(existing.longest_streak, streakDays);
  }

  const newTotalXp = (existing?.total_xp ?? 0) + xpEarned;
  const newLevel = calculateLevel(newTotalXp);
  const newTotalQ = (existing?.total_questions ?? 0) + sessionTotal;
  const newTotalCorrect = (existing?.total_correct ?? 0) + sessionCorrect;
  const newTotalSessions = (existing?.total_sessions ?? 0) + 1;

  await pool.query(
    `INSERT INTO user_stats
      (user_id, total_xp, level, streak_days, longest_streak,
       last_activity_date, total_questions, total_correct, total_sessions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      total_xp = VALUES(total_xp),
      level = VALUES(level),
      streak_days = VALUES(streak_days),
      longest_streak = VALUES(longest_streak),
      last_activity_date = VALUES(last_activity_date),
      total_questions = VALUES(total_questions),
      total_correct = VALUES(total_correct),
      total_sessions = VALUES(total_sessions)`,
    [userId, newTotalXp, newLevel, streakDays, longestStreak,
     todayStr, newTotalQ, newTotalCorrect, newTotalSessions],
  );

  return {
    user_id: userId,
    total_xp: newTotalXp,
    level: newLevel,
    streak_days: streakDays,
    longest_streak: longestStreak,
    last_activity_date: todayStr,
    total_questions: newTotalQ,
    total_correct: newTotalCorrect,
    total_sessions: newTotalSessions,
  };
}

export async function updateTopicProgress(
  userId: string,
  topicId: number | null | undefined,
  subjectId: number | null | undefined,
  sessionCorrect: number,
  sessionTotal: number,
  score: number,
) {
  if (!topicId) return;

  await pool.query(
    `INSERT INTO user_topic_progress
      (user_id, topic_id, subject_id, sessions_count, questions_seen,
       questions_correct, best_score, last_session_at)
    VALUES (?, ?, ?, 1, ?, ?, ?, NOW(3))
    ON DUPLICATE KEY UPDATE
      sessions_count = sessions_count + 1,
      questions_seen = questions_seen + VALUES(questions_seen),
      questions_correct = questions_correct + VALUES(questions_correct),
      best_score = GREATEST(best_score, VALUES(best_score)),
      last_session_at = NOW(3)`,
    [userId, topicId, subjectId ?? null, sessionTotal, sessionCorrect, score],
  );
}

type AchievementRow = { id: number; slug: string; condition_type: string; condition_value: number; xp_reward: number };
type UserAchRow = { achievement_id: number };

export async function checkAndGrantAchievements(
  userId: string,
  stats: UserStatsRow,
  sessionScore: number,
): Promise<Array<{ slug: string; name: string; xp_reward: number }>> {
  const [allAch] = await pool.query('SELECT * FROM achievements');
  const achievements = allAch as AchievementRow[];

  const [userAchRows] = await pool.query(
    'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
    [userId],
  );
  const earnedIds = new Set((userAchRows as UserAchRow[]).map(r => r.achievement_id));

  const newlyEarned: Array<{ slug: string; name: string; xp_reward: number }> = [];

  for (const ach of achievements) {
    if (earnedIds.has(ach.id)) continue;

    let qualified = false;
    switch (ach.condition_type) {
      case 'sessions':
        qualified = stats.total_sessions >= ach.condition_value;
        break;
      case 'correct':
        qualified = stats.total_correct >= ach.condition_value;
        break;
      case 'streak':
        qualified = stats.streak_days >= ach.condition_value;
        break;
      case 'score':
        qualified = sessionScore >= ach.condition_value;
        break;
      case 'total_xp':
        qualified = stats.total_xp >= ach.condition_value;
        break;
    }

    if (qualified) {
      await pool.query(
        `INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`,
        [userId, ach.id],
      );

      if (ach.xp_reward > 0) {
        await pool.query(
          `UPDATE user_stats SET total_xp = total_xp + ?, level = FLOOR((total_xp + ?) / 500) + 1 WHERE user_id = ?`,
          [ach.xp_reward, ach.xp_reward, userId],
        );
      }

      newlyEarned.push({ slug: ach.slug, name: ach.slug, xp_reward: ach.xp_reward });
    }
  }

  return newlyEarned;
}
