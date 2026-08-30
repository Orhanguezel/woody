import type { Metadata } from 'next';
import type React from 'react';

import { buildPageMetadata, fetchUiSectionObject, readUiText } from '@/seo/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const ui = await fetchUiSectionObject('ui_privacy_policy', locale);

  const pageTitle =
    readUiText(ui, 'ui_privacy_policy_meta_title') ||
    readUiText(ui, 'ui_privacy_policy_fallback_title', 'Privacy Policy');
  const pageDescription =
    readUiText(ui, 'ui_privacy_policy_meta_description') ||
    readUiText(ui, 'ui_privacy_policy_page_description', '');

  return buildPageMetadata({
    locale,
    pageKey: 'privacy-policy',
    pathname: '/gizlilik',
    fallback: {
      title: pageTitle,
      description: pageDescription,
    },
  });
}

export default function GizlilikLayout({ children }: { children: React.ReactNode }) {
  return children;
}
