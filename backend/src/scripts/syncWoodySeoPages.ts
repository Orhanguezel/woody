import 'dotenv/config';

import mysql from 'mysql2/promise';
import {
  WOODY_SEO_LOCALES,
  WOODY_STATIC_SEO_PAGES,
  type WoodyPageSeoConfig,
} from '@shared/shared-types/woody-seo-catalog';

const APPLY = process.argv.includes('--apply');
const BASE_URL = String(
  process.env.SEO_SYNC_BASE_URL || process.env.FRONTEND_URL || 'https://woodyvearkadaslari.com',
).replace(/\/+$/, '');

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function metaContent(html: string, attribute: string, value: string): string {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(
      `<meta\\b[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`,
      'i',
    ),
    new RegExp(
      `<meta\\b[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`,
      'i',
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return '';
}

function titleContent(html: string): string {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeHtml(match[1].replace(/<[^>]+>/g, '')) : '';
}

async function crawlPage(locale: string, path: string) {
  const url = `${BASE_URL}/${locale}${path === '/' ? '' : path}`;
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'WoodySeoSync/1.0' },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const html = await response.text();
  const title = metaContent(html, 'property', 'og:title') || titleContent(html);
  const description =
    metaContent(html, 'name', 'description') || metaContent(html, 'property', 'og:description');
  if (!title || !description) throw new Error(`${url} has incomplete metadata`);
  return { title, description };
}

async function buildLocalePages(locale: string): Promise<Record<string, WoodyPageSeoConfig>> {
  const definitions = WOODY_STATIC_SEO_PAGES.filter((page) => !page.trOnly || locale === 'tr');
  const entries = await Promise.all(
    definitions.map(async (definition) => {
      const metadata = await crawlPage(locale, definition.path);
      const value: WoodyPageSeoConfig = {
        title: metadata.title,
        description: metadata.description,
        keywords: '',
        canonical_path: '',
        no_index: !definition.indexable,
        og: {
          mode: 'generated',
          title: metadata.title,
          description: metadata.description,
          eyebrow: '',
          template: definition.ogTemplate,
          background_image: '',
          foreground_image: '',
          generated_image: '',
          custom_image: '',
          alt: `${metadata.title} — Woody and Friends`,
        },
      };
      return [definition.key, value] as const;
    }),
  );
  return Object.fromEntries(entries);
}

function requireDatabaseEnv() {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
  const missing = required.filter((key) => !String(process.env[key] || '').trim());
  if (missing.length) throw new Error(`Missing database environment: ${missing.join(', ')}`);
  return {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    charset: 'utf8mb4_unicode_ci',
  };
}

async function main() {
  const rows = await Promise.all(
    WOODY_SEO_LOCALES.map(async (locale) => ({
      locale,
      pages: await buildLocalePages(locale),
    })),
  );

  for (const row of rows) {
    console.log(`${row.locale}: ${Object.keys(row.pages).length} SEO page records`);
  }

  if (!APPLY) {
    console.log('Dry run completed. Use --apply to upsert site_settings.seo_pages.');
    return;
  }

  const connection = await mysql.createConnection(requireDatabaseEnv());
  try {
    for (const row of rows) {
      const [existingRows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT value FROM site_settings WHERE `key` = ? AND locale = ? LIMIT 1',
        ['seo_pages', row.locale],
      );
      let existing: Record<string, unknown> = {};
      const raw = existingRows[0]?.value;
      if (typeof raw === 'string' && raw.trim()) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) existing = parsed;
        } catch {
          existing = {};
        }
      }

      const value = JSON.stringify({ ...existing, ...row.pages });
      await connection.execute(
        `INSERT INTO site_settings (id, \`key\`, locale, value)
         VALUES (?, 'seo_pages', ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = CURRENT_TIMESTAMP(3)`,
        [`ss-woody-seo-pages-${row.locale}`, row.locale, value],
      );
    }
  } finally {
    await connection.end();
  }

  console.log('SEO page settings synchronized.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
