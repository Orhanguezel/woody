import ContactIdentityCard from './ContactIdentityCard';
import ContactRouteClient from './ContactRouteClient';
import { loadContactDetails } from './contact-details.server';

import { tUi } from '@/i18n/staticUi';

import { toE164TR } from '@/lib/contact-details';
import {
  getLocaleDescriptionFallback,
  getPublicAppName,
  getPublicLogoUrl,
  getPublicSiteOrigin,
} from '@/lib/site-config';
import JsonLd from '@/seo/JsonLd';
import { breadcrumbSchema, graph, localBusiness } from '@/seo/jsonld';

type Props = { params: Promise<{ locale: string }> };

export default async function ContactRoutePage({ params }: Props) {
  const { locale } = await params;
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();

  // Künye tek kaynaktan: DB `contact_info` + site-defaults yedeği.
  // Telefon/adres/ünvan burada YAZMAZ; ekranda ve schema.org'da aynı değer görünür.
  const details = await loadContactDetails(locale);
  const pageUrl = `${siteUrl}/${locale}/contact`;
  const logoUrl = new URL(getPublicLogoUrl(), siteUrl).toString();
  const phoneE164 = toE164TR(details.phone);
  const countryLabel =
    details.address.addressCountry === 'TR'
      ? tUi(locale, 'Turkey')
      : details.address.addressCountry || '';

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
            ...(details.legalName ? { legalName: details.legalName } : {}),
            description: getLocaleDescriptionFallback(locale) || app,
            url: pageUrl,
            ...(phoneE164 ? { telephone: phoneE164 } : {}),
            ...(details.email ? { email: details.email } : {}),
            address: {
              addressCountry: details.address.addressCountry || 'TR',
              addressLocality: details.address.addressLocality || countryLabel,
              ...(details.address.addressRegion
                ? { addressRegion: details.address.addressRegion }
                : {}),
              ...(details.address.postalCode ? { postalCode: details.address.postalCode } : {}),
              ...(details.address.streetAddress
                ? { streetAddress: details.address.streetAddress }
                : {}),
            },
            logo: logoUrl,
            areaServed: tUi(locale, 'Turkey'),
          }),
        ])}
      />
      <ContactRouteClient>
        <ContactIdentityCard locale={locale} details={details} />
      </ContactRouteClient>
    </>
  );
}
