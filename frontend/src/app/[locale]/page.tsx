import type { Metadata } from 'next';
import React from 'react';
import HomeContent from '@/components/containers/home/HomeContent';
import JsonLd from '@/seo/JsonLd';
import WoodyHomePage from '@/components/woody/home/WoodyHomePage';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { woodyPageGraph } from '@/components/woody/seo';

import { normPath } from '@/integrations/shared';
import { buildMetadataFromSeo, fetchSeoObject, fetchSeoPageObject, mergeSeoPageIntoSeo } from '@/seo/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  let seo = await fetchSeoObject(locale);
  const pageSeo = await fetchSeoPageObject(locale, 'home');
  seo = mergeSeoPageIntoSeo(seo, pageSeo);

  return buildMetadataFromSeo(seo, { locale, pathname: normPath('/') });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [content, preschool, workshop, homeTutor, whyContent, newsContent] = await Promise.all([
    loadWoodyPageContent('home', locale),
    loadWoodyPageContent('preschool', locale),
    loadWoodyPageContent('workshop', locale),
    loadWoodyPageContent('home-tutor', locale),
    loadWoodyPageContent('why-woody', locale),
    loadWoodyPageContent('news', locale),
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
          locale={locale}
        />
      </>
    );
  }
  return <HomeContent locale={locale} />;
}
