import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import {
  WOODY_SEO_LOCALES,
  WOODY_STATIC_SEO_PAGES,
  normalizeWoodyPageSeoConfig,
} from '@shared/shared-types/woody-seo-catalog';
import {
  getCloudinaryConfig,
  uploadBufferAuto,
} from '@shared/shared-backend/modules/storage';

const APPLY = process.argv.includes('--apply');
const BASE_URL = String(
  process.env.SEO_SYNC_BASE_URL ||
    process.env.FRONTEND_URL ||
    'https://woodyvearkadaslari.com',
).replace(/\/+$/, '');
const BUCKET = 'public';

function requireDatabaseEnv() {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
  const missing = required.filter((key) => !String(process.env[key] || '').trim());
  if (missing.length) throw new Error(`Missing database environment: ${missing.join(', ')}`);
  return {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    charset: 'utf8mb4_unicode_ci',
  };
}

function parseObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

async function fetchOg(locale: string, pageKey: string): Promise<Buffer> {
  const url = `${BASE_URL}/og/${encodeURIComponent(locale)}/${encodeURIComponent(pageKey)}`;
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'WoodyOgStorageSync/1.0' },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  if (!(response.headers.get('content-type') || '').includes('image/png')) {
    throw new Error(`${url} did not return image/png`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (
    buffer.length < 24 ||
    buffer.readUInt32BE(16) !== 1200 ||
    buffer.readUInt32BE(20) !== 630
  ) {
    throw new Error(`${url} is not a 1200x630 PNG`);
  }
  return buffer;
}

async function main() {
  const connection = await mysql.createConnection(requireDatabaseEnv());
  const storageConfig = APPLY ? await getCloudinaryConfig() : null;
  if (APPLY && !storageConfig) throw new Error('Storage is not configured');

  let synchronized = 0;
  try {
    for (const locale of WOODY_SEO_LOCALES) {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT value FROM site_settings WHERE `key` = ? AND locale = ? LIMIT 1',
        ['seo_pages', locale],
      );
      const pages = parseObject(rows[0]?.value);
      const definitions = WOODY_STATIC_SEO_PAGES.filter(
        (definition) => !definition.trOnly || locale === 'tr',
      );

      for (const definition of definitions) {
        const config = normalizeWoodyPageSeoConfig(pages[definition.key], definition);
        if (config.og.mode !== 'generated') continue;

        const buffer = await fetchOg(locale, definition.key);
        if (!APPLY || !storageConfig) {
          console.log(`ready ${locale}/${definition.key} (${buffer.length} bytes)`);
          continue;
        }

        const folder = `seo/og/${locale}`;
        const fileName = `${definition.key}.png`;
        const upload = await uploadBufferAuto(storageConfig, buffer, {
          folder,
          publicId: definition.key,
          mime: 'image/png',
        });
        const path = upload.public_id;
        const provider = storageConfig.driver === 'local' ? 'local' : 'cloudinary';
        const metadata = JSON.stringify({
          module_key: 'seo',
          kind: 'generated-og',
          page: definition.key,
          locale,
        });

        const [existing] = await connection.query<mysql.RowDataPacket[]>(
          'SELECT id FROM storage_assets WHERE bucket = ? AND path = ? LIMIT 1',
          [BUCKET, path],
        );
        const id = existing[0]?.id || randomUUID();
        await connection.execute(
          `INSERT INTO storage_assets
             (id, name, bucket, path, folder, mime, size, width, height, url, provider,
              provider_public_id, provider_resource_type, provider_format, provider_version,
              etag, metadata)
           VALUES (?, ?, ?, ?, ?, 'image/png', ?, 1200, 630, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name), folder = VALUES(folder), size = VALUES(size),
             width = 1200, height = 630, url = VALUES(url), provider = VALUES(provider),
             provider_public_id = VALUES(provider_public_id),
             provider_resource_type = VALUES(provider_resource_type),
             provider_format = VALUES(provider_format),
             provider_version = VALUES(provider_version), etag = VALUES(etag),
             metadata = VALUES(metadata), updated_at = CURRENT_TIMESTAMP(3)`,
          [
            id,
            fileName,
            BUCKET,
            path,
            folder,
            buffer.length,
            upload.secure_url,
            provider,
            upload.public_id,
            upload.resource_type || 'image',
            upload.format || 'png',
            upload.version ?? null,
            upload.etag ?? null,
            metadata,
          ],
        );

        pages[definition.key] = {
          ...config,
          og: {
            ...config.og,
            generated_image: upload.secure_url,
          },
        };
        synchronized += 1;
        console.log(`stored ${locale}/${definition.key} -> ${upload.secure_url}`);
      }

      if (APPLY) {
        await connection.execute(
          `UPDATE site_settings
           SET value = ?, updated_at = CURRENT_TIMESTAMP(3)
           WHERE \`key\` = 'seo_pages' AND locale = ?`,
          [JSON.stringify(pages), locale],
        );
      }
    }
  } finally {
    await connection.end();
  }

  console.log(
    APPLY
      ? `Stored and linked ${synchronized} OG assets.`
      : 'Dry run completed. Use --apply to store and link OG assets.',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
