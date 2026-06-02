import type { FastifyInstance } from 'fastify';
import { adminCreateSubject, adminUpdateSubject, adminDeleteSubject } from './admin.controller';

export async function registerSubjectsAdmin(app: FastifyInstance) {
  app.post('/subjects', adminCreateSubject);
  app.put('/subjects/:id', adminUpdateSubject);
  app.delete('/subjects/:id', adminDeleteSubject);
}
