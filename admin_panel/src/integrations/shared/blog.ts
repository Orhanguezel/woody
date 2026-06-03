// =============================================================
// FILE: src/integrations/shared/blog.ts
// Blog admin types + normalizers
// =============================================================

export type BlogStatus = 'draft' | 'published';

export type BlogCategory =
  | 'genel'
  | 'haber'
  | 'okul-oncesi'
  | 'aile'
  | 'dijital-icerik'
  | 'ogretmen'
  | 'okul'
  | 'etkinlik'
  | 'mevsimsel'
  | 'tohum-bilimi'
  | 'ekim-teknikleri'
  | 'tarim-teknolojisi'
  | 'piyasa-analizi';

export type BlogPostAdminView = {
  id: string;
  category: BlogCategory;
  author: string | null;
  image_url: string | null;
  status: BlogStatus;
  published_at: string | null;
  is_active: boolean;
  display_order: number;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BlogPostUpsertBody = {
  locale: string;
  category: BlogCategory;
  author?: string | null;
  image_url?: string | null;
  status: BlogStatus;
  published_at?: string | null;
  is_active: boolean;
  display_order: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
};

export type BlogListQuery = {
  locale?: string;
};

function toStr(value: unknown) {
  return String(value ?? '').trim();
}

function toNullableStr(value: unknown) {
  const s = toStr(value);
  return s ? s : null;
}

function toBool(value: unknown) {
  if (typeof value === 'boolean') return value;
  return value === 1 || value === '1' || value === 'true';
}

function toNum(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStatus(value: unknown): BlogStatus {
  return toStr(value) === 'published' ? 'published' : 'draft';
}

function toCategory(value: unknown): BlogCategory {
  const s = toStr(value) as BlogCategory;
  return s || 'genel';
}

export function normalizeBlogPostAdmin(raw: unknown): BlogPostAdminView {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toStr(r.id),
    category: toCategory(r.category),
    author: toNullableStr(r.author),
    image_url: toNullableStr(r.image_url),
    status: toStatus(r.status),
    published_at: toNullableStr(r.published_at),
    is_active: toBool(r.is_active),
    display_order: toNum(r.display_order),
    locale: toStr(r.locale || 'tr') || 'tr',
    title: toStr(r.title),
    slug: toStr(r.slug),
    excerpt: toNullableStr(r.excerpt),
    content: toStr(r.content),
    meta_title: toNullableStr(r.meta_title),
    meta_description: toNullableStr(r.meta_description),
    created_at: toNullableStr(r.created_at),
    updated_at: toNullableStr(r.updated_at),
  };
}

export function toBlogListParams(query?: BlogListQuery): Record<string, unknown> {
  return query?.locale ? { locale: query.locale } : {};
}
