import 'server-only';

import { loadPageContent } from '@/config/pages/loader';
import { stripHtml } from '@/integrations/shared';
import {
  getDefaultContactInfo,
  getDefaultSocialUrls,
  getPublicAppName,
  getPublicSiteOrigin,
  getSiteAuthor,
} from '@/lib/site-config';
import { WOODY_LOCALES, WOODY_PAGE_ROUTES, localizedWoodyPath } from '@/components/woody/routes';
import { loadDbBlogPosts } from '@/components/woody/blog-db-loader.server';

type FaqContent = {
  items?: Array<{ answer?: string; problem?: string; question?: string; solution?: string }>;
};

type LlmsContent = {
  pageLabels?: Record<string, string>;
  priorityGuides?: Array<{ slug: string; scope: string }>;
  seriesAges?: string;
};

function isoDay(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

type StoreProductsContent = {
  products?: Array<{ description?: string; name?: string; slug?: string; title?: string }>;
};

function excerptOf(value: string, max = 180) {
  const text = stripHtml(value).replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function line(value: string) {
  return value.trim();
}

function localizedLinks(path: string) {
  const origin = getPublicSiteOrigin();
  return WOODY_LOCALES.map((locale) => `- ${locale}: ${origin}${localizedWoodyPath(locale, path)}`).join('\n');
}

export async function buildLlmsText({ full }: { full: boolean }) {
  const app = getPublicAppName();
  const origin = getPublicSiteOrigin();
  const contact = getDefaultContactInfo();
  const socials = getDefaultSocialUrls();
  const author = getSiteAuthor('tr');
  const aboutUrl = `${origin}${localizedWoodyPath('tr', '/about')}`;
  const [faq, storeProducts, llms, posts] = await Promise.all([
    loadPageContent<FaqContent>('faq', 'tr'),
    loadPageContent<StoreProductsContent>('store-products', 'tr'),
    loadPageContent<LlmsContent>('llms', 'tr'),
    loadDbBlogPosts('tr', undefined, 50),
  ]);

  // Rehberler DB'den gelir: önce sorgu sahipliği verilen öncelikli rehberler
  // (kapsam cümlesiyle), sonra diğer yayınlanmış yazılar (özetiyle).
  // Yayında olmayan öncelikli slug listelenmez.
  const bySlug = new Map(posts.map((post) => [String(post.slug || ''), post]));
  const priority = (llms?.priorityGuides ?? [])
    .map((guide) => ({ guide, post: bySlug.get(guide.slug) }))
    .filter((entry) => entry.post);
  const prioritySlugs = new Set(priority.map((entry) => entry.guide.slug));
  const guideLine = (slug: string, title: string, scope: string) =>
    `- [${stripHtml(title)}](${origin}${localizedWoodyPath('tr', `/blog/${slug}`)})${scope ? `: ${stripHtml(scope)}` : ''}`;
  const priorityGuideLines = priority.map(({ guide, post }) => guideLine(guide.slug, String(post?.title || ''), guide.scope));
  const otherGuideLines = posts
    .filter((post) => post.slug && !prioritySlugs.has(String(post.slug)))
    .slice(0, full ? 50 : 12)
    .map((post) => guideLine(String(post.slug), String(post.title || ''), excerptOf(String(post.summary || ''))));
  const lastUpdated = posts
    .map((post) => isoDay(post.updated_at || post.published_at || post.created_at))
    .filter(Boolean)
    .sort()
    .pop();

  const faqItems = (faq?.items ?? [])
    .map((item) => ({
      question: stripHtml(String(item.question || '')),
      // Önce soruyu doğrudan cevaplayan `problem`, sonra yaklaşım. Yalnız
      // marka cümlesi soru-cevap değildir.
      answer: [item.problem, item.answer || item.solution]
        .map((part) => stripHtml(String(part || '')))
        .filter(Boolean)
        .join(' '),
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, full ? 25 : 8);

  const products = (storeProducts?.products ?? [])
    .map((item) => ({
      name: stripHtml(String(item.title || item.name || '')),
      slug: String(item.slug || '').trim(),
      description: stripHtml(String(item.description || '')),
    }))
    .filter((item) => item.name)
    .slice(0, full ? 24 : 8);

  const keyPages = WOODY_PAGE_ROUTES.map((route) => ({
    key: route.key,
    label: llms?.pageLabels?.[route.key] || route.key,
    path: route.path,
  }));

  return [
    `# ${app}`,
    '',
    // llms.txt standardı: H1'in hemen altında blockquote özet.
    `> ${app} okul oncesi Ingilizce, hikaye temelli egitim setleri, Mini School (atolye) programlari, ev ve ozel ders cozumleri, Woody Academy ve dijital icerik alanlari sunan cocuk odakli egitim markasidir.`,
    '',
    '## Site yapisi',
    ...keyPages.map((page) => `- [${page.label}](${origin}${localizedWoodyPath('tr', page.path)})`),
    '',
    ...(priorityGuideLines.length
      ? ['## Oncelikli rehberler', ...priorityGuideLines, '']
      : []),
    ...(otherGuideLines.length ? ['## Diger rehberler', ...otherGuideLines, ''] : []),
    ...(author.name
      ? [
          '## Yazar ve editoryal sorumluluk',
          `- ${author.name}${author.jobTitle ? ` — ${author.jobTitle}` : ''}: ${aboutUrl}#author`,
          `- Editoryal politika (kaynak, yapay zeka destegi, guncelleme ve duzeltme): ${aboutUrl}#editorial-policy`,
          '',
        ]
      : []),
    '## Diller',
    `Aktif URL dilleri: ${WOODY_LOCALES.join(', ')}. Varsayilan dil tr'dir. Locale'siz URL'ler 308 ile Turkce canonical URL'lere yonlenir.`,
    '',
    '## Yapilandirilmis veri',
    'Sitede Organization, WebSite, EducationalOrganization, Article, FAQPage, LocalBusiness ve BreadcrumbList JSON-LD semalari kullanilir. Magazada Mini School ve Ev Serisi setleri online satilir; okul serisi teklif bazlidir.',
    '',
    '## Urun ve hizmetler',
    '- Okul oncesi Ingilizce egitim setleri',
    '- Mini School Serisi (atolye ve kurs merkezleri icin)',
    '- Ev ve ozel ders modeli',
    '- Woody Academy egitmen ve kurum destek alani',
    '- Dijital icerik, hikaye, video, muzik ve kutuphane alanlari',
    ...(llms?.seriesAges ? [llms.seriesAges] : []),
    ...products.map((product) =>
      `- ${product.name}${product.slug ? `: ${origin}${localizedWoodyPath('tr', `/store/${product.slug}`)}` : ''}${product.description ? ` — ${product.description}` : ''}`,
    ),
    '',
    '## SSS',
    ...faqItems.flatMap((item) => [`### ${item.question}`, item.answer, '']),
    ...(full
      ? [
          '## Tum ana sayfa linkleri',
          ...keyPages.flatMap((page) => [`### ${page.label}`, localizedLinks(page.path), '']),
        ]
      : []),
    '## Bot erisimi',
    'Arama motorlari ve AI crawlerlari genel icerik sayfalarina erisebilir. Admin, API ve kullaniciya ozel hesap/okul alanlari robots.txt ile dislanir.',
    '',
    '## Iletisim',
    contact.companyName ? `- Sirket/marka: ${contact.companyName}` : '',
    contact.phone ? `- Telefon: ${contact.phone}` : '',
    contact.whatsapp ? `- WhatsApp: ${contact.whatsapp}` : '',
    contact.email ? `- E-posta: ${contact.email}` : '',
    contact.address?.streetAddress || contact.address?.addressLocality
      ? `- Adres: ${[contact.address.streetAddress, contact.address.addressLocality, contact.address.addressRegion, contact.address.addressCountry].filter(Boolean).join(', ')}`
      : '',
    ...Object.entries(socials).map(([key, value]) => `- ${key}: ${value}`),
    '',
    lastUpdated ? `Son icerik guncellemesi: ${lastUpdated}` : '',
  ]
    .map((part) => (typeof part === 'string' ? line(part) : ''))
    .filter((part, index, arr) => part || arr[index - 1])
    .join('\n');
}
