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
import { registerDashboardAdmin } from '@/modules/dashboard';
import { registerUserActivityAdmin } from '@/modules/userActivity';
import { setGatewayRefundHandler, OrderRefundError } from '@shared/shared-backend/modules/orders/refund.service';
import { refundPaytrOrder, PaytrRefundError } from '@/modules/checkout/paytrRefund';
import { registerSearchConsoleAdmin } from '@/modules/searchConsole';

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

// Paylasilan /orders/:id/refund ucu yalnizca bayi cari hesabini biliyordu;
// woody siparisleri PayTR oldugu icin her iade 400 donuyordu. Gecidi burada
// enjekte ediyoruz — paylasilan modul saglayici detayini bilmeye devam etmez.
setGatewayRefundHandler(async ({ orderId, paymentMethod, reason }) => {
  if (paymentMethod !== 'paytr') {
    throw new OrderRefundError('refund_not_supported_for_payment_method');
  }
  try {
    await refundPaytrOrder({ orderId, reason });
  } catch (err) {
    // Denetleyici yalnizca OrderRefundError'i 400 + kod olarak dondurur;
    // aksi halde panel anlamsiz bir 500 gorur.
    if (err instanceof PaytrRefundError) {
      throw new OrderRefundError(err.detail ? `${err.code}: ${err.detail}` : err.code);
    }
    throw err;
  }
});

export async function registerProjectAdmin(adminApi: FastifyInstance) {
  await registerHomeSectionsAdmin(adminApi);
  await registerAdminPanelCommerceStubs(adminApi);
  // Dashboard ozeti — gercek woody verisi (eskiden stub'di, sifir donuyordu)
  await registerDashboardAdmin(adminApi);
  // Kullanici aktivitesi — ne yapti, nerede gezdi (audit_request_logs)
  await registerUserActivityAdmin(adminApi);
  // Blog ve urun admin ekranlarindaki Google indeks durumu.
  await registerSearchConsoleAdmin(adminApi);
  await registerSchoolsAdmin(adminApi);
  await registerOrdersProjectAdmin(adminApi);
  await registerCheckoutAdmin(adminApi);
  await registerCatalogAdmin(adminApi);
  await registerEntitlementsAdmin(adminApi);
  await registerQuoteRequestsAdmin(adminApi);
  await registerContactsAdmin(adminApi);
  await registerSubscriptionsAdmin(adminApi);
}
