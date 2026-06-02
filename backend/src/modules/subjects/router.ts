import type { FastifyInstance } from 'fastify';
import { listSubjectsByTopic, getSubjectById } from './controller';

export async function registerSubjects(app: FastifyInstance) {
  app.get('/topics/:topicSlug/subjects', listSubjectsByTopic);
  app.get('/subjects/:id', getSubjectById);
}
