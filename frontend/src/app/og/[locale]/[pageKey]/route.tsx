import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getWoodySeoPageDefinition,
  isWoodySeoLocale,
  normalizeWoodyPageSeoConfig,
  type WoodyOgTemplate,
} from '@shared/shared-types/woody-seo-catalog';

import { loadWoodyPageContent } from '@/components/woody/content-loader.server';
import { loadPageContent } from '@/config/pages/loader';
import { getPublicAppName } from '@/lib/site-config';
import { fetchSeoPageObject } from '@/seo/serverMetadata';

export const runtime = 'nodejs';
export const revalidate = 3600;

type RouteProps = {
  params: Promise<{ locale: string; pageKey: string }>;
};

type OgFallbackContent = {
  title?: string;
  description?: string;
  lead?: string;
  hero?: { title?: string; description?: string; eyebrow?: string };
};

const PALETTES: Record<WoodyOgTemplate, { from: string; to: string; accent: string; soft: string }> = {
  brand: { from: '#071314', to: '#173d3f', accent: '#f58220', soft: '#ffd79f' },
  education: { from: '#0b2947', to: '#176b87', accent: '#f5c518', soft: '#d8f3ff' },
  academy: { from: '#321755', to: '#713a8f', accent: '#f5c518', soft: '#f1dcff' },
  catalog: { from: '#152846', to: '#0d6680', accent: '#ff8b38', soft: '#dff7ff' },
  digital: { from: '#102c50', to: '#176b87', accent: '#62d8ff', soft: '#e1f8ff' },
  editorial: { from: '#3b2618', to: '#81471f', accent: '#f5c518', soft: '#fff1d6' },
  corporate: { from: '#18342d', to: '#376d5a', accent: '#f58220', soft: '#e0f5eb' },
  legal: { from: '#252b35', to: '#4a5568', accent: '#f5c518', soft: '#edf2f7' },
  local: { from: '#17394b', to: '#28755d', accent: '#f5c518', soft: '#e2fff4' },
};

const CONTENT_KEY_OVERRIDES: Record<string, string> = {
  about: 'about-page',
  faqs: 'faq',
};

async function loadFallback(pageKey: string, locale: string): Promise<OgFallbackContent | null> {
  const contentKey = CONTENT_KEY_OVERRIDES[pageKey] || pageKey;
  if (pageKey === 'about' || pageKey === 'faqs') {
    return loadPageContent<OgFallbackContent>(contentKey, locale);
  }
  return loadWoodyPageContent(contentKey, locale);
}

function fitTitleSize(title: string): number {
  if (title.length > 78) return 48;
  if (title.length > 58) return 56;
  if (title.length > 38) return 66;
  return 76;
}

let logoDataUrlPromise: Promise<string> | null = null;
let arabicFontPromise: Promise<ArrayBuffer> | null = null;

function getLogoDataUrl(): Promise<string> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = readFile(
      path.join(process.cwd(), 'public/assets/woody/woody-footer-v2.png'),
    ).then((buffer) => `data:image/png;base64,${buffer.toString('base64')}`);
  }
  return logoDataUrlPromise;
}

function getArabicFont(): Promise<ArrayBuffer> {
  if (!arabicFontPromise) {
    const fontPath =
      process.env.OG_ARABIC_FONT_PATH?.trim() ||
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
    arabicFontPromise = readFile(fontPath).then((buffer) =>
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
    );
  }
  return arabicFontPromise;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { locale: rawLocale, pageKey } = await params;
  const locale = rawLocale.toLowerCase();
  const definition = getWoodySeoPageDefinition(pageKey);

  if (!definition || !isWoodySeoLocale(locale) || (definition.trOnly && locale !== 'tr')) {
    return new Response('Not found', { status: 404 });
  }

  const [rawSeo, fallback, logoUrl, arabicFont] = await Promise.all([
    fetchSeoPageObject(locale, pageKey),
    loadFallback(pageKey, locale),
    getLogoDataUrl(),
    locale === 'ar' ? getArabicFont() : Promise.resolve(null),
  ]);
  const seo = normalizeWoodyPageSeoConfig(rawSeo, definition);
  const title = seo.og.title || seo.title || fallback?.hero?.title || fallback?.title || getPublicAppName();
  const description =
    seo.og.description ||
    seo.description ||
    fallback?.hero?.description ||
    fallback?.description ||
    fallback?.lead ||
    '';
  const eyebrow = locale === 'ar'
    ? getPublicAppName()
    : seo.og.eyebrow || fallback?.hero?.eyebrow || getPublicAppName();
  const palette = PALETTES[seo.og.template] || PALETTES[definition.ogTemplate];
  const rtl = locale === 'ar';
  return new ImageResponse(
    (
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          padding: '62px 68px',
          color: '#ffffff',
          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
          fontFamily: rtl ? '"Noto Sans Arabic"' : 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 560,
            height: 560,
            borderRadius: 560,
            right: rtl ? -240 : -160,
            top: -250,
            border: `3px solid ${palette.accent}`,
            opacity: 0.22,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: 360,
            left: rtl ? -120 : -140,
            bottom: -210,
            background: palette.accent,
            opacity: 0.13,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width={146} height={72} alt="" style={{ objectFit: 'contain' }} />
            <div style={{ display: 'flex', fontSize: 22, color: palette.soft }}>
              woodyvearkadaslari.com
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1010 }}>
            <div
              style={{
                display: 'flex',
                alignSelf: rtl ? 'flex-end' : 'flex-start',
                padding: '10px 18px',
                borderRadius: 999,
                border: `1px solid ${palette.accent}`,
                color: palette.soft,
                fontSize: 21,
                letterSpacing: rtl ? 0 : 1.5,
                textTransform: rtl ? 'none' : 'uppercase',
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                display: 'flex',
                width: '100%',
                fontSize: fitTitleSize(title),
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: -1.5,
                textAlign: rtl ? 'right' : 'left',
                justifyContent: rtl ? 'flex-end' : 'flex-start',
              }}
            >
              {title}
            </div>
            {description && !rtl ? (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  maxWidth: 900,
                  fontSize: 28,
                  lineHeight: 1.3,
                  color: palette.soft,
                  textAlign: rtl ? 'right' : 'left',
                  justifyContent: rtl ? 'flex-end' : 'flex-start',
                }}
              >
                {description.length > 150 ? `${description.slice(0, 147).trim()}…` : description}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', width: 64, height: 6, borderRadius: 8, background: palette.accent }} />
            <div style={{ display: 'flex', fontSize: 19, color: palette.soft }}>
              {locale.toUpperCase()} · 1200 × 630
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
      ...(arabicFont
        ? {
            fonts: [
              {
                name: 'Noto Sans Arabic',
                data: arabicFont,
                style: 'normal' as const,
                weight: 700 as const,
              },
            ],
          }
        : {}),
    },
  );
}
