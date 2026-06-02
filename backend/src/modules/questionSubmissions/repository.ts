import { db } from '@/db/client';
import { questionSubmissions } from './schema';
import type { SubmissionStatus } from './schema';
import { eq, desc } from 'drizzle-orm';

export async function findSubmissionById(id: number) {
  const [row] = await db.select().from(questionSubmissions)
    .where(eq(questionSubmissions.id, id)).limit(1);
  return row ?? null;
}

export async function insertSubmission(input: {
  userId: string;
  topicSlug?: string | null;
  subjectSlug?: string | null;
  payload: Record<string, unknown>;
  contributorNote?: string | null;
}) {
  const [result] = await db.insert(questionSubmissions).values({
    userId: input.userId,
    topicSlug: input.topicSlug ?? null,
    subjectSlug: input.subjectSlug ?? null,
    payload: input.payload,
    contributorNote: input.contributorNote ?? null,
  }).$returningId();

  const id = result.id;
  const [row] = await db.select().from(questionSubmissions)
    .where(eq(questionSubmissions.id, id)).limit(1);
  return row ?? null;
}

export async function listSubmissionsByUser(userId: string, limit = 50) {
  return db.select().from(questionSubmissions)
    .where(eq(questionSubmissions.userId, userId))
    .orderBy(desc(questionSubmissions.id))
    .limit(limit);
}

export async function listSubmissionsAdmin(opts: {
  status?: SubmissionStatus;
  page: number;
  limit: number;
}) {
  const offset = (opts.page - 1) * opts.limit;
  const base = db.select().from(questionSubmissions).orderBy(desc(questionSubmissions.id));
  const rows = opts.status
    ? await base.where(eq(questionSubmissions.status, opts.status)).limit(opts.limit).offset(offset)
    : await base.limit(opts.limit).offset(offset);

  return rows;
}

export async function updateSubmissionStatus(input: {
  id: number;
  status: SubmissionStatus;
  reviewerUserId: string;
  reviewerNote?: string | null;
  mergedQuestionId?: number | null;
}) {
  await db.update(questionSubmissions).set({
    status: input.status,
    reviewedBy: input.reviewerUserId,
    reviewedAt: new Date(),
    reviewerNote: input.reviewerNote ?? null,
    mergedQuestionId: input.mergedQuestionId ?? null,
  }).where(eq(questionSubmissions.id, input.id));
}
