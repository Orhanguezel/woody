'use client';

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Languages } from 'lucide-react';

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
    const mapReference = (sourceItems: MenuItemWithChildren[]): MenuItemWithChildren[] => {
      const flat = flattenMenu(sourceItems);
      return REFERENCE_NAV.map((ref, index) => {
        const apiItem = flat.find((item) => cleanHashLink(String(item.url || '')) === ref.url);
        return {
          id: apiItem?.id || ref.id,
          url: ref.url,
          title: ref.labels[locale as keyof typeof ref.labels] || ref.labels.en,
          order_num: (index + 1) * 10,
        } as MenuItemWithChildren;
      });
    };

    if (initialMenuItems && initialMenuItems.length > 0) {
      return mapReference(initialMenuItems.slice().sort((a, b) => ((a as any)?.order_num ?? 0) - ((b as any)?.order_num ?? 0)) as MenuItemWithChildren[]);
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
    return mapReference(FALLBACK_MENU.map(mapItem));
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

      <header data-test-marker="antigravity-fix-v1" className="relative z-[1000]">
        <nav
          className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-500 px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32
            ${scrolled
              ? 'py-4 bg-[var(--gm-bg)]/92 backdrop-blur-[12px] border-b border-[var(--gm-border-soft)] shadow-sm'
              : 'py-6 lg:py-8 bg-transparent'
            }`}
        >
          <Link href={homeHref} className="flex items-center no-underline group">
            <SiteLogo
              alt={resolvedBrand.name}
              wrapperClassName="w-36 sm:w-44 lg:w-48"
              className="max-h-14 object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex gap-5 list-none m-0 p-0 items-center">
              {headerMenuItems.map((item) => {
                const rawUrl = (item.url || '') as string;
                const label = item.title || 'Link';
                const children = item.children ?? [];
                const hasChildren = children.length > 0;
                const href = rawUrl
                  ? (isExternalHref(rawUrl) ? rawUrl : localizePath(locale, cleanHashLink(rawUrl)))
                  : '#';

                if (hasChildren) {
                  return (
                    <li key={item.id} className="static group/dd">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 font-serif text-[13px] font-normal tracking-[0.05em] text-[var(--gm-text)] hover:text-[var(--gm-primary)] transition-colors cursor-default"
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
                        cleanHashLink(rawUrl) === '/store'
                          ? 'inline-flex min-h-10 items-center rounded-md bg-[var(--gm-gold-deep)] px-4 py-2 text-[12px] font-black tracking-[0.08em] text-[var(--gm-surface)] shadow-[var(--gm-shadow-soft)] transition hover:-translate-y-0.5'
                          : 'font-serif text-[13px] font-bold tracking-[0.08em] text-[var(--gm-text)] hover:text-[var(--gm-gold-deep)] transition-colors relative group'
                      }
                    >
                      {label}
                      {cleanHashLink(rawUrl) !== '/store' ? (
                        <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[var(--gm-gold)] transition-all duration-300 group-hover:w-full" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4">
              <details className="group/lang relative">
                <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/70 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gm-text)]">
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
                  className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] uppercase text-[var(--gm-text)] hover:text-[var(--gm-gold-deep)] transition-colors"
                  title={locale === 'tr' ? 'Profilim' : 'Profile'}
                >
                  <IconUser className="w-4 h-4" />
                  {locale === 'tr' ? 'Profil' : 'Profile'}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Right */}
          <div className="flex lg:hidden items-center gap-3">
            <details className="group/lang relative">
              <summary className="flex cursor-pointer list-none items-center rounded-md border border-[var(--gm-border-soft)] bg-[var(--gm-surface)]/70 p-2 text-[var(--gm-text)]">
                <Languages className="size-4" aria-hidden />
              </summary>
              <div className="absolute right-0 top-full mt-2 min-w-40 rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-3 shadow-[var(--gm-shadow-card)]">
                <LanguageSwitcher />
              </div>
            </details>
            {isAuthenticated && (
              <Link href={localizePath(locale, '/profile')} className="p-2 text-[var(--gm-text)]">
                <IconUser className="w-5 h-5" />
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
              className="flex flex-col gap-1.5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className={`w-6 h-[1px] bg-[var(--gm-gold)] transition-all ${mobileOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`} />
              <span className={`w-6 h-[1px] bg-[var(--gm-gold)] ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`w-6 h-[1px] bg-[var(--gm-gold)] transition-all ${mobileOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`} />
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div
          className={`fixed inset-0 z-[40] bg-[var(--gm-bg)]/98 backdrop-blur-xl transition-all duration-500 lg:hidden flex flex-col justify-center items-center px-12 text-center
            ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
          <ul className="flex flex-col gap-6 list-none m-0 p-0 mb-12 max-h-[70vh] overflow-y-auto">
            {headerMenuItems.map((item) => {
              const children = item.children ?? [];
              const hasChildren = children.length > 0;
              const itemUrl = item.url || '';
              return (
                <li key={item.id} className="text-center">
                  {hasChildren ? (
                    <details className="group/m">
                      <summary className="flex items-center justify-center gap-2 cursor-pointer font-display text-2xl tracking-widest text-[var(--gm-gold)] list-none">
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
                                className="font-serif text-lg italic text-[var(--gm-text-dim)] hover:text-[var(--gm-gold)]"
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
                      className="font-display text-2xl tracking-widest text-[var(--gm-gold)]"
                      onClick={() => setMobileOpen(false)}
                    >
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
