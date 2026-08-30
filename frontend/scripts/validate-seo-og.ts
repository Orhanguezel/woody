import {
  WOODY_SEO_LOCALES,
  WOODY_STATIC_SEO_PAGES,
} from '@shared/shared-types/woody-seo-catalog';

const BASE_URL = String(process.env.SEO_BASE_URL || 'http://127.0.0.1:3077').replace(/\/+$/, '');
const CONCURRENCY = Math.max(1, Number(process.env.SEO_CHECK_CONCURRENCY || 8));

type Check = { locale: string; key: string; path: string };

const checks: Check[] = WOODY_SEO_LOCALES.flatMap((locale) =>
  WOODY_STATIC_SEO_PAGES
    .filter((page) => !page.trOnly || locale === 'tr')
    .map((page) => ({ locale, key: page.key, path: page.path })),
);

function hasMeta(html: string, attribute: 'name' | 'property', value: string): boolean {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<meta\\b[^>]*${attribute}=["']${escaped}["'][^>]*>`, 'i').test(html);
}

function metaContent(html: string, attribute: 'name' | 'property', value: string): string {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tag = html.match(new RegExp(`<meta\\b[^>]*${attribute}=["']${escaped}["'][^>]*>`, 'i'))?.[0] || '';
  return tag.match(/\bcontent=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&') || '';
}

function pngSize(buffer: ArrayBuffer): { width: number; height: number } | null {
  const bytes = new Uint8Array(buffer);
  if (
    bytes.length < 24 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    return null;
  }
  const view = new DataView(buffer);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

async function validate(check: Check) {
  const pageUrl = `${BASE_URL}/${check.locale}${check.path === '/' ? '' : check.path}`;
  const pageResponse = await fetch(pageUrl, { redirect: 'follow' });
  if (!pageResponse.ok) throw new Error(`${pageUrl}: HTTP ${pageResponse.status}`);
  const html = await pageResponse.text();
  const missing = [
    !/<title>[^<]+<\/title>/i.test(html) ? 'title' : '',
    !hasMeta(html, 'name', 'description') ? 'description' : '',
    !/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(html) ? 'canonical' : '',
    !hasMeta(html, 'property', 'og:image') ? 'og:image' : '',
    !hasMeta(html, 'name', 'twitter:image') ? 'twitter:image' : '',
  ].filter(Boolean);
  if (missing.length) throw new Error(`${pageUrl}: missing ${missing.join(', ')}`);

  const metadataOgUrl = metaContent(html, 'property', 'og:image');
  const ogUrl = metadataOgUrl
    ? new URL(metadataOgUrl, pageUrl).toString()
    : `${BASE_URL}/og/${check.locale}/${check.key}`;
  const ogResponse = await fetch(ogUrl, { redirect: 'manual' });
  if (!ogResponse.ok) throw new Error(`${ogUrl}: HTTP ${ogResponse.status}`);
  const contentType = ogResponse.headers.get('content-type') || '';
  if (!contentType.includes('image/png')) throw new Error(`${ogUrl}: invalid content-type ${contentType}`);
  const size = pngSize(await ogResponse.arrayBuffer());
  if (!size || size.width !== 1200 || size.height !== 630) {
    throw new Error(`${ogUrl}: expected 1200x630 PNG`);
  }
}

async function worker(queue: Check[], failures: string[]) {
  while (queue.length) {
    const check = queue.shift();
    if (!check) return;
    try {
      await validate(check);
      console.log(`ok ${check.locale}/${check.key}`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
}

const queue = [...checks];
const failures: string[] = [];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker(queue, failures)),
);

if (failures.length) {
  console.error(`\n${failures.length} SEO/OG checks failed:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Validated ${checks.length} localized SEO pages and OG images.`);
