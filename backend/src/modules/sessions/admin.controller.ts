import type { FastifyRequest, FastifyReply } from 'fastify';
import { findAllSessions } from './repository';
import { pool } from '@/db/client';

export async function adminListSessions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = req.query as { page?: string; limit?: string };
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const result = await findAllSessions({ page, limit });
    return reply.send({ success: true, ...result });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function adminGetStats(req: FastifyRequest, reply: FastifyReply) {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) as total FROM users') as unknown as [[{ total: number }]];
    const [[sessions]] = await pool.query('SELECT COUNT(*) as total FROM quiz_sessions') as unknown as [[{ total: number }]];
    const [[questions]] = await pool.query('SELECT COUNT(*) as total FROM questions') as unknown as [[{ total: number }]];
    const [[completed]] = await pool.query(
      "SELECT COUNT(*) as total FROM quiz_sessions WHERE status = 'completed'",
    ) as unknown as [[{ total: number }]];

    return reply.send({
      success: true,
      data: {
        total_users: users.total,
        total_sessions: sessions.total,
        completed_sessions: completed.total,
        total_questions: questions.total,
      },
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
