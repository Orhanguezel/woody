'use client';

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Languages, Menu, ShoppingBag, X } from 'lucide-react';

import HeaderOffcanvas from './HeaderOffcanvas';
import MegaMenuPanel from './MegaMenuPanel';
import { SiteLogo } from '@/layout/SiteLogo';
import { useGetSiteSettingByKeyQuery } from '@/integrations/rtk/hooks';
import type { PublicMenuItemDto } from '@/integrations/shared';
import { localizePath } from '@/integrations/shared';
import { useLocaleShort, useUiSection } from '@/i18n';
import { useAuthStore } from '@/features/auth/auth.store';
import { IconUser } from '@/components/ui/icons';
import {
  getHeaderFallbackMenu,
  getPublicAppName,
} from '@/lib/site-config';
import { WOODY_LOCALES } from '@/components/woody/routes';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { FOCUS_RING } from '@/lib/a11y';

// Menu API boş gelirse src/config/site-defaults.json (navigation.headerFallbackMenu)
type FallbackMenuItem = {
  id: string;
  url?: string;
  label: Record<string, string>;
  children?: FallbackMenuItem[];
};

const FALLBACK_MENU: FallbackMenuItem[] = getHeaderFallbackMenu() as FallbackMenuItem[];

const REFERENCE_NAV = [
  { id: 'ref-home', url: '/', labels: { tr: 'HOME', en: 'HOME', de: 'HOME' } },
  { id: 'ref-store', url: '/store', labels: { tr: 'WOODY STORE', en: 'WOODY STORE', de: 'WOODY STORE' } },
  { id: 'ref-preschool', url: '/preschool', labels: { tr: 'OKUL', en: 'SCHOOL', de: 'SCHULE' } },
  { id: 'ref-workshop', url: '/workshop', labels: { tr: 'ATÖLYE', en: 'WORKSHOP', de: 'WORKSHOP' } },
  { id: 'ref-home-tutor', url: '/home-tutor', labels: { tr: 'EV & ÖZEL DERS', en: 'HOME & PRIVATE LESSON', de: 'ZUHAUSE & EINZELUNTERRICHT' } },
  { id: 'ref-academy', url: '/woody-academy', labels: { tr: 'WOODY ACADEMY', en: 'WOODY ACADEMY', de: 'WOODY ACADEMY' } },
  { id: 'ref-blog', url: '/blog', labels: { tr: 'BLOG', en: 'BLOG', de: 'BLOG' } },
] as const;

type MenuItemWithChildren = PublicMenuItemDto & {
  children?: MenuItemWithChildren[];
};

const isActivePath = (pathname: string | null, locale: string, rawUrl: string) => {
  const clean = cleanHashLink(rawUrl || '/');
  const localized = localizePath(locale, clean);
  const current = pathname || '/';
  if (clean === '/') return current === localized || current === `/${locale}`;
  return current === localized || current.startsWith(`${localized}/`);
};

const isExternalHref = (href: string) =>
  /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);

const cleanHashLink = (href: string) => {
  if (!href) return href;
  let clean = href;
  if (clean.startsWith('#')) return `/${clean.substring(1)}`;
  if (clean.startsWith('/#')) return `/${clean.substring(2)}`;
  const localePattern = WOODY_LOCALES.map((loc) => loc.replace('-', '\\-')).join('|');
  clean = clean.replace(new RegExp(`^\\/(${localePattern})(\\/|$)`, 'i'), '/');
  if (clean.includes('#')) return `/${clean.split('#')[1]}`;
  return clean === '' ? '/' : clean;
};

function flattenMenu(items: MenuItemWithChildren[]): MenuItemWithChildren[] {
  return items.flatMap((item) => [item, ...flattenMenu(item.children ?? [])]);
}

function isPublicAuthMenuItem(item: MenuItemWithChildren): boolean {
  const rawUrl = cleanHashLink(String(item.url || (item as any).href || '')).toLowerCase();
  const title = String(item.title || (item as any).label || '').toLowerCase();
  return /(^|\/)(login|register|logout|auth)(\/|$)/.test(rawUrl)
    || /\b(login|register|registrieren|anmelden|sign in|sign up)\b/i.test(title)
    || /\b(giriş|kayıt|çıkış)\b/i.test(title);
}

function filterPublicMenu(items: MenuItemWithChildren[]): MenuItemWithChildren[] {
  return items
    .filter((item) => !isPublicAuthMenuItem(item))
    .map((item) => ({
      ...item,
      children: item.children?.length ? filterPublicMenu(item.children) : undefined,
    }));
}

function sortMenu(items: MenuItemWithChildren[]): MenuItemWithChildren[] {
  return items
    .filter((item) => !isPublicAuthMenuItem(item))
    .slice()
    .sort((a, b) => ((a as any)?.order_num ?? 0) - ((b as any)?.order_num ?? 0))
    .map((item) => ({
      ...item,
      children: item.children?.length ? sortMenu(item.children) : undefined,
    }));
}

type HeaderClientBrand = {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  socials?: Record<string, string>;
};

function getSettingString(value: unknown, key: string) {
  if (typeof value !== 'object' || value === null || !(key in value)) return undefined;
  const raw = (value as Record<string, unknown>)[key];
  return typeof raw === 'string' && raw.trim() ? raw : undefined;
}

type HeaderClientProps = {
  brand?: HeaderClientBrand;
  locale?: string;
  /** SSR'da fetch edilen menu items — RTK Query'nin SSR/client farkından kaynaklanan hidrasyon mismatch'i önler. */
  initialMenuItems?: PublicMenuItemDto[];
};

const HeaderClient: React.FC<HeaderClientProps> = ({ brand, locale: localeProp, initialMenuItems }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const locale = useLocaleShort(localeProp);
  const { ui } = useUiSection('ui_header', locale);

  const { data: contactInfoSetting } = useGetSiteSettingByKeyQuery({ key: 'contact_info', locale });
  const { data: companyBrandSetting } = useGetSiteSettingByKeyQuery({ key: 'company_brand', locale });

  const resolvedBrand = useMemo(() => {
    const name =
      brand?.name ||
      getSettingString(companyBrandSetting?.value, 'name') ||
      getSettingString(contactInfoSetting?.value, 'companyName') ||
      getPublicAppName();
    return { name };
  }, [brand?.name, contactInfoSetting?.value, companyBrandSetting?.value]);

  // HİDRASYON STRATEJİSİ: SSR'da Header.tsx pre-fetch eder, client'ta initialMenuItems
  // kullanılır. RTK Query çağrısı yok — server/client farkını tamamen ortadan kaldırır.
  // (Menü değişiklikleri admin'den sayfa yenilenmesiyle yansır; revalidate: 60sn.)
  const headerMenuItems: MenuItemWithChildren[] = useMemo(() => {
    const mapReferenceFallback = (sourceItems: MenuItemWithChildren[]): MenuItemWithChildren[] => {
      const flat = flattenMenu(filterPublicMenu(sourceItems));
      return REFERENCE_NAV.map((ref, index) => {
        const apiItem = flat.find((item) => cleanHashLink(String(item.url || '')) === ref.url);
        return {
          id: apiItem?.id || ref.id,
          url: apiItem?.url || ref.url,
          title: ref.labels[locale as keyof typeof ref.labels] || ref.labels.en,
          order_num: apiItem?.order_num ?? (index + 1) * 10,
        } as MenuItemWithChildren;
      });
    };

    if (initialMenuItems && initialMenuItems.length > 0) {
      // DB menusu TEK kaynak: admin'den eklenen ogeler (orn. Woody Dijital) dusurulmez.
      // REFERENCE_NAV kilidi KALDIRILDI — yalnizca URL bazli dedupe yapilir.
      const flat = flattenMenu(filterPublicMenu(sortMenu(initialMenuItems as MenuItemWithChildren[])));
      const seen = new Set<string>();
      const out: MenuItemWithChildren[] = [];
      for (const item of flat) {
        const key = cleanHashLink(String(item.url || ''));
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(item);
      }
      if (out.length > 0) return out;
    }
    // initialMenuItems boş ise (SSR fetch başarısız) — varsayılan linkleri locale'e göre üret
    const mapItem = (m: FallbackMenuItem): MenuItemWithChildren => ({
      id: m.id,
      url: m.url ?? '',
      title: m.label[locale] || m.label.tr,
      ...(m.children && m.children.length > 0
        ? { children: m.children.map(mapItem) as MenuItemWithChildren[] }
        : {}),
    } as MenuItemWithChildren);
    return mapReferenceFallback(FALLBACK_MENU.map(mapItem));
  }, [locale, initialMenuItems]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const homeHref = localizePath(locale, '/');
  const profileHref = localizePath(locale, '/profile');

  return (
    <Fragment>
      <HeaderOffcanvas open={open} onClose={() => setOpen(false)} brand={resolvedBrand} locale={locale} />

      <header className="relative z-[1000]">
        <nav
          aria-label={locale === 'tr' ? 'Ana menü' : 'Main navigation'}
          className={`fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-white transition-all duration-500
            ${scrolled
              ? 'shadow-sm'
              : ''
            }`}
        >
          <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-6 md:px-12">
            <Link
              href={homeHref}
              className={`flex shrink-0 items-center no-underline group rounded-md ${FOCUS_RING}`}
              aria-label={locale === 'tr' ? 'Ana sayfa' : 'Home'}
            >
              <SiteLogo
                alt={resolvedBrand.name}
                wrapperClassName="!w-auto h-[56px] md:h-[64px]"
                className="!w-auto h-full object-contain"
                priority
              />
            </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex gap-5 lg:gap-7 list-none m-0 p-0 items-center">
              {headerMenuItems.map((item) => {
                const rawUrl = (item.url || '') as string;
                const label = item.title || 'Link';
                const children = item.children ?? [];
                const hasChildren = children.length > 0;
                const href = rawUrl
                  ? (isExternalHref(rawUrl) ? rawUrl : localizePath(locale, cleanHashLink(rawUrl)))
                  : '#';
                const cleanUrl = cleanHashLink(rawUrl);
                const active = isActivePath(pathname, locale, rawUrl);

                if (hasChildren) {
                  return (
                    <li key={item.id} className="static group/dd">
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1.5 rounded-md font-serif text-[13px] font-normal tracking-[0.05em] text-[var(--gm-text)] hover:text-[var(--gm-primary)] transition-colors cursor-default ${FOCUS_RING}`}
                        aria-haspopup="true"
                      >
                        {label}
                        <ChevronDown className="w-3 h-3 transition-transform group-hover/dd:rotate-180" />
                      </button>
                      <div className="absolute left-0 right-0 top-full -mt-4 pt-4 opacity-0 invisible group-hover/dd:opacity-100 group-hover/dd:visible transition-all duration-300 z-50 pointer-events-none group-hover/dd:pointer-events-auto">
                        <div className="mx-auto w-fit px-6 lg:px-12 drop-shadow-2xl pt-2">
                          <MegaMenuPanel
                            links={children.map((c) => ({ id: c.id, url: (c as any).url, title: c.title }))}
                            locale={locale}
                            panelEyebrow={label}
                          />
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      className={
                        cleanUrl === '/store'
                          ? `inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[var(--gm-primary)] px-4 py-2 text-[11px] font-semibold tracking-[0.10em] text-white shadow-[var(--gm-shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--gm-primary-dark)] lg:text-[12px] ${FOCUS_RING}`
                          : `relative rounded-md pb-1 text-[11px] lg:text-[12px] font-medium tracking-[0.15em] text-gray-600 transition-colors hover:text-black ${active ? 'border-b-2 border-black text-black' : ''} ${FOCUS_RING}`
                      }
                    >
                      {cleanUrl === '/store' ? <ShoppingBag className="size-3.5" aria-hidden /> : null}
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4">
              <details className="group/lang relative">
                <summary
                  className={`flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/70 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gm-text)] ${FOCUS_RING}`}
                  aria-label={ui('ui_header_language', locale === 'tr' ? 'Dil seçimi' : 'Language selection')}
                >
                  <Languages className="size-4 text-[var(--gm-primary)]" aria-hidden />
                  {ui('ui_header_language', locale === 'tr' ? 'Dil' : 'Language')}
                  <ChevronDown className="size-3 transition group-open/lang:rotate-180" aria-hidden />
                </summary>
                <div className="absolute right-0 top-full mt-2 min-w-44 rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-3 shadow-[var(--gm-shadow-card)]">
                  <LanguageSwitcher />
                </div>
              </details>
              {isAuthenticated && (
                <Link
                  href={profileHref}
                  className={`inline-flex items-center gap-2 rounded-md text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--gm-text)] transition-colors hover:text-[var(--gm-gold-deep)] ${FOCUS_RING}`}
                  aria-label={locale === 'tr' ? 'Profilim' : 'My profile'}
                >
                  <IconUser className="w-4 h-4" />
                  {locale === 'tr' ? 'Profil' : 'Profile'}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-3">
            <details className="group/lang relative">
              <summary
                className={`flex cursor-pointer list-none items-center rounded-md border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/70 p-2 text-[var(--gm-text)] ${FOCUS_RING}`}
                aria-label={ui('ui_header_language', locale === 'tr' ? 'Dil seçimi' : 'Language selection')}
              >
                <Languages className="size-4" aria-hidden />
              </summary>
              <div className="absolute right-0 top-full mt-2 min-w-40 rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-3 shadow-[var(--gm-shadow-card)]">
                <LanguageSwitcher />
              </div>
            </details>
            {isAuthenticated && (
              <Link
                href={localizePath(locale, '/profile')}
                className={`rounded-md p-2 text-[var(--gm-text)] ${FOCUS_RING}`}
                aria-label={locale === 'tr' ? 'Profilim' : 'My profile'}
              >
                <IconUser className="w-5 h-5" aria-hidden />
              </Link>
            )}
            <button
              type="button"
              aria-label={
                mobileOpen
                  ? (locale === 'tr' ? 'Mobil menüyü kapat' : 'Close mobile menu')
                  : (locale === 'tr' ? 'Mobil menüyü aç' : 'Open mobile menu')
              }
              aria-expanded={mobileOpen}
              aria-controls="header-mobile-nav"
              className={`rounded-md p-2 text-black ${FOCUS_RING}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
            </button>
          </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div
          id="header-mobile-nav"
          aria-hidden={!mobileOpen}
          aria-label={locale === 'tr' ? 'Mobil menü' : 'Mobile menu'}
          className={`fixed left-0 right-0 top-[72px] z-[49] border-t border-gray-100 bg-white px-6 py-4 shadow-lg transition-all duration-300 md:hidden
            ${mobileOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0 pointer-events-none'}`}
        >
          <ul className="m-0 flex max-h-[70vh] list-none flex-col gap-0 overflow-y-auto p-0">
            {headerMenuItems.map((item) => {
              const children = item.children ?? [];
              const hasChildren = children.length > 0;
              const itemUrl = item.url || '';
              const cleanUrl = cleanHashLink(itemUrl);
              return (
                <li key={item.id} className="text-left">
                  {hasChildren ? (
                    <details className="group/m">
                      <summary className={`flex cursor-pointer list-none items-center justify-between gap-2 rounded-md py-3 text-[13px] font-medium tracking-[0.15em] text-gray-600 ${FOCUS_RING}`}>
                        {item.title}
                        <ChevronDown className="w-4 h-4 transition-transform group-open/m:rotate-180" />
                      </summary>
                      <ul className="mt-4 flex flex-col gap-3 list-none p-0">
                        {children.map((c) => {
                          const cu = c.url || '#';
                          return (
                            <li key={c.id}>
                              <Link
                                href={isExternalHref(cu) ? cu : localizePath(locale, cleanHashLink(cu))}
                                className={`rounded-md font-serif text-lg italic text-[var(--gm-text-dim)] hover:text-[var(--gm-gold)] ${FOCUS_RING}`}
                                onClick={() => setMobileOpen(false)}
                              >
                                {c.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  ) : (
                    <Link
                      href={itemUrl ? (isExternalHref(itemUrl) ? itemUrl : localizePath(locale, cleanHashLink(itemUrl))) : '#'}
                      className={
                        cleanUrl === '/store'
                          ? `my-2 flex items-center justify-center gap-2 rounded-lg bg-[var(--gm-primary)] px-4 py-3 text-center text-[13px] font-semibold tracking-[0.10em] text-white shadow-[var(--gm-shadow-soft)] ${FOCUS_RING}`
                          : `block rounded-md py-3 text-[13px] font-medium tracking-[0.15em] text-gray-600 ${FOCUS_RING}`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      {cleanUrl === '/store' ? <ShoppingBag className="size-4" aria-hidden /> : null}
                      {item.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </header>
    </Fragment>
  );
};

export default HeaderClient;
