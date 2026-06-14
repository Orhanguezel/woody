const trimSlash = (v: string) => v.replace(/\/+$/, '');

const isAbsoluteUrl = (v: string) => /^https?:\/\//i.test(v);

const toOriginLike = (v: string): string => {
  const s = String(v || '').trim();
  if (!s) return '';
  if (!isAbsoluteUrl(s)) return '';

  try {
    const u = new URL(s);
    let out = `${u.protocol}//${u.host}${u.pathname}`.replace(/\/+$/, '');
    // Strip versionsuz veya versionlu API suffix'i: /api, /api/v1, /api/v2, ...
    out = out.replace(/\/api(?:\/v\d+)?$/i, '');
    return trimSlash(out);
  } catch {
    return '';
  }
};

export const getMediaOrigin = (): string => {
  const explicit = toOriginLike(process.env.NEXT_PUBLIC_MEDIA_ORIGIN || '');
  if (explicit) return explicit;

  const candidates = [
    process.env.NEXT_PUBLIC_MEDIA_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.PANEL_API_URL,
    process.env.NEXT_PUBLIC_PANEL_API_URL,
  ];

  for (const c of candidates) {
    const origin = toOriginLike(c || '');
    if (origin) return origin;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimSlash(window.location.origin);
  }

  return '';
};

export const resolveMediaUrl = (raw: string | null | undefined): string => {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^(data:|blob:)/i.test(s)) return s;
  if (isAbsoluteUrl(s)) return s;

  if (s.startsWith('/')) {
    const origin = getMediaOrigin();
    return origin ? `${origin}${s}` : s;
  }

  return s;
};

