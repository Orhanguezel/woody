'use client';

import * as React from 'react';

import { buildWhatsAppHref, buildWhatsAppWebHref, isMobileUserAgent } from '@/lib/whatsapp';

type WhatsAppLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  phone?: string | null;
  text?: string | null;
};

/**
 * WhatsApp baglanti butonu.
 * - SSR / mobil: `wa.me` (uygulamayi acar)
 * - Masaustu (mount sonrasi): `web.whatsapp.com` — Linux'taki "No Apps Available"
 *   protokol diyalogunu onler.
 */
export function WhatsAppLink({ phone, text, children, ...rest }: WhatsAppLinkProps) {
  const [href, setHref] = React.useState(() => buildWhatsAppHref(phone, text));
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    try {
      window.gtag?.('event', 'whatsapp_click', {
        page_path: window.location.pathname,
        phone: phone || undefined,
      });
    } catch {
      // Analytics is optional.
    }
    rest.onClick?.(event);
  };

  React.useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    setHref(
      isMobileUserAgent(ua) ? buildWhatsAppHref(phone, text) : buildWhatsAppWebHref(phone, text),
    );
  }, [phone, text]);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}

export default WhatsAppLink;
