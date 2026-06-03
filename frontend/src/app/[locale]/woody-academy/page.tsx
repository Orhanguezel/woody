import JsonLd from '@/seo/JsonLd';
import WoodyFallback from '@/components/woody/WoodyFallback';
import WoodyPage from '@/components/woody/WoodyPage';
import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';

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
  return (
    <>
      <JsonLd id="woody-academy" data={woodyPageGraph({ locale, pathname: PATHNAME, content, schemaType: 'EducationalOrganization' })} />
      <WoodyPage content={content} locale={locale} />
    </>
  );
}
