import type { FastifyInstance } from 'fastify';
import { startSession, submitSession, getSession, getMySessions } from './controller';

export async function registerSessions(app: FastifyInstance) {
  app.post('/sessions/start', startSession);
  app.post('/sessions/:id/submit', submitSession);
  app.get('/sessions/:id', getSession);
  app.get('/sessions/me', getMySessions);
}
