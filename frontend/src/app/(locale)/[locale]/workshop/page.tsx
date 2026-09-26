import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import WorkshopPageClient from '@/components/woody/workshop/WorkshopPageClient';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';
import { answerIntroFromContent } from '@/components/woody/answer-intro.server';

const PAGE_KEY = 'workshop';
const PATHNAME = '/workshop';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function WorkshopPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  if (!content) return <WoodyFallback pageKey={PAGE_KEY} />;
  return (
    <>
      <JsonLd id="woody-workshop" data={woodyPageGraph({ locale, pathname: PATHNAME, content })} />
      <WorkshopPageClient content={content} locale={locale} answerIntro={answerIntroFromContent(content, locale)} />
    </>
  );
}
