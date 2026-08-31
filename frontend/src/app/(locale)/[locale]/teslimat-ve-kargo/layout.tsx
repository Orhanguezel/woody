import type { Metadata } from 'next';
import type React from 'react';

import { buildPageMetadata } from '@/seo/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    pageKey: 'shipping-policy',
    pathname: '/teslimat-ve-kargo',
    fallback: {
      title: 'Teslimat ve Kargo Koşulları',
      description: 'Sipariş hazırlık süresi, kargo teslim süresi, kargo ücreti ve teslim alma kuralları.',
    },
  });
}

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
