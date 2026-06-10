import adminBrandingDefaults from '@/config/admin-branding-defaults.json';

export function getAdminAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || adminBrandingDefaults.app_name;
}

export function getAdminBrandSubtitle(): string {
  return process.env.NEXT_PUBLIC_ADMIN_BRAND_SUBTITLE?.trim() || '';
}

export function getDefaultSiteNameForSeo(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || getAdminAppName();
}

/** SERP onizlemesi icin; NEXT_PUBLIC_SITE_URL veya NEXT_PUBLIC_SITE_DOMAIN */
export function getPublicSiteHostname(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim();
  if (fromEnv) return fromEnv.replace(/^https?:\/\//i, '').split('/')[0] || 'example.com';
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname || 'example.com';
    } catch {
      return 'example.com';
    }
  }
  return 'example.com';
}

export function adminDocumentTitle(pageLabel: string): string {
  return `${pageLabel} | ${getAdminAppName()}`;
}
