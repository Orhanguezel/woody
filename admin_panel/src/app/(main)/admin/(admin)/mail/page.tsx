'use client';
// =============================================================
// FILE: src/app/(main)/admin/(admin)/mail/page.tsx
// E-posta (SMTP) Ayarları — dedike sayfa. Mantık tekrarı YOK:
// site-settings'teki SmtpSettingsTab bileşeni yeniden kullanılır.
// SMTP ayarları GLOBAL (locale yalnız UI rozeti içindir).
// =============================================================

import { SmtpSettingsTab } from '../site-settings/tabs/smtp-settings-tab';

export default function MailSettingsPage() {
  return <SmtpSettingsTab locale="tr" />;
}
