import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import HomeTutorPageClient from '@/components/woody/home-tutor/HomeTutorPageClient';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';

const PAGE_KEY = 'home-tutor';
const PATHNAME = '/home-tutor';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function HomeTutorPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  if (!content) return <WoodyFallback pageKey={PAGE_KEY} />;
  return (
    <>
      <JsonLd id="woody-home-tutor" data={woodyPageGraph({ locale, pathname: PATHNAME, content })} />
      <HomeTutorPageClient content={content} locale={locale} />
    </>
  );
}
