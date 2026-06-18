import type { Metadata } from 'next';

import { tUi } from '@/i18n/staticUi';

import SchoolAssetsClient from '@/components/woody/school/SchoolAssetsClient';
import { buildPageMetadata } from '@/seo/serverMetadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    pageKey: 'school-assets',
    pathname: '/school/assets',
    fallback: {
      title: tUi(locale, 'School Digital Content'),
      description:
        tUi(locale, 'Woody digital content assigned to the school account.'),
    },
  });
}

export default function SchoolAssetsPage() {
  return <SchoolAssetsClient />;
}
