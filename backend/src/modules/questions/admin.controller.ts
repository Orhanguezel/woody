import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  findQuestions, findQuestionById,
  insertQuestion, updateQuestion, deleteQuestion, setQuestionActive,
} from './repository';
import { listQuestionsQuery, createQuestionSchema, updateQuestionSchema, toggleActiveSchema } from './validation';

export async function adminListQuestions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = listQuestionsQuery.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const result = await findQuestions({
      topicId: parsed.data.topic_id,
      subjectId: parsed.data.subject_id,
      activeOnly: false,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });
    return reply.send({ success: true, ...result });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminCreateQuestion(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = createQuestionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const id = await insertQuestion(parsed.data);
    return reply.code(201).send({ success: true, data: { id } });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminUpdateQuestion(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    const existing = await findQuestionById(id);
    if (!existing) return reply.code(404).send({ success: false, message: 'not_found' });

    const parsed = updateQuestionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    await updateQuestion(id, parsed.data);
    return reply.send({ success: true, message: 'updated' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminDeleteQuestion(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    await deleteQuestion(id);
    return reply.send({ success: true, message: 'deleted' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminToggleQuestionActive(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    const parsed = toggleActiveSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    await setQuestionActive(id, Boolean(parsed.data.is_active));
    return reply.send({ success: true, message: 'updated' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
