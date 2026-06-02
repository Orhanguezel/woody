import type { FastifyRequest, FastifyReply } from 'fastify';
import { findQuestions, findRandomQuestions } from './repository';
import { listQuestionsQuery, randomQuestionsBody } from './validation';

export async function listQuestions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = listQuestionsQuery.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const result = await findQuestions({
      topicId: parsed.data.topic_id,
      subjectId: parsed.data.subject_id,
      activeOnly: true,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });
    return reply.send({ success: true, ...result });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function getRandomQuestions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = randomQuestionsBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const rows = await findRandomQuestions({
      topicId: parsed.data.topic_id,
      subjectId: parsed.data.subject_id,
      count: parsed.data.count,
    });

    const safe = (rows as Array<Record<string, unknown>>).map(
      ({ correct_answer, ...rest }) => rest,
    );
    return reply.send({ success: true, data: safe });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
