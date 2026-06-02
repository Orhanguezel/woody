import type { FastifyRequest, FastifyReply } from 'fastify';
import { findAllAchievements } from './repository';

export async function adminListAchievements(req: FastifyRequest, reply: FastifyReply) {
  try {
    const rows = await findAllAchievements();
    return reply.send({ success: true, data: rows });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
