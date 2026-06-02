import type { FastifyInstance } from 'fastify';
import {
  adminListHomeSections,
  adminGetHomeSection,
  adminCreateHomeSection,
  adminPatchHomeSection,
  adminDeleteHomeSection,
  adminReorderHomeSections,
} from './admin.controller';

export async function registerHomeSectionsAdmin(app: FastifyInstance) {
  app.get('/home/sections', adminListHomeSections);
  app.post('/home/sections', adminCreateHomeSection);
  app.post('/home/sections/reorder', adminReorderHomeSections);
  app.get('/home/sections/:id', adminGetHomeSection);
  app.patch('/home/sections/:id', adminPatchHomeSection);
  app.delete('/home/sections/:id', adminDeleteHomeSection);
}
