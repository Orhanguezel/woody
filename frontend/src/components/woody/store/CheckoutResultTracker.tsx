'use client';

import { useEffect } from 'react';

import { reportPurchaseOnce } from '@/lib/ecommerce-events';

/** Basari sayfasinda GA4 purchase olayini (siparis basina tek kez) gonderir. Gorsel cikti uretmez. */
export default function CheckoutResultTracker({ orderId }: { orderId: string }) {
  useEffect(() => {
    reportPurchaseOnce(orderId);
  }, [orderId]);
  return null;
}
