import type { FastifyInstance } from 'fastify';
import { registerHomeLayoutPublic, registerHomeSectionsAdmin } from '@/modules/homeSections';
import { registerAdminPanelCommerceStubs } from '@/modules/adminPanelStubs/router';
import { registerSchoolsAdmin, registerSchoolsPublic } from '@/modules/schools';
import { registerOrdersProjectAdmin } from '@/modules/orders';
import { registerCheckoutPublic, registerCheckoutAdmin } from '@/modules/checkout';
import { registerCatalogAdmin, registerCatalogPublic } from '@/modules/catalog';
import { registerEntitlementsAdmin, registerEntitlementsPublic } from '@/modules/entitlements';
import { registerQuoteRequestsAdmin, registerQuoteRequestsPublic } from '@/modules/quoteRequests';
import { registerContactsAdmin, registerContactsPublic } from '@/modules/contacts';
import { registerSubscriptionsAdmin, registerSubscriptionsPublic } from '@/modules/subscriptions';
import { registerWaitlistPublic } from '@/modules/waitlist';
import { registerContentSourcePublic } from '@/modules/contentSource';

export async function registerProjectPublic(api: FastifyInstance) {
  await registerHomeLayoutPublic(api);
  await registerSchoolsPublic(api);
  await registerCatalogPublic(api);
  await registerCheckoutPublic(api);
  await registerEntitlementsPublic(api);
  await registerQuoteRequestsPublic(api);
  await registerContactsPublic(api);
  await registerSubscriptionsPublic(api);
  await registerWaitlistPublic(api);
  // Tanitio icerik kaynagi kontrati v1.3 — GET /content-source/articles + /products
  await registerContentSourcePublic(api);

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
  await registerCheckoutAdmin(adminApi);
  await registerCatalogAdmin(adminApi);
  await registerEntitlementsAdmin(adminApi);
  await registerQuoteRequestsAdmin(adminApi);
  await registerContactsAdmin(adminApi);
  await registerSubscriptionsAdmin(adminApi);
}
