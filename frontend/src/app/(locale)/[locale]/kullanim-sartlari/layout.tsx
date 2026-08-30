import type { Metadata } from 'next';
import type React from 'react';

import { buildPageMetadata, fetchUiSectionObject, readUiText } from '@/seo/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const ui = await fetchUiSectionObject('ui_terms', locale);

  const pageTitle =
    readUiText(ui, 'ui_terms_meta_title') ||
    readUiText(ui, 'ui_terms_fallback_title', 'Terms & Conditions');
  const pageDescription =
    readUiText(ui, 'ui_terms_meta_description') ||
    readUiText(ui, 'ui_terms_page_description', '');

  return buildPageMetadata({
    locale,
    pageKey: 'terms',
    pathname: '/kullanim-sartlari',
    fallback: {
      title: pageTitle,
      description: pageDescription,
    },
  });
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
