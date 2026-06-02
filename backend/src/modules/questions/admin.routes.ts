import type { FastifyInstance } from 'fastify';
import {
  adminListQuestions, adminCreateQuestion,
  adminUpdateQuestion, adminDeleteQuestion, adminToggleQuestionActive,
} from './admin.controller';

export async function registerQuestionsAdmin(app: FastifyInstance) {
  app.get('/questions', adminListQuestions);
  app.post('/questions', adminCreateQuestion);
  app.put('/questions/:id', adminUpdateQuestion);
  app.delete('/questions/:id', adminDeleteQuestion);
  app.put('/questions/:id/active', adminToggleQuestionActive);
}
