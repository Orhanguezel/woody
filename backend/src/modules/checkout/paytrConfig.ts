// =============================================================
// PayTR yapilandirmasi — admin panel (site_settings) once, env yedek.
//
// Kaynak sirasi her alan icin: DB (admin panel) dolu ise DB, degilse env.
// Hicbir kaynakta yoksa ozellik KAPALI kalir (503) — varsayilan/fallback
// deger URETILMEZ (CLAUDE.md secret fallback yasagi).
//
// Sirlar DB'ye secretBox ile sifreli yazilir; API'den yalniz maskeli onizleme
// doner, tam deger hicbir zaman disari cikmaz.
// =============================================================
import { randomUUID } from 'crypto';
import type { RowDataPacket } from 'mysql2/promise';

import { env } from '@/core/env';
import { openSecret, sealSecret } from '@/core/secretBox';
import { pool } from '@/db/client';

export const PAYTR_SETTING_KEY = 'paytr_gateway';
const SECRET_PURPOSE = 'paytr';
const CACHE_TTL_MS = 30_000;

export type PaytrSource = 'db' | 'env' | 'none';

export type PaytrConfig = {
  enabled: boolean;
  testMode: boolean;
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  /** Her alanin hangi katmandan geldigi — admin ekraninda gosterilir. */
  source: {
    enabled: PaytrSource;
    testMode: PaytrSource;
    merchantId: PaytrSource;
    merchantKey: PaytrSource;
    merchantSalt: PaytrSource;
  };
  /** DB kaydi var ama sir cozulemedi (JWT_SECRET rotate edilmis olabilir). */
  decryptFailed: boolean;
};

type StoredPaytr = {
  enabled?: boolean;
  testMode?: boolean;
  merchantId?: string;
  merchantKey?: string;
  merchantSalt?: string;
};

let cache: { at: number; config: PaytrConfig } | null = null;

export function invalidatePaytrConfigCache() {
  cache = null;
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function readStored(): Promise<StoredPaytr | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT value FROM site_settings WHERE `key` = ? AND locale = ? LIMIT 1',
    [PAYTR_SETTING_KEY, '*'],
  );
  const raw = rows[0]?.value;
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' ? (parsed as StoredPaytr) : null;
  } catch {
    return null;
  }
}

function resolve(stored: StoredPaytr | null): PaytrConfig {
  let decryptFailed = false;

  const openStored = (sealed: unknown): string => {
    const value = clean(sealed);
    if (!value) return '';
    const plain = openSecret(SECRET_PURPOSE, value);
    if (plain === null) {
      decryptFailed = true;
      return '';
    }
    return plain;
  };

  const dbMerchantId = clean(stored?.merchantId);
  const dbKey = openStored(stored?.merchantKey);
  const dbSalt = openStored(stored?.merchantSalt);

  const pick = (dbValue: string, envValue: string): [string, PaytrSource] => {
    if (dbValue) return [dbValue, 'db'];
    if (envValue) return [envValue, 'env'];
    return ['', 'none'];
  };

  const [merchantId, merchantIdSource] = pick(dbMerchantId, clean(env.PAYTR_MERCHANT_ID));
  const [merchantKey, merchantKeySource] = pick(dbKey, clean(env.PAYTR_MERCHANT_KEY));
  const [merchantSalt, merchantSaltSource] = pick(dbSalt, clean(env.PAYTR_MERCHANT_SALT));

  // Boolean alanlarda "DB kaydi varsa DB kazanir" — false degeri de gecerli bir karardir.
  const hasDbEnabled = typeof stored?.enabled === 'boolean';
  const hasDbTestMode = typeof stored?.testMode === 'boolean';

  return {
    enabled: hasDbEnabled ? Boolean(stored?.enabled) : env.FEATURE_PAYTR_PAYMENT,
    testMode: hasDbTestMode ? Boolean(stored?.testMode) : env.PAYTR_TEST_MODE,
    merchantId,
    merchantKey,
    merchantSalt,
    source: {
      enabled: hasDbEnabled ? 'db' : 'env',
      testMode: hasDbTestMode ? 'db' : 'env',
      merchantId: merchantIdSource,
      merchantKey: merchantKeySource,
      merchantSalt: merchantSaltSource,
    },
    decryptFailed,
  };
}

export async function loadPaytrConfig(): Promise<PaytrConfig> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.config;
  let stored: StoredPaytr | null = null;
  try {
    stored = await readStored();
  } catch {
    // DB okunamiyorsa env katmaniyla devam et; fail-closed davranis korunur.
    stored = null;
  }
  const config = resolve(stored);
  cache = { at: now, config };
  return config;
}

/** Odeme baslatmaya yeter mi — hem acik hem de uc alanin dolu olmasi gerekir. */
export function isPaytrUsable(config: PaytrConfig): boolean {
  return Boolean(config.enabled && config.merchantId && config.merchantKey && config.merchantSalt);
}

export type SavePaytrInput = {
  enabled?: boolean;
  testMode?: boolean;
  merchantId?: string;
  /** Bos/verilmemis ise mevcut kayit KORUNUR (maskeli ekrandan bos gonderilir). */
  merchantKey?: string;
  merchantSalt?: string;
};

export async function savePaytrSettings(input: SavePaytrInput): Promise<PaytrConfig> {
  const stored = (await readStored()) ?? {};

  const next: StoredPaytr = {
    enabled: typeof input.enabled === 'boolean' ? input.enabled : stored.enabled,
    testMode: typeof input.testMode === 'boolean' ? input.testMode : stored.testMode,
    merchantId: input.merchantId !== undefined ? clean(input.merchantId) : clean(stored.merchantId),
    merchantKey: clean(input.merchantKey)
      ? sealSecret(SECRET_PURPOSE, clean(input.merchantKey))
      : clean(stored.merchantKey),
    merchantSalt: clean(input.merchantSalt)
      ? sealSecret(SECRET_PURPOSE, clean(input.merchantSalt))
      : clean(stored.merchantSalt),
  };

  await pool.execute(
    `
      INSERT INTO site_settings (id, \`key\`, locale, value)
      VALUES (?, ?, '*', ?)
      ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = CURRENT_TIMESTAMP(3)
    `,
    [randomUUID(), PAYTR_SETTING_KEY, JSON.stringify(next)],
  );

  invalidatePaytrConfigCache();
  return loadPaytrConfig();
}
