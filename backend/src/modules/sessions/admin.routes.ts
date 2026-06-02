import type { FastifyInstance } from 'fastify';
import { adminListSessions, adminGetStats } from './admin.controller';

export async function registerSessionsAdmin(app: FastifyInstance) {
  app.get('/stats', adminGetStats);
  app.get('/sessions', adminListSessions);
}
