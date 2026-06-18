import type { Metadata } from 'next';
import { tUi } from '@/i18n/staticUi';

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
      title: tUi(locale, 'Frequently Asked Questions'),
      description:
        tUi(locale, 'Frequently asked questions about Woody and Friends.'),
    },
  });
}

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
