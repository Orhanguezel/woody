import type { FastifyInstance } from 'fastify';
import { getHomeLayoutPublic } from './controller';

export async function registerHomeLayoutPublic(app: FastifyInstance) {
  app.get('/home/layout', getHomeLayoutPublic);
}
