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
    pageKey: 'blog',
    pathname: '/blog',
    fallback: {
      title: 'Blog',
      description:
        tUi(locale, 'Woody and Friends blog posts on children English and digital learning.'),
    },
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
