import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import WoodyAcademyPageClient from '@/components/woody/academy/WoodyAcademyPageClient';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';
import { answerIntroFromContent } from '@/components/woody/answer-intro.server';

const PAGE_KEY = 'woody-academy';
const PATHNAME = '/woody-academy';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  return woodyMetadata({ locale, pageKey: PAGE_KEY, pathname: PATHNAME, content });
}

export default async function WoodyAcademyPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadWoodyPageContent(PAGE_KEY, locale);
  if (!content) return <WoodyFallback pageKey={PAGE_KEY} />;
  const answerIntro = answerIntroFromContent(content, locale);
  return (
    <>
      <JsonLd id="woody-academy" data={woodyPageGraph({ locale, pathname: PATHNAME, content, schemaType: 'EducationalOrganization' })} />
      <WoodyAcademyPageClient content={content} locale={locale} answerIntro={answerIntro} />
    </>
  );
}
