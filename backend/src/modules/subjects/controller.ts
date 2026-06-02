import type { FastifyRequest, FastifyReply } from 'fastify';
import { findSubjectsByTopicSlug, findSubjectById } from './repository';

export async function listSubjectsByTopic(
  req: FastifyRequest<{ Params: { topicSlug: string } }>,
  reply: FastifyReply,
) {
  try {
    const result = await findSubjectsByTopicSlug(req.params.topicSlug);
    if (!result) return reply.code(404).send({ success: false, message: 'topic_not_found' });
    return reply.send({ success: true, data: result });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function getSubjectById(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const row = await findSubjectById(Number(req.params.id));
    if (!row) return reply.code(404).send({ success: false, message: 'not_found' });
    return reply.send({ success: true, data: row });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
