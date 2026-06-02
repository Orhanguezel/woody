import type { FastifyRequest, FastifyReply } from 'fastify';
import { submitQuestionBody } from './validation';
import { insertSubmission, listSubmissionsByUser } from './repository';

export async function submitQuestion(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? '';
    if (!userId) return reply.code(401).send({ success: false, message: 'unauthorized' });

    const parsed = submitQuestionBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, errors: parsed.error.flatten() });
    }

    const { topic_slug, subject_slug, contributor_note, payload } = parsed.data;
    const row = await insertSubmission({
      userId,
      topicSlug: topic_slug ?? null,
      subjectSlug: subject_slug ?? null,
      contributorNote: contributor_note ?? null,
      payload: payload as Record<string, unknown>,
    });

    return reply.code(201).send({ success: true, data: row });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function listMySubmissions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? '';
    if (!userId) return reply.code(401).send({ success: false, message: 'unauthorized' });

    const rows = await listSubmissionsByUser(userId);
    return reply.send({ success: true, data: rows });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
