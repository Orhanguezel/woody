import type { FastifyInstance } from 'fastify';
import { listTopics, getTopicBySlug } from './controller';

export async function registerTopics(app: FastifyInstance) {
  app.get('/topics', listTopics);
  app.get('/topics/:slug', getTopicBySlug);
}
