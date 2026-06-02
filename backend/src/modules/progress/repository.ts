import { pool } from '@/db/client';

type StatsRow = {
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

type TopicProgressRow = {
  id: number;
  user_id: string;
  topic_id: number;
  subject_id: number | null;
  sessions_count: number;
  questions_seen: number;
  questions_correct: number;
  best_score: number;
  last_session_at: string | null;
};

export async function getMyStats(userId: string): Promise<StatsRow | null> {
  const [rows] = await pool.query(
    'SELECT * FROM user_stats WHERE user_id = ?',
    [userId],
  );
  const arr = rows as StatsRow[];
  return arr[0] ?? null;
}

export async function getMyTopicProgress(userId: string): Promise<TopicProgressRow[]> {
  const [rows] = await pool.query(
    'SELECT * FROM user_topic_progress WHERE user_id = ? ORDER BY topic_id, subject_id',
    [userId],
  );
  return rows as TopicProgressRow[];
}

export async function getTopicProgressById(
  userId: string,
  topicId: number,
): Promise<TopicProgressRow[]> {
  const [rows] = await pool.query(
    'SELECT * FROM user_topic_progress WHERE user_id = ? AND topic_id = ? ORDER BY subject_id',
    [userId, topicId],
  );
  return rows as TopicProgressRow[];
}
