import type { FastifyRequest, FastifyReply } from 'fastify';
import { findAllAchievements, findUserAchievements } from './repository';

export async function listAchievements(req: FastifyRequest, reply: FastifyReply) {
  try {
    const rows = await findAllAchievements();
    return reply.send({ success: true, data: rows });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function getMyAchievements(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? "";
    const rows = await findUserAchievements(userId);
    return reply.send({ success: true, data: rows });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
