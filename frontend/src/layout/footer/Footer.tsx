'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

import SocialLinks from '@/components/common/public/SocialLinks';
import { SiteLogo } from '@/layout/SiteLogo';
import { useGetSiteSettingByKeyQuery } from '@/integrations/rtk/hooks';
import { useLocaleShort, useUiSection } from '@/i18n';
import { localizePath } from '@/integrations/shared';
import { getCopyrightHolder } from '@/lib/site-config';

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

function footerLinks(locale: string): FooterLink[] {
  return [
    { id: 'school', url: '/preschool', title: locale === 'tr' ? 'Okul' : 'School' },
    { id: 'workshop', url: '/workshop', title: locale === 'tr' ? 'Atölye' : 'Workshop' },
    { id: 'home-tutor', url: '/home-tutor', title: locale === 'tr' ? 'Ev & Özel Ders' : 'Home & Private Lesson' },
    { id: 'academy', url: '/woody-academy', title: 'Woody Academy' },
    { id: 'store', url: '/store', title: 'Woody Store' },
    { id: 'blog', url: '/blog', title: 'Blog' },
  ];
}

const Footer: React.FC<{ locale?: string }> = ({ locale: localeProp }) => {
  const fallbackLocale = useLocaleShort();
  const locale = localeProp || fallbackLocale;
  const { ui } = useUiSection('ui_footer', locale);

  const { data: companyBrandSetting } = useGetSiteSettingByKeyQuery({ key: 'company_brand', locale });
  const { data: contactInfoSetting } = useGetSiteSettingByKeyQuery({ key: 'contact_info', locale });
  const { data: socialsSetting } = useGetSiteSettingByKeyQuery({ key: 'socials', locale });

  const { socials } = useMemo(() => {
    const brandVal = (companyBrandSetting?.value ?? {}) as any;
    const socialsVal = (socialsSetting?.value ?? {}) as Record<string, string>;
    const mergedSocials: Record<string, string> = {
      ...(brandVal.socials as Record<string, string> | undefined),
      ...socialsVal,
    };
    return { socials: mergedSocials };
  }, [companyBrandSetting?.value, socialsSetting?.value]);

  const contact = (contactInfoSetting?.value ?? {}) as Record<string, unknown>;
  const phone = String(contact.phone || contact.gsm || contact.whatsapp || '').trim();
  const email = String(contact.email || '').trim();
  const address = String(contact.address || contact.addressLine || '').trim();
  const homeHref = localizePath(locale, '/');

  return (
    <footer className="border-t border-[var(--gm-border-soft)] bg-[var(--gm-bg)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 rounded-xl border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-6 shadow-[var(--gm-shadow-soft)] md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gm-primary)]">
              Woody Academy
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--gm-text)]">
              {locale === 'tr' ? 'Woody Academy Kariyer' : 'Woody Academy Careers'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gm-text-dim)]">
              {locale === 'tr'
                ? 'Öğretmen gelişim programları ve okul iş birlikleri hakkında bilgi almak için bizimle iletişime geçin.'
                : 'Contact us for teacher development programs and school partnerships.'}
            </p>
          </div>
          <Link
            href={localizePath(locale, '/contact')}
            className="mt-5 inline-flex rounded-md bg-[var(--gm-primary)] px-5 py-3 font-bold text-[var(--gm-surface)] md:mt-0"
          >
            {locale === 'tr' ? 'İletişime Geç' : 'Contact Us'}
          </Link>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start text-left">
            <Link href={homeHref} className="mb-8 flex items-start no-underline">
              <SiteLogo
                variant="dark"
                wrapperClassName="w-44"
                className="max-h-20 object-contain"
                priority={false}
              />
            </Link>
            <p className="max-w-[280px] text-[15px] font-light leading-relaxed text-[var(--gm-text-dim)]">
              {ui(
                'ui_footer_tagline',
                locale === 'tr'
                  ? 'Okul öncesi İngilizce eğitiminde oyun temelli, hikaye destekli ve dijital içerikle sürdürülebilir öğrenme deneyimi.'
                  : 'A play-based, story-supported, and digitally sustainable preschool English learning experience.',
              )}
            </p>
          </div>

          <div>
            <div className="mb-8 font-display text-[11px] uppercase tracking-[0.32em] text-[var(--gm-gold-deep)]">
              {locale === 'tr' ? 'Kurumsal' : 'Corporate'}
            </div>
            <ul className="m-0 list-none space-y-4 p-0">
              {footerLinks(locale).map((item) => (
                <li key={item.id}>
                  <Link
                    href={isExternalHref(item.url) ? item.url : localizePath(locale, cleanHashLink(item.url))}
                    className="font-serif text-[16px] italic text-[var(--gm-text-dim)] transition-colors hover:text-[var(--gm-gold)]"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-8 font-display text-[11px] uppercase tracking-[0.32em] text-[var(--gm-gold-deep)]">
              {locale === 'tr' ? 'İletişim' : 'Contact'}
            </div>
            <ul className="m-0 list-none space-y-4 p-0 text-[var(--gm-text-dim)]">
              {phone ? (
                <li className="flex gap-3">
                  <Phone className="mt-1 size-4 shrink-0 text-[var(--gm-primary)]" aria-hidden />
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-[var(--gm-gold)]">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex gap-3">
                  <Mail className="mt-1 size-4 shrink-0 text-[var(--gm-primary)]" aria-hidden />
                  <a href={`mailto:${email}`} className="hover:text-[var(--gm-gold)]">
                    {email}
                  </a>
                </li>
              ) : null}
              {address ? (
                <li className="flex gap-3">
                  <MapPin className="mt-1 size-4 shrink-0 text-[var(--gm-primary)]" aria-hidden />
                  <span>{address}</span>
                </li>
              ) : null}
              {!phone && !email && !address ? (
                <li>
                  <Link href={localizePath(locale, '/contact')} className="hover:text-[var(--gm-gold)]">
                    {locale === 'tr' ? 'İletişim formu' : 'Contact form'}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <div className="mb-8 font-display text-[11px] uppercase tracking-[0.32em] text-[var(--gm-gold-deep)]">
              {locale === 'tr' ? 'Bizi Takip Edin' : 'Follow Us'}
            </div>
            <SocialLinks socials={socials} size="sm" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-[var(--gm-border-soft)] pt-8 text-[11px] uppercase tracking-[0.1em] text-[var(--gm-muted)] md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {getCopyrightHolder()}. {ui('ui_footer_rights', 'TÜM HAKLARI SAKLIDIR.')}
          </p>
          <div className="flex gap-6">
            <Link href={localizePath(locale, '/editorial-policy')} className="transition-colors hover:text-[var(--gm-gold)]">
              {locale === 'tr' ? 'EDİTORYAL POLİTİKA' : locale === 'de' ? 'REDAKTIONELLE RICHTLINIE' : 'EDITORIAL POLICY'}
            </Link>
            <a href="https://guezelwebdesign.com" target="_blank" rel="noopener" className="transition-colors hover:text-[var(--gm-gold)]">
              DESIGNED BY GUEZELWEB
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
