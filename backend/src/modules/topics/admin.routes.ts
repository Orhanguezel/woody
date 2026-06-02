import type { FastifyInstance } from 'fastify';
import {
  adminListTopics, adminCreateTopic,
  adminUpdateTopic, adminDeleteTopic, adminToggleTopicActive,
} from './admin.controller';

export async function registerTopicsAdmin(app: FastifyInstance) {
  app.get('/topics', adminListTopics);
  app.post('/topics', adminCreateTopic);
  app.put('/topics/:id', adminUpdateTopic);
  app.delete('/topics/:id', adminDeleteTopic);
  app.put('/topics/:id/active', adminToggleTopicActive);
}
