import type { Metadata } from 'next';

import WoodyBlogIndexClient from '@/components/woody/WoodyBlogIndexClient';
import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, graph, itemList } from '@/seo/jsonld';
import { buildPageMetadata } from '@/seo/serverMetadata';
import { getPublicAppName, getPublicSiteOrigin } from '@/lib/site-config';
import { loadFallbackBlogPosts } from '@/components/woody/blog-loader.server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    pageKey: 'blog',
    pathname: '/blog',
    fallback: {
      title: locale === 'tr' ? 'Blog' : 'Blog',
      description:
        locale === 'tr'
          ? 'Woody ve Arkadaşları blog yazıları, çocuk İngilizcesi ve dijital öğrenme notları.'
          : 'Woody ve Arkadaşları blog posts on children English and digital learning.',
    },
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = await loadFallbackBlogPosts(locale);
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const pageUrl = `${siteUrl}/${locale}/blog`;

  return (
    <>
      <JsonLd
        id="woody-blog-list"
        data={graph([
          breadcrumbSchema([
            { name: app, item: `${siteUrl}/${locale}` },
            { name: 'Blog', item: pageUrl },
          ]),
          itemList({
            url: pageUrl,
            name: 'Blog',
            items: posts.map((post, index) => ({
              name: post.title,
              url: `${pageUrl}/${encodeURIComponent(post.slug)}`,
              image: post.featured_image,
              position: index + 1,
            })),
          }),
        ])}
      />
      <WoodyBlogIndexClient />
    </>
  );
}
