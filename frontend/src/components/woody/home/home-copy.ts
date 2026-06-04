import type { WoodyCard, WoodyPageContent } from '../content-loader.server';

export type WoodyNewsItem = {
  title: string;
  summary: string;
  date: string;
  image?: string;
  video?: string;
  fitImage?: boolean;
  href?: string;
};

export type WoodyWhyItem = {
  title: string;
  description: string;
};

export const HERO_BG = '/assets/woody/sections/hero-poster.webp';
// Woody marka logosu — DB site_logo ile ayni varlik (/uploads/brand/logo-primary.svg).
export const WOODY_CHARACTER_IMAGE = '/uploads/brand/logo-primary.svg';
export const WHY_WOODY_BG_IMAGES = [
  '/assets/woody/sections/why-woody-bg-1.webp',
  '/assets/woody/sections/why-woody-bg-2.webp',
] as const;
export const CERTIFICATE_IMAGES = [
  { alt: 'Cambridge English', src: '/assets/woody/sections/cert-7.webp' },
  { alt: 'British Side', src: '/assets/woody/sections/cert-8.webp' },
  { alt: 'Woody Academy', src: '/assets/woody/sections/cert-9.webp' },
] as const;
export const NEWS_IMAGES = [
  '/assets/woody/sections/news-1.webp',
  '/assets/woody/sections/news-2.webp',
  '/assets/woody/sections/news-rekant.webp',
  '/assets/woody/sections/news-woody7.webp',
] as const;

export const SET_SERIES_MEDIA = [
  {
    accent: 'var(--level-junior)',
    image: '/media/woody/reference/n8vryl38_6.png',
    ribbonTr: 'OKUL SERISI',
    ribbonEn: 'SCHOOL SERIES',
  },
  {
    accent: 'var(--gm-success)',
    image: '/media/woody/reference/7q4grria_7.png',
    ribbonTr: 'ATOLYE SERISI',
    ribbonEn: 'WORKSHOP SERIES',
  },
  {
    accent: '#9B59B6',
    image: '/media/woody/reference/exdjhy2v_8.png',
    ribbonTr: 'EV OZEL DERS SERISI',
    ribbonEn: 'HOME TUTOR SERIES',
  },
] as const;

export const FALLBACK_WHY_ITEMS: WoodyWhyItem[] = [
  {
    title: 'Cambridge yaklaşımıyla uyumlu ilerleme',
    description: 'Seviyeler, dinleme, konuşma, okuma ve yazmaya hazırlık becerilerini yaşa uygun bir sırayla güçlendirir.',
  },
  {
    title: 'Öğretmen için net ders akışı',
    description: 'Sınıf içinde hangi materyalin, hangi oyunla ve hangi tekrar ritmiyle kullanılacağı daha görünür olur.',
  },
  {
    title: 'Çocuk için oyun ve hikaye bağı',
    description: 'Karakterler, şarkılar ve hikayeler çocukların İngilizceyle duygusal bağ kurmasına yardımcı olur.',
  },
  {
    title: 'Kurum için standart kalite',
    description: 'Dersler öğretmenden öğretmene dağılmadan, okulun izleyebileceği ortak bir modelle ilerler.',
  },
  {
    title: 'Dijital içerikle süreklilik',
    description: 'Kitap, video, şarkı ve okul hesabı akışları öğrenmeyi sınıf sonrası süreçlere taşır.',
  },
  {
    title: 'Sertifikaya uzanan akademi yolu',
    description: 'Academy aşaması öğrenciyi Cambridge English sınavlarına hazırlayan daha üst seviye bir sürece bağlar.',
  },
];

export const FALLBACK_NEWS: WoodyNewsItem[] = [
  {
    title: 'Woody Almanya distribütörlüğü',
    summary: 'Woody ve Arkadaşları, okul öncesi İngilizce setlerini Avrupa kurumlarına ulaştıracak yeni iş birliklerini duyurur.',
    date: '2026-06-03',
    image: NEWS_IMAGES[0],
    href: '/blog',
  },
  {
    title: 'Rusya pazarı için yeni temsilcilik',
    summary: 'Uluslararası temsilcilik ağı, anaokulu İngilizce içeriklerinin farklı kurumlara uyarlanmasını kolaylaştırır.',
    date: '2026-06-03',
    image: NEWS_IMAGES[1],
    href: '/blog',
  },
  {
    title: 'Cambridge English sertifika sistemine geçiş',
    summary: 'Woody Academy, öğrencileri uluslararası ölçekte değerlendirilebilir bir İngilizce yolculuğuna hazırlar.',
    date: '2026-06-03',
    image: NEWS_IMAGES[2],
    href: '/woody-academy',
  },
];

export function localizeHomeHref(locale: string, href?: string) {
  if (!href) return '#';
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  const normalized = href.startsWith('/') ? href : `/${href}`;
  return `/${locale}${normalized === '/' ? '' : normalized}`;
}

export function getSetCards(home: WoodyPageContent, setPages: WoodyPageContent[]): WoodyCard[] {
  const fromHome = home.sections?.flatMap((section) => section.items ?? []) ?? [];
  const preferred = fromHome.filter((item) =>
    ['/preschool', '/workshop', '/home-tutor'].includes(item.href ?? ''),
  );
  if (preferred.length >= 3) return preferred.slice(0, 3);

  return setPages.map((page) => ({
    title: page.hero?.title || page.title,
    description: page.hero?.description || page.description,
    href: page.key === 'preschool' ? '/preschool' : page.key === 'workshop' ? '/workshop' : '/home-tutor',
    badge:
      page.key === 'preschool'
        ? 'Okul'
        : page.key === 'workshop'
          ? 'Atölye'
          : 'Ev & Özel Ders',
    features: page.sections?.flatMap((section) => section.items?.map((item) => item.title) ?? []).slice(0, 4) ?? [],
  }));
}

export function getWhyItems(content: WoodyPageContent | null): WoodyWhyItem[] {
  const fromSections = content?.sections?.flatMap((section) =>
    (section.items ?? []).map((item) => ({
      title: item.title,
      description: item.description || '',
    })),
  ) ?? [];
  return fromSections.length >= 6 ? fromSections.slice(0, 6) : FALLBACK_WHY_ITEMS;
}

export function getNewsItems(content: WoodyPageContent | null): WoodyNewsItem[] {
  const cards = [...(content?.cards ?? []), ...(content?.products ?? [])];
  if (cards.length) {
    return cards.map((card, index) => ({
      title: card.title,
      summary: card.description || '',
      date: card.badge || '',
      image: card.image || NEWS_IMAGES[index % NEWS_IMAGES.length],
      video: card.video,
      fitImage: card.fitImage,
      href: card.href,
    }));
  }
  const sectionItems = content?.sections?.flatMap((section) => section.items ?? []) ?? [];
  if (sectionItems.length) {
    return sectionItems.map((item, index) => ({
      title: item.title,
      summary: item.description || '',
      date: item.badge || '',
      image: item.image || NEWS_IMAGES[index % NEWS_IMAGES.length],
      video: item.video,
      fitImage: item.fitImage,
      href: item.href,
    }));
  }
  return FALLBACK_NEWS;
}
