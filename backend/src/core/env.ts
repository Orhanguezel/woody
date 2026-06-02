import 'dotenv/config';

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

function parseEnvInt(v: string | undefined, fallback: number): number {
  const n = parseInt(v ?? '', 10);
  return isNaN(n) ? fallback : n;
}

function parseEnvList(v: string | undefined): string[] {
  if (!v) return [];
  return v.split(',').map(s => s.trim()).filter(Boolean);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3077';

/** development: tarayıcıdan farklı portlar (admin 3096, frontend 3077, vb.) CORS’a otomatik eklenir */
const DEV_CORS_EXTRA = [
  'http://localhost:3096',
  'http://127.0.0.1:3096',
  'http://localhost:3077',
  'http://127.0.0.1:3077',
  'http://localhost:3034',
  'http://localhost:3000',
  'http://127.0.0.1:3034',
  'http://127.0.0.1:3000',
];

const CORS_LIST = parseEnvList(process.env.CORS_ORIGIN);
const isProd = (process.env.NODE_ENV ?? 'development') === 'production';
const CORS_ORIGIN = (() => {
  const base = CORS_LIST.length ? CORS_LIST : [FRONTEND_URL];
  if (isProd) return base;
  return [...new Set([...DEV_CORS_EXTRA, ...base])];
})();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseEnvInt(process.env.PORT, 8086),
  SENTRY_DSN: process.env.SENTRY_DSN || '',

  DB: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: parseEnvInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER ?? 'app',
    password: process.env.DB_PASSWORD ?? 'app',
    name: process.env.DB_NAME ?? 'project_db',
  },

  JWT_SECRET: requireEnv('JWT_SECRET'),
  COOKIE_SECRET: process.env.COOKIE_SECRET ?? 'project-cookie-secret-change-in-production',
  CORS_ORIGIN,

  PUBLIC_URL: process.env.PUBLIC_URL ?? 'http://localhost:8086',
  FRONTEND_URL,

  STORAGE_DRIVER: (process.env.STORAGE_DRIVER || 'local').toLowerCase() as 'local' | 'cloudinary',
  LOCAL_STORAGE_ROOT: process.env.LOCAL_STORAGE_ROOT || '',
  LOCAL_STORAGE_BASE_URL: process.env.LOCAL_STORAGE_BASE_URL || '/uploads',

  /** Opsiyonel icerik kok dizini (quiz/promote vb.); legacy: TARMINGO_ROOT */
  QUIZ_CONTENT_ROOT: (process.env.QUIZ_CONTENT_ROOT || process.env.TARMINGO_ROOT || '').trim(),
  /** promote sonrasi `node scripts/build-questions-js.mjs` calistir */
  QUIZ_REBUILD_AFTER_PROMOTE: process.env.QUIZ_REBUILD_AFTER_PROMOTE === 'true',
  /** questions.source_id: gonderi satiri ile carpimsiz tekil anahtar (unique subject_id ile) */
  SUBMISSION_SOURCE_ID_BASE: parseEnvInt(process.env.SUBMISSION_SOURCE_ID_BASE, 8_000_000),
} as const;

export type AppEnv = typeof env;
