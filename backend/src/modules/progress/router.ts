import type { FastifyInstance } from 'fastify';
import { getMyProgress, getMyTopicDetail } from './controller';

export async function registerProgress(app: FastifyInstance) {
  app.get('/progress/me', getMyProgress);
  app.get('/progress/me/topics/:topicId', getMyTopicDetail);
}
