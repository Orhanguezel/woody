import {
  mysqlTable, int, char, text, datetime, varchar, index, customType,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

const json = customType<{ data: Record<string, unknown>; driverData: string }>({
  dataType() { return 'json'; },
  fromDriver(v) { return typeof v === 'string' ? JSON.parse(v) : v; },
});

export const submissionStatusEnum = [
  'pending',
  'in_review',
  'approved',
  'rejected',
  'merged',
] as const;

export type SubmissionStatus = (typeof submissionStatusEnum)[number];

export const questionSubmissions = mysqlTable('question_submissions', {
  id:               int('id', { unsigned: true }).autoincrement().notNull().primaryKey(),
  userId:           char('user_id', { length: 36 }).notNull(),
  status:           varchar('status', { length: 20 }).notNull().default('pending'),
  topicSlug:        varchar('topic_slug', { length: 100 }),
  subjectSlug:      varchar('subject_slug', { length: 100 }),
  payload:          json('payload').notNull(),
  contributorNote:  text('contributor_note'),
  reviewerNote:     text('reviewer_note'),
  reviewedBy:       char('reviewed_by', { length: 36 }),
  reviewedAt:       datetime('reviewed_at', { fsp: 3 }),
  mergedQuestionId: int('merged_question_id', { unsigned: true }),
  createdAt:        datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt:        datetime('updated_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (t) => [
  index('question_submissions_user_idx').on(t.userId),
  index('question_submissions_status_idx').on(t.status),
]);

export type QuestionSubmissionRow = typeof questionSubmissions.$inferSelect;
