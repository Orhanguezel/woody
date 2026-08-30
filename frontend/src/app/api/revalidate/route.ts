import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Sabit varsayilan YOK: fallback olsaydi env'siz her kurulum ayni bilinen
// secret'i kullanir ve herkes cache revalidation tetikleyebilirdi.
const SECRET = process.env.REVALIDATE_SECRET;

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3094',
  'http://localhost:3094',
  'http://127.0.0.1:3094',
].filter(Boolean);

async function pingIndexNow(): Promise<{ accepted: number } | { skipped: string }> {
  const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
  const key = String(process.env.INDEXNOW_KEY || process.env.NEXT_PUBLIC_INDEXNOW_KEY || '').trim();
  if (!siteUrl || !key) return { skipped: 'indexnow_not_configured' };

  const sitemapResponse = await fetch(`${siteUrl}/sitemap.xml`, {
    headers: { accept: 'application/xml,text/xml,*/*' },
    cache: 'no-store',
  });
  if (!sitemapResponse.ok) throw new Error(`sitemap_fetch_failed:${sitemapResponse.status}`);
  const xml = await sitemapResponse.text();
  const host = new URL(siteUrl).host;
  const urlList = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => {
      try {
        return new URL(url).host === host;
      } catch {
        return false;
      }
    })
    .filter((url, index, allUrls) => allUrls.indexOf(url) === index)
    .slice(0, 10_000);

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList,
    }),
  });
  if (!response.ok) throw new Error(`indexnow_failed:${response.status}`);
  return { accepted: urlList.length };
}

function corsHeaders(origin?: string | null) {
  const matched = (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]) || '*';
  return {
    'Access-Control-Allow-Origin': matched,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  const body = await request.json().catch(() => ({}));
  const { secret, path, all, indexNow } = body as {
    secret?: string;
    path?: string;
    all?: boolean;
    indexNow?: boolean;
  };

  // SECRET tanimsizsa ONCE reddet: aksi halde env eksikken saldirganin
  // gonderdigi undefined, undefined !== undefined -> false uretip auth'u bypass eder.
  if (!SECRET) {
    return NextResponse.json({ error: 'revalidate_not_configured' }, { status: 500, headers });
  }

  if (secret !== SECRET) {
    return NextResponse.json({ error: 'invalid_secret' }, { status: 401, headers });
  }

  try {
    if (all) {
      revalidatePath('/', 'layout');
      const indexNowResult = indexNow
        ? await pingIndexNow().catch((error) => ({
            skipped: error instanceof Error ? error.message : 'indexnow_failed',
          }))
        : undefined;
      return NextResponse.json(
        { revalidated: true, scope: 'all', ...(indexNowResult ? { indexNow: indexNowResult } : {}) },
        { headers },
      );
    }

    if (path) {
      revalidatePath(path, 'page');
      return NextResponse.json({ revalidated: true, path }, { headers });
    }

    revalidatePath('/tr', 'layout');
    revalidatePath('/en', 'layout');
    return NextResponse.json({ revalidated: true, scope: 'all-locales' }, { headers });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'revalidation_failed' },
      { status: 500, headers },
    );
  }
}
