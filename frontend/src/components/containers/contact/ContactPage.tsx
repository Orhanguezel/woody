'use client';

import { useMemo } from 'react';

import { Mail, MessageCircle, Phone } from 'lucide-react';

import { useGetSiteSettingByKeyQuery } from '@/integrations/rtk/hooks';
import { safeStr, safeJson } from '@/integrations/shared';

import { useLocaleShort, useUiSection } from '@/i18n';
import { tUi } from '@/i18n/staticUi';

import ContactForm from './ContactForm';
import { FOCUS_RING } from '@/lib/a11y';
import { mergeContactDetails, toE164TR, whatsappHref } from '@/lib/contact-details';
import { getDefaultContactInfo, getPublicAppName } from '@/lib/site-config';

// ── Types ──

type ContactInfo = Partial<{
  companyName: string;
  phones: string[];
  email: string;
  address: string;
  addressSecondary: string;
  whatsappNumber: string;
  website: string;
  notes: string;
}>;

// ── Helpers ──

function buildMailto(email: string, subject?: string) {
  const e = safeStr(email);
  if (!e) return '';
  const s = safeStr(subject);
  return `mailto:${encodeURIComponent(e)}${s ? `?subject=${encodeURIComponent(s)}` : ''}`;
}

// ── Component ──

export default function ContactPage() {
  const locale = useLocaleShort();
  const { ui } = useUiSection('ui_contact', locale as any);

  // Yedek metinler KODA GOMULU TURKCE OLAMAZ: `ui_contact` satiri hicbir dilde
  // yoktu, bu yuzden 10 dilin tamami Turkce form goruyordu. Yedek artik statik
  // 10-dil sozlugunden gelir; DB'deki `ui_contact_*` degeri hâlâ ustune yazar.
  const t = useMemo(
    () => ({
      subprefix: safeStr(ui('ui_contact_subprefix', getPublicAppName())),
      sublabel: safeStr(ui('ui_contact_sublabel', tUi(locale, 'Contact'))),
      titleLeft: safeStr(ui('ui_contact_title_left', tUi(locale, 'Contact Us'))),
      tagline: safeStr(
        ui(
          'ui_contact_tagline',
          tUi(
            locale,
            'Send us a message with your questions or requests. Our team will get back to you shortly.',
          ),
        ),
      ),

      formTitle: safeStr(ui('ui_contact_form_title', tUi(locale, 'Send a message'))),
      firstName: safeStr(ui('ui_contact_first_name', `${tUi(locale, 'First name')}*`)),
      lastName: safeStr(ui('ui_contact_last_name', tUi(locale, 'Last name'))),
      phone: safeStr(ui('ui_contact_phone', `${tUi(locale, 'Phone')}*`)),
      email: safeStr(ui('ui_contact_email', `${tUi(locale, 'Email')}*`)),
      subject: safeStr(ui('ui_contact_subject_label', `${tUi(locale, 'Subject')}*`)),
      message: safeStr(ui('ui_contact_message_label', `${tUi(locale, 'Message')}*`)),
      messagePh: safeStr(ui('ui_contact_message_placeholder', tUi(locale, 'Write your message...'))),

      topicLabel: safeStr(ui('ui_contact_select_label', tUi(locale, 'Subject'))),
      topicAppointment: safeStr(
        ui('ui_contact_service_cooling_towers', tUi(locale, 'Support request')),
      ),
      topicQuestion: safeStr(
        ui('ui_contact_service_maintenance', tUi(locale, 'Question / information')),
      ),
      topicCollab: safeStr(ui('ui_contact_service_modernization', tUi(locale, 'Collaboration'))),
      topicOther: safeStr(ui('ui_contact_service_other', tUi(locale, 'Other'))),

      termsPrefix: safeStr(ui('ui_contact_terms_prefix', tUi(locale, 'I accept:'))),
      terms: safeStr(ui('ui_contact_terms', tUi(locale, 'Privacy Policy'))),
      conditions: safeStr(ui('ui_contact_conditions', tUi(locale, 'Terms of Use'))),

      submit: safeStr(ui('ui_contact_submit', tUi(locale, 'Send'))),
      sending: safeStr(ui('ui_contact_sending', tUi(locale, 'Sending...'))),
      success: safeStr(
        ui('ui_contact_success', tUi(locale, 'Thank you! Your message has been sent.')),
      ),
      errorGeneric: safeStr(
        ui('ui_contact_error_generic', tUi(locale, 'Could not send. Please try again.')),
      ),

      errRequired: safeStr(ui('ui_contact_error_required', tUi(locale, 'This field is required.'))),
      errEmail: safeStr(ui('ui_contact_error_email', tUi(locale, 'Enter a valid email address.'))),
      errPhone: safeStr(ui('ui_contact_error_phone', tUi(locale, 'Enter a valid phone number.'))),
      errMinMessage: safeStr(
        ui('ui_contact_error_message', tUi(locale, 'Write a message of at least 10 characters.')),
      ),

      subjectBase: safeStr(ui('ui_contact_subject_base', tUi(locale, 'Contact Message'))),
      addressLabel: safeStr(ui('ui_contact_address_label', tUi(locale, 'Address'))),
      mapTitle: safeStr(ui('ui_contact_map_title', tUi(locale, 'Location'))),
      infoTitle: safeStr(ui('ui_contact_info_title', tUi(locale, 'Quick Contact'))),
      infoNoteTitle: safeStr(ui('ui_contact_info_note_title', tUi(locale, 'Note'))),
    }),
    [ui, locale],
  );

  // ── Contact info (localized) ──
  const { data: contactInfoRaw } = useGetSiteSettingByKeyQuery({
    key: 'contact_info',
    locale,
  } as any);

  const contactInfo = useMemo<ContactInfo>(() => {
    const v = (contactInfoRaw as any)?.value ?? contactInfoRaw;
    return safeJson<ContactInfo>(v, {} as ContactInfo);
  }, [contactInfoRaw]);

  // Adres/telefon iki katmanlı: DB `contact_info` + site-defaults yedeği.
  // Açık künye banner altındaki kartta; burada yalnızca hızlı iletişim aksiyonları var.
  const details = useMemo(
    () => mergeContactDetails(contactInfo, getDefaultContactInfo()),
    [contactInfo],
  );
  const primaryPhone = details.phone;
  const emailTo = details.email;
  const waHref = whatsappHref(details.whatsapp);
  const notes = safeStr(contactInfo?.notes);

  // ── Map config (localized) ──
  const { data: mapRaw } = useGetSiteSettingByKeyQuery({ key: 'contact_map', locale } as any);

  const mapCfg = useMemo(() => {
    const v = (mapRaw as any)?.value ?? mapRaw;
    const parsed = safeJson<any>(v, {});
    return {
      title: safeStr(parsed.title) || t.mapTitle,
      height: Number(parsed.height) || 420,
      embed_url: safeStr(parsed.embed_url),
    };
  }, [mapRaw, t.mapTitle]);

  return (
    <section className="bg-bg-primary py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sol: Bilgi + Harita */}
          <div className="lg:col-span-5">
            <div className="mb-8">
              <div className="text-sm font-normal uppercase tracking-[0.2em] text-brand-primary mb-3">
                <span>{t.subprefix}</span>{' '}
                <span className="text-text-muted">{t.sublabel}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-text-primary mb-4">
                {t.titleLeft}
              </h2>
              <p className="text-text-secondary leading-relaxed">{t.tagline}</p>
            </div>

            {/* Hızlı iletişim aksiyonları — açık künye banner altındaki kartta */}
            <div className="bg-bg-secondary shadow-soft border border-border-light p-6 mb-8">
              <h3 className="text-lg font-light font-serif text-text-primary mb-4">
                {t.infoTitle}
              </h3>

              <ul className="m-0 list-none space-y-2 p-0 text-sm">
                {primaryPhone && (
                  <li>
                    <a
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-text-primary transition-colors hover:bg-brand-light ${FOCUS_RING}`}
                      href={`tel:${toE164TR(primaryPhone) || primaryPhone}`}
                      aria-label={`${tUi(locale, 'Call Us')}: ${primaryPhone}`}
                    >
                      <Phone className="size-[18px] shrink-0 text-brand-primary" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-[13px] text-text-muted">
                          {tUi(locale, 'Call Us')}
                        </span>
                        <span className="block font-medium">{primaryPhone}</span>
                      </span>
                    </a>
                  </li>
                )}

                {waHref && (
                  <li>
                    <a
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-text-primary transition-colors hover:bg-brand-light ${FOCUS_RING}`}
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tUi(locale, 'Contact us on WhatsApp')}
                    >
                      <MessageCircle className="size-[18px] shrink-0 text-brand-primary" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-[13px] text-text-muted">WhatsApp</span>
                        <span className="block font-medium">{details.whatsapp}</span>
                      </span>
                    </a>
                  </li>
                )}

                {emailTo && (
                  <li>
                    <a
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-text-primary transition-colors hover:bg-brand-light ${FOCUS_RING}`}
                      href={buildMailto(emailTo)}
                      aria-label={`${tUi(locale, 'Send Email')}: ${emailTo}`}
                    >
                      <Mail className="size-[18px] shrink-0 text-brand-primary" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-[13px] text-text-muted">
                          {tUi(locale, 'Send Email')}
                        </span>
                        <span className="block break-all font-medium">{emailTo}</span>
                      </span>
                    </a>
                  </li>
                )}
              </ul>

              {notes && (
                <div className="mt-4 border-t border-border-light pt-3 text-sm text-text-secondary">
                  <strong className="text-text-primary">{t.infoNoteTitle}:</strong>
                  <div className="mt-1">{notes}</div>
                </div>
              )}
            </div>

            {/* Harita */}
            {mapCfg.embed_url && (
              <div className="bg-bg-secondary shadow-soft border border-border-light overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light">
                  <h3 className="text-lg font-light font-serif text-text-primary">{mapCfg.title}</h3>
                </div>
                <iframe
                  title={mapCfg.title}
                  src={mapCfg.embed_url}
                  height={mapCfg.height}
                  className="w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          {/* Sağ: Form */}
          <div className="lg:col-span-7">
            <ContactForm locale={locale} t={t} />
          </div>
        </div>
      </div>
    </section>
  );
}
