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
    pageKey: 'faqs',
    pathname: '/faqs',
    fallback: {
      title: locale === 'tr' ? 'Sık Sorulan Sorular' : 'Frequently Asked Questions',
      description:
        locale === 'tr'
          ? 'Woody ve Arkadaşları hakkında sık sorulan sorular.'
          : 'Frequently asked questions about Woody and Friends.',
    },
  });
}

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
