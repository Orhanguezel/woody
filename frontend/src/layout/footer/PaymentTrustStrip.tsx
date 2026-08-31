'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Lock } from 'lucide-react';

import { tUi } from '@/i18n/staticUi';
import { useUiSection } from '@/i18n';
import { safeStr } from '@/integrations/shared';

/**
 * Footer odeme guven seridi — "guvenli kredi karti odemesi" + saglayici logosu.
 *
 * MARKA KURALI: odeme saglayicisinin adi/logosu KODDA YAZMAZ. Ikisi de
 * site_settings > ui_footer'dan gelir:
 *   ui_footer_payment_provider_name  (or. "PayTR")
 *   ui_footer_payment_provider_logo  (or. "/assets/payment/paytr-logo-white.svg")
 * Ayarlanmamissa saglayici blogu HIC render edilmez; yalnizca notr guvenlik
 * satiri kalir. Boylece baska bir firma icin seed'lendiginde ekranda yanlis
 * bir odeme saglayicisi gorunmez.
 */
export default function PaymentTrustStrip({ locale }: { locale: string }) {
  const { ui } = useUiSection('ui_footer', locale);

  const secureText = useMemo(
    () =>
      safeStr(ui('ui_footer_payment_secure', '')).trim() ||
      tUi(locale, '256-bit SSL ile güvenli ödeme'),
    [ui, locale],
  );

  const providerLabel = useMemo(
    () => safeStr(ui('ui_footer_payment_provider_label', '')).trim(),
    [ui],
  );
  const providerName = useMemo(
    () => safeStr(ui('ui_footer_payment_provider_name', '')).trim(),
    [ui],
  );
  const providerLogo = useMemo(
    () => safeStr(ui('ui_footer_payment_provider_logo', '')).trim(),
    [ui],
  );

  // "Visa, Mastercard, Troy" gibi virgullu liste — bos ise kart rozeti cikmaz.
  const cards = useMemo(() => {
    const raw = safeStr(ui('ui_footer_payment_cards', '')).trim();
    return raw
      ? raw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }, [ui]);

  const hasProvider = Boolean(providerName || providerLogo);

  return (
    <div className="mb-6 flex flex-col items-center gap-4 border-t border-white/10 pt-6 md:flex-row md:justify-between">
      <p className="flex items-center gap-2 text-[12px] text-gray-300">
        <Lock className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
        <span>{secureText}</span>
      </p>

      {cards.length ? (
        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-2 p-0">
          {cards.map((card) => (
            <li
              key={card}
              className="rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-200"
            >
              {card}
            </li>
          ))}
        </ul>
      ) : null}

      {hasProvider ? (
        <div className="flex items-center gap-2.5">
          {providerLabel ? (
            <span className="text-[11px] uppercase tracking-[0.1em] text-gray-400">
              {providerLabel}
            </span>
          ) : null}
          {providerLogo ? (
            <Image
              src={providerLogo}
              alt={providerName || providerLabel || ''}
              width={108}
              height={20}
              className="h-5 w-auto object-contain opacity-90"
              unoptimized
            />
          ) : (
            <span className="text-[13px] font-bold text-white">{providerName}</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
