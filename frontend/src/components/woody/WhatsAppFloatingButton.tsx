'use client';

import { MessageCircle } from 'lucide-react';
import { useMemo } from 'react';

import { FOCUS_RING } from '@/lib/a11y';
import { useGetSiteSettingByKeyQuery } from '@/integrations/rtk/hooks';
import { useLocaleShort } from '@/i18n';
import { tUi } from '@/i18n/staticUi';
import { WhatsAppLink } from '@/components/common/WhatsAppLink';

function cleanPhone(value: unknown) {
  return String(value || '').replace(/[^\d+]/g, '');
}

export default function WhatsAppFloatingButton({ locale: localeProp }: { locale?: string }) {
  const locale = useLocaleShort(localeProp);
  const { data: contactInfo } = useGetSiteSettingByKeyQuery({ key: 'contact_info', locale });

  const phone = useMemo(() => {
    const value = (contactInfo?.value ?? {}) as Record<string, unknown>;
    return cleanPhone(value.whatsapp || value.phone || value.gsm).replace(/^\+/, '') || '905331570373';
  }, [contactInfo?.value]);

  const text =
    locale === 'tr'
      ? 'Merhaba, Woody and Friends hakkında bilgi almak istiyorum.'
      : 'Hello, I would like information about Woody and Friends.';

  const ariaLabel = tUi(locale, 'Contact us on WhatsApp');

  return (
    <div className="fixed bottom-6 left-6 z-[900] flex flex-row-reverse items-center gap-3">
      <span className="hidden rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-gray-700 shadow-[0_6px_18px_rgba(0,0,0,0.14)] md:inline-block">
        {tUi(locale, 'Contact Us')}
      </span>
      <WhatsAppLink
        phone={phone}
        text={text}
        aria-label={ariaLabel}
        className={`inline-flex size-[60px] items-center justify-center rounded-full bg-[var(--gm-success)] text-[var(--gm-surface)] shadow-lg transition duration-300 hover:scale-110 hover:opacity-90 ${FOCUS_RING}`}
      >
        <MessageCircle className="size-8" aria-hidden />
      </WhatsAppLink>
    </div>
  );
}
