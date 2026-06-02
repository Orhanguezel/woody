import type { FastifyInstance } from 'fastify';
import { adminListAchievements } from './admin.controller';

export async function registerAchievementsAdmin(app: FastifyInstance) {
  app.get('/achievements', adminListAchievements);
}
