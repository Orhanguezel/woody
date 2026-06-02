import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  findAllTopics, findTopicById,
  insertTopic, updateTopic, deleteTopic, setTopicActive,
} from './repository';
import { createTopicSchema, updateTopicSchema, toggleActiveSchema } from './validation';

export async function adminListTopics(req: FastifyRequest, reply: FastifyReply) {
  try {
    const rows = await findAllTopics(false);
    return reply.send({ success: true, data: rows });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminCreateTopic(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = createTopicSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    const id = await insertTopic(parsed.data);
    return reply.code(201).send({ success: true, data: { id } });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminUpdateTopic(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    const existing = await findTopicById(id);
    if (!existing) return reply.code(404).send({ success: false, message: 'not_found' });

    const parsed = updateTopicSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    await updateTopic(id, parsed.data);
    return reply.send({ success: true, message: 'updated' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminDeleteTopic(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    await deleteTopic(id);
    return reply.send({ success: true, message: 'deleted' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminToggleTopicActive(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(req.params.id);
    const parsed = toggleActiveSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ success: false, errors: parsed.error.flatten() });

    await setTopicActive(id, Boolean(parsed.data.is_active));
    return reply.send({ success: true, message: 'updated' });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
