// =============================================================
// FILE: src/components/layout/banner/CookieSettingsModal.tsx
// – Cookie Settings Modal (DB/UI localized) + final consent state
// - Necessary always on
// - Analytics switch toggles analytics consent
// =============================================================
'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';

// i18n + UI (STANDARD)
import { useLocaleShort, useUiSection } from '@/i18n';

export type ConsentState = {
  necessary: true;
  analytics: boolean;
};

type Props = {
  open: boolean;
  locale?: string;

  consent: ConsentState;

  title?: string;
  description?: string;

  labelNecessary?: string;
  descNecessary?: string;

  labelAnalytics?: string;
  descAnalytics?: string;

  btnSave?: string;
  btnCancel?: string;

  ariaClose?: string;

  onClose: () => void;
  onSave: (next: ConsentState) => void;
};

function pickText(primary?: string, secondary?: string, fallback?: string) {
  const p = (primary ?? '').trim();
  if (p) return p;
  const s = (secondary ?? '').trim();
  if (s) return s;
  return (fallback ?? '').trim();
}

const COOKIE_MODAL_FALLBACKS: Record<string, Record<string, string>> = {
  tr: {
    cc_aria_close: 'Kapat',
    cc_btn_cancel: 'Vazgeç',
    cc_btn_save: 'Kaydet',
    cc_desc_analytics: 'Trafiği ve performansı anlamamıza yardımcı olur.',
    cc_desc_necessary: 'Oturum, güvenlik ve dil tercihi gibi temel işlevler için gereklidir.',
    cc_description: 'Hangi çerez kategorilerine izin vereceğinizi seçebilirsiniz. Zorunlu çerezler her zaman aktiftir.',
    cc_label_analytics: 'Analitik',
    cc_label_necessary: 'Zorunlu',
    cc_pill_on: 'Açık',
    cc_title: 'Çerez Ayarları',
  },
  en: {
    cc_aria_close: 'Close',
    cc_btn_cancel: 'Cancel',
    cc_btn_save: 'Save',
    cc_desc_analytics: 'Helps us understand traffic and performance.',
    cc_desc_necessary: 'Required for core functions such as session, security, and language preference.',
    cc_description: 'You can choose which cookie categories you allow. Necessary cookies are always enabled.',
    cc_label_analytics: 'Analytics',
    cc_label_necessary: 'Necessary',
    cc_pill_on: 'On',
    cc_title: 'Cookie Settings',
  },
  de: {
    cc_aria_close: 'Schließen',
    cc_btn_cancel: 'Abbrechen',
    cc_btn_save: 'Speichern',
    cc_desc_analytics: 'Hilft uns, Datenverkehr und Leistung zu verstehen.',
    cc_desc_necessary: 'Erforderlich für Kernfunktionen wie Sitzung, Sicherheit und Spracheinstellung.',
    cc_description: 'Sie können auswählen, welche Cookie-Kategorien Sie erlauben. Notwendige Cookies sind immer aktiv.',
    cc_label_analytics: 'Analyse',
    cc_label_necessary: 'Notwendig',
    cc_pill_on: 'Aktiv',
    cc_title: 'Cookie-Einstellungen',
  },
  ar: {
    cc_aria_close: 'إغلاق',
    cc_btn_cancel: 'إلغاء',
    cc_btn_save: 'حفظ',
    cc_desc_analytics: 'يساعدنا على فهم الزيارات والأداء.',
    cc_desc_necessary: 'ضروري للوظائف الأساسية مثل الجلسة والأمان وتفضيل اللغة.',
    cc_description: 'يمكنك اختيار فئات ملفات تعريف الارتباط التي تسمح بها. الملفات الضرورية مفعلة دائما.',
    cc_label_analytics: 'التحليلات',
    cc_label_necessary: 'ضرورية',
    cc_pill_on: 'مفعل',
    cc_title: 'إعدادات ملفات تعريف الارتباط',
  },
  fr: {
    cc_aria_close: 'Fermer',
    cc_btn_cancel: 'Annuler',
    cc_btn_save: 'Enregistrer',
    cc_desc_analytics: 'Nous aide à comprendre le trafic et les performances.',
    cc_desc_necessary: 'Nécessaire aux fonctions essentielles comme la session, la sécurité et la langue.',
    cc_description: 'Vous pouvez choisir les catégories de cookies autorisées. Les cookies nécessaires sont toujours actifs.',
    cc_label_analytics: 'Analyse',
    cc_label_necessary: 'Nécessaires',
    cc_pill_on: 'Activé',
    cc_title: 'Paramètres des cookies',
  },
  ru: {
    cc_aria_close: 'Закрыть',
    cc_btn_cancel: 'Отмена',
    cc_btn_save: 'Сохранить',
    cc_desc_analytics: 'Помогает нам понимать трафик и производительность.',
    cc_desc_necessary: 'Необходимы для основных функций, таких как сессия, безопасность и выбор языка.',
    cc_description: 'Вы можете выбрать разрешенные категории cookies. Необходимые cookies всегда включены.',
    cc_label_analytics: 'Аналитика',
    cc_label_necessary: 'Необходимые',
    cc_pill_on: 'Вкл.',
    cc_title: 'Настройки cookies',
  },
  es: {
    cc_aria_close: 'Cerrar',
    cc_btn_cancel: 'Cancelar',
    cc_btn_save: 'Guardar',
    cc_desc_analytics: 'Nos ayuda a entender el tráfico y el rendimiento.',
    cc_desc_necessary: 'Necesarias para funciones básicas como sesión, seguridad y preferencia de idioma.',
    cc_description: 'Puedes elegir qué categorías de cookies permites. Las necesarias siempre están activas.',
    cc_label_analytics: 'Analítica',
    cc_label_necessary: 'Necesarias',
    cc_pill_on: 'Activo',
    cc_title: 'Configuración de cookies',
  },
  it: {
    cc_aria_close: 'Chiudi',
    cc_btn_cancel: 'Annulla',
    cc_btn_save: 'Salva',
    cc_desc_analytics: 'Ci aiuta a capire traffico e prestazioni.',
    cc_desc_necessary: 'Necessari per funzioni di base come sessione, sicurezza e preferenza lingua.',
    cc_description: 'Puoi scegliere quali categorie di cookie consentire. I cookie necessari sono sempre attivi.',
    cc_label_analytics: 'Analisi',
    cc_label_necessary: 'Necessari',
    cc_pill_on: 'Attivo',
    cc_title: 'Impostazioni cookie',
  },
  nl: {
    cc_aria_close: 'Sluiten',
    cc_btn_cancel: 'Annuleren',
    cc_btn_save: 'Opslaan',
    cc_desc_analytics: 'Helpt ons verkeer en prestaties te begrijpen.',
    cc_desc_necessary: 'Nodig voor kernfuncties zoals sessie, veiligheid en taalvoorkeur.',
    cc_description: 'Je kunt kiezen welke cookiecategorieën je toestaat. Noodzakelijke cookies staan altijd aan.',
    cc_label_analytics: 'Analyse',
    cc_label_necessary: 'Noodzakelijk',
    cc_pill_on: 'Aan',
    cc_title: 'Cookie-instellingen',
  },
  'pt-br': {
    cc_aria_close: 'Fechar',
    cc_btn_cancel: 'Cancelar',
    cc_btn_save: 'Salvar',
    cc_desc_analytics: 'Ajuda-nos a entender o tráfego e o desempenho.',
    cc_desc_necessary: 'Necessário para funções básicas como sessão, segurança e preferência de idioma.',
    cc_description: 'Você pode escolher quais categorias de cookies permite. Cookies necessários ficam sempre ativos.',
    cc_label_analytics: 'Análise',
    cc_label_necessary: 'Necessários',
    cc_pill_on: 'Ativo',
    cc_title: 'Configurações de cookies',
  },
};

function modalFallback(locale: string, key: string) {
  const normalized = locale.toLowerCase();
  return COOKIE_MODAL_FALLBACKS[normalized]?.[key] || COOKIE_MODAL_FALLBACKS[normalized.split('-')[0]]?.[key] || COOKIE_MODAL_FALLBACKS.en[key] || key;
}

export default function CookieSettingsModal({
  open,
  consent,
  onClose,
  onSave,

  title,
  description,

  labelNecessary,
  descNecessary,

  labelAnalytics,
  descAnalytics,

  btnSave,
  btnCancel,

  ariaClose,
}: Props) {
  const locale = useLocaleShort();
  const { ui } = useUiSection('ui_cookie', locale as any);

  const titleId = useId();
  const descId = useId();

  const [analytics, setAnalytics] = useState<boolean>(!!consent.analytics);

  useEffect(() => {
    if (!open) return;
    setAnalytics(!!consent.analytics);
  }, [open, consent.analytics]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const nextState: ConsentState = useMemo(() => ({ necessary: true, analytics }), [analytics]);

  const uiTitle = ui('cc_title', modalFallback(locale, 'cc_title'));
  const uiDesc = ui(
    'cc_description',
    modalFallback(locale, 'cc_description'),
  );

  const uiLabelNecessary = ui('cc_label_necessary', modalFallback(locale, 'cc_label_necessary'));
  const uiDescNecessary = ui(
    'cc_desc_necessary',
    modalFallback(locale, 'cc_desc_necessary'),
  );

  const uiLabelAnalytics = ui('cc_label_analytics', modalFallback(locale, 'cc_label_analytics'));
  const uiDescAnalytics = ui(
    'cc_desc_analytics',
    modalFallback(locale, 'cc_desc_analytics'),
  );

  const uiBtnSave = ui('cc_btn_save', modalFallback(locale, 'cc_btn_save'));
  const uiBtnCancel = ui('cc_btn_cancel', modalFallback(locale, 'cc_btn_cancel'));
  const uiAriaClose = ui('cc_aria_close', modalFallback(locale, 'cc_aria_close'));

  const finalTitle = pickText(title, uiTitle, 'Cookie Settings');
  const finalDesc = pickText(description, uiDesc, '');

  const finalLabelNecessary = pickText(labelNecessary, uiLabelNecessary, 'Necessary');
  const finalDescNecessary = pickText(descNecessary, uiDescNecessary, '');

  const finalLabelAnalytics = pickText(labelAnalytics, uiLabelAnalytics, 'Analytics');
  const finalDescAnalytics = pickText(descAnalytics, uiDescAnalytics, '');

  const finalBtnSave = pickText(btnSave, uiBtnSave, 'Save');
  const finalBtnCancel = pickText(btnCancel, uiBtnCancel, 'Cancel');
  const finalAriaClose = pickText(ariaClose, uiAriaClose, 'Close');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10050] bg-black/60 p-4 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-bg-card border border-border-light shadow-medium overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border-light">
          <div className="min-w-0">
            <p id={titleId} className="text-lg font-serif font-light text-text-primary leading-snug">
              {finalTitle}
            </p>
            <p id={descId} className="mt-2 text-sm text-text-secondary leading-relaxed">
              {finalDesc}
            </p>
          </div>

          <button
            type="button"
            className="shrink-0 w-9 h-9 rounded-full border border-border-light text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            onClick={onClose}
            aria-label={finalAriaClose}
            title={finalAriaClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-bold text-text-primary">{finalLabelNecessary}</p>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">{finalDescNecessary}</p>
            </div>
            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-text-primary border border-brand-primary/15">
              {ui('cc_pill_on', modalFallback(locale, 'cc_pill_on'))}
            </span>
          </div>

          <div className="h-px bg-bg-card-hover" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-bold text-text-primary">{finalLabelAnalytics}</p>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">{finalDescAnalytics}</p>
            </div>

            <label className="shrink-0 inline-flex items-center gap-3 select-none">
              <span className="sr-only">{finalLabelAnalytics}</span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="sr-only peer"
              />
              <span className="relative w-12 h-7 rounded-full bg-sand-300 peer-checked:bg-brand-primary transition-colors border border-border-medium peer-checked:border-brand-primary">
                <span className="absolute top-0.5 left-0.5 w-6 h-6 bg-bg-card shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-primary hover:bg-bg-card transition-colors"
            onClick={onClose}
          >
            {finalBtnCancel}
          </button>

          <button
            type="button"
            className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-brand-primary text-bg-primary text-sm font-bold hover:bg-brand-hover transition-colors shadow-sm"
            onClick={() => onSave(nextState)}
          >
            {finalBtnSave}
          </button>
        </div>
      </div>
    </div>
  );
}
