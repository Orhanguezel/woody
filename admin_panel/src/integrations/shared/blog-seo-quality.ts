// Woody blog içerik kalite puanlaması (istemci tarafı).
// Backend `@shared/shared-backend/modules/blog/seo-quality.ts` ile BIREBIR aynı mantık:
// böylece admin panelde canlı görünen skor, kaydedilince backend skoruyla eşleşir.

import type { BlogSeoQualityScore } from './blog';

export type BlogSeoQualityInput = {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  image_url?: string | null;
  target_keyword?: string | null;
};

const BLOG_MIN_WORDS = 700;
const BLOG_TARGET_MIN_WORDS = 900;
const KEYWORD_DENSITY_MIN = 0.004;
const KEYWORD_DENSITY_MAX = 0.015;

function stripHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsOf(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function countOccurrences(text: string, needle: string) {
  const kw = needle.trim().toLocaleLowerCase('tr');
  if (!kw) return 0;
  const hay = text.toLocaleLowerCase('tr');
  let count = 0;
  let index = 0;
  while ((index = hay.indexOf(kw, index)) !== -1) {
    count += 1;
    index += kw.length;
  }
  return count;
}

function safeStr(value: unknown) {
  return String(value ?? '').trim();
}

function inferTargetKeyword(input: BlogSeoQualityInput) {
  const explicit = safeStr(input.target_keyword);
  if (explicit) return explicit;

  const metaTitle = safeStr(input.meta_title).split('|')[0]?.trim();
  if (metaTitle) return metaTitle;

  return safeStr(input.title)
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(nedir|nasıl|rehber|detaylı|güncel|seçilmeli)\b/gi, '')
    .replace(/[?—|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreBlogSeoQuality(input: BlogSeoQualityInput): BlogSeoQualityScore {
  const html = safeStr(input.content);
  const text = stripHtml(html);
  const wordCount = wordsOf(text).length;
  const targetKeyword = inferTargetKeyword(input);
  const occurrences = countOccurrences(
    [safeStr(input.title), safeStr(input.excerpt), text].join(' '),
    targetKeyword,
  );
  const density = wordCount ? occurrences / wordCount : 0;
  const h2Count = (html.match(/<h2\b/gi) || []).length;
  const linkCount = (html.match(/<a\s/gi) || []).length;
  const hasFaq = /sıkça sorulan|sss|faq/i.test(html);
  const hasList = /<ul\b|<ol\b|<table\b/i.test(html);
  const hasCleanHtml = !/<span\b|style=/i.test(html);
  const metaTitle = safeStr(input.meta_title);
  const metaDescription = safeStr(input.meta_description);

  const points: Record<string, { ok: boolean; points: number }> = {
    A1_content_not_empty: { ok: wordCount > 0, points: 10 },
    A2_keyword_present: { ok: occurrences >= 1, points: 10 },
    A3_minimum_length: { ok: wordCount >= BLOG_MIN_WORDS, points: 10 },
    A4_natural_density: {
      ok: density >= KEYWORD_DENSITY_MIN && density <= KEYWORD_DENSITY_MAX,
      points: 10,
    },
    B1_title_keyword: {
      ok: safeStr(input.title)
        .toLocaleLowerCase('tr')
        .includes(targetKeyword.toLocaleLowerCase('tr')),
      points: 5,
    },
    B2_heading_structure: { ok: h2Count >= 4, points: 4 },
    B3_schema_ready: { ok: true, points: 6 },
    B4_internal_links: { ok: linkCount >= 2, points: 3 },
    B5_image_present: { ok: Boolean(safeStr(input.image_url)), points: 4 },
    B6_meta_ready: {
      ok:
        metaTitle.length >= 35 &&
        metaTitle.length <= 65 &&
        metaDescription.length >= 120 &&
        metaDescription.length <= 170,
      points: 3,
    },
    C1_clean_original_html: { ok: hasCleanHtml, points: 5 },
    C2_depth: { ok: wordCount >= BLOG_TARGET_MIN_WORDS || h2Count >= 6, points: 4 },
    C3_readability: { ok: (html.match(/<p\b/gi) || []).length >= 6, points: 4 },
    C4_experience_signal: { ok: /3-6|öğretmen|sınıf|kazanım|uygulama/i.test(text), points: 4 },
    C5_freshness: { ok: /2026|güncel/i.test([safeStr(input.title), text].join(' ')), points: 3 },
    D1_self_contained_answer: {
      ok: text.slice(0, 500).toLocaleLowerCase('tr').includes(targetKeyword.toLocaleLowerCase('tr')),
      points: 5,
    },
    D2_faq_block: { ok: hasFaq, points: 4 },
    D3_list_or_definition: { ok: hasList || /nedir|nasıl|kontrol listesi/i.test(html), points: 3 },
    D4_entity_consistency: {
      ok: /Woody and Friends|Woody ve Arkadaşları|MusicLand|StoryLand/i.test(text),
      points: 3,
    },
  };

  const checks = Object.fromEntries(
    Object.entries(points).map(([key, check]) => [key, check.ok]),
  );
  const score = Object.values(points).reduce((sum, c) => sum + (c.ok ? c.points : 0), 0);
  const gatePassed =
    points.A1_content_not_empty.ok &&
    points.A2_keyword_present.ok &&
    points.A3_minimum_length.ok &&
    points.A4_natural_density.ok;

  const recommendations: string[] = [];
  if (!points.A3_minimum_length.ok) recommendations.push(`İçeriği en az ${BLOG_MIN_WORDS} kelimeye çıkar.`);
  if (!points.A4_natural_density.ok)
    recommendations.push('Odak kelime yoğunluğunu doğal aralık olan %0.4-%1.5 bandına getir.');
  if (!points.B1_title_keyword.ok) recommendations.push('Odak kelimeyi (SEO başlığı) yazı başlığında da geçir.');
  if (!points.B4_internal_links.ok) recommendations.push('En az 2 ilgili iç link ekle.');
  if (!points.B5_image_present.ok) recommendations.push('En az 1 yerel görsel ekle.');
  if (!points.B6_meta_ready.ok)
    recommendations.push('Meta başlık 35-65, meta açıklama 120-170 karakter olmalı.');
  if (!points.C2_depth.ok) recommendations.push('Derinlik için 900+ kelime veya 6+ H2 hedefle.');
  if (!points.C5_freshness.ok) recommendations.push('İçeriğe güncellik sinyali ekle (ör. 2026 / güncel).');
  if (!points.D2_faq_block.ok) recommendations.push('4-6 soruluk SSS bölümü ekle.');

  return {
    score,
    level: !gatePassed || score < 60 ? 'fail' : score < 80 ? 'publishable' : 'ready',
    gate_passed: gatePassed,
    word_count: wordCount,
    target_keyword: targetKeyword,
    keyword_occurrences: occurrences,
    keyword_density: Number((density * 100).toFixed(2)),
    checks,
    recommendations,
  };
}

// Puanlama kriterleri — UI etiketleri ve gruplandırma
export const BLOG_SEO_CHECK_META: Record<string, { label: string; group: string; points: number }> = {
  A1_content_not_empty: { label: 'İçerik boş değil', group: 'A · Temel SEO', points: 10 },
  A2_keyword_present: { label: 'Odak kelime geçiyor', group: 'A · Temel SEO', points: 10 },
  A3_minimum_length: { label: 'En az 700 kelime', group: 'A · Temel SEO', points: 10 },
  A4_natural_density: { label: 'Doğal yoğunluk (%0.4-1.5)', group: 'A · Temel SEO', points: 10 },
  B1_title_keyword: { label: 'Başlıkta odak kelime', group: 'B · Yapı & Teknik', points: 5 },
  B2_heading_structure: { label: 'En az 4 H2 başlık', group: 'B · Yapı & Teknik', points: 4 },
  B3_schema_ready: { label: 'Şema hazırlığı', group: 'B · Yapı & Teknik', points: 6 },
  B4_internal_links: { label: 'En az 2 iç link', group: 'B · Yapı & Teknik', points: 3 },
  B5_image_present: { label: 'Görsel var', group: 'B · Yapı & Teknik', points: 4 },
  B6_meta_ready: { label: 'Meta başlık/açıklama uygun', group: 'B · Yapı & Teknik', points: 3 },
  C1_clean_original_html: { label: 'Temiz HTML', group: 'C · İçerik Kalitesi', points: 5 },
  C2_depth: { label: 'Derinlik (900+ söz / 6+ H2)', group: 'C · İçerik Kalitesi', points: 4 },
  C3_readability: { label: 'Okunabilirlik (6+ paragraf)', group: 'C · İçerik Kalitesi', points: 4 },
  C4_experience_signal: { label: 'Deneyim sinyali', group: 'C · İçerik Kalitesi', points: 4 },
  C5_freshness: { label: 'Güncellik (2026)', group: 'C · İçerik Kalitesi', points: 3 },
  D1_self_contained_answer: { label: 'Net cevap pasajı', group: 'D · GEO / Alıntılanabilirlik', points: 5 },
  D2_faq_block: { label: 'SSS bölümü (4-6)', group: 'D · GEO / Alıntılanabilirlik', points: 4 },
  D3_list_or_definition: { label: 'Liste / tanım', group: 'D · GEO / Alıntılanabilirlik', points: 3 },
  D4_entity_consistency: { label: 'Marka/varlık tutarlılığı', group: 'D · GEO / Alıntılanabilirlik', points: 3 },
};
