import { notFound } from 'next/navigation';

import JsonLd from '@/seo/JsonLd';
import LocalIstanbulGuide from '@/components/woody/local/LocalIstanbulGuide';
import type { LocalGuideContent } from '@/components/woody/local/LocalIstanbulGuide';
import { woodyMetadata, woodyPageGraph } from '@/components/woody/seo';
import { loadPageContent } from '@/config/pages/loader';
import type { WoodyPageContent } from '@/components/woody/content-loader.server';

type Props = { params: Promise<{ locale: string; slug: string }> };

const LOCAL_CITY_ROUTES: Record<string, { city: string; locality: string }> = {
  'ankara-anaokulu-ingilizce-egitimi': { city: 'Ankara', locality: 'Ankara' },
  'izmir-anaokulu-ingilizce-egitimi': { city: 'İzmir', locality: 'Izmir' },
  'bursa-anaokulu-ingilizce-egitimi': { city: 'Bursa', locality: 'Bursa' },
};

function cloneForCity(content: LocalGuideContent, city: string): LocalGuideContent {
  const text = JSON.stringify(content)
    .replace(/İstanbul/g, city)
    .replace(/Istanbul/g, city === 'İzmir' ? 'Izmir' : city)
    .replace(/istanbul/g, city.toLocaleLowerCase('tr-TR'));
  const cloned = JSON.parse(text) as LocalGuideContent;
  cloned.title = `${city} Anaokulu İngilizce Eğitimi`;
  cloned.description = `${city}'daki anaokulları için 3-6 yaş oyun temelli İngilizce eğitim sistemi: müfredat, materyal, öğretmen eğitimi, Cambridge YLE hazırlığı ve dijital içerik.`;
  cloned.hero = {
    ...(cloned.hero ?? {}),
    title: `${city} Anaokulu İngilizce Eğitimi`,
    description: `${city}'daki anaokulu yöneticileri ve öğretmenleri için 3-6 yaş grubunda İngilizce öğretiminin bilimsel temellerinden uygulamaya, ideal müfredattan doğru materyal seçimine kadar kapsamlı rehber.`,
  };
  return cloned;
}

function asPageContent(key: string, raw: LocalGuideContent): WoodyPageContent {
  return {
    key,
    title: raw.title,
    description: raw.description,
    hero: raw.hero
      ? {
          title: raw.hero.title,
          description: raw.hero.description,
          eyebrow: raw.hero.eyebrow,
        }
      : undefined,
    faq: raw.faq,
    seo: (raw as any).seo,
    raw: raw as unknown as Record<string, unknown>,
  };
}

export function generateStaticParams() {
  return Object.keys(LOCAL_CITY_ROUTES).map((slug) => ({ locale: 'tr', slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const route = LOCAL_CITY_ROUTES[slug];
  if (locale !== 'tr' || !route) return {};
  const base = await loadPageContent<LocalGuideContent>('local-istanbul', 'tr');
  if (!base) return {};
  const raw = cloneForCity(base, route.city);
  const content = asPageContent(`local-${route.locality.toLowerCase()}`, raw);
  return woodyMetadata({ locale, pageKey: content.key, pathname: `/lokal/${slug}`, content });
}

export default async function LocalCityPage({ params }: Props) {
  const { locale, slug } = await params;
  const route = LOCAL_CITY_ROUTES[slug];
  if (locale !== 'tr' || !route) notFound();
  const base = await loadPageContent<LocalGuideContent>('local-istanbul', 'tr');
  if (!base) notFound();
  const raw = cloneForCity(base, route.city);
  const content = asPageContent(`local-${route.locality.toLowerCase()}`, raw);
  const pathname = `/lokal/${slug}`;

  return (
    <>
      <JsonLd id={`woody-local-${route.locality.toLowerCase()}`} data={woodyPageGraph({ locale, pathname, content, schemaType: 'LocalBusiness' })} />
      <LocalIstanbulGuide content={raw} />
    </>
  );
}
