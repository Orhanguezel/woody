import type { Metadata } from 'next';
import { tUi } from '@/i18n/staticUi';

import React from 'react';
import { preload } from 'react-dom';
import HomeContent from '@/components/containers/home/HomeContent';
import { fetchHomeLayout } from '@/components/containers/home/fetchHomeLayout.server';
import JsonLd from '@/seo/JsonLd';
import WoodyHomePage from '@/components/woody/home/WoodyHomePage';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { woodyPageGraph } from '@/components/woody/seo';

import { normPath } from '@/integrations/shared';
import { buildPageMetadata } from '@/seo/server';

function preloadHomeHeroAssets() {
  preload('/assets/woody/sections/hero-poster.webp', {
    as: 'image',
    fetchPriority: 'high',
    type: 'image/webp',
    media: '(min-width: 768px)',
  } as Parameters<typeof preload>[1]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata({
    locale,
    pageKey: 'home',
    pathname: normPath('/'),
    fallback: {
      title: tUi(locale, 'Woody and Friends | Preschool English'),
      description:
        tUi(locale, 'Preschool English learning sets, digital content, and teacher support platform.'),
    },
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  preloadHomeHeroAssets();
  const [content, preschool, workshop, homeTutor, whyContent, newsContent, layout] = await Promise.all([
    loadWoodyPageContent('home', locale),
    loadWoodyPageContent('preschool', locale),
    loadWoodyPageContent('workshop', locale),
    loadWoodyPageContent('home-tutor', locale),
    loadWoodyPageContent('why-woody', locale),
    loadWoodyPageContent('news', locale),
    fetchHomeLayout(),
  ]);
  if (content) {
    return (
      <>
        <JsonLd id="woody-home" data={woodyPageGraph({ locale, pathname: '/', content, schemaType: 'EducationalOrganization' })} />
        <WoodyHomePage
          content={content}
          setPages={[preschool, workshop, homeTutor].filter((item): item is NonNullable<typeof item> => Boolean(item))}
          whyContent={whyContent}
          newsContent={newsContent}
          layout={layout}
          locale={locale}
        />
      </>
    );
  }
  return <HomeContent locale={locale} />;
}
