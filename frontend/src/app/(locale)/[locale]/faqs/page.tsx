import { loadPageContent } from '@/config/pages/loader';
import { getPublicAppName, getPublicSiteOrigin } from '@/lib/site-config';
import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, faqSchema, graph } from '@/seo/jsonld';
import { stripHtml } from '@/integrations/shared';

type Props = { params: Promise<{ locale: string }> };
type FaqPageContent = {
  description?: string;
  hero?: {
    title?: string;
    description?: string;
    eyebrow?: string;
  };
  title?: string;
  items?: Array<{ answer?: string; problem?: string; question?: string; solution?: string }>;
};

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadPageContent<FaqPageContent>('faq', locale);
  const title = content?.hero?.title || content?.title || 'FAQs';
  const description = content?.hero?.description || content?.description || '';
  const items = (content?.items ?? [])
    .map((item) => ({
      question: String(item.question || '').trim(),
      answer: [item.problem, item.answer || item.solution]
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .filter((part, index, parts) => parts.indexOf(part) === index)
        .join(' '),
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, 25);
  const schemaItems = items.map((item) => ({
    question: stripHtml(item.question),
    answer: stripHtml(item.answer),
  }));
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const pageUrl = `${siteUrl}/${locale}/faqs`;

  return (
    <>
      {schemaItems.length > 0 ? (
        <JsonLd
          id="faqs-ssr"
          data={graph([
            breadcrumbSchema([
              { name: app, item: `${siteUrl}/${locale}` },
              { name: title, item: pageUrl },
            ]),
            faqSchema(schemaItems),
          ])}
        />
      ) : null}
      <main className="bg-[#fff9ee] text-[#24333f]">
        <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {content?.hero?.eyebrow ? (
              <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#f58220]">
                {content.hero.eyebrow}
              </p>
            ) : null}
            <h1 className="font-serif text-4xl font-light leading-tight text-[#24333f] md:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-5 text-base font-medium leading-8 text-[#5f6871] md:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          <section className="space-y-4" aria-label={title}>
            {items.map((item, index) => {
              const question = stripHtml(item.question);
              const answerText = stripHtml(item.answer);
              return (
                <details
                  key={`${question}-${index}`}
                  className="group border border-[#eadfce] bg-white p-6 shadow-[0_10px_30px_rgba(36,51,63,0.06)]"
                  open={index === 0}
                >
                  <summary className="cursor-pointer list-none font-serif text-xl font-semibold text-[#24333f] marker:hidden">
                    {question}
                  </summary>
                  <div className="mt-4 border-t border-[#f0dcb6] pt-4 text-base leading-8 text-[#5f6871]">
                    <p>{answerText}</p>
                  </div>
                </details>
              );
            })}
          </section>
        </section>
      </main>
    </>
  );
}
