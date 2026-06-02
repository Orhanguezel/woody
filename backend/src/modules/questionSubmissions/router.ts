import type { FastifyInstance } from 'fastify';
import { submitQuestion, listMySubmissions } from './controller';

export async function registerQuestionSubmissions(app: FastifyInstance) {
  app.post('/question-submissions', submitQuestion);
  app.get('/question-submissions/me', listMySubmissions);
}
