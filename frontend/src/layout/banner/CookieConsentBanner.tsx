// =============================================================
// FILE: src/components/layout/banner/CookieConsentBanner.tsx
// Cookie Consent Banner (DB-driven + localized) + Analytics Consent bridge
// - Reads site_settings key: cookie_consent (localized: tr/en/de)
// - Persists consent to cookie + localStorage (versioned key)
// - Calls window.__setAnalyticsConsent(boolean) OR queues until analytics-consent-init loads
// =============================================================
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';

import CookieSettingsModal, { type ConsentState } from './CookieSettingsModal';

// i18n + UI (STANDARD)
import { useLocaleShort, useUiSection } from '@/i18n';
import { localizePath } from '@/integrations/shared';
import { getCookieConsentStorageKey } from '@/lib/site-config';

// DB
import { useGetSiteSettingByKeyQuery } from '@/integrations/rtk/hooks';

type CookieConsentDb = {
  consent_version?: number;
  defaults?: {
    necessary?: boolean;
    analytics?: boolean;
    marketing?: boolean;
  };
  ui?: {
    enabled?: boolean;
    position?: 'bottom' | 'top';
    show_reject_all?: boolean;
  };
  texts?: {
    title?: string | Record<string, string>;
    description?: string | Record<string, string>;
  };
};

const COOKIE_DAYS = 180;

function setCookie(name: string, value: string, days: number) {
  try {
    const maxAge = days * 24 * 60 * 60;
    const isHttps =
      typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
    const secure = isHttps ? '; secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value,
    )}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
  } catch {}
}

function getCookie(name: string): string | null {
  try {
    const pattern = new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`);
    const m = document.cookie.match(pattern);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function safeJsonParse<T = any>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? (obj as T) : null;
  } catch {
    return null;
  }
}

function makeKeys(version: number) {
  const v = Number.isFinite(version) && version > 0 ? version : 1;
  const base = getCookieConsentStorageKey(String(v));
  return {
    cookieKey: base,
    lsKey: base,
    version: v,
  };
}

function normalizeConsent(input: any): ConsentState | null {
  if (!input || typeof input !== 'object') return null;
  const analytics = !!(input as any).analytics;
  return { necessary: true, analytics };
}

function persistConsent(keys: { cookieKey: string; lsKey: string }, consent: ConsentState) {
  const raw = JSON.stringify({ analytics: !!consent.analytics });
  try {
    localStorage.setItem(keys.lsKey, raw);
  } catch {}
  setCookie(keys.cookieKey, raw, COOKIE_DAYS);
}

function loadConsent(keys: { cookieKey: string; lsKey: string }): ConsentState | null {
  const fromCookie = normalizeConsent(safeJsonParse(getCookie(keys.cookieKey)));
  if (fromCookie) return fromCookie;

  try {
    const fromLs = normalizeConsent(safeJsonParse(localStorage.getItem(keys.lsKey)));
    if (fromLs) return fromLs;
  } catch {}

  return null;
}

function queueConsent(next: boolean) {
  try {
    (window as any).__pendingAnalyticsConsent = (window as any).__pendingAnalyticsConsent || [];
    const q = (window as any).__pendingAnalyticsConsent as any[];

    const last = q.length ? q[q.length - 1] : null;
    if (typeof last === 'boolean' && last === next) return;

    q.push(next);
  } catch {}
}

function applyAnalyticsConsent(next: boolean) {
  try {
    (window as any).__analyticsConsentGranted = next === true;

    if (typeof (window as any).__setAnalyticsConsent === 'function') {
      (window as any).__setAnalyticsConsent(next);
    } else {
      queueConsent(next);
    }
  } catch {}
}

function parseCookieConsentSetting(value: unknown): CookieConsentDb | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value as CookieConsentDb;
  if (typeof value === 'string') return safeJsonParse<CookieConsentDb>(value);
  return null;
}

const COOKIE_FALLBACKS: Record<string, Record<string, string>> = {
  tr: {
    cc_banner_aria_close: 'Kapat',
    cc_banner_aria_region: 'Çerez onayı',
    cc_banner_btn_accept: 'Tümünü Kabul Et',
    cc_banner_btn_reject: 'Tümünü Reddet',
    cc_banner_btn_settings: 'Çerez Ayarları',
    cc_banner_desc: 'Deneyimi geliştirmek ve trafiği isteğe bağlı analiz etmek için çerezler kullanıyoruz.',
    cc_banner_link_policy: 'Çerez Politikası',
    cc_banner_title: 'Çerezler',
  },
  en: {
    cc_banner_aria_close: 'Close',
    cc_banner_aria_region: 'Cookie consent',
    cc_banner_btn_accept: 'Accept All',
    cc_banner_btn_reject: 'Reject All',
    cc_banner_btn_settings: 'Cookie Settings',
    cc_banner_desc: 'We use cookies to improve your experience and optionally analyze traffic.',
    cc_banner_link_policy: 'Cookie Policy',
    cc_banner_title: 'Cookies',
  },
  de: {
    cc_banner_aria_close: 'Schließen',
    cc_banner_aria_region: 'Cookie-Einwilligung',
    cc_banner_btn_accept: 'Alle akzeptieren',
    cc_banner_btn_reject: 'Alle ablehnen',
    cc_banner_btn_settings: 'Cookie-Einstellungen',
    cc_banner_desc: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und optional den Datenverkehr zu analysieren.',
    cc_banner_link_policy: 'Cookie-Richtlinie',
    cc_banner_title: 'Cookies',
  },
  ar: {
    cc_banner_aria_close: 'إغلاق',
    cc_banner_aria_region: 'موافقة ملفات تعريف الارتباط',
    cc_banner_btn_accept: 'قبول الكل',
    cc_banner_btn_reject: 'رفض الكل',
    cc_banner_btn_settings: 'إعدادات ملفات تعريف الارتباط',
    cc_banner_desc: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل الزيارات اختياريا.',
    cc_banner_link_policy: 'سياسة ملفات تعريف الارتباط',
    cc_banner_title: 'ملفات تعريف الارتباط',
  },
  fr: {
    cc_banner_aria_close: 'Fermer',
    cc_banner_aria_region: 'Consentement aux cookies',
    cc_banner_btn_accept: 'Tout accepter',
    cc_banner_btn_reject: 'Tout refuser',
    cc_banner_btn_settings: 'Paramètres des cookies',
    cc_banner_desc: 'Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic de façon optionnelle.',
    cc_banner_link_policy: 'Politique de cookies',
    cc_banner_title: 'Cookies',
  },
  ru: {
    cc_banner_aria_close: 'Закрыть',
    cc_banner_aria_region: 'Согласие на cookies',
    cc_banner_btn_accept: 'Принять все',
    cc_banner_btn_reject: 'Отклонить все',
    cc_banner_btn_settings: 'Настройки cookies',
    cc_banner_desc: 'Мы используем cookies, чтобы улучшить ваш опыт и при необходимости анализировать трафик.',
    cc_banner_link_policy: 'Политика cookies',
    cc_banner_title: 'Cookies',
  },
  es: {
    cc_banner_aria_close: 'Cerrar',
    cc_banner_aria_region: 'Consentimiento de cookies',
    cc_banner_btn_accept: 'Aceptar todo',
    cc_banner_btn_reject: 'Rechazar todo',
    cc_banner_btn_settings: 'Configuración de cookies',
    cc_banner_desc: 'Usamos cookies para mejorar tu experiencia y analizar el tráfico de forma opcional.',
    cc_banner_link_policy: 'Política de cookies',
    cc_banner_title: 'Cookies',
  },
  it: {
    cc_banner_aria_close: 'Chiudi',
    cc_banner_aria_region: 'Consenso ai cookie',
    cc_banner_btn_accept: 'Accetta tutto',
    cc_banner_btn_reject: 'Rifiuta tutto',
    cc_banner_btn_settings: 'Impostazioni cookie',
    cc_banner_desc: 'Usiamo i cookie per migliorare la tua esperienza e analizzare il traffico in modo facoltativo.',
    cc_banner_link_policy: 'Informativa sui cookie',
    cc_banner_title: 'Cookie',
  },
  nl: {
    cc_banner_aria_close: 'Sluiten',
    cc_banner_aria_region: 'Cookie-toestemming',
    cc_banner_btn_accept: 'Alles accepteren',
    cc_banner_btn_reject: 'Alles weigeren',
    cc_banner_btn_settings: 'Cookie-instellingen',
    cc_banner_desc: 'We gebruiken cookies om je ervaring te verbeteren en optioneel verkeer te analyseren.',
    cc_banner_link_policy: 'Cookiebeleid',
    cc_banner_title: 'Cookies',
  },
  'pt-br': {
    cc_banner_aria_close: 'Fechar',
    cc_banner_aria_region: 'Consentimento de cookies',
    cc_banner_btn_accept: 'Aceitar tudo',
    cc_banner_btn_reject: 'Rejeitar tudo',
    cc_banner_btn_settings: 'Configurações de cookies',
    cc_banner_desc: 'Usamos cookies para melhorar sua experiência e analisar o tráfego opcionalmente.',
    cc_banner_link_policy: 'Política de cookies',
    cc_banner_title: 'Cookies',
  },
};

function cookieFallback(locale: string, key: string) {
  const normalized = locale.toLowerCase();
  return COOKIE_FALLBACKS[normalized]?.[key] || COOKIE_FALLBACKS[normalized.split('-')[0]]?.[key] || COOKIE_FALLBACKS.en[key] || key;
}

export default function CookieConsentBanner() {
  const locale = useLocaleShort();
  const { ui } = useUiSection('ui_cookie', locale as any);

  const { data: consentSettingRaw, isLoading: isConsentLoading } = useGetSiteSettingByKeyQuery({
    key: 'cookie_consent',
    locale,
  } as any);

  const consentSetting: CookieConsentDb | null = useMemo(() => {
    const v = (consentSettingRaw as any)?.value ?? consentSettingRaw;
    return parseCookieConsentSetting(v);
  }, [consentSettingRaw]);

  const consentVersion = useMemo(() => {
    const v = Number(consentSetting?.consent_version);
    return Number.isFinite(v) && v > 0 ? v : 1;
  }, [consentSetting]);

  const keys = useMemo(() => makeKeys(consentVersion), [consentVersion]);

  const enabled = consentSetting?.ui?.enabled !== false;
  const showRejectAll = consentSetting?.ui?.show_reject_all !== false;
  const position = consentSetting?.ui?.position === 'top' ? 'top' : 'bottom';

  const defaultAnalytics = !!consentSetting?.defaults?.analytics;

  const [ready, setReady] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({ necessary: true, analytics: false });
  const [hasChoice, setHasChoice] = useState<boolean>(false);

  useEffect(() => {
    if (isConsentLoading) return;

    if (!enabled) {
      applyAnalyticsConsent(false);
      setReady(true);
      setHasChoice(true);
      return;
    }

    const existing = loadConsent(keys);

    if (existing) {
      setConsent(existing);
      setHasChoice(true);
      applyAnalyticsConsent(existing.analytics);
    } else {
      const initial: ConsentState = { necessary: true, analytics: !!defaultAnalytics };
      setConsent(initial);
      setHasChoice(false);
      applyAnalyticsConsent(!!initial.analytics);
    }

    setReady(true);
  }, [isConsentLoading, enabled, keys, defaultAnalytics]);

  const policyHref = useMemo(() => localizePath(locale as any, '/cookie-policy'), [locale]);

  const onRejectAll = useCallback(() => {
    const next: ConsentState = { necessary: true, analytics: false };
    setConsent(next);
    persistConsent(keys, next);
    applyAnalyticsConsent(false);
    setHasChoice(true);
    setOpenSettings(false);
  }, [keys]);

  const onAcceptAll = useCallback(() => {
    const next: ConsentState = { necessary: true, analytics: true };
    setConsent(next);
    persistConsent(keys, next);
    applyAnalyticsConsent(true);
    setHasChoice(true);
    setOpenSettings(false);
  }, [keys]);

  const onSaveSettings = useCallback(
    (next: ConsentState) => {
      const normalized: ConsentState = { necessary: true, analytics: !!next.analytics };
      setConsent(normalized);
      persistConsent(keys, normalized);
      applyAnalyticsConsent(!!normalized.analytics);
      setHasChoice(true);
      setOpenSettings(false);
    },
    [keys],
  );

  if (!ready) return null;
  if (!enabled) return null;

  if (hasChoice) {
    return (
      <CookieSettingsModal
        open={openSettings}
        consent={consent}
        onClose={() => setOpenSettings(false)}
        onSave={onSaveSettings}
      />
    );
  }

  const titleText = ui('cc_banner_title', cookieFallback(locale, 'cc_banner_title'));

  const descText = ui('cc_banner_desc', cookieFallback(locale, 'cc_banner_desc'));

  const policyLabel = ui('cc_banner_link_policy', cookieFallback(locale, 'cc_banner_link_policy'));

  const btnSettings = ui('cc_banner_btn_settings', cookieFallback(locale, 'cc_banner_btn_settings'));
  const btnReject = ui('cc_banner_btn_reject', cookieFallback(locale, 'cc_banner_btn_reject'));
  const btnAccept = ui('cc_banner_btn_accept', cookieFallback(locale, 'cc_banner_btn_accept'));

  const ariaClose = ui('cc_banner_aria_close', cookieFallback(locale, 'cc_banner_aria_close'));

  return (
    <>
      <div
        className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-[10040] p-4`}
        role="region"
        aria-label={ui('cc_banner_aria_region', cookieFallback(locale, 'cc_banner_aria_region'))}
      >
        <div className="mx-auto max-w-5xl rounded-2xl bg-bg-card/95 backdrop-blur-md border border-border-light shadow-medium p-5 sm:p-6 relative">
          <button
            type="button"
            className="absolute right-3 top-3 w-9 h-9 rounded-full border border-border-light text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            onClick={showRejectAll ? onRejectAll : () => setOpenSettings(true)}
            aria-label={ariaClose}
            title={ariaClose}
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 pr-10">
              <p className="text-base sm:text-lg font-serif font-light text-text-primary leading-snug">
                {titleText}
              </p>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {descText}{' '}
                <Link className="text-brand-primary font-bold hover:underline" href={policyHref}>
                  {policyLabel}
                </Link>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-primary hover:bg-bg-card transition-colors"
                onClick={() => setOpenSettings(true)}
              >
                {btnSettings}
              </button>

              {showRejectAll ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-brand-primary/30 text-sm font-bold text-brand-primary hover:bg-brand-primary/5 transition-colors"
                  onClick={onRejectAll}
                >
                  {btnReject}
                </button>
              ) : null}

              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-brand-primary text-bg-primary text-sm font-bold hover:bg-brand-hover transition-colors shadow-sm"
                onClick={onAcceptAll}
              >
                {btnAccept}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CookieSettingsModal
        open={openSettings}
        consent={consent}
        onClose={() => setOpenSettings(false)}
        onSave={onSaveSettings}
      />
    </>
  );
}
