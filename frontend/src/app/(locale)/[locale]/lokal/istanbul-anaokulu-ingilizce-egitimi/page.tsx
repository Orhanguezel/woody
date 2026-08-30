import { notFound } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import LocalIstanbulGuide from '@/components/woody/local/LocalIstanbulGuide';
import type { LocalGuideContent } from '@/components/woody/local/LocalIstanbulGuide';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';
import { loadPageContent } from '@/config/pages/loader';

const PAGE_KEY = 'local-istanbul';
const PATHNAME = '/lokal/istanbul-anaokulu-ingilizce-egitimi';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function LocalIstanbulPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'tr') notFound();
  const [content, rawContent] = await Promise.all([
    loadWoodyPageContent(PAGE_KEY, locale),
    loadPageContent<LocalGuideContent>(PAGE_KEY, locale),
  ]);
  if (!content) return <WoodyFallback pageKey={PAGE_KEY} />;
  return (
    <>
      <JsonLd id="woody-local-istanbul" data={woodyPageGraph({ locale, pathname: PATHNAME, content, schemaType: 'LocalBusiness' })} />
      {rawContent ? <LocalIstanbulGuide content={rawContent} /> : <WoodyFallback pageKey={PAGE_KEY} />}
    </>
  );
}
