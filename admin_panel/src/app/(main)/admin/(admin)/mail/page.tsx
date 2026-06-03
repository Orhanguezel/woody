'use client';
// =============================================================
// FILE: src/app/(main)/admin/(admin)/mail/page.tsx
// E-posta (SMTP) Ayarları — dedike sayfa. Mantık tekrarı YOK:
// site-settings'teki SmtpSettingsTab bileşeni yeniden kullanılır.
// Genel kabuk: woody orders standardı (gm badge + serif header).
// =============================================================

import { Mail } from 'lucide-react';

import { SmtpSettingsTab } from '../site-settings/tabs/smtp-settings-tab';

export default function MailSettingsPage() {
  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-8 h-px bg-gm-gold" />
          <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">E-posta</span>
        </div>
        <h1 className="font-serif text-4xl text-gm-text flex items-center gap-3">
          <Mail className="w-7 h-7 text-gm-gold" />
          E-posta (SMTP) Ayarları
        </h1>
        <p className="text-gm-muted text-sm font-serif italic opacity-70">
          E-posta gönderim ayarlarını yönetin — global ayardır (locale=*).
        </p>
      </div>

      {/* SMTP ayar kartı (site-settings ile ortak bileşen, kart başlığı gizli) */}
      <SmtpSettingsTab locale="tr" showHeader={false} />
    </div>
  );
}
