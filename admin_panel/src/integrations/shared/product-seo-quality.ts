export type ProductSeoQualityInput = {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  image_url?: string | null;
  alt?: string | null;
  tags?: string | null;
  specifications?: string | null;
  category_id?: string | null;
  product_code?: string | null;
};

export type ProductSeoQualityScore = {
  score: number;
  level: 'fail' | 'publishable' | 'ready';
  gate_passed: boolean;
  checks: Record<string, boolean>;
  recommendations: string[];
  title_length: number;
  description_length: number;
  meta_title_length: number;
  meta_description_length: number;
};

export const PRODUCT_SEO_CHECK_META: Record<
  string,
  { label: string; group: string; points: number }
> = {
  title: { label: 'Ürün başlığı yeterli', group: 'A · Temel SEO', points: 10 },
  slug: { label: 'Temiz ve açıklayıcı slug', group: 'A · Temel SEO', points: 8 },
  description: { label: 'Ürün açıklaması 80–600 karakter', group: 'A · Temel SEO', points: 15 },
  meta_title: { label: 'Meta title 35–65 karakter', group: 'B · Arama Sonucu', points: 15 },
  meta_description: { label: 'Meta description 120–170 karakter', group: 'B · Arama Sonucu', points: 15 },
  image: { label: 'Ürün/OG görseli var', group: 'C · Görsel & İçerik', points: 10 },
  alt: { label: 'Açıklayıcı görsel alt metni', group: 'C · Görsel & İçerik', points: 8 },
  tags: { label: 'En az 3 ilgili etiket', group: 'C · Görsel & İçerik', points: 6 },
  category: { label: 'Kategori seçilmiş', group: 'D · Ürün Verisi', points: 4 },
  product_code: { label: 'Ürün kodu var', group: 'D · Ürün Verisi', points: 4 },
  specifications: { label: 'En az 2 ürün özelliği', group: 'D · Ürün Verisi', points: 5 },
};

const text = (value: unknown) => String(value ?? '').trim();

export function scoreProductSeoQuality(input: ProductSeoQualityInput): ProductSeoQualityScore {
  const title = text(input.title);
  const slug = text(input.slug);
  const description = text(input.description);
  const metaTitle = text(input.meta_title);
  const metaDescription = text(input.meta_description);
  const tags = text(input.tags).split(',').map((item) => item.trim()).filter(Boolean);
  const specifications = text(input.specifications)
    .split('\n')
    .filter((line) => line.includes(':') && line.split(':').every((part) => part.trim()));

  const checks = {
    title: title.length >= 20 && title.length <= 90,
    slug: slug.length >= 10 && slug.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
    description: description.length >= 80 && description.length <= 600,
    meta_title: metaTitle.length >= 35 && metaTitle.length <= 65,
    meta_description: metaDescription.length >= 120 && metaDescription.length <= 170,
    image: Boolean(text(input.image_url)),
    alt: text(input.alt).length >= 12,
    tags: tags.length >= 3,
    category: Boolean(text(input.category_id)),
    product_code: Boolean(text(input.product_code)),
    specifications: specifications.length >= 2,
  };
  const score = Object.entries(checks).reduce(
    (sum, [key, ok]) => sum + (ok ? PRODUCT_SEO_CHECK_META[key].points : 0),
    0,
  );
  const gatePassed =
    checks.title &&
    checks.slug &&
    checks.description &&
    checks.meta_title &&
    checks.meta_description &&
    checks.image;
  const recommendations: string[] = [];
  if (!checks.title) recommendations.push('Ürün başlığını 20–90 karakter aralığına getir.');
  if (!checks.slug) recommendations.push('Slug alanını küçük harf ve tirelerle açıklayıcı biçimde düzenle.');
  if (!checks.description) recommendations.push('Ürün açıklamasını en az 80 karakterle kullanım amacı ve seviye bilgisi içerecek şekilde genişlet.');
  if (!checks.meta_title) recommendations.push('Meta title alanını 35–65 karakter aralığına getir.');
  if (!checks.meta_description) recommendations.push('Meta description alanını 120–170 karakter aralığına getir.');
  if (!checks.image) recommendations.push('Storage üzerinden bir ürün görseli ekle.');
  if (!checks.alt) recommendations.push('Görsel için en az 12 karakterlik açıklayıcı alt metin yaz.');
  if (!checks.tags) recommendations.push('En az 3 ilgili ürün etiketi ekle.');
  if (!checks.specifications) recommendations.push('En az 2 yapılandırılmış ürün özelliği ekle.');

  return {
    score,
    level: !gatePassed || score < 60 ? 'fail' : score < 80 ? 'publishable' : 'ready',
    gate_passed: gatePassed,
    checks,
    recommendations,
    title_length: title.length,
    description_length: description.length,
    meta_title_length: metaTitle.length,
    meta_description_length: metaDescription.length,
  };
}
