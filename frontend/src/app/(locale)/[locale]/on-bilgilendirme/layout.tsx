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
    pageKey: 'preliminary-info',
    pathname: '/on-bilgilendirme',
    fallback: {
      title: 'Ön Bilgilendirme Formu',
      description: 'Satış öncesi zorunlu ön bilgilendirme: satıcı bilgileri, ürün, ödeme, teslimat ve cayma hakkı.',
    },
  });
}

export default function PreliminaryInfoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
