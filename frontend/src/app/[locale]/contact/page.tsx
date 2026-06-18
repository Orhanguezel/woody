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

export default async function ContactRoutePage({ params }: Props) {
  const { locale } = await params;
  const siteUrl = getPublicSiteOrigin();
  const app = getPublicAppName();
  const contact = getDefaultContactInfo();
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
            ...(contact.phone ? { telephone: contact.phone } : {}),
            ...(contact.email ? { email: contact.email } : {}),
            ...(contact.address?.addressCountry && contact.address?.addressLocality
              ? {
                  address: {
                    addressCountry: contact.address.addressCountry,
                    addressLocality: contact.address.addressLocality,
                    ...(contact.address.addressRegion ? { addressRegion: contact.address.addressRegion } : {}),
                    ...(contact.address.postalCode ? { postalCode: contact.address.postalCode } : {}),
                    ...(contact.address.streetAddress ? { streetAddress: contact.address.streetAddress } : {}),
                  },
                }
              : {}),
            logo: logoUrl,
            areaServed: tUi(locale, 'Turkey'),
          }),
        ])}
      />
      <ContactRouteClient />
    </>
  );
}
