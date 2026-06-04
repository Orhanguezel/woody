import { buildPageMetadata } from '@/seo/server';
import type { Metadata } from 'next';
import type React from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    pageKey: 'contact',
    pathname: '/contact',
    fallback: {
      title: locale === 'tr' ? 'İletişim' : 'Contact',
      description:
        locale === 'tr'
          ? 'Woody ve Arkadaşları ile iletişime geçin.'
          : 'Contact Woody and Friends.',
    },
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
