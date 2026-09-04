import type { RowDataPacket } from 'mysql2';

import { pool } from '@/db/client';

export type GscEntityType = 'blog' | 'product';
export type GscIndexCategory = 'indexed' | 'not_indexed' | 'issue' | 'unknown';

export type GscIndexItem = {
  url: string;
  verdict: string;
  coverage_state: string;
  last_crawl: string | null;
  checked_at: string | null;
  category: GscIndexCategory;
  label: string;
  recommendation: string;
};

type SettingRow = RowDataPacket & { key: string; value: string };
type SlugRow = RowDataPacket & { slug: string };
type IndexRow = RowDataPacket & {
  url: string;
  verdict: string | null;
  coverage_state: string | null;
  last_crawl: string | null;
  checked_at: string | null;
};

let schemaReady: Promise<void> | null = null;

function ensureGscSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool
      .execute(
        `CREATE TABLE IF NOT EXISTS gsc_url_index (
          url VARCHAR(512) NOT NULL,
          verdict VARCHAR(64) DEFAULT NULL,
          coverage_state VARCHAR(255) DEFAULT NULL,
          last_crawl DATETIME(3) DEFAULT NULL,
          checked_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (url),
          KEY gsc_url_index_checked_idx (checked_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      )
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

const OAUTH_KEYS = [
  'google_ads_client_id',
  'google_ads_client_secret',
  'google_ads_refresh_token',
  'gsc_site_url',
  'public_base_url',
] as const;

function settingValue(raw: string | null | undefined): string {
  if (!raw) return '';
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'string' ? parsed.trim() : raw.trim();
  } catch {
    return raw.trim().replace(/^"|"$/g, '');
  }
}

async function getSettings(): Promise<Map<string, string>> {
  const placeholders = OAUTH_KEYS.map(() => '?').join(', ');
  const [rows] = await pool.query<SettingRow[]>(
    `SELECT \`key\`, value FROM site_settings WHERE locale = '*' AND \`key\` IN (${placeholders})`,
    [...OAUTH_KEYS],
  );
  return new Map(rows.map((row) => [row.key, settingValue(row.value)]));
}

function siteToOrigin(site: string, publicBaseUrl: string): string {
  if (publicBaseUrl) return publicBaseUrl.replace(/\/+$/, '');
  if (site.startsWith('sc-domain:')) return `https://${site.slice('sc-domain:'.length).replace(/\/+$/, '')}`;
  return site.replace(/\/+$/, '');
}

async function getGoogleConfig() {
  const settings = await getSettings();
  const site = settings.get('gsc_site_url') || 'sc-domain:woodyvearkadaslari.com';
  return {
    clientId: settings.get('google_ads_client_id') || '',
    clientSecret: settings.get('google_ads_client_secret') || '',
    refreshToken: settings.get('google_ads_refresh_token') || '',
    site,
    origin: siteToOrigin(site, settings.get('public_base_url') || ''),
  };
}

export async function getGscStatus() {
  const config = await getGoogleConfig();
  return {
    connected: Boolean(config.clientId && config.clientSecret && config.refreshToken),
    site: config.site,
  };
}

async function getGoogleAccessToken(): Promise<string> {
  const config = await getGoogleConfig();
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error('google_oauth_missing');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
    }),
  });
  const body = (await response.json().catch(() => null)) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  } | null;
  if (!response.ok || !body?.access_token) {
    throw new Error(body?.error_description || body?.error || 'google_oauth_failed');
  }
  return body.access_token;
}

function classify(verdict: string, coverage: string) {
  if (verdict === 'PASS' || /submitted and indexed/i.test(coverage)) {
    return {
      category: 'indexed' as const,
      label: 'İndexli',
      recommendation: 'Düzenli içerik güncellemesi ve iç linklerle görünürlüğü koruyun.',
    };
  }
  if (/not indexed|unknown to google|discovered|crawled/i.test(coverage)) {
    return {
      category: 'not_indexed' as const,
      label: 'İndexsiz',
      recommendation: 'Sitemap’e ekleyin ve iç link verin; URL Inspection’dan “İndexleme iste”.',
    };
  }
  if (/duplicate|noindex|soft 404|redirect|blocked|error/i.test(`${verdict} ${coverage}`)) {
    return {
      category: 'issue' as const,
      label: 'Sorun',
      recommendation: 'Canonical, robots/noindex, yönlendirme ve sayfa içerik kalitesini kontrol edin.',
    };
  }
  return {
    category: 'unknown' as const,
    label: coverage || verdict || 'Bilinmiyor',
    recommendation: 'URL Inspection ayrıntısında canonical, robots ve tarama durumunu kontrol edin.',
  };
}

function itemFromRow(row: IndexRow): GscIndexItem {
  const verdict = row.verdict || '';
  const coverage = row.coverage_state || '';
  return {
    url: row.url,
    verdict,
    coverage_state: coverage,
    last_crawl: row.last_crawl,
    checked_at: row.checked_at,
    ...classify(verdict, coverage),
  };
}

async function entitySlugs(type: GscEntityType, locale: string): Promise<string[]> {
  if (type === 'blog') {
    const [rows] = await pool.query<SlugRow[]>(
      `SELECT DISTINCT bi.slug
         FROM blog_posts_i18n bi
        WHERE bi.locale = ? AND bi.slug <> ''`,
      [locale],
    );
    return rows.map((row) => row.slug);
  }

  const [rows] = await pool.query<SlugRow[]>(
    `SELECT DISTINCT pi.slug
       FROM product_i18n pi
      WHERE pi.locale = ? AND pi.slug <> ''`,
    [locale],
  );
  return rows.map((row) => row.slug);
}

async function entityContext(type: GscEntityType, locale: string) {
  const config = await getGoogleConfig();
  const slugs = await entitySlugs(type, locale);
  const segment = type === 'product' ? 'store' : 'blog';
  const urls = new Map(slugs.map((slug) => [slug, `${config.origin}/${locale}/${segment}/${slug}`]));
  return { ...config, urls };
}

export async function listGscEntityIndex(type: GscEntityType, locale: string) {
  await ensureGscSchema();
  const context = await entityContext(type, locale);
  const [rows] = await pool.query<IndexRow[]>(
    'SELECT url, verdict, coverage_state, last_crawl, checked_at FROM gsc_url_index',
  );
  const byUrl = new Map(rows.map((row) => [row.url.replace(/\/+$/, ''), itemFromRow(row)]));
  const items: Record<string, GscIndexItem> = {};
  const summary = { indexed: 0, not_indexed: 0, issue: 0, unknown: 0, unchecked: 0 };

  for (const [slug, url] of context.urls) {
    const item = byUrl.get(url.replace(/\/+$/, ''));
    if (!item) {
      summary.unchecked += 1;
      continue;
    }
    items[slug] = item;
    summary[item.category] += 1;
  }

  return { type, locale, items, summary };
}

function toMysqlDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export async function inspectGscEntity(type: GscEntityType, locale: string, slug: string) {
  await ensureGscSchema();
  const context = await entityContext(type, locale);
  const url = context.urls.get(slug);
  if (!url) throw new Error('entity_not_found');

  const accessToken = await getGoogleAccessToken();
  const response = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: context.site }),
  });
  const body = (await response.json().catch(() => null)) as {
    inspectionResult?: { indexStatusResult?: Record<string, unknown> };
    error?: { message?: string };
  } | null;
  if (!response.ok) throw new Error(body?.error?.message || 'gsc_inspect_failed');

  const result = body?.inspectionResult?.indexStatusResult || {};
  const verdict = String(result.verdict || '');
  const coverage = String(result.coverageState || '');
  const lastCrawl = toMysqlDateTime(String(result.lastCrawlTime || ''));
  await pool.execute(
    `INSERT INTO gsc_url_index (url, verdict, coverage_state, last_crawl, checked_at)
     VALUES (?, ?, ?, ?, NOW(3))
     ON DUPLICATE KEY UPDATE verdict = VALUES(verdict), coverage_state = VALUES(coverage_state),
       last_crawl = VALUES(last_crawl), checked_at = VALUES(checked_at)`,
    [url, verdict, coverage, lastCrawl],
  );

  const [rows] = await pool.query<IndexRow[]>(
    'SELECT url, verdict, coverage_state, last_crawl, checked_at FROM gsc_url_index WHERE url = ? LIMIT 1',
    [url],
  );
  if (!rows[0]) throw new Error('gsc_cache_write_failed');
  return itemFromRow(rows[0]);
}
