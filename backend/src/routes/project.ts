import type { FastifyInstance } from 'fastify';
import { registerHomeLayoutPublic, registerHomeSectionsAdmin } from '@/modules/homeSections';
import { registerAdminPanelCommerceStubs } from '@/modules/adminPanelStubs/router';
import { registerSchoolsAdmin, registerSchoolsPublic } from '@/modules/schools';
import { registerOrdersProjectAdmin } from '@/modules/orders';
import { registerCheckoutPublic } from '@/modules/checkout';

export async function registerProjectPublic(api: FastifyInstance) {
  await registerHomeLayoutPublic(api);
  await registerSchoolsPublic(api);
  await registerCheckoutPublic(api);

  // Notifications: backend'de gercek modul yok; admin paneli sidebar'i
  // /notifications/unread-count'u 60sn'de bir polling yapip 404 + retry dongusu uretiyordu.
  // Zararsiz read-stub'lar (count:0 / bos liste) — admin+user tek yol (/api/v1/notifications).
  api.get('/notifications/unread-count', async (_req, reply) => reply.send({ count: 0 }));
  api.get('/notifications', async (_req, reply) => reply.send([]));
}

export async function registerProjectAdmin(adminApi: FastifyInstance) {
  await registerHomeSectionsAdmin(adminApi);
  await registerAdminPanelCommerceStubs(adminApi);
  await registerSchoolsAdmin(adminApi);
  await registerOrdersProjectAdmin(adminApi);
}
