import React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { tUi } from '@/i18n/staticUi';

import type { Metadata } from 'next';
import BlogDetails from '@/components/containers/blog/BlogDetails';
import Banner from '@/layout/banner/Breadcrum';
import { safeStr, titleFromSlug, excerpt } from '@/integrations/shared';
import { normPath, absUrlJoin } from '@/integrations/shared';
import { buildPageMetadata, fetchCustomPagePublicBySlug } from '@/seo/server';
import JsonLd from '@/seo/JsonLd';
import { articleSchema, breadcrumbSchema, faqSchema, graph } from '@/seo/jsonld';
import FaqAccordion from '@/components/common/FaqAccordion';
import { getEditorialTeamName, getPublicAppName, getPublicSiteOrigin, getSiteAuthor } from '@/lib/site-config';
import { findFallbackBlogPost, loadFallbackBlogPosts } from '@/components/woody/blog-loader.server';
import { loadDbBlogPost, loadDbBlogPosts } from '@/components/woody/blog-db-loader.server';
import WoodyBlogFallbackDetail from '@/components/woody/WoodyBlogFallbackDetail';
import { WOODY_LOCALES } from '@/components/woody/routes';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  // GSC cift-indeks fix (2026-08-30): her locale YALNIZ KENDI slug'lariyla prerender edilir.
  // Eski hali tr slug'larini 10 locale'e carpiyordu -> /fr/blog/<tr-slug> gibi ~10x kopya
  // sayfa 200 + self-canonical donuyordu (1527 index / 765 degil tablosunun ana kaynagi).
  const perLocale = await Promise.all(
    WOODY_LOCALES.map(async (locale) => {
      const rows = await loadDbBlogPosts(locale);
      // Fallback icerik Turkce — yalniz tr'de slug kaynagi olabilir
      const posts = rows.length > 0 ? rows : locale === 'tr' ? await loadFallbackBlogPosts('tr') : [];
      return posts.map((post) => ({ locale, slug: post.slug }));
    }),
  );
  return perLocale.flat();
}

/**
 * Yanlis-locale slug cozumu: slug istenen dilde yoksa dogru URL'ye 308.
 * - Baska dilde DB'de varsa: istenen dilin kendi slug'i (alternates) varsa ona,
 *   yoksa yazinin gercek locale URL'ine yonlendir.
 * - Hicbir dilde yoksa ama tr fallback listesindeyse /tr'ye yonlendir.
 * - Hicbir yerde yoksa notFound() (eski davranis: her slug'a 200 -> soft-404 fabrikasi).
 */
async function redirectOrNotFound(slug: string, locale: string): Promise<never> {
  for (const other of WOODY_LOCALES) {
    if (other === locale) continue;
    const post = await loadDbBlogPost(slug, other);
    if (post) {
      const alt = post.alternates?.find((a) => a.locale === locale && a.slug);
      permanentRedirect(alt ? `/${locale}/blog/${alt.slug}` : `/${other}/blog/${slug}`);
    }
  }
  if (locale !== 'tr' && (await findFallbackBlogPost(slug, 'tr'))) {
    permanentRedirect(`/tr/blog/${slug}`);
  }
  notFound();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = (await params) as { locale: string; slug: string };
  const locale = safeStr(p?.locale) || 'de';
  const slug = safeStr(p?.slug);

  const pathname = normPath(`/blog/${slug || ''}`);

  const dbPost = slug ? await loadDbBlogPost(slug, locale) : null;
  const page = dbPost ? null : await fetchCustomPagePublicBySlug({ slug, locale });
  // Fallback icerik Turkce — diger dillerde metadata uretme (sayfa zaten 308/404 verir)
  const fallbackPost =
    dbPost || page || locale !== 'tr' ? null : await findFallbackBlogPost(slug, locale);

  // 308/404 karari BURADA verilmeli: sayfa govdesi stream'e basladiktan sonra status
  // degistirilemez (page icindeki notFound() 200 + not-found govdesi uretiyordu).
  // generateMetadata head'den once beklenir -> status kodu dogru cikar.
  if (!dbPost && !page && !fallbackPost && slug) {
    await redirectOrNotFound(slug, locale);
  }

  // Blog slug'lari dile gore CEVRILI -> hreflang/canonical her dilin KENDI slug'ini
  // kullanmali. dbPost.alternates (backend'den) -> per-locale path map. Yoksa generic.
  const localizedPaths = dbPost?.alternates?.length
    ? Object.fromEntries(dbPost.alternates.map((a) => [a.locale, `/blog/${a.slug}`]))
    : undefined;

  const pageTitle =
    safeStr(dbPost?.meta_title) ||
    safeStr(dbPost?.title) ||
    safeStr(page?.meta_title) ||
    safeStr(page?.title) ||
    safeStr(fallbackPost?.meta_title) ||
    fallbackPost?.title ||
    titleFromSlug(slug, 'Blog Detail');

  const rawDesc =
    safeStr(page?.meta_description) ||
    safeStr(page?.summary) ||
    safeStr(page?.content_html) ||
    safeStr((page as any)?.content) ||
    safeStr(dbPost?.meta_description) ||
    safeStr(dbPost?.summary) ||
    safeStr(dbPost?.content_html) ||
    safeStr(fallbackPost?.meta_description) ||
    safeStr(fallbackPost?.summary) ||
    '';
  const pageDescription = rawDesc ? excerpt(rawDesc, 180) : '';

  const imageRaw =
    safeStr(page?.featured_image) ||
    safeStr(dbPost?.featured_image) ||
    safeStr(fallbackPost?.featured_image) ||
    (Array.isArray((page as any)?.images) ? safeStr((page as any).images[0]) : '');

  const metadata = await buildPageMetadata({
    locale,
    pageKey: 'blog-post',
    pathname,
    fallback: {
      title: pageTitle,
      description: pageDescription,
      ogImage: imageRaw,
    },
  });
  if (localizedPaths) {
    const siteUrl = metadata.metadataBase?.toString().replace(/\/+$/, '') || getPublicSiteOrigin();
    metadata.alternates = {
      ...metadata.alternates,
      canonical: absUrlJoin(siteUrl, `/${locale}${localizedPaths[locale] || pathname}`),
      languages: Object.fromEntries(
        Object.entries(localizedPaths).map(([code, path]) => [
          code,
          absUrlJoin(siteUrl, `/${code}${path}`),
        ]),
      ),
    };
  }
  return metadata;
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const p = (await params) as { locale: string; slug: string };
  const locale = safeStr(p?.locale) || 'tr';
  const slug = safeStr(p?.slug);
  const dbPost = slug ? await loadDbBlogPost(slug, locale) : null;
  const page = dbPost ? null : slug ? await fetchCustomPagePublicBySlug({ slug, locale }) : null;
  // Fallback icerik Turkce — yalniz tr'de dogrudan render edilir (kopya-indeks fix)
  const fallbackPost =
    dbPost || page || locale !== 'tr' ? null : await findFallbackBlogPost(slug, locale);
  if (!dbPost && !page && !fallbackPost && slug) {
    await redirectOrNotFound(slug, locale);
  }
  const title = safeStr(dbPost?.title) || safeStr(page?.title) || fallbackPost?.title || titleFromSlug(slug, 'Blog Detail');
  const description = excerpt(
    safeStr(dbPost?.summary) ||
      safeStr(dbPost?.content_html) ||
      safeStr(page?.summary) ||
      safeStr(page?.content_html) ||
      safeStr(page?.content) ||
      safeStr(fallbackPost?.summary) ||
      title,
    180,
  );
  const app = getPublicAppName();
  const editorialName = getEditorialTeamName();
  const siteUrl = getPublicSiteOrigin();
  const siteAuthor = getSiteAuthor(locale);
  const aboutUrl = `${siteUrl}/${locale}/about`;
  const postAuthorName = safeStr(dbPost?.author) || safeStr(fallbackPost?.author);
  // Gercek kisi yazar (E-E-A-T): post yazari bos, site yazariyla ayni VEYA generic bir
  // editor/ekip adiysa zengin Person (jobTitle/sameAs) kullan; admin gercek farkli bir
  // yazar girmisse yalniz adiyla goster.
  const _pa = postAuthorName.trim().toLowerCase();
  const isGenericEditorial =
    !_pa ||
    _pa === siteAuthor.name.trim().toLowerCase() ||
    _pa === editorialName.trim().toLowerCase() ||
    /edit(o|ö)r|editorial|ekib|ekip|team|takım/i.test(_pa);
  const isSiteAuthor = isGenericEditorial;
  const displayAuthorName = isSiteAuthor ? siteAuthor.name : postAuthorName;
  const articleAuthor = isSiteAuthor
    ? {
        name: siteAuthor.name,
        url: aboutUrl,
        jobTitle: siteAuthor.jobTitle,
        ...(siteAuthor.image ? { image: siteAuthor.image } : {}),
        ...(siteAuthor.sameAs.length ? { sameAs: siteAuthor.sameAs } : {}),
      }
    : { name: postAuthorName, url: aboutUrl };
  const pageUrl = `${siteUrl}/${locale}/blog/${encodeURIComponent(slug)}`;
  const image =
    safeStr(dbPost?.featured_image) ||
    safeStr(page?.featured_image) ||
    safeStr(fallbackPost?.featured_image) ||
    (Array.isArray(page?.images) ? safeStr(page.images[0]) : '');
  const faqItems = [
    {
      question: tUi(locale, 'How is this content prepared?'),
      answer:
        locale === 'tr'
          ? `${app} blog içerikleri editoryal kontrol ve konu araştırması ilkeleriyle hazırlanır.`
          : `${app} blog content is prepared with editorial review and topic research.`,
    },
    {
      question: tUi(locale, 'Does this article replace professional advice?'),
      answer: tUi(locale, 'No. Blog articles provide general information; for personal situations consult a relevant professional.'),
    },
  ];

  return (
    <>
      <JsonLd
        id="blog-article"
        data={graph([
          breadcrumbSchema([
            { name: app, item: `${siteUrl}/${locale}` },
            { name: 'Blog', item: `${siteUrl}/${locale}/blog` },
            { name: title, item: pageUrl },
          ]),
          articleSchema({
            headline: title,
            description,
            image: image ? absUrlJoin(siteUrl, image) : undefined,
            datePublished: dbPost?.created_at || page?.created_at || fallbackPost?.created_at || '2026-04-30T00:00:00.000Z',
            dateModified: dbPost?.updated_at || dbPost?.created_at || page?.updated_at || page?.created_at || fallbackPost?.updated_at || fallbackPost?.created_at || '2026-04-30T00:00:00.000Z',
            author: articleAuthor,
            publisherId: `${siteUrl}/#org`,
            url: pageUrl,
            speakableSelectors: ['h1'],
            inLanguage: locale,
          }),
          faqSchema(faqItems),
        ])}
      />
      {page || !fallbackPost ? <Banner title={title} /> : null}
      {dbPost ? (
        <WoodyBlogFallbackDetail post={dbPost} locale={locale} />
      ) : page ? (
        <BlogDetails />
      ) : fallbackPost ? (
        <WoodyBlogFallbackDetail post={fallbackPost} locale={locale} />
      ) : (
        <BlogDetails />
      )}
      <FaqAccordion items={faqItems} title={tUi(locale, 'Questions About This Article')} />
      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/55 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-(--gm-gold)">
            {locale === 'tr' ? 'Yazar' : 'Author'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--gm-text)]">
            {displayAuthorName}
          </h2>
          {isSiteAuthor && siteAuthor.jobTitle ? (
            <p className="mt-1 text-sm font-medium text-(--gm-gold)">{siteAuthor.jobTitle}</p>
          ) : null}
          <p className="mt-3 text-[var(--gm-text-dim)]">
            {isSiteAuthor && siteAuthor.bio
              ? siteAuthor.bio
              : locale === 'tr'
                ? `${app} editörleri içerikleri sade, sorumlu ve uygulanabilir bir dille hazırlar.`
                : `${app} editors prepare content in clear, responsible, and practical language.`}
          </p>
        </div>
      </section>
    </>
  );
}
