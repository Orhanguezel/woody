import type { FastifyRequest, FastifyReply } from 'fastify';
import { findLayoutPublicActive } from './repository';

export async function getHomeLayoutPublic(_req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await findLayoutPublicActive();
    return reply.send({ success: true, data });
  } catch (err) {
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
