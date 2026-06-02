import type { FastifyRequest, FastifyReply } from 'fastify';
import { findAllTopics, findTopicBySlug, findSubjectsByTopicId } from './repository';

export async function listTopics(req: FastifyRequest, reply: FastifyReply) {
  try {
    const rows = await findAllTopics(true);
    return reply.send({ success: true, data: rows });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function getTopicBySlug(
  req: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply,
) {
  try {
    const topic = await findTopicBySlug(req.params.slug);
    if (!topic) return reply.code(404).send({ success: false, message: 'not_found' });

    const subs = await findSubjectsByTopicId(topic.id);
    return reply.send({ success: true, data: { ...topic, subjects: subs } });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
