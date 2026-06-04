import FaqsRouteClient from './FaqsRouteClient';

import { loadPageContent } from '@/config/pages/loader';
import { getPublicAppName, getPublicSiteOrigin } from '@/lib/site-config';
import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, faqSchema, graph } from '@/seo/jsonld';

type Props = { params: Promise<{ locale: string }> };
type FaqPageContent = {
  title?: string;
  items?: Array<{ answer?: string; question?: string; solution?: string }>;
};

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadPageContent<FaqPageContent>('faq', locale);
  const items = (content?.items ?? [])
    .map((item) => ({
      question: String(item.question || '').trim(),
      answer: String(item.answer || item.solution || '').trim(),
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, 25);
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const pageUrl = `${siteUrl}/${locale}/faqs`;

  return (
    <>
      {items.length > 0 ? (
        <JsonLd
          id="faqs-ssr"
          data={graph([
            breadcrumbSchema([
              { name: app, item: `${siteUrl}/${locale}` },
              { name: content?.title || 'FAQs', item: pageUrl },
            ]),
            faqSchema(items),
          ])}
        />
      ) : null}
      <FaqsRouteClient />
    </>
  );
}
