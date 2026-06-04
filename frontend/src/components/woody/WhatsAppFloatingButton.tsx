'use client';

import { MessageCircle } from 'lucide-react';
import { useMemo } from 'react';

import { useGetSiteSettingByKeyQuery } from '@/integrations/rtk/hooks';
import { useLocaleShort } from '@/i18n';

function cleanPhone(value: unknown) {
  return String(value || '').replace(/[^\d+]/g, '');
}

export default function WhatsAppFloatingButton({ locale: localeProp }: { locale?: string }) {
  const locale = useLocaleShort(localeProp);
  const { data: contactInfo } = useGetSiteSettingByKeyQuery({ key: 'contact_info', locale });

  const href = useMemo(() => {
    const value = (contactInfo?.value ?? {}) as Record<string, unknown>;
    const phone = cleanPhone(value.whatsapp || value.phone || value.gsm);
    const normalized = phone || '+905555555555';
    const text =
      locale === 'tr'
        ? 'Merhaba, Woody ve Arkadaşları hakkında bilgi almak istiyorum.'
        : 'Hello, I would like information about Woody and Friends.';
    return `https://wa.me/${normalized.replace(/^\+/, '')}?text=${encodeURIComponent(text)}`;
  }, [contactInfo?.value, locale]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed right-5 bottom-5 z-[900] inline-flex size-14 items-center justify-center rounded-full bg-[var(--gm-success)] text-[var(--gm-surface)] shadow-[var(--gm-shadow-card)] transition hover:-translate-y-1"
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
