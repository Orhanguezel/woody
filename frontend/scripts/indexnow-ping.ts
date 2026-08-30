const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
if (!siteUrl) {
  console.error('NEXT_PUBLIC_SITE_URL is required.');
  process.exit(1);
}
const key = String(process.env.INDEXNOW_KEY || process.env.NEXT_PUBLIC_INDEXNOW_KEY || '').trim();

if (!key) {
  console.error('INDEXNOW_KEY is required.');
  process.exit(1);
}

const host = new URL(siteUrl).host;
const keyLocation = `${siteUrl}/${key}.txt`;

async function loadUrlsFromSitemap(): Promise<string[]> {
  const sitemapUrl = String(process.env.INDEXNOW_SITEMAP_URL || `${siteUrl}/sitemap.xml`).trim();
  const response = await fetch(sitemapUrl, { headers: { accept: 'application/xml,text/xml,*/*' } });
  if (!response.ok) {
    throw new Error(`Sitemap fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const urls = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.host === host && /^https?:$/.test(parsed.protocol);
      } catch {
        return false;
      }
    });

  return Array.from(new Set(urls)).slice(0, 10000);
}

async function loadUrls(): Promise<string[]> {
  const explicitUrls = String(process.env.INDEXNOW_URLS || '').trim();
  if (explicitUrls) {
    return explicitUrls
      .split(/[\s,]+/)
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return loadUrlsFromSitemap();
}

async function assertKeyLocation() {
  const response = await fetch(keyLocation, { headers: { accept: 'text/plain,*/*' } });
  const body = await response.text();
  if (!response.ok || body.trim() !== key) {
    throw new Error(`IndexNow key file is not reachable at ${keyLocation}`);
  }
}

await assertKeyLocation();
const urlList = await loadUrls();

if (urlList.length === 0) {
  console.error('No URLs found for IndexNow ping.');
  process.exit(1);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host,
    key,
    keyLocation,
    urlList,
  }),
});

const body = await response.text();

if (!response.ok) {
  console.error(`IndexNow ping failed: ${response.status} ${response.statusText}`);
  if (body) console.error(body);
  process.exit(1);
}

console.log(`IndexNow ping accepted for ${urlList.length} URLs.`);
