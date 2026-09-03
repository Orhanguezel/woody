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
  consentState: 'granted' | 'denied' | 'unknown';
};

const STORAGE_KEY = 'woody_commerce_attribution_v1';

function analyticsConsent(): CommerceAttribution['consentState'] {
  if (typeof window === 'undefined') return 'unknown';
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index) || '';
      if (!key.includes('_cookie_consent_v')) continue;
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
  const raw = decodeURIComponent(cookie.slice(4));
  const match = raw.match(/^GA\d+\.\d+\.(\d+\.\d+)$/);
  return match?.[1];
}

export function captureCommerceAttribution(): CommerceAttribution {
  if (typeof window === 'undefined') return { consentState: 'unknown' };

  const consentState = analyticsConsent();
  if (consentState !== 'granted') return { consentState };

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) return JSON.parse(existing) as CommerceAttribution;
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
    landingUrl: limited(`${window.location.pathname}${window.location.search}`, 500),
    referrer: limited(document.referrer, 500),
    gaClientId: gaClientId(),
    consentState,
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Olcum checkout'u engellemez.
  }
  return attribution;
}
