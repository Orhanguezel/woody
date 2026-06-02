import type { FastifyRequest, FastifyReply } from 'fastify';
import { getMyStats, getMyTopicProgress, getTopicProgressById } from './repository';

export async function getMyProgress(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? "";
    const [stats, topicProgress] = await Promise.all([
      getMyStats(userId),
      getMyTopicProgress(userId),
    ]);

    return reply.send({
      success: true,
      data: {
        stats: stats ?? {
          total_xp: 0, level: 1, streak_days: 0, longest_streak: 0,
          total_questions: 0, total_correct: 0, total_sessions: 0,
        },
        topic_progress: topicProgress,
      },
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}

export async function getMyTopicDetail(
  req: FastifyRequest<{ Params: { topicId: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = (req.user as { sub?: string }).sub ?? "";
    const topicId = Number(req.params.topicId);
    const rows = await getTopicProgressById(userId, topicId);
    return reply.send({ success: true, data: rows });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ success: false, message: 'server_error' });
  }
}
