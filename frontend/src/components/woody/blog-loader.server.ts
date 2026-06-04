import 'server-only';

import { loadPageContent } from '@/config/pages/loader';

export type WoodyFallbackBlogPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featured_image?: string;
  featured_image_alt?: string;
  created_at: string;
  updated_at?: string;
  content_html?: string;
  author?: string;
  category?: string;
};

export async function loadFallbackBlogPosts(locale: string): Promise<WoodyFallbackBlogPost[]> {
  const posts = await loadPageContent<WoodyFallbackBlogPost[]>('blog-fallback-posts', locale);
  return Array.isArray(posts) ? posts : [];
}

export async function loadFallbackBlogPostsByCategory(
  locale: string,
  category: string,
): Promise<WoodyFallbackBlogPost[]> {
  const posts = await loadFallbackBlogPosts(locale);
  return posts.filter((post) => post.category === category);
}

export async function findFallbackBlogPost(
  slug: string,
  locale: string,
): Promise<WoodyFallbackBlogPost | null> {
  const posts = await loadFallbackBlogPosts(locale);
  return posts.find((post) => post.slug === slug) ?? null;
}
