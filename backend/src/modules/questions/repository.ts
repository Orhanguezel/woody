import { db, pool } from '@/db/client';
import { questions } from './schema';
import { eq, and, sql, count, max } from 'drizzle-orm';

type ListFilter = {
  topicId?: number;
  subjectId?: number;
  activeOnly?: boolean;
  page: number;
  limit: number;
};

export async function findQuestions(filter: ListFilter) {
  const conditions = [];
  if (filter.topicId) conditions.push(eq(questions.topicId, filter.topicId));
  if (filter.subjectId) conditions.push(eq(questions.subjectId, filter.subjectId));
  if (filter.activeOnly !== false) conditions.push(eq(questions.isActive, 1));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (filter.page - 1) * filter.limit;

  const [rows, [totalRow]] = await Promise.all([
    db.select().from(questions).where(where)
      .orderBy(questions.displayOrder)
      .limit(filter.limit).offset(offset),
    db.select({ total: count() }).from(questions).where(where),
  ]);

  return { rows, total: totalRow.total, page: filter.page, limit: filter.limit };
}

export async function findRandomQuestions(opts: {
  topicId?: number; subjectId?: number; count: number;
}) {
  const conditions: string[] = ['is_active = 1'];
  const params: unknown[] = [];

  if (opts.topicId) {
    conditions.push('topic_id = ?');
    params.push(opts.topicId);
  }
  if (opts.subjectId) {
    conditions.push('subject_id = ?');
    params.push(opts.subjectId);
  }

  params.push(opts.count);

  const [rows] = await pool.query(
    `SELECT * FROM questions WHERE ${conditions.join(' AND ')} ORDER BY RAND() LIMIT ?`,
    params,
  );
  return rows as Array<Record<string, unknown>>;
}

export async function findQuestionById(id: number) {
  const [row] = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return row ?? null;
}

export async function findQuestionsByIds(ids: number[]) {
  if (!ids.length) return [];
  const [rows] = await pool.query(
    `SELECT * FROM questions WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids,
  );
  return rows as Array<Record<string, unknown>>;
}

export async function maxDisplayOrderForSubject(subjectId: number) {
  const [r] = await db.select({ m: max(questions.displayOrder) })
    .from(questions)
    .where(eq(questions.subjectId, subjectId));
  return r?.m != null ? Number(r.m) : 0;
}

export async function insertQuestion(data: {
  topic_id: number; subject_id: number; question: string;
  options: string[]; correct_answer: number; explanation?: string;
  week_tag?: string; difficulty?: number;
  source_id?: number | null;
  display_order?: number;
}) {
  const [result] = await db.insert(questions).values({
    topicId: data.topic_id,
    subjectId: data.subject_id,
    question: data.question,
    options: data.options,
    correctAnswer: data.correct_answer,
    explanation: data.explanation ?? null,
    weekTag: data.week_tag ?? null,
    difficulty: data.difficulty ?? 1,
    sourceId: data.source_id ?? null,
    displayOrder: data.display_order ?? 0,
  }).$returningId();
  return result.id;
}

export async function updateQuestion(id: number, data: {
  topic_id?: number; subject_id?: number; question?: string;
  options?: string[]; correct_answer?: number; explanation?: string;
  week_tag?: string; difficulty?: number;
}) {
  await db.update(questions).set({
    ...(data.topic_id !== undefined && { topicId: data.topic_id }),
    ...(data.subject_id !== undefined && { subjectId: data.subject_id }),
    ...(data.question !== undefined && { question: data.question }),
    ...(data.options !== undefined && { options: data.options }),
    ...(data.correct_answer !== undefined && { correctAnswer: data.correct_answer }),
    ...(data.explanation !== undefined && { explanation: data.explanation }),
    ...(data.week_tag !== undefined && { weekTag: data.week_tag }),
    ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
  }).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  await db.delete(questions).where(eq(questions.id, id));
}

export async function setQuestionActive(id: number, isActive: boolean) {
  await db.update(questions).set({ isActive: isActive ? 1 : 0 }).where(eq(questions.id, id));
}
