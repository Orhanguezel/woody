import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import WoodyBlogIndexClient from '@/components/woody/WoodyBlogIndexClient';
import {
  loadFallbackBlogPosts,
  loadFallbackBlogPostsByCategory,
} from '@/components/woody/blog-loader.server';
import { loadDbBlogPosts } from '@/components/woody/blog-db-loader.server';
import { getPublicAppName, getPublicSiteOrigin } from '@/lib/site-config';
import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, graph, itemList } from '@/seo/jsonld';
import { buildPageMetadata } from '@/seo/serverMetadata';

type Props = { params: Promise<{ category: string; locale: string }> };

const BLOG_CATEGORIES = [
  'genel',
  'haber',
  'okul-oncesi',
  'aile',
  'dijital-icerik',
  'ogretmen',
  'okul',
  'etkinlik',
  'mevsimsel',
] as const;

function decodeCategory(input: string) {
  try {
    return decodeURIComponent(input).trim();
  } catch {
    return input.trim();
  }
}

function isBlogCategory(category: string): category is (typeof BLOG_CATEGORIES)[number] {
  return BLOG_CATEGORIES.includes(category as (typeof BLOG_CATEGORIES)[number]);
}

function categoryTitle(category: string, locale: string) {
  const tr: Record<string, string> = {
    genel: 'Genel',
    haber: 'Haberler',
    'okul-oncesi': 'Okul Öncesi',
    aile: 'Aile',
    'dijital-icerik': 'Dijital İçerik',
    ogretmen: 'Öğretmen',
    okul: 'Okul',
    etkinlik: 'Etkinlik',
    mevsimsel: 'Mevsimsel',
  };
  const en: Record<string, string> = {
    genel: 'General',
    haber: 'News',
    'okul-oncesi': 'Preschool',
    aile: 'Family',
    'dijital-icerik': 'Digital Content',
    ogretmen: 'Teacher',
    okul: 'School',
    etkinlik: 'Event',
    mevsimsel: 'Seasonal',
  };
  return (locale === 'tr' ? tr : en)[category] || category;
}

export async function generateStaticParams() {
  const posts = await loadFallbackBlogPosts('tr');
  const categories = new Set(posts.map((post) => post.category).filter(Boolean));
  BLOG_CATEGORIES.forEach((category) => categories.add(category));
  return Array.from(categories).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: rawCategory, locale } = await params;
  const category = decodeCategory(rawCategory);
  if (!isBlogCategory(category)) return {};

  const title = categoryTitle(category, locale);
  return buildPageMetadata({
    locale,
    pageKey: 'blog',
    pathname: `/blog/category/${category}`,
    fallback: {
      title: `${title} | Blog`,
      description:
        locale === 'tr'
          ? `${title} kategorisindeki Woody blog yazıları.`
          : `Woody blog posts in the ${title} category.`,
    },
  });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category: rawCategory, locale } = await params;
  const category = decodeCategory(rawCategory);
  if (!isBlogCategory(category)) notFound();

  const dbPosts = await loadDbBlogPosts(locale, category);
  const posts = dbPosts.length > 0 ? dbPosts : await loadFallbackBlogPostsByCategory(locale, category);
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const title = categoryTitle(category, locale);
  const pageUrl = `${siteUrl}/${locale}/blog/category/${encodeURIComponent(category)}`;

  return (
    <>
      <JsonLd
        id="woody-blog-category-list"
        data={graph([
          breadcrumbSchema([
            { name: app, item: `${siteUrl}/${locale}` },
            { name: 'Blog', item: `${siteUrl}/${locale}/blog` },
            { name: title, item: pageUrl },
          ]),
          itemList({
            url: pageUrl,
            name: `${title} | Blog`,
            items: posts.map((post, index) => ({
              name: post.title,
              url: `${siteUrl}/${locale}/blog/${encodeURIComponent(post.slug)}`,
              image: post.featured_image,
              position: index + 1,
            })),
          }),
        ])}
      />
      <WoodyBlogIndexClient
        activeCategory={category}
        bannerTitleOverride={`${title} | Blog`}
        forceInitialPosts
        initialPosts={posts}
      />
    </>
  );
}
