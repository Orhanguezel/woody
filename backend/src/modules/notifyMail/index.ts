// =============================================================
// FILE: src/modules/notifyMail/index.ts
// Yonetici bildirim e-postalari — TEK kaynak.
//
// Alicilar artik .env'de degil site_settings'te (`notify_emails`):
// adres degistirmek icin sunucuya girip deploy etmek gerekmiyor,
// Site Ayarlari > Bildirim E-postalari'ndan yonetiliyor.
// (Kural: gorunen/isletme verisi koda gomulmez, DB'den gelir.)
//
// Cozum sirasi:
//   1) site_settings.notify_emails      (virgullu liste veya JSON dizi)
//   2) .env NOTIFY_EMAILS               (dagitim ortami yedegi)
//   3) .env ADMIN_EMAIL                 (eski davranis, geriye uyum)
//
// Her bildirim turu ayrica acilip kapatilabilir:
//   notify_on_order / notify_on_quote / notify_on_contact
//
// Bildirim gonderimi ASLA is akisini bozmaz: hata yalnizca loglanir,
// siparis/teklif kaydi yine de tamamlanir.
// =============================================================

import type { RowDataPacket } from 'mysql2';

import { sendMailRaw } from '@shared/shared-backend/modules/mail-api';

import { pool } from '@/db/client';

type NotifyKind = 'order' | 'quote' | 'contact';

const TOGGLE_KEY: Record<NotifyKind, string> = {
  order: 'notify_on_order',
  quote: 'notify_on_quote',
  contact: 'notify_on_contact',
};

/** site_settings.value JSON olarak saklanir ('"a@b.com"' gibi) — duz metne indirger. */
function unwrapSettingValue(raw: unknown): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  try {
    const parsed = JSON.parse(s);
    if (typeof parsed === 'string') return parsed.trim();
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean).join(',');
    if (typeof parsed === 'boolean' || typeof parsed === 'number') return String(parsed);
    return '';
  } catch {
    return s;
  }
}

async function readSetting(key: string): Promise<string> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT value FROM site_settings WHERE \`key\` = ? ORDER BY (locale = '*') DESC LIMIT 1`,
      [key],
    );
    return unwrapSettingValue(rows[0]?.value);
  } catch {
    return '';
  }
}

function parseEmails(raw: string): string[] {
  return [
    ...new Set(
      String(raw || '')
        .split(/[,;\s]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)),
    ),
  ];
}

/** Bildirim alicilarini cozer; hicbiri yoksa bos dizi doner (gonderim atlanir). */
export async function resolveNotifyRecipients(): Promise<string[]> {
  const fromDb = parseEmails(await readSetting('notify_emails'));
  if (fromDb.length) return fromDb;

  const fromEnv = parseEmails(process.env.NOTIFY_EMAILS || '');
  if (fromEnv.length) return fromEnv;

  return parseEmails(process.env.ADMIN_EMAIL || '');
}

/** Bir bildirim turu acik mi? Ayar yoksa VARSAYILAN ACIK. */
async function isEnabled(kind: NotifyKind): Promise<boolean> {
  const v = (await readSetting(TOGGLE_KEY[kind])).toLowerCase();
  if (!v) return true;
  return !(v === 'false' || v === '0' || v === 'off' || v === 'hayir');
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Etiket/deger satirlarindan basit bir HTML tablo uretir. */
export function rowsToHtml(title: string, rows: Array<[string, unknown]>, extra?: string): string {
  return `
    <h2 style="font-family:system-ui,sans-serif">${escapeHtml(title)}</h2>
    <table cellpadding="6" cellspacing="0" border="0" style="font-family:system-ui,sans-serif;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="color:#666"><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`,
        )
        .join('')}
    </table>
    ${extra ?? ''}
  `;
}

/**
 * Yoneticilere bildirim gonderir.
 * Gonderim hatasi cagiran akisi ETKILEMEZ — yalnizca loglanir.
 */
export async function notifyAdmins(args: {
  kind: NotifyKind;
  subject: string;
  html: string;
  text: string;
  /** Musteri e-postasi — yanitla dendiginde dogrudan ona gitsin. */
  replyTo?: string | null;
  log?: { warn: (o: unknown, m: string) => void };
}): Promise<void> {
  try {
    if (!(await isEnabled(args.kind))) return;

    const to = await resolveNotifyRecipients();
    if (!to.length) return;

    await sendMailRaw({
      to: to.join(', '),
      subject: args.subject,
      html: args.html,
      text: args.text,
      ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    } as Parameters<typeof sendMailRaw>[0]);
  } catch (err) {
    args.log?.warn({ err, kind: args.kind }, 'admin_notification_failed');
  }
}
