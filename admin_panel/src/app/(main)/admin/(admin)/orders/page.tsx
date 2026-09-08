import AdminOrdersClient from './_components/admin-orders-client';
import type { PaymentStatus } from '@/integrations/shared';

const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ payment_status?: string }>;
}) {
  const query = await searchParams;
  const initialPaymentStatus = PAYMENT_STATUSES.includes(query.payment_status as PaymentStatus)
    ? query.payment_status as PaymentStatus
    : 'all';
  return <AdminOrdersClient initialPaymentStatus={initialPaymentStatus} />;
}
