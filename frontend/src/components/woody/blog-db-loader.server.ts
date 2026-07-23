import 'server-only';

import { getPublicApiBaseUrl } from '@/lib/site-config';
import type { WoodyFallbackBlogPost } from './blog-loader.server';

type ApiBlogPost = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  author?: string | null;
  category?: string | null;
  published_at?: string | Date | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

export type WoodyDbBlogPost = WoodyFallbackBlogPost & {
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  // Per-locale slug alternatifleri (hreflang/canonical dogru per-locale slug icin)
  alternates?: Array<{ locale: string; slug: string }>;
};

function apiBase() {
  return getPublicApiBaseUrl().replace(/\/+$/, '');
}

function asIsoString(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  const str = String(value).trim();
  if (!str) return '';
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? str : date.toISOString();
}

function normalizeBlogPost(row: unknown): WoodyDbBlogPost | null {
  const post = row as ApiBlogPost;
  const id = String(post.id || '').trim();
  const title = String(post.title || '').trim();
  const slug = String(post.slug || '').trim();
  if (!id || !title || !slug) return null;

  const publishedAt = asIsoString(post.published_at) || asIsoString(post.created_at);

  return {
    id,
    title,
    slug,
    summary: String(post.excerpt || '').trim(),
    featured_image: post.image_url || undefined,
    featured_image_alt: title,
    created_at: publishedAt,
    updated_at: asIsoString(post.updated_at) || undefined,
    content_html: post.content || undefined,
    author: post.author || undefined,
    category: post.category || undefined,
    published_at: publishedAt || undefined,
    meta_title: post.meta_title || undefined,
    meta_description: post.meta_description || undefined,
    alternates: Array.isArray((post as { alternates?: unknown }).alternates)
      ? ((post as { alternates: Array<{ locale?: unknown; slug?: unknown }> }).alternates
          .map((a) => ({ locale: String(a?.locale || '').trim(), slug: String(a?.slug || '').trim() }))
          .filter((a) => a.locale && a.slug))
      : undefined,
  };
}

export async function loadDbBlogPosts(
  locale: string,
  category?: string,
  limit = 12,
): Promise<WoodyDbBlogPost[]> {
  try {
    const params = new URLSearchParams({ locale, limit: String(limit) });
    if (category) params.set('category', category);
    const res = await fetch(`${apiBase()}/blog?${params.toString()}`, {
      next: { revalidate: 60, tags: ['blog_posts'] },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as { data?: unknown };
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.map(normalizeBlogPost).filter((item): item is WoodyDbBlogPost => Boolean(item));
  } catch {
    return [];
  }
}

export async function loadDbBlogPost(slug: string, locale: string): Promise<WoodyDbBlogPost | null> {
  try {
    const res = await fetch(
      `${apiBase()}/blog/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 60, tags: ['blog_posts', `blog_post_${slug}`] } },
    );
    if (!res.ok) return null;
    return normalizeBlogPost(await res.json());
  } catch {
    return null;
  }
}
