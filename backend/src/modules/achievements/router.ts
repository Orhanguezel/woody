import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@shared/shared-backend/middleware/auth';
import { listAchievements, getMyAchievements } from './controller';

export async function registerAchievements(app: FastifyInstance) {
  app.get('/achievements', listAchievements);

  app.register(async (authApi) => {
    authApi.addHook('onRequest', requireAuth);
    authApi.get('/achievements/me', getMyAchievements);
  });
}
