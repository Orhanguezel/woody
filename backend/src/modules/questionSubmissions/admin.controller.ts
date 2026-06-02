import type { FastifyRequest, FastifyReply } from 'fastify';
import { adminPatchSubmissionBody } from './validation';
import { listSubmissionsAdmin, updateSubmissionStatus } from './repository';
import { promoteSubmissionToQuestion } from './promoteSubmission';

export async function adminListSubmissions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const q = req.query as Record<string, string | undefined>;
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(q.limit) || 30));
    const status = q.status as 'pending' | 'in_review' | 'approved' | 'rejected' | 'merged' | undefined;

    const rows = await listSubmissionsAdmin({
      status: status && ['pending', 'in_review', 'approved', 'rejected', 'merged'].includes(status)
        ? status
        : undefined,
      page,
      limit,
    });
    return reply.send({ success: true, data: rows, page, limit });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminPatchSubmission(req: FastifyRequest, reply: FastifyReply) {
  try {
    const reviewerId = (req.user as { sub?: string }).sub ?? '';
    if (!reviewerId) return reply.code(401).send({ success: false, message: 'unauthorized' });

    const id = Number((req.params as { id?: string }).id);
    if (!Number.isFinite(id) || id < 1) {
      return reply.code(400).send({ success: false, message: 'invalid_id' });
    }

    const parsed = adminPatchSubmissionBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, errors: parsed.error.flatten() });
    }

    await updateSubmissionStatus({
      id,
      status: parsed.data.status,
      reviewerUserId: reviewerId,
      reviewerNote: parsed.data.reviewer_note ?? null,
      mergedQuestionId: parsed.data.merged_question_id ?? null,
    });

    return reply.send({ success: true });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

const promoteErrorCodeToHttp: Record<string, number> = {
  not_found: 404,
  missing_topic_or_subject_slug: 400,
  unknown_topic: 400,
  unknown_subject: 400,
  invalid_payload: 400,
};

export async function adminPromoteSubmission(req: FastifyRequest, reply: FastifyReply) {
  try {
    const reviewerId = (req.user as { sub?: string }).sub ?? '';
    if (!reviewerId) return reply.code(401).send({ success: false, message: 'unauthorized' });

    const id = Number((req.params as { id?: string }).id);
    if (!Number.isFinite(id) || id < 1) {
      return reply.code(400).send({ success: false, message: 'invalid_id' });
    }

    const result = await promoteSubmissionToQuestion(id, reviewerId);
    if (!result.ok) {
      const code = result.code;
      const status = promoteErrorCodeToHttp[code] ?? 400;
      return reply.code(status).send({ success: false, code, message: result.message });
    }

    return reply.send({
      success: true,
      data: {
        question_id: result.questionId,
        deduplicated: result.deduplicated ?? false,
        json_path: result.jsonRelPath,
        quiz_rebuild_ran: result.quizRebuildRan,
        quiz_rebuild_warning: result.quizRebuildWarning,
      },
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
