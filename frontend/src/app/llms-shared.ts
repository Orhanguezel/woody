import 'server-only';

import { loadPageContent } from '@/config/pages/loader';
import { stripHtml } from '@/integrations/shared';
import {
  getDefaultContactInfo,
  getDefaultSocialUrls,
  getPublicAppName,
  getPublicSiteOrigin,
} from '@/lib/site-config';
import { WOODY_LOCALES, WOODY_PAGE_ROUTES, localizedWoodyPath } from '@/components/woody/routes';

type FaqContent = {
  items?: Array<{ answer?: string; question?: string; solution?: string }>;
};

type StoreProductsContent = {
  products?: Array<{ description?: string; name?: string; slug?: string; title?: string }>;
};

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
  const [faq, storeProducts] = await Promise.all([
    loadPageContent<FaqContent>('faq', 'tr'),
    loadPageContent<StoreProductsContent>('store-products', 'tr'),
  ]);

  const faqItems = (faq?.items ?? [])
    .map((item) => ({
      question: stripHtml(String(item.question || '')),
      answer: stripHtml(String(item.answer || item.solution || '')),
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
    label: route.key,
    path: route.path,
  }));

  return [
    `# ${app}`,
    '',
    `${app} okul oncesi Ingilizce, hikaye temelli egitim setleri, Mini School (atolye) programlari, ev ve ozel ders cozumleri, Woody Academy ve dijital icerik alanlari sunan cocuk odakli egitim markasidir.`,
    '',
    '## Site yapisi',
    ...keyPages.map((page) => `- ${page.label}: ${origin}${localizedWoodyPath('tr', page.path)}`),
    '',
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
  ]
    .map((part) => (typeof part === 'string' ? line(part) : ''))
    .filter((part, index, arr) => part || arr[index - 1])
    .join('\n');
}
