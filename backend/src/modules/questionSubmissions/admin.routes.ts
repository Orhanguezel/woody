import type { FastifyInstance } from 'fastify';
import {
  adminListSubmissions,
  adminPatchSubmission,
  adminPromoteSubmission,
} from './admin.controller';

export async function registerQuestionSubmissionsAdmin(app: FastifyInstance) {
  app.get('/question-submissions', adminListSubmissions);
  app.patch('/question-submissions/:id', adminPatchSubmission);
  app.post('/question-submissions/:id/promote', adminPromoteSubmission);
}
