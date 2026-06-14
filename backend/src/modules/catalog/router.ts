import type { FastifyInstance } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { pool } from '@/db/client';

type TaxonomyQuery = {
  locale?: string;
};

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function registerCatalogPublic(app: FastifyInstance) {
  app.get('/catalog/taxonomy', async (req) => {
    const q = (req.query || {}) as TaxonomyQuery;
    const locale = clean(q.locale).slice(0, 8) || 'tr';

    const [categories, series, levels] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        `
          SELECT c.id, ci.slug, ci.name, c.display_order AS \`order\`
            FROM categories c
            INNER JOIN category_i18n ci ON ci.category_id = c.id AND ci.locale = ?
           WHERE c.module_key = 'store'
             AND c.is_active = 1
           ORDER BY c.display_order ASC, ci.name ASC
        `,
        [locale],
      ),
      pool.execute<RowDataPacket[]>(
        `
          SELECT s.id, s.code, si.slug, si.name, s.display_order AS \`order\`
            FROM product_series s
            INNER JOIN product_series_i18n si ON si.series_id = s.id AND si.locale = ?
           WHERE s.is_active = 1
           ORDER BY s.display_order ASC, si.name ASC
        `,
        [locale],
      ),
      pool.execute<RowDataPacket[]>(
        `
          SELECT l.id, l.code, li.slug, li.name, l.rank, l.display_order AS \`order\`
            FROM product_levels l
            INNER JOIN product_level_i18n li ON li.level_id = l.id AND li.locale = ?
           WHERE l.is_active = 1
           ORDER BY l.rank ASC, l.display_order ASC, li.name ASC
        `,
        [locale],
      ),
    ]);

    return {
      categories: categories[0],
      series: series[0],
      levels: levels[0],
    };
  });
}

const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal('0'),
  z.literal('1'),
  z.literal('true'),
  z.literal('false'),
]);

function boolToTinyint(value: unknown, fallback = 1) {
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return fallback;
}

const taxonomyBodySchema = z.object({
  code: z.string().trim().min(1).max(64),
  display_order: z.coerce.number().int().min(0).optional().default(0),
  rank: z.coerce.number().int().min(0).optional(),
  is_active: boolLike.optional(),
  locale: z.string().trim().min(2).max(8).optional().default('tr'),
  name: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional().nullable(),
});

const contentBodySchema = z.object({
  kind: z.enum(['digital', 'physical']),
  media_type: z.enum(['video', 'pdf', 'audio', 'image', 'other']).optional().nullable(),
  storage_asset_id: z.string().trim().max(64).optional().nullable(),
  external_url: z.string().trim().max(4000).optional().nullable(),
  is_preview: boolLike.optional(),
  display_order: z.coerce.number().int().min(0).optional().default(0),
  is_active: boolLike.optional(),
  locale: z.string().trim().min(2).max(8).optional().default('tr'),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional().nullable(),
});

type TaxonomyKind = 'series' | 'levels';

const taxonomyTables = {
  series: {
    base: 'product_series',
    i18n: 'product_series_i18n',
    idCol: 'series_id',
    orderCol: 'display_order',
    extraSelect: '',
    extraInsertCols: '',
    extraInsertValues: '',
    extraUpdate: '',
  },
  levels: {
    base: 'product_levels',
    i18n: 'product_level_i18n',
    idCol: 'level_id',
    orderCol: 'display_order',
    extraSelect: ', b.rank',
    extraInsertCols: ', rank',
    extraInsertValues: ', ?',
    extraUpdate: ', rank = ?',
  },
} as const;

async function listTaxonomy(kind: TaxonomyKind, locale: string) {
  const t = taxonomyTables[kind];
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT b.id, b.code, b.display_order, b.is_active${t.extraSelect},
             i.locale, i.name, i.slug, i.description
        FROM ${t.base} b
        LEFT JOIN ${t.i18n} i ON i.${t.idCol} = b.id AND i.locale = ?
       ORDER BY ${kind === 'levels' ? 'b.rank ASC,' : ''} b.display_order ASC, b.code ASC
    `,
    [locale],
  );
  return rows;
}

async function getTaxonomy(kind: TaxonomyKind, id: string, locale: string) {
  const t = taxonomyTables[kind];
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
      SELECT b.id, b.code, b.display_order, b.is_active${t.extraSelect},
             i.locale, i.name, i.slug, i.description
        FROM ${t.base} b
        LEFT JOIN ${t.i18n} i ON i.${t.idCol} = b.id AND i.locale = ?
       WHERE b.id = ?
       LIMIT 1
    `,
    [locale, id],
  );
  return rows[0] || null;
}

async function registerTaxonomyAdminRoutes(app: FastifyInstance, kind: TaxonomyKind) {
  const routeBase = kind === 'series' ? '/series' : '/levels';
  const t = taxonomyTables[kind];

  app.get(routeBase, async (req) => {
    const q = (req.query || {}) as { locale?: string };
    return listTaxonomy(kind, clean(q.locale).slice(0, 8) || 'tr');
  });

  app.get(`${routeBase}/:id`, async (req, reply) => {
    const { id } = req.params as { id: string };
    const q = (req.query || {}) as { locale?: string };
    const row = await getTaxonomy(kind, id, clean(q.locale).slice(0, 8) || 'tr');
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });

  app.post(routeBase, async (req, reply) => {
    const parsed = taxonomyBodySchema.safeParse(req.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ error: { message: 'validation_error', details: parsed.error.flatten() } });
    }
    const data = parsed.data;
    const id = randomUUID();
    const active = boolToTinyint(data.is_active, 1);
    const rankValues = kind === 'levels' ? [data.rank ?? data.display_order] : [];
    await pool.execute(
      `
        INSERT INTO ${t.base}
          (id, code, display_order, is_active, created_at, updated_at${t.extraInsertCols})
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)${t.extraInsertValues})
      `,
      [id, data.code, data.display_order, active, ...rankValues],
    );
    await pool.execute(
      `
        INSERT INTO ${t.i18n} (${t.idCol}, locale, name, slug, description)
        VALUES (?, ?, ?, ?, ?)
      `,
      [id, data.locale, data.name, data.slug, data.description || null],
    );
    return reply.code(201).send(await getTaxonomy(kind, id, data.locale));
  });

  app.patch(`${routeBase}/:id`, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = taxonomyBodySchema.partial().safeParse(req.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ error: { message: 'validation_error', details: parsed.error.flatten() } });
    }
    const data = parsed.data;
    const basePatches: string[] = [];
    const baseValues: Array<string | number> = [];
    if (data.code !== undefined) {
      basePatches.push('code = ?');
      baseValues.push(data.code);
    }
    if (data.display_order !== undefined) {
      basePatches.push('display_order = ?');
      baseValues.push(data.display_order);
    }
    if (data.is_active !== undefined) {
      basePatches.push('is_active = ?');
      baseValues.push(boolToTinyint(data.is_active));
    }
    if (kind === 'levels' && data.rank !== undefined) {
      basePatches.push('rank = ?');
      baseValues.push(data.rank);
    }
    if (basePatches.length) {
      await pool.execute(
        `UPDATE ${t.base} SET ${basePatches.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
        [...baseValues, id],
      );
    }

    const locale = data.locale || 'tr';
    if (data.name !== undefined || data.slug !== undefined || data.description !== undefined) {
      const current = await getTaxonomy(kind, id, locale);
      await pool.execute(
        `
          INSERT INTO ${t.i18n} (${t.idCol}, locale, name, slug, description)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            slug = VALUES(slug),
            description = VALUES(description)
        `,
        [
          id,
          locale,
          data.name ?? current?.name ?? '',
          data.slug ?? current?.slug ?? '',
          data.description ?? current?.description ?? null,
        ],
      );
    }

    const row = await getTaxonomy(kind, id, locale);
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });

  app.delete(`${routeBase}/:id`, async (req) => {
    const { id } = req.params as { id: string };
    await pool.execute(`DELETE FROM ${t.i18n} WHERE ${t.idCol} = ?`, [id]);
    await pool.execute(`DELETE FROM ${t.base} WHERE id = ?`, [id]);
    return { ok: true };
  });

  app.patch(`${routeBase}/:id/active`, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as { is_active?: unknown };
    await pool.execute(
      `UPDATE ${t.base} SET is_active = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [boolToTinyint(body.is_active), id],
    );
    const row = await getTaxonomy(kind, id, 'tr');
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return row;
  });
}

export async function registerCatalogAdmin(app: FastifyInstance) {
  await registerTaxonomyAdminRoutes(app, 'series');
  await registerTaxonomyAdminRoutes(app, 'levels');

  app.get('/products/:id/contents', async (req) => {
    const { id } = req.params as { id: string };
    const q = (req.query || {}) as { locale?: string };
    const locale = clean(q.locale).slice(0, 8) || 'tr';
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT pc.id, pc.product_id AS productId, pc.kind, pc.media_type AS mediaType,
               pc.storage_asset_id AS storageAssetId, pc.external_url AS externalUrl,
               pc.is_preview AS isPreview, pc.display_order AS displayOrder,
               pc.is_active AS isActive, pci.locale, pci.title, pci.description
          FROM product_contents pc
          LEFT JOIN product_content_i18n pci ON pci.content_id = pc.id AND pci.locale = ?
         WHERE pc.product_id = ?
         ORDER BY pc.display_order ASC, pc.created_at ASC
      `,
      [locale, id],
    );
    return rows;
  });

  app.post('/products/:id/contents', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = contentBodySchema.safeParse(req.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ error: { message: 'validation_error', details: parsed.error.flatten() } });
    }
    const data = parsed.data;
    const contentId = randomUUID();
    await pool.execute(
      `
        INSERT INTO product_contents
          (id, product_id, kind, media_type, storage_asset_id, external_url, is_preview,
           display_order, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
      `,
      [
        contentId,
        id,
        data.kind,
        data.kind === 'digital' ? data.media_type || 'other' : null,
        data.storage_asset_id || null,
        data.external_url || null,
        boolToTinyint(data.is_preview, 0),
        data.display_order,
        boolToTinyint(data.is_active, 1),
      ],
    );
    await pool.execute(
      `
        INSERT INTO product_content_i18n (content_id, locale, title, description)
        VALUES (?, ?, ?, ?)
      `,
      [contentId, data.locale, data.title, data.description || null],
    );
    return reply.code(201).send({ id: contentId, productId: id });
  });

  app.patch('/products/:id/contents/:contentId', async (req, reply) => {
    const { id, contentId } = req.params as { id: string; contentId: string };
    const parsed = contentBodySchema.partial().safeParse(req.body || {});
    if (!parsed.success) {
      return reply.code(422).send({ error: { message: 'validation_error', details: parsed.error.flatten() } });
    }
    const data = parsed.data;
    const patches: string[] = [];
    const values: Array<string | number | null> = [];
    if (data.kind !== undefined) {
      patches.push('kind = ?');
      values.push(data.kind);
    }
    if (data.media_type !== undefined) {
      patches.push('media_type = ?');
      values.push(data.media_type || null);
    }
    if (data.storage_asset_id !== undefined) {
      patches.push('storage_asset_id = ?');
      values.push(data.storage_asset_id || null);
    }
    if (data.external_url !== undefined) {
      patches.push('external_url = ?');
      values.push(data.external_url || null);
    }
    if (data.is_preview !== undefined) {
      patches.push('is_preview = ?');
      values.push(boolToTinyint(data.is_preview, 0));
    }
    if (data.display_order !== undefined) {
      patches.push('display_order = ?');
      values.push(data.display_order);
    }
    if (data.is_active !== undefined) {
      patches.push('is_active = ?');
      values.push(boolToTinyint(data.is_active, 1));
    }
    if (patches.length) {
      await pool.execute(
        `
          UPDATE product_contents
             SET ${patches.join(', ')}, updated_at = CURRENT_TIMESTAMP(3)
           WHERE id = ? AND product_id = ?
        `,
        [...values, contentId, id],
      );
    }

    const locale = data.locale || 'tr';
    if (data.title !== undefined || data.description !== undefined) {
      await pool.execute(
        `
          INSERT INTO product_content_i18n (content_id, locale, title, description)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description)
        `,
        [contentId, locale, data.title || '', data.description || null],
      );
    }
    return { ok: true };
  });

  app.delete('/products/:id/contents/:contentId', async (req) => {
    const { id, contentId } = req.params as { id: string; contentId: string };
    await pool.execute('DELETE FROM product_content_i18n WHERE content_id = ?', [contentId]);
    await pool.execute('DELETE FROM product_contents WHERE id = ? AND product_id = ?', [contentId, id]);
    return { ok: true };
  });
}
