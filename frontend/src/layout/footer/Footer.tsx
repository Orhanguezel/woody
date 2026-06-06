'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';

import SocialLinks from '@/components/common/public/SocialLinks';
import { SiteLogo } from '@/layout/SiteLogo';
import { useGetSiteSettingByKeyQuery, useListMenuItemsQuery } from '@/integrations/rtk/hooks';
import { useLocaleShort, useUiSection } from '@/i18n';
import { localizePath, type PublicMenuItemDto } from '@/integrations/shared';
import { FOCUS_RING } from '@/lib/a11y';
import { getCopyrightHolder, getDefaultSocialUrls } from '@/lib/site-config';

type FooterLink = {
  id: string;
  url: string;
  title: string;
};

const isExternalHref = (href: string) =>
  /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);

const cleanHashLink = (href: string) => {
  if (!href) return href;
  if (href === '/') return href;
  if (href.startsWith('#')) return `/${href.substring(1)}`;
  if (href.startsWith('/#')) return `/${href.substring(2)}`;
  if (href.includes('#')) return `/${href.split('#')[1]}`;
  return href;
};

function fallbackFooterLinks(locale: string): FooterLink[] {
  return [
    { id: 'preschool', url: '/preschool', title: locale === 'tr' ? 'Okul' : 'School' },
    { id: 'workshop', url: '/workshop', title: locale === 'tr' ? 'Atölye' : 'Workshop' },
    { id: 'home-tutor', url: '/home-tutor', title: locale === 'tr' ? 'Ev & Özel Ders' : 'Home & Private Lesson' },
    { id: 'academy', url: '/woody-academy', title: 'Woody Academy' },
    { id: 'library', url: '/library', title: locale === 'tr' ? 'Kütüphane' : 'Library' },
    { id: 'store', url: '/store', title: 'Woody Store' },
    { id: 'blog', url: '/blog', title: 'Blog' },
  ];
}

const normalizePhone = (value: string) => value.replace(/\s+/g, '');
const normalizeWhatsApp = (value: string) => value.replace(/[^\d]/g, '');

const Footer: React.FC<{ locale?: string }> = ({ locale: localeProp }) => {
  const fallbackLocale = useLocaleShort();
  const locale = localeProp || fallbackLocale;
  const { ui } = useUiSection('ui_footer', locale);

  const { data: companyBrandSetting } = useGetSiteSettingByKeyQuery({ key: 'company_brand', locale });
  const { data: contactInfoSetting } = useGetSiteSettingByKeyQuery({ key: 'contact_info', locale });
  const { data: socialsSetting } = useGetSiteSettingByKeyQuery({ key: 'socials', locale });
  const { data: footerMenuData } = useListMenuItemsQuery({
    location: 'footer',
    is_active: true,
    locale,
    nested: true,
  });

  const { socials } = useMemo(() => {
    const brandVal = (companyBrandSetting?.value ?? {}) as Record<string, unknown>;
    const socialsVal = (socialsSetting?.value ?? {}) as Record<string, string>;
    const mergedSocials: Record<string, string> = {
      ...getDefaultSocialUrls(),
      ...(brandVal.socials as Record<string, string> | undefined),
      ...socialsVal,
    };
    return { socials: mergedSocials };
  }, [companyBrandSetting?.value, socialsSetting?.value]);

  const menuItems: FooterLink[] = useMemo(() => {
    const raw = footerMenuData as unknown as { items?: PublicMenuItemDto[] } | PublicMenuItemDto[] | undefined;
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    if (!list.length) return fallbackFooterLinks(locale);
    return list
      .slice()
      .sort((a, b) => ((a as any)?.order_num ?? 0) - ((b as any)?.order_num ?? 0))
      .map((item) => ({
        id: String(item.id),
        url: item.url || item.href || '#',
        title: item.title || item.slug || 'Link',
      }));
  }, [footerMenuData, locale]);

  const contact = (contactInfoSetting?.value ?? {}) as Record<string, unknown>;
  const phones = Array.isArray(contact.phones)
    ? contact.phones.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const phone = String(contact.phone || phones[0] || '').trim();
  const secondPhone = String(phones[1] || contact.whatsapp || '').trim();
  const whatsapp = String(contact.whatsappNumber || contact.whatsapp || secondPhone || phone).trim();
  const email = String(contact.email || '').trim();
  const whatsappHref = whatsapp
    ? `https://wa.me/${normalizeWhatsApp(whatsapp)}`
    : 'https://wa.me/905331570373';
  const homeHref = localizePath(locale, '/');

  return (
    <footer className="bg-gray-900 py-16 text-white lg:py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link
              href={homeHref}
              className={`mb-6 flex items-start no-underline rounded-md ${FOCUS_RING}`}
              aria-label={locale === 'tr' ? 'Ana sayfa' : 'Home'}
            >
              <SiteLogo
                variant="light"
                wrapperClassName="w-[32rem]"
                className="max-h-44 object-contain"
                priority={false}
              />
            </Link>
            <p className="max-w-[320px] text-[14px] leading-relaxed text-gray-400">
              {ui(
                'ui_footer_tagline',
                locale === 'tr'
                  ? 'Okul öncesi İngilizce eğitiminde oyun temelli ve sistemli öğrenme modeli.'
                  : 'A play-based and structured preschool English learning model.',
              )}
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-[16px] font-semibold tracking-wide text-white">
              {locale === 'tr' ? 'Kurumsal' : 'Corporate'}
            </h4>
            <ul className="m-0 list-none space-y-3 p-0">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={isExternalHref(item.url) ? item.url : localizePath(locale, cleanHashLink(item.url))}
                    className={`rounded-md text-[14px] text-gray-400 transition-colors hover:text-white ${FOCUS_RING}`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-[16px] font-semibold tracking-wide text-white">
              {locale === 'tr' ? 'İletişim' : 'Contact'}
            </h4>
            <ul className="m-0 list-none space-y-4 p-0 text-[14px] text-gray-400">
              {phone ? (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-[18px] shrink-0" aria-hidden />
                  <a
                    href={`tel:${normalizePhone(phone)}`}
                    className={`rounded-md hover:text-white ${FOCUS_RING}`}
                    aria-label={locale === 'tr' ? `Telefon: ${phone}` : `Phone: ${phone}`}
                  >
                    {phone}
                  </a>
                </li>
              ) : null}
              {secondPhone ? (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-[18px] shrink-0" aria-hidden />
                  <a
                    href={`tel:${normalizePhone(secondPhone)}`}
                    className={`rounded-md hover:text-white ${FOCUS_RING}`}
                    aria-label={locale === 'tr' ? `Telefon: ${secondPhone}` : `Phone: ${secondPhone}`}
                  >
                    {secondPhone}
                  </a>
                </li>
              ) : null}
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 size-[18px] shrink-0" aria-hidden />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-md hover:text-[var(--gm-success)] ${FOCUS_RING}`}
                  aria-label={locale === 'tr' ? 'WhatsApp ile iletişime geçin' : 'Contact us on WhatsApp'}
                >
                  {locale === 'tr' ? 'WhatsApp ile iletişime geçin' : 'Contact us on WhatsApp'}
                </a>
              </li>
              {email ? (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-[18px] shrink-0" aria-hidden />
                  <a
                    href={`mailto:${email}`}
                    className={`rounded-md hover:text-white ${FOCUS_RING}`}
                    aria-label={locale === 'tr' ? `E-posta: ${email}` : `Email: ${email}`}
                  >
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>

            <h4 className="mb-4 mt-8 text-[16px] font-semibold tracking-wide text-white">
              {locale === 'tr' ? 'Bizi Takip Edin' : 'Follow Us'}
            </h4>
            <SocialLinks socials={socials} size="lg" tone="dark" />
          </div>
        </div>

        <div className="mb-8 mt-6">
          <a
            href="https://wa.me/905331570373?text=Merhaba%2C%20Woody%20Academy%20%C3%B6%C4%9Fretmen%20ba%C5%9Fvurusu%20yapmak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className={`group mx-auto block max-w-[600px] rounded-lg bg-white/5 p-4 text-center no-underline transition-all duration-300 hover:bg-white/10 ${FOCUS_RING}`}
            aria-label={locale === 'tr' ? 'Woody Academy öğretmen başvurusu' : 'Woody Academy teacher application'}
          >
            <p className="mb-1 text-[12px] text-gray-400 md:text-[13px]">Woody Academy Kariyer</p>
            <p className="flex items-center justify-center gap-1 text-[13px] font-medium text-white md:text-[14px]">
              <span>{locale === 'tr' ? 'Öğretmen Başvurusu' : 'Teacher Application'}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </p>
          </a>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 text-[12px] text-gray-200 md:flex-row">
          <p className="text-white/85">
            &copy; {new Date().getFullYear()} {getCopyrightHolder()}.{' '}
            {ui('ui_footer_rights', locale === 'tr' ? 'TÜM HAKLARI SAKLIDIR.' : 'ALL RIGHTS RESERVED.')}
          </p>
          <div className="flex gap-6 text-[11px] uppercase tracking-[0.1em]">
            <a
              href="https://guezelwebdesign.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md transition-colors hover:text-white ${FOCUS_RING}`}
              aria-label="Designed by Guezel Web Design"
            >
              DESIGNED BY GUEZELWEB
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
