import type { FastifyInstance } from 'fastify';
import { listQuestions, getRandomQuestions } from './controller';

export async function registerQuestions(app: FastifyInstance) {
  app.get('/questions', listQuestions);
  app.post('/questions/random', getRandomQuestions);
}
