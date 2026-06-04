import type { Metadata } from 'next';

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
      title: locale === 'tr' ? 'Okul Dijital İçerikleri' : 'School Digital Content',
      description:
        locale === 'tr'
          ? 'Okul hesabına atanmış Woody dijital içerikleri.'
          : 'Woody digital content assigned to the school account.',
    },
  });
}

export default function SchoolAssetsPage() {
  return <SchoolAssetsClient />;
}
