import type { Metadata } from 'next';
import type React from 'react';

import { buildPageMetadata, fetchUiSectionObject, readUiText } from '@/seo/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const ui = await fetchUiSectionObject('ui_cookie_policy', locale);

  const pageTitle =
    readUiText(ui, 'ui_cookie_policy_meta_title') ||
    readUiText(ui, 'ui_cookie_policy_fallback_title', 'Cookie Policy');
  const pageDescription =
    readUiText(ui, 'ui_cookie_policy_meta_description') ||
    readUiText(ui, 'ui_cookie_policy_page_description', '');

  return buildPageMetadata({
    locale,
    pageKey: 'cookie-policy',
    pathname: '/cerez-politikasi',
    fallback: {
      title: pageTitle,
      description: pageDescription,
    },
  });
}

export default function CookieLayout({ children }: { children: React.ReactNode }) {
  return children;
}
