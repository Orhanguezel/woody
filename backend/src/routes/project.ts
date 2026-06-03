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
}

export async function registerProjectAdmin(adminApi: FastifyInstance) {
  await registerHomeSectionsAdmin(adminApi);
  await registerAdminPanelCommerceStubs(adminApi);
  await registerSchoolsAdmin(adminApi);
  await registerOrdersProjectAdmin(adminApi);
}
