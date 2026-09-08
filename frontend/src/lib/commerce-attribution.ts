export type CommerceAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  landingUrl?: string;
  referrer?: string;
  gaClientId?: string;
  gaSessionId?: string;
  consentState: 'granted' | 'denied' | 'unknown';
};

const STORAGE_KEY = 'woody_commerce_attribution_v1';

function analyticsConsent(): CommerceAttribution['consentState'] {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index) || '';
      if (/_cookie_consent_v\d+$/.test(key)) keys.push(key);
    }
    keys.sort((a, b) => Number(b.match(/v(\d+)$/)?.[1]) - Number(a.match(/v(\d+)$/)?.[1]));
    for (const key of keys) {
      const value = JSON.parse(window.localStorage.getItem(key) || '{}') as { analytics?: boolean };
      return value.analytics === true ? 'granted' : 'denied';
    }
  } catch {
    return 'unknown';
  }
  return 'unknown';
}

function limited(value: string | null | undefined, max = 255): string | undefined {
  const normalized = (value || '').trim();
  return normalized ? normalized.slice(0, max) : undefined;
}

function gaClientId(): string | undefined {
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('_ga='));
  if (!cookie) return undefined;
  const raw = cookie.slice(4);
  const match = raw.match(/^GA\d+\.\d+\.(\d+\.\d+)$/);
  return match?.[1];
}

function safeReferrer(value: string): string | undefined {
  try { const url = new URL(value); return limited(url.origin + url.pathname, 500); } catch { return undefined; }
}

function gaSessionId(): string | undefined {
  // GA4 supports GS1 and GS2 cookies; re-read when attribution is requested.
  const cookies = document.cookie.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    if (!/^_ga_[A-Z0-9]+=/.test(cookie)) continue;
    const value = cookie.slice(cookie.indexOf('=') + 1);
    const id = value.match(/^GS1\.\d+\.(\d+)/)?.[1] || value.match(/^GS2\.\d+\.s(\d+)/)?.[1];
    if (id) return id;
  }
  return undefined;
}

export function captureCommerceAttribution(): CommerceAttribution {
  if (typeof window === 'undefined') return { consentState: 'unknown' };

  const consentState = analyticsConsent();
  if (consentState !== 'granted') {
    try { window.sessionStorage.removeItem(STORAGE_KEY); } catch {}
    return { consentState };
  }

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      const saved = JSON.parse(existing) as CommerceAttribution;
      return { ...saved, consentState, gaClientId: gaClientId() || saved.gaClientId, gaSessionId: gaSessionId() || saved.gaSessionId };
    }
  } catch {
    // Session storage kapaliysa mevcut sayfadan devam edilir.
  }

  const params = new URLSearchParams(window.location.search);
  const attribution: CommerceAttribution = {
    source: limited(params.get('utm_source'), 100),
    medium: limited(params.get('utm_medium'), 100),
    campaign: limited(params.get('utm_campaign'), 160),
    content: limited(params.get('utm_content'), 160),
    term: limited(params.get('utm_term'), 160),
    gclid: limited(params.get('gclid'), 255),
    gbraid: limited(params.get('gbraid'), 255),
    wbraid: limited(params.get('wbraid'), 255),
    landingUrl: limited(window.location.pathname, 500),
    referrer: safeReferrer(document.referrer),
    gaClientId: gaClientId(),
    gaSessionId: gaSessionId(),
    consentState,
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Olcum checkout'u engellemez.
  }
  return attribution;
}
