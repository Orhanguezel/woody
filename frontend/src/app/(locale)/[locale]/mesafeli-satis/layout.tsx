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
    pageKey: 'distance-sales',
    pathname: '/mesafeli-satis',
    fallback: {
      title: 'Mesafeli Satış Sözleşmesi',
      description: 'Woody and Friends mesafeli satış sözleşmesi: taraflar, ürün, ödeme, teslimat, cayma hakkı ve uyuşmazlık çözümü.',
    },
  });
}

export default function DistanceSalesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
