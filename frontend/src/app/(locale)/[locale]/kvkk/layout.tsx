import type { Metadata } from 'next';
import type React from 'react';

import { buildPageMetadata, fetchUiSectionObject, readUiText } from '@/seo/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const ui = await fetchUiSectionObject('ui_kvkk', locale);

  const pageTitle =
    readUiText(ui, 'ui_kvkk_meta_title') || readUiText(ui, 'ui_kvkk_page_title', 'Privacy Notice');
  const pageDescription =
    readUiText(ui, 'ui_kvkk_meta_description') || readUiText(ui, 'ui_kvkk_page_description', '');

  return buildPageMetadata({
    locale,
    pageKey: 'kvkk',
    pathname: '/kvkk',
    fallback: {
      title: pageTitle,
      description: pageDescription,
    },
  });
}

export default function KvkkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
