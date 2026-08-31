// =============================================================
// secretBox — admin panelden girilen saglayici sirlarini (PayTR merchant
// key/salt gibi) veritabaninda SIFRELI tutar.
//
// Neden: bu sirlar site_settings'e duz metin yazilirsa her mysqldump yedegi
// (or. /root/yedek-*.sql) calisan bir odeme kimligi tasir. AES-256-GCM ile
// sarilir; anahtar env'de ZATEN zorunlu olan JWT_SECRET'ten HKDF ile turetilir
// (yeni env degiskeni gerekmez, admin panelden yonetim bozulmaz).
//
// JWT_SECRET rotate edilirse eski kayitlar acilamaz -> openSecret null doner,
// ozellik fail-closed kapanir ve sirlar admin panelden yeniden girilir.
// =============================================================
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'crypto';

import { env } from './env';

const VERSION = 'v1';

function deriveKey(purpose: string): Buffer {
  return Buffer.from(hkdfSync('sha256', env.JWT_SECRET, 'woody-secret-box', purpose, 32));
}

/** Duz metni `v1.<iv>.<tag>.<ciphertext>` (base64url parcali) formatinda sarar. */
export function sealSecret(purpose: string, plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(purpose), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [VERSION, iv.toString('base64'), cipher.getAuthTag().toString('base64'), enc.toString('base64')].join('.');
}

/** Sarmali cozer. Bozuk/yabanci/anahtari degismis kayitta null doner (throw etmez). */
export function openSecret(purpose: string, sealed: unknown): string | null {
  if (typeof sealed !== 'string' || !sealed.startsWith(`${VERSION}.`)) return null;
  const parts = sealed.split('.');
  if (parts.length !== 4) return null;
  try {
    const decipher = createDecipheriv('aes-256-gcm', deriveKey(purpose), Buffer.from(parts[1], 'base64'));
    decipher.setAuthTag(Buffer.from(parts[2], 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(parts[3], 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

export function isSealed(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(`${VERSION}.`);
}

/** Admin ekranina donen maskeli onizleme — tam deger asla API'den cikmaz. */
export function maskSecret(plain: string | null | undefined): string {
  const s = String(plain ?? '');
  if (!s) return '';
  if (s.length <= 4) return '••••';
  return `••••${s.slice(-4)}`;
}
