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
    pageKey: 'blog',
    pathname: '/blog',
    fallback: {
      title: 'Blog',
      description:
        locale === 'tr'
          ? 'Woody ve Arkadaşları blog yazıları, çocuk İngilizcesi ve dijital öğrenme notları.'
          : 'Woody and Friends blog posts on children English and digital learning.',
    },
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
