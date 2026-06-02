import { db, pool } from '@/db/client';
import { quiz_sessions as quizSessions, session_answers as sessionAnswers } from './schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createSession(data: {
  userId: string;
  sessionType: 'daily' | 'topic' | 'subject' | 'practice' | 'exam';
  topicId?: number;
  subjectId?: number;
  totalQuestions: number;
}) {
  const [result] = await db.insert(quizSessions).values({
    userId: data.userId,
    sessionType: data.sessionType,
    topicId: data.topicId ?? null,
    subjectId: data.subjectId ?? null,
    totalQuestions: data.totalQuestions,
  }).$returningId();
  return result.id;
}

export async function findSessionById(id: number) {
  const [row] = await db.select().from(quizSessions)
    .where(eq(quizSessions.id, id)).limit(1);
  return row ?? null;
}

export async function findUserSessions(userId: string, limit = 20) {
  return db.select().from(quizSessions)
    .where(eq(quizSessions.userId, userId))
    .orderBy(desc(quizSessions.startedAt))
    .limit(limit);
}

export async function completeSession(id: number, data: {
  correct: number; score: number; xpEarned: number;
}) {
  await db.update(quizSessions).set({
    correct: data.correct,
    score: data.score,
    xpEarned: data.xpEarned,
    status: 'completed',
    completedAt: new Date(),
  }).where(eq(quizSessions.id, id));
}

export async function insertSessionAnswers(answers: Array<{
  sessionId: number;
  questionId: number;
  userAnswer: number | null;
  isCorrect: boolean;
}>) {
  if (!answers.length) return;
  await db.insert(sessionAnswers).values(
    answers.map(a => ({
      sessionId: a.sessionId,
      questionId: a.questionId,
      userAnswer: a.userAnswer,
      isCorrect: a.isCorrect ? 1 : 0,
    })),
  );
}

export async function findSessionAnswers(sessionId: number) {
  return db.select().from(sessionAnswers)
    .where(eq(sessionAnswers.sessionId, sessionId));
}

export async function findAllSessions(opts: { page: number; limit: number }) {
  const offset = (opts.page - 1) * opts.limit;
  const [rows] = await pool.query(
    `SELECT * FROM quiz_sessions ORDER BY started_at DESC LIMIT ? OFFSET ?`,
    [opts.limit, offset],
  );
  const [[countRow]] = await pool.query(
    `SELECT COUNT(*) as total FROM quiz_sessions`,
  ) as unknown as [[{ total: number }]];
  return { rows, total: countRow.total, page: opts.page, limit: opts.limit };
}
