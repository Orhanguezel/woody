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
    pageKey: 'refund-policy',
    pathname: '/iade-cayma',
    fallback: {
      title: 'İptal, İade ve Geri Ödeme Koşulları',
      description: '14 gün cayma hakkı, iade süreci, geri ödeme süresi ve cayma hakkı istisnaları.',
    },
  });
}

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
