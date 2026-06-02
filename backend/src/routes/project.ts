import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@agro/shared-backend/middleware/auth';
import { registerNotifications } from '@agro/shared-backend/modules/notifications';
import { registerTopics, registerTopicsAdmin } from '@/modules/topics';
import { registerSubjects, registerSubjectsAdmin } from '@/modules/subjects';
import { registerQuestions, registerQuestionsAdmin } from '@/modules/questions';
import { registerSessions, registerSessionsAdmin } from '@/modules/sessions';
import { registerProgress } from '@/modules/progress';
import { registerAchievements, registerAchievementsAdmin } from '@/modules/achievements';
import {
  registerQuestionSubmissions,
  registerQuestionSubmissionsAdmin,
} from '@/modules/questionSubmissions';
import { registerHomeLayoutPublic, registerHomeSectionsAdmin } from '@/modules/homeSections';
import { registerAdminPanelCommerceStubs } from '@/modules/adminPanelStubs/router';

export async function registerProjectPublic(api: FastifyInstance) {
  await registerHomeLayoutPublic(api);
  await registerTopics(api);
  await registerSubjects(api);
  await registerQuestions(api);
  await registerAchievements(api);

  await api.register(async (authApi) => {
    authApi.addHook('onRequest', requireAuth);
    await registerSessions(authApi);
    await registerProgress(authApi);
    await registerQuestionSubmissions(authApi);
  });
}

export async function registerProjectAdmin(adminApi: FastifyInstance) {
  await registerHomeSectionsAdmin(adminApi);
  await registerTopicsAdmin(adminApi);
  await registerSubjectsAdmin(adminApi);
  await registerQuestionsAdmin(adminApi);
  await registerSessionsAdmin(adminApi);
  await registerAchievementsAdmin(adminApi);
  await registerQuestionSubmissionsAdmin(adminApi);
  await registerAdminPanelCommerceStubs(adminApi);
}
