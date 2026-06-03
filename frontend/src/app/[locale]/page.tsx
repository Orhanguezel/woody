import type { Metadata } from 'next';
import React from 'react';
import HomeContent from '@/components/containers/home/HomeContent';
import JsonLd from '@/seo/JsonLd';
import WoodyPage from '@/components/woody/WoodyPage';
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
  const content = await loadWoodyPageContent('home', locale);
  if (content) {
    return (
      <>
        <JsonLd id="woody-home" data={woodyPageGraph({ locale, pathname: '/', content, schemaType: 'EducationalOrganization' })} />
        <WoodyPage content={content} locale={locale} />
      </>
    );
  }
  return <HomeContent locale={locale} />;
}
