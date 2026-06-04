import type { Metadata } from 'next';

import LevelFinderClient from '@/components/woody/level-finder/LevelFinderClient';
import { localizedWoodyPath } from '@/components/woody/routes';
import { getPublicAppName } from '@/lib/site-config';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const appName = getPublicAppName();
  return {
    title: `Woody Level Finder | ${appName}`,
    description: `${appName} Level Finder ile öğrencinin yaşına ve İngilizce becerilerine göre en uygun seviyeyi belirleyin.`,
    alternates: {
      canonical: localizedWoodyPath(locale, '/level-finder'),
    },
  };
}

export default async function LevelFinderPage() {
  return <LevelFinderClient />;
}
