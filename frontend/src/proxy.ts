// =============================================================
// FILE: src/proxy.ts (Next.js 16+ — eski middleware.ts deprecated)
// Locale prefix routing — locale'siz URL'ler default locale'e redirect edilir.
// /en, /de gibi diğer dilleri olduğu gibi geçirir.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';

// 10 dil (DB app_locales ile uyumlu). firstSeg lowercase'lendiği için kodlar küçük harf.
// NOT: İdeali DB'den dinamik; şimdilik merkezi tek liste (proxy edge runtime DB okuyamaz).
const SUPPORTED_LOCALES = ['tr', 'en', 'de', 'ar', 'fr', 'ru', 'es', 'it', 'nl', 'pt-br'] as const;
const DEFAULT_LOCALE = 'tr';

// Non-locale path prefixes (admin, api vs.) — 'media' diskten dogrudan servis edilir, locale'e redirect EDILMEZ
const NON_LOCALE_PREFIXES = ['admin', 'api', 'uploads', 'media', 'public', 'static', 'images', 'assets'];

// Static file extensions — middleware'i atla (video/ses dahil; yoksa .mp4/.mp3 /tr'ye redirect olup 404 doner)
const STATIC_EXT_RE = /\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|otf|eot|css|js|mjs|map|txt|xml|json|webmanifest|mp4|webm|mov|m4v|mp3|m4a|wav|ogg|pdf)$/i;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Next.js internals + static dosyalar — atla
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/offline.html' ||
    STATIC_EXT_RE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // İlk path segment'i (boşsa root '/')
  const firstSeg = pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();

  // Non-locale (admin/api/uploads) — olduğu gibi geç
  if (firstSeg && NON_LOCALE_PREFIXES.includes(firstSeg)) {
    return NextResponse.next();
  }

  // Locale prefix var ve destekli — olduğu gibi geç
  if (firstSeg && (SUPPORTED_LOCALES as readonly string[]).includes(firstSeg)) {
    return NextResponse.next();
  }

  // Locale prefix YOK → default locale'e 308 REDIRECT (URL /tr/...'ye DEĞİŞİR)
  // ESKİ (HATALI): NextResponse.rewrite → /preschool + /tr/preschool ikisi de 200 = KOPYA.
  // Redirect kopyayı ortadan kaldırır; sitemap/canonical zaten /tr/... kullanıyor.
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    // _next/static, _next/image hariç her şeyde çalış
    '/((?!_next/static|_next/image).*)',
  ],
};
