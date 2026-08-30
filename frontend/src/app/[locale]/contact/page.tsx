import ContactRouteClient from './ContactRouteClient';

import { tUi } from '@/i18n/staticUi';

import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, graph, localBusiness } from '@/seo/jsonld';
import {
  getDefaultContactInfo,
  getLocaleDescriptionFallback,
  getPublicAppName,
  getPublicLogoUrl,
  getPublicSiteOrigin,
} from '@/lib/site-config';

type Props = { params: Promise<{ locale: string }> };

function toE164TR(phone: string | undefined) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('90')) return `+${digits}`;
  if (digits.startsWith('0')) return `+90${digits.slice(1)}`;
  return `+90${digits}`;
}

export default async function ContactRoutePage({ params }: Props) {
  const { locale } = await params;
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const contact = getDefaultContactInfo();
  const primaryPhone = contact.phone || contact.phones?.[0] || '0324 358 03 73';
  const primaryPhoneE164 = toE164TR(primaryPhone);
  const whatsapp = contact.whatsapp || contact.whatsappNumber || '0533 157 03 73';
  const whatsappE164 = toE164TR(whatsapp);
  const email = contact.email || 'minayayinevi@gmail.com';
  const companyName = 'Mina Yayınevi';
  const addressLocality = contact.address?.addressLocality && contact.address.addressLocality !== 'Türkiye Geneli'
    ? contact.address.addressLocality
    : 'Mersin';
  const addressCountry = contact.address?.addressCountry || 'TR';
  const visibleAddress = [
    contact.address?.streetAddress,
    addressLocality,
    contact.address?.addressRegion,
    addressCountry === 'TR' ? 'Türkiye' : addressCountry,
  ].filter(Boolean).join(', ');
  const pageUrl = `${siteUrl}/${locale}/contact`;
  const logoUrl = new URL(getPublicLogoUrl(), siteUrl).toString();

  return (
    <>
      <JsonLd
        id="contact-local-business"
        data={graph([
          breadcrumbSchema([
            { name: app, item: `${siteUrl}/${locale}` },
            { name: tUi(locale, 'Contact'), item: pageUrl },
          ]),
          localBusiness({
            id: `${siteUrl}/#local-business`,
            name: app,
            description: getLocaleDescriptionFallback(locale) || app,
            url: pageUrl,
            ...(primaryPhoneE164 ? { telephone: primaryPhoneE164 } : {}),
            ...(email ? { email } : {}),
            address: {
              addressCountry,
              addressLocality,
              ...(contact.address?.addressRegion ? { addressRegion: contact.address.addressRegion } : {}),
              ...(contact.address?.postalCode ? { postalCode: contact.address.postalCode } : {}),
              ...(contact.address?.streetAddress ? { streetAddress: contact.address.streetAddress } : {}),
            },
            logo: logoUrl,
            areaServed: tUi(locale, 'Turkey'),
          }),
        ])}
      />
      <section className="bg-[#fff9ee] px-4 py-10 text-[#24333f]">
        <div className="container mx-auto max-w-5xl border border-[#eadfce] bg-white p-6 shadow-[0_10px_30px_rgba(36,51,63,0.06)]">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#f58220]">
            {tUi(locale, 'Official Contact Information')}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-light">{tUi(locale, 'Contact')}</h2>
          <dl className="mt-6 grid gap-4 text-sm leading-7 md:grid-cols-2">
            <div>
              <dt className="font-bold text-[#24333f]">{tUi(locale, 'Company')}</dt>
              <dd>{companyName} / {app}</dd>
            </div>
            <div>
              <dt className="font-bold text-[#24333f]">{tUi(locale, 'Phone')}</dt>
              <dd>
                <a className="text-[#d96f12] underline" href={`tel:${primaryPhoneE164}`}>
                  {primaryPhoneE164 || primaryPhone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#24333f]">WhatsApp</dt>
              <dd>
                <a className="text-[#d96f12] underline" href={`https://wa.me/${whatsappE164.replace(/\D/g, '')}`}>
                  {whatsappE164 || whatsapp}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#24333f]">{tUi(locale, 'Email')}</dt>
              <dd>
                <a className="text-[#d96f12] underline" href={`mailto:${email}`}>
                  {email}
                </a>
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="font-bold text-[#24333f]">{tUi(locale, 'Address')}</dt>
              <dd>{visibleAddress}</dd>
            </div>
          </dl>
        </div>
      </section>
      <ContactRouteClient />
    </>
  );
}
