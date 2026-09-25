import type { Metadata } from 'next';

import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, graph, profilePerson } from '@/seo/jsonld';
import { buildPageMetadata } from '@/seo/serverMetadata';
import { loadPageContent } from '@/config/pages/loader';
import { getPublicAppName, getPublicSiteOrigin, getSiteAuthor } from '@/lib/site-config';
import { getEditorialPolicyCopy } from '@/lib/page-copy';

type Props = { params: Promise<{ locale: string }> };

type AboutCopy = {
  eyebrow?: string;
  title: string;
  lead?: string;
  founderTitle?: string;
  founderParagraphs?: string[];
  methodologyTitle?: string;
  methodologyParagraphs?: string[];
  experienceTitle?: string;
  experienceParagraphs?: string[];
  differentiatorsTitle?: string;
  differentiators?: Array<{ title: string; body: string }>;
  /** Seri → kimin için → nasıl edinilir tablosu (varlık merkezi). */
  productFamiliesTitle?: string;
  productFamiliesColumns?: [string, string, string];
  productFamilies?: Array<{ name: string; audience: string; access: string; href?: string }>;
  authorLabel?: string;
  expertiseLabel?: string;
  /** Yalnız kurucu biyografisi yoksa gösterilen yedek metin. */
  authorBio?: string;
};

async function loadAbout(locale: string) {
  return loadPageContent<AboutCopy>('about-page', locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = await loadAbout(locale);
  return buildPageMetadata({
    locale,
    pageKey: 'about',
    pathname: '/about',
    fallback: {
      title: content?.title,
      description: content?.lead || content?.authorBio,
    },
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const content = await loadAbout(locale);
  const app = getPublicAppName();
  const siteUrl = getPublicSiteOrigin();
  const pageUrl = `${siteUrl}/${locale}/about`;
  const author = getSiteAuthor(locale);
  const editorial = await getEditorialPolicyCopy(locale, app);

  if (!content) return null;

  const sections = [
    { title: content.founderTitle, paragraphs: content.founderParagraphs ?? [] },
    { title: content.methodologyTitle, paragraphs: content.methodologyParagraphs ?? [] },
    { title: content.experienceTitle, paragraphs: content.experienceParagraphs ?? [] },
  ].filter((section) => section.title || section.paragraphs.length);

  return (
    <>
      <JsonLd
        id="woody-about"
        data={graph([
          breadcrumbSchema([
            { name: app, item: `${siteUrl}/${locale}` },
            { name: content.eyebrow || 'About', item: pageUrl },
          ]),
          {
            '@type': 'AboutPage',
            '@id': `${pageUrl}#about`,
            name: content.title,
            description: content.lead || content.authorBio,
            url: pageUrl,
            isPartOf: { '@id': `${siteUrl}/#website` },
            about: { '@id': `${siteUrl}/#org` },
            publishingPrinciples: `${pageUrl}#editorial-policy`,
            mainEntity: { '@id': `${pageUrl}#author` },
            inLanguage: locale,
          },
          profilePerson({
            id: `${pageUrl}#author`,
            name: author.name,
            url: pageUrl,
            ...(author.image ? { image: author.image } : {}),
            jobTitle: author.jobTitle,
            description: author.bio || content.authorBio,
            knowsAbout: author.knowsAbout,
            knowsLanguage: ['tr', 'en'],
            worksForId: `${siteUrl}/#org`,
            ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
          }),
        ])}
      />
      <main className="bg-[#fff9ee] text-[#24333f]">
        <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            {content.eyebrow ? (
              <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#f58220]">
                {content.eyebrow}
              </p>
            ) : null}
            <h1 className="font-serif text-4xl font-light leading-tight md:text-5xl">
              {content.title}
            </h1>
            {content.lead ? (
              <p className="mt-5 text-base font-medium leading-8 text-[#5f6871] md:text-lg">
                {content.lead}
              </p>
            ) : null}
          </div>

          <div className="mt-12 space-y-6">
            {sections.map((section, index) => (
              <section key={section.title || index} className="border border-[#eadfce] bg-white p-6 shadow-[0_10px_30px_rgba(36,51,63,0.06)] md:p-8">
                {section.title ? (
                  <h2 className="font-serif text-2xl font-semibold text-[#24333f]">
                    {section.title}
                  </h2>
                ) : null}
                <div className="mt-4 space-y-4 text-base leading-8 text-[#5f6871]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {content.differentiators?.length ? (
            <section className="mt-12">
              {content.differentiatorsTitle ? (
                <h2 className="text-center font-serif text-3xl font-light text-[#24333f]">
                  {content.differentiatorsTitle}
                </h2>
              ) : null}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {content.differentiators.map((item) => (
                  <article key={item.title} className="border border-[#eadfce] bg-white p-6">
                    <h3 className="text-lg font-bold text-[#24333f]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5f6871]">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {content.productFamilies?.length ? (
            <section className="mt-12 border border-[#eadfce] bg-white p-6 md:p-8">
              {content.productFamiliesTitle ? (
                <h2 className="font-serif text-2xl font-semibold text-[#24333f]">
                  {content.productFamiliesTitle}
                </h2>
              ) : null}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm leading-6 text-[#5f6871]">
                  {content.productFamiliesColumns ? (
                    <thead>
                      <tr className="border-b border-[#eadfce] text-[#24333f]">
                        {content.productFamiliesColumns.map((column) => (
                          <th key={column} scope="col" className="py-2 pr-4 font-bold">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  ) : null}
                  <tbody>
                    {content.productFamilies.map((row) => (
                      <tr key={row.name} className="border-b border-[#f3ebdd] align-top">
                        <th scope="row" className="py-3 pr-4 font-semibold text-[#24333f]">
                          {row.href ? (
                            <a href={`/${locale}${row.href}`} className="underline decoration-[#f58220]/40 hover:decoration-[#f58220]">
                              {row.name}
                            </a>
                          ) : (
                            row.name
                          )}
                        </th>
                        <td className="py-3 pr-4">{row.audience}</td>
                        <td className="py-3">{row.access}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section id="author" className="mt-12 scroll-mt-32 border border-[#eadfce] bg-white p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f58220]">
              {content.authorLabel || (locale === 'tr' ? 'Kurucu ve yazar' : 'Founder and author')}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold">{author.name}</h2>
            {author.jobTitle ? (
              <p className="mt-1 text-sm font-semibold text-[#f58220]">{author.jobTitle}</p>
            ) : null}
            {/* Kurucu biyografisi önceliklidir; jenerik marka cümlesi yalnız yedektir. */}
            <p className="mt-4 text-base leading-8 text-[#5f6871]">{author.bio || content.authorBio}</p>
            {locale === 'tr' && author.knowsAbout.length ? (
              <p className="mt-4 text-sm leading-7 text-[#5f6871]">
                <span className="font-semibold text-[#24333f]">
                  {content.expertiseLabel || (locale === 'tr' ? 'Çalışma alanları' : 'Areas of work')}:
                </span>{' '}
                {author.knowsAbout.join(' · ')}
              </p>
            ) : null}
          </section>

          {editorial.sections.length ? (
            <section id="editorial-policy" className="mt-12 scroll-mt-32 border border-[#eadfce] bg-white p-6 md:p-8">
              <h2 className="font-serif text-2xl font-semibold text-[#24333f]">{editorial.title}</h2>
              {editorial.description ? (
                <p className="mt-2 text-base leading-8 text-[#5f6871]">{editorial.description}</p>
              ) : null}
              <div className="mt-6 space-y-6">
                {editorial.sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-lg font-bold text-[#24333f]">{section.title}</h3>
                    <div className="mt-2 space-y-3 text-base leading-8 text-[#5f6871]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      </main>
    </>
  );
}
