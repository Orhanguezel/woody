'use client';

import { useEffect } from 'react';

import { reportPurchaseOnce } from '@/lib/ecommerce-events';

/** Basari sayfasinda GA4 purchase olayini (siparis basina tek kez) gonderir. Gorsel cikti uretmez. */
export default function CheckoutResultTracker({ orderId }: { orderId: string }) {
  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      for (let attempt = 0; attempt < 6 && !cancelled; attempt += 1) {
        try {
          const response = await fetch(`/api/v1/checkout/orders/${encodeURIComponent(orderId)}/measurement`);
          if (response.ok) {
            const data = (await response.json()) as {
              ready?: boolean;
              delivery?: 'server' | 'browser';
              purchase?: { currency: string; value?: number; items: Array<{ item_id: string; item_name: string; price?: number; quantity?: number }> };
            };
            if (data.ready && data.purchase) {
              reportPurchaseOnce(orderId, data.purchase, data.delivery === 'server' ? 'server' : 'browser');
              return;
            }
            if (data.ready) return;
          }
        } catch {
          // PayTR callback ile basari redirect'i yarisi olabilir; tekrar denenir.
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1_500 * (attempt + 1)));
      }
    };
    void verify();
    return () => { cancelled = true; };
  }, [orderId]);
  return null;
}
