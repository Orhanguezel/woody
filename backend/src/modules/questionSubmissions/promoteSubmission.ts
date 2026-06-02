import fs from 'fs';
import path from 'path';
import { spawnSync } from 'node:child_process';
import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { env } from '@/core/env';
import { questionSubmissions } from './schema';
import { questions } from '@/modules/questions/schema';
import { findTopicBySlug } from '@/modules/topics/repository';
import { findSubjectByTopicIdAndSlug } from '@/modules/subjects/repository';
import { maxDisplayOrderForSubject } from '@/modules/questions/repository';
import { findSubmissionById } from './repository';

const ZORLUK_TO_DIFF: Record<string, number> = {
  baslangic: 1,
  kolay: 2,
  orta: 3,
  zor: 4,
  asiri_zor: 5,
};

export type PromoteResult =
  | {
      ok: true;
      questionId: number;
      deduplicated?: boolean;
      jsonRelPath?: string;
      quizRebuildRan: boolean;
      quizRebuildWarning?: string;
    }
  | { ok: false; code: string; message?: string };

export async function promoteSubmissionToQuestion(
  submissionId: number,
  reviewerUserId: string,
): Promise<PromoteResult> {
  const row = await findSubmissionById(submissionId);
  if (!row) return { ok: false, code: 'not_found' };

  if (row.mergedQuestionId != null) {
    return {
      ok: true,
      questionId: row.mergedQuestionId,
      deduplicated: true,
      quizRebuildRan: false,
    };
  }

  const topicSlug = row.topicSlug?.trim();
  const subjectSlug = row.subjectSlug?.trim();
  if (!topicSlug || !subjectSlug) {
    return {
      ok: false,
      code: 'missing_topic_or_subject_slug',
      message: 'Oneri kaydinda topic_slug ve subject_slug dolu olmali.',
    };
  }

  const topic = await findTopicBySlug(topicSlug);
  if (!topic) return { ok: false, code: 'unknown_topic', message: topicSlug };

  const subject = await findSubjectByTopicIdAndSlug(topic.id, subjectSlug);
  if (!subject) {
    return { ok: false, code: 'unknown_subject', message: `${topicSlug}/${subjectSlug}` };
  }

  const payload = row.payload as Record<string, unknown>;
  const qtext = typeof payload.q === 'string' ? payload.q : '';
  const opts = Array.isArray(payload.opts)
    ? payload.opts.filter((x): x is string => typeof x === 'string')
    : [];
  const ansRaw = payload.ans;
  const ans = typeof ansRaw === 'number' ? ansRaw : Number(ansRaw);

  if (!qtext.trim() || opts.length < 2 || !Number.isFinite(ans) || ans < 0 || ans >= opts.length) {
    return { ok: false, code: 'invalid_payload', message: 'q, opts (>=2), ans gecerli indeks olmali' };
  }

  const exp = typeof payload.exp === 'string' ? payload.exp : '';
  const cat = typeof payload.cat === 'string' ? payload.cat : '';
  const zraw = payload.zorluk;
  const zkey = typeof zraw === 'string' ? zraw.trim() : '';
  const difficulty = ZORLUK_TO_DIFF[zkey] ?? 3;

  const sourceId = env.SUBMISSION_SOURCE_ID_BASE + submissionId;
  const nextOrder = (await maxDisplayOrderForSubject(subject.id)) + 1;

  let questionId = 0;

  await db.transaction(async (tx) => {
    const [ins] = await tx.insert(questions).values({
      topicId: topic.id,
      subjectId: subject.id,
      question: qtext,
      options: opts,
      correctAnswer: ans,
      explanation: exp || null,
      weekTag: cat || null,
      difficulty,
      isActive: 1,
      displayOrder: nextOrder,
      sourceId,
    }).$returningId();

    questionId = ins.id;

    await tx.update(questionSubmissions).set({
      status: 'merged',
      mergedQuestionId: questionId,
      reviewedBy: reviewerUserId,
      reviewedAt: new Date(),
    }).where(eq(questionSubmissions.id, submissionId));
  });

  let jsonRelPath: string | undefined;
  if (env.QUIZ_CONTENT_ROOT) {
    const dir = path.join(env.QUIZ_CONTENT_ROOT, 'sorular', '_gonderiler');
    fs.mkdirSync(dir, { recursive: true });
    const fname = `submission-${submissionId}.json`;
    const abs = path.join(dir, fname);

    const out = [{
      id: sourceId,
      cat: cat || `${topicSlug} — kullanici onerisi`,
      q: qtext,
      opts,
      ans,
      exp: exp || '',
      zorluk: zkey || 'orta',
      _submission_id: submissionId,
      _merged_question_id: questionId,
    }];

    fs.writeFileSync(abs, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    jsonRelPath = path.posix.join('sorular', '_gonderiler', fname);
  }

  let quizRebuildRan = false;
  let quizRebuildWarning: string | undefined;

  if (env.QUIZ_CONTENT_ROOT && env.QUIZ_REBUILD_AFTER_PROMOTE) {
    quizRebuildRan = true;
    const r = spawnSync(process.execPath, ['scripts/build-questions-js.mjs'], {
      cwd: env.QUIZ_CONTENT_ROOT,
      encoding: 'utf8',
      timeout: 120_000,
    });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    if (r.status !== 0 || r.error) {
      quizRebuildWarning = (r.error?.message ?? out).slice(-800);
    }
  }

  return {
    ok: true,
    questionId,
    jsonRelPath,
    quizRebuildRan,
    quizRebuildWarning,
  };
}
