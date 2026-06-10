// =============================================================
// FILE: src/config/app-config.ts
// Admin Panel Config — DB'den gelen branding verileri için fallback
// =============================================================

import packageJson from '../../package.json';
import adminBrandingDefaults from './admin-branding-defaults.json';

const currentYear = new Date().getFullYear();
const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || adminBrandingDefaults.app_name;
const appCopyright = process.env.NEXT_PUBLIC_APP_COPYRIGHT?.trim() || adminBrandingDefaults.app_copyright;
const appDescription =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION?.trim() || adminBrandingDefaults.app_description;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || adminBrandingDefaults.site_url;

export type AdminBrandingConfig = {
  app_name: string;
  app_copyright: string;
  html_lang: string;
  theme_color: string;
  favicon_16: string;
  favicon_32: string;
  favicon_url: string;
  logo_url: string;
  apple_touch_icon: string;
  /** Giriş sayfası sol panel başlığı (boşsa çeviri: Tekrar hoş geldiniz). */
  admin_login_heading: string;
  /** Giriş sayfası sol panel alıntı metni. */
  admin_login_quote: string;
  /** Giriş arka plan görseli URL (boşsa düz tema arka plani; site-settings'ten atanir). */
  admin_login_background_url: string;
  meta: {
    title: string;
    description: string;
    og_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_card: string;
  };
};

export const DEFAULT_BRANDING: AdminBrandingConfig = {
  app_name: appName,
  app_copyright: appCopyright,
  html_lang: 'tr',
  theme_color: '#FF6A00',
  favicon_16: '/favicon/favicon-16.svg',
  favicon_32: '/favicon/favicon-32.svg',
  favicon_url: '/favicon.ico',
  logo_url: '/assets/woody/woody-and-friends-flat.png',
  apple_touch_icon: '/favicon/apple-touch-icon.svg',
  admin_login_heading: '',
  admin_login_quote:
    'Okul oncesi Ingilizce, hikaye ve dijital ogrenme iceriklerini buradan yonetin.',
  admin_login_background_url: '/assets/woody/sections/hero-poster.webp',
  meta: {
    title: appName,
    description: appDescription,
    og_url: siteUrl,
    og_title: appName,
    og_description: appDescription,
    og_image: '/favicon.svg',
    twitter_card: 'summary_large_image',
  },
};

export const APP_CONFIG = {
  name: DEFAULT_BRANDING.app_name,
  version: packageJson.version,
  copyright: `© ${currentYear}, ${DEFAULT_BRANDING.app_copyright}.`,
  meta: {
    title: DEFAULT_BRANDING.meta.title,
    description: DEFAULT_BRANDING.meta.description,
  },
  branding: DEFAULT_BRANDING,
} as const;
