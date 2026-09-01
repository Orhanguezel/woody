import type { LucideIcon } from 'lucide-react';
import { Building2, Clock, Mail, MapPin, MessageCircle, Phone, UserRound } from 'lucide-react';

import { tUi } from '@/i18n/staticUi';
import { FOCUS_RING } from '@/lib/a11y';
import { formatAddressLine, toE164TR, whatsappHref, type ContactDetails } from '@/lib/contact-details';

type Props = {
  locale: string;
  details: ContactDetails;
};

function InfoItem({
  icon: Icon,
  label,
  children,
  wide = false,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${wide ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
      <span
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary"
        aria-hidden
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </dt>
        <dd className="mt-1 break-words text-[15px] leading-6 text-text-primary">{children}</dd>
      </div>
    </div>
  );
}

/**
 * Resmî iletişim künyesi — banner'ın hemen altında, sunucuda render edilir.
 *
 * Sayfanın ilk bölümü olarak render EDİLMEZ: header `fixed` olduğu için ilk bölüm
 * her zaman `data-header-overlay` taşıyan banner olmalı, yoksa kart başlığı
 * header'ın altında kalır (2026-09 hatası).
 */
export default function ContactIdentityCard({ locale, details }: Props) {
  const countryLabel =
    details.address.addressCountry === 'TR'
      ? tUi(locale, 'Turkey')
      : details.address.addressCountry || '';
  const addressLine = formatAddressLine(details.address, countryLabel);
  const mapsHref = addressLine
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`
    : '';

  const companyLine = [details.legalName, details.companyName].filter(Boolean).join(' / ');
  const phoneHref = toE164TR(details.phone);
  const waHref = whatsappHref(details.whatsapp);
  const linkClass = `rounded-sm text-brand-primary underline decoration-brand-primary/40 underline-offset-2 transition-colors hover:decoration-brand-primary ${FOCUS_RING}`;

  return (
    <section className="bg-bg-primary pb-4 pt-2 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border-light bg-bg-secondary p-6 shadow-soft md:p-8">
          <div className="mb-6 border-b border-border-light pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
              {tUi(locale, 'Official Contact Information')}
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {tUi(locale, 'Seller identity, open address and contact channels.')}
            </p>
          </div>

          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companyLine ? (
              <InfoItem icon={Building2} label={tUi(locale, 'Company')}>
                {companyLine}
              </InfoItem>
            ) : null}

            {details.sellerName ? (
              <InfoItem icon={UserRound} label={tUi(locale, 'Seller')}>
                {details.sellerName}
              </InfoItem>
            ) : null}

            {details.phone ? (
              <InfoItem icon={Phone} label={tUi(locale, 'Phone')}>
                <a className={linkClass} href={`tel:${phoneHref || details.phone}`}>
                  {details.phone}
                </a>
              </InfoItem>
            ) : null}

            {details.whatsapp && waHref ? (
              <InfoItem icon={MessageCircle} label="WhatsApp">
                <a className={linkClass} href={waHref} target="_blank" rel="noopener noreferrer">
                  {details.whatsapp}
                </a>
              </InfoItem>
            ) : null}

            {details.email ? (
              <InfoItem icon={Mail} label={tUi(locale, 'Email')}>
                <a className={linkClass} href={`mailto:${details.email}`}>
                  {details.email}
                </a>
              </InfoItem>
            ) : null}

            {details.businessHours.length ? (
              <InfoItem icon={Clock} label={tUi(locale, 'Working Hours')}>
                {details.businessHours.join(' · ')}
              </InfoItem>
            ) : null}

            {addressLine ? (
              <InfoItem icon={MapPin} label={tUi(locale, 'Address')} wide>
                <address className="not-italic">
                  {mapsHref ? (
                    <a className={linkClass} href={mapsHref} target="_blank" rel="noopener noreferrer">
                      {addressLine}
                    </a>
                  ) : (
                    addressLine
                  )}
                </address>
              </InfoItem>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  );
}
