import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';
import {
  createCheckoutForm,
  retrieveCheckoutForm,
  createPaytrToken,
  verifyPaytrCallback,
  encodePaytrBasket,
  toPaytrCurrency,
} from '@shared/shared-backend/modules/payments';
import { env } from '@/core/env';
import { maskSecret } from '@/core/secretBox';
import { pool } from '@/db/client';
import {
  invalidatePaytrConfigCache,
  isPaytrUsable,
  loadPaytrConfig,
  savePaytrSettings,
} from './paytrConfig';

type CheckoutItem = {
  product_id?: string;
  quantity?: number;
};

type CheckoutBody = {
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
  shipping?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    country?: string;
  };
  items?: CheckoutItem[];
  notes?: string;
};

type ProductRow = RowDataPacket & {
  id: string;
  price: string;
  title: string;
  category_name: string | null;
  purchase_mode: 'online' | 'quote';
  access_duration_days: number | null;
  has_physical: number;
};

type OrderRow = RowDataPacket & {
  id: string;
  dealer_id: string;
  total: string;
  status: string;
  payment_status: string;
  payment_ref: string | null;
  email: string | null;
  full_name: string | null;
};

function badRequest(reply: FastifyReply, message: string) {
  return reply.code(400).send({ error: { message } });
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function checkoutUrl(status: string, orderId?: string, locale = 'tr') {
  const base = env.FRONTEND_URL.replace(/\/$/, '');
  const params = new URLSearchParams({ payment: status });
  if (orderId) params.set('order', orderId);
  return `${base}/${locale}/store/checkout?${params.toString()}`;
}

// Basarili odeme sonrasi dijital erisim haklarini tanimlar (iyzico + paytr ortak)
async function grantOrderEntitlements(orderId: string, dealerId: string) {
  const [items] = await pool.execute<RowDataPacket[]>(
    `
      SELECT oi.product_id, p.access_duration_days
        FROM order_items oi
        INNER JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?
    `,
    [orderId],
  );
  for (const item of items) {
    const durationDays = item.access_duration_days == null ? null : Number(item.access_duration_days);
    await pool.execute(
      `
        INSERT INTO user_entitlements
          (id, user_id, product_id, order_id, source, status, starts_at, expires_at, created_at, updated_at)
        VALUES (
          ?, ?, ?, ?, 'purchase', 'active', CURRENT_TIMESTAMP(3),
          ${durationDays == null ? 'NULL' : 'DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL ? DAY)'},
          CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
        )
        ON DUPLICATE KEY UPDATE
          order_id = VALUES(order_id),
          source = 'purchase',
          status = 'active',
          expires_at = ${
            durationDays == null
              ? 'NULL'
              : 'DATE_ADD(GREATEST(COALESCE(expires_at, CURRENT_TIMESTAMP(3)), CURRENT_TIMESTAMP(3)), INTERVAL ? DAY)'
          },
          updated_at = CURRENT_TIMESTAMP(3)
      `,
      durationDays == null
        ? [randomUUID(), dealerId, item.product_id, orderId]
        : [randomUUID(), dealerId, item.product_id, orderId, durationDays, durationDays],
    );
  }
}

// PayTR merchant_oid yalnizca alfanumerik olabilir — UUID tiresiz + 'WD' oneki (34 char, payment_ref CHAR(36))
function paytrMerchantOid(orderId: string) {
  return `WD${orderId.replace(/-/g, '')}`;
}

// PayTR yapilandirmasi artik admin panelden (site_settings) gelir, env yedektir.
// Bkz. ./paytrConfig.ts — kaynak sirasi ve fail-closed davranis orada.

async function logPaytrCallback(entry: {
  merchantOid?: string;
  status?: string;
  totalAmount?: string;
  sourceIp?: string;
  outcome: string;
  detail?: string;
  payload?: unknown;
}) {
  try {
    const amount = Number(entry.totalAmount);
    await pool.execute(
      `
        INSERT INTO paytr_callback_logs (id, merchant_oid, status, total_amount, source_ip, outcome, detail, payload)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        entry.merchantOid || null,
        entry.status || null,
        Number.isFinite(amount) ? (amount / 100).toFixed(2) : null,
        entry.sourceIp || null,
        entry.outcome,
        entry.detail ? entry.detail.slice(0, 500) : null,
        entry.payload ? JSON.stringify(entry.payload) : null,
      ],
    );
  } catch {
    // loglama callback akisini asla bozmaz
  }
}

async function ensureCustomer(customer: CheckoutBody['customer']) {
  const email = clean(customer?.email).toLowerCase();
  if (!email || !email.includes('@')) throw new Error('customer_email_required');

  const [existing] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  if (existing[0]?.id) return String(existing[0].id);

  const id = randomUUID();
  const fullName = clean(customer?.name) || email;
  const phone = clean(customer?.phone) || null;
  await pool.execute(
    `
      INSERT INTO users (id, email, password_hash, full_name, phone, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, 1, 0)
    `,
    [id, email, `checkout:${randomUUID()}`, fullName, phone],
  );
  await pool.execute(
    'INSERT IGNORE INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
    [randomUUID(), id, 'customer'],
  );
  await pool.execute(
    'INSERT IGNORE INTO profiles (id, full_name, phone, city, address_line1) VALUES (?, ?, ?, ?, ?)',
    [id, fullName, phone, clean(customer?.city) || null, clean(customer?.address) || null],
  );
  return id;
}

async function getProducts(items: CheckoutItem[], locale: string) {
  const ids = [...new Set(items.map((item) => clean(item.product_id)).filter(Boolean))];
  if (!ids.length) return new Map<string, ProductRow>();

  const placeholders = ids.map(() => '?').join(', ');
  const [rows] = await pool.execute<ProductRow[]>(
    `
        SELECT p.id, p.price, pi.title, ci.name AS category_name
             , p.purchase_mode, p.access_duration_days,
               EXISTS(
                 SELECT 1 FROM product_contents pc
                  WHERE pc.product_id = p.id AND pc.kind = 'physical' AND pc.is_active = 1
               ) AS has_physical
        FROM products p
        INNER JOIN product_i18n pi ON pi.product_id = p.id AND pi.locale = ?
        LEFT JOIN category_i18n ci ON ci.category_id = p.category_id AND ci.locale = ?
       WHERE p.id IN (${placeholders})
         AND p.item_type = 'product'
         AND p.is_active = 1
    `,
    [locale, locale, ...ids],
  );
  return new Map(rows.map((row) => [row.id, row]));
}

export async function registerCheckoutPublic(app: FastifyInstance) {
  app.get('/store/products', async (req) => {
    const q = (req.query || {}) as {
      locale?: string;
      category?: string;
      series?: string;
      level?: string;
      isFree?: string;
    };
    const locale = clean(q.locale).slice(0, 8) || 'tr';
    const filters: string[] = [];
    const params: Array<string | number> = [locale, locale, locale, locale];
    const category = clean(q.category);
    const series = clean(q.series);
    const level = clean(q.level);
    const isFree = clean(q.isFree);
    if (category) {
      filters.push('(p.category_id = ? OR ci.slug = ?)');
      params.push(category, category);
    }
    if (series) {
      filters.push('(p.series_id = ? OR psi.slug = ? OR ps.code = ?)');
      params.push(series, series, series);
    }
    if (level) {
      filters.push('(p.level_id = ? OR pli.slug = ? OR pl.code = ?)');
      params.push(level, level, level);
    }
    if (isFree) {
      filters.push('p.is_free = ?');
      params.push(isFree === '1' || isFree === 'true' ? 1 : 0);
    }
    const [rows] = await pool.execute(
      `
        SELECT p.id, p.price, p.image_url AS imageUrl, p.video_url AS videoUrl, p.stock_quantity AS stockQuantity,
               p.product_code AS productCode, p.purchase_mode AS purchaseMode,
               p.is_free AS isFree, p.access_duration_days AS accessDurationDays,
               EXISTS(
                 SELECT 1 FROM product_contents pc
                  WHERE pc.product_id = p.id AND pc.kind = 'physical' AND pc.is_active = 1
               ) AS hasPhysical,
               pi.locale, pi.title, pi.slug, pi.description, pi.alt,
               pi.meta_title AS metaTitle, pi.meta_description AS metaDescription,
               ci.slug AS categorySlug, ci.name AS categoryName,
               psi.slug AS seriesSlug, psi.name AS seriesName,
               pli.slug AS levelSlug, pli.name AS levelName, pl.rank AS levelRank
          FROM products p
          INNER JOIN product_i18n pi ON pi.product_id = p.id AND pi.locale = ?
          LEFT JOIN category_i18n ci ON ci.category_id = p.category_id AND ci.locale = ?
          LEFT JOIN product_series ps ON ps.id = p.series_id
          LEFT JOIN product_series_i18n psi ON psi.series_id = p.series_id AND psi.locale = ?
          LEFT JOIN product_levels pl ON pl.id = p.level_id
          LEFT JOIN product_level_i18n pli ON pli.level_id = p.level_id AND pli.locale = ?
         WHERE p.item_type = 'product'
           AND p.is_active = 1
           ${filters.length ? `AND ${filters.join(' AND ')}` : ''}
         ORDER BY p.order_num ASC, p.created_at DESC
      `,
      params,
    );
    return rows;
  });

  app.get('/store/products/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const q = (req.query || {}) as { locale?: string };
    const locale = clean(q.locale).slice(0, 8) || 'tr';
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT p.id, p.price, p.image_url AS imageUrl, p.video_url AS videoUrl, p.stock_quantity AS stockQuantity,
               p.product_code AS productCode, p.purchase_mode AS purchaseMode,
               p.is_free AS isFree, p.access_duration_days AS accessDurationDays,
               EXISTS(
                 SELECT 1 FROM product_contents pc
                  WHERE pc.product_id = p.id AND pc.kind = 'physical' AND pc.is_active = 1
               ) AS hasPhysical,
               pi.locale, pi.title, pi.slug, pi.description, pi.alt,
               pi.meta_title AS metaTitle, pi.meta_description AS metaDescription,
               ci.slug AS categorySlug, ci.name AS categoryName,
               psi.slug AS seriesSlug, psi.name AS seriesName,
               pli.slug AS levelSlug, pli.name AS levelName, pl.rank AS levelRank
          FROM products p
          INNER JOIN product_i18n pi ON pi.product_id = p.id AND pi.locale = ?
          LEFT JOIN category_i18n ci ON ci.category_id = p.category_id AND ci.locale = ?
          LEFT JOIN product_series_i18n psi ON psi.series_id = p.series_id AND psi.locale = ?
          LEFT JOIN product_levels pl ON pl.id = p.level_id
          LEFT JOIN product_level_i18n pli ON pli.level_id = p.level_id AND pli.locale = ?
         WHERE pi.slug = ?
           AND p.item_type = 'product'
           AND p.is_active = 1
         LIMIT 1
      `,
      [locale, locale, locale, locale, slug],
    );
    const [product] = rows as Record<string, unknown>[];
    if (!product) return reply.code(404).send({ error: { message: 'not_found' } });
    const [contents] = await pool.execute<RowDataPacket[]>(
      `
        SELECT pc.id, pc.kind, pc.media_type AS mediaType, pci.title, pci.description,
               pc.is_preview AS isPreview, pc.display_order AS displayOrder
          FROM product_contents pc
          INNER JOIN product_content_i18n pci ON pci.content_id = pc.id AND pci.locale = ?
         WHERE pc.product_id = ?
           AND pc.is_active = 1
         ORDER BY pc.display_order ASC
      `,
      [locale, String(product.id)],
    );
    return { ...product, contents };
  });

  app.post('/checkout/orders', async (req, reply) => {
    const body = (req.body || {}) as CheckoutBody;
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return badRequest(reply, 'items_required');

    let customerId: string;
    try {
      customerId = await ensureCustomer(body.customer);
    } catch {
      return badRequest(reply, 'customer_email_required');
    }

    const locale = clean((req.headers['x-locale'] as string | undefined) || 'tr').slice(0, 8) || 'tr';
    const products = await getProducts(items, locale);
    const orderId = randomUUID();
    let total = 0;
    const orderItems: Array<[string, string, string, number, string, string]> = [];

    for (const item of items) {
      const productId = clean(item.product_id);
      const product = products.get(productId);
      if (!product) return badRequest(reply, 'product_not_found');
      if (product.purchase_mode !== 'online') return badRequest(reply, 'product_not_available_online');
      const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * quantity;
      total += lineTotal;
      orderItems.push([
        randomUUID(),
        orderId,
        productId,
        quantity,
        unitPrice.toFixed(2),
        lineTotal.toFixed(2),
      ]);
    }

    const hasPhysical = [...products.values()].some((product) => Number(product.has_physical) === 1);
    const shipping = body.shipping || {};
    const shippingName = clean(shipping.name) || clean(body.customer?.name);
    const shippingPhone = clean(shipping.phone) || clean(body.customer?.phone);
    const shippingAddress = clean(shipping.address) || clean(body.customer?.address);
    const shippingCity = clean(shipping.city) || clean(body.customer?.city);
    const shippingDistrict = clean(shipping.district);
    const shippingPostalCode = clean(shipping.postalCode);
    const shippingCountry = clean(shipping.country) || 'TR';
    if (hasPhysical && (!shippingName || !shippingPhone || !shippingAddress || !shippingCity)) {
      return badRequest(reply, 'shipping_address_required');
    }

    await pool.execute(
      `
        INSERT INTO orders (
          id, dealer_id, status, total, notes, payment_status,
          shipping_name, shipping_phone, shipping_address, shipping_city,
          shipping_district, shipping_postal_code, shipping_country
        )
        VALUES (?, ?, 'pending', ?, ?, 'unpaid', ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        customerId,
        total.toFixed(2),
        clean(body.notes) || null,
        shippingName || null,
        shippingPhone || null,
        shippingAddress || null,
        shippingCity || null,
        shippingDistrict || null,
        shippingPostalCode || null,
        shippingCountry,
      ],
    );

    for (const row of orderItems) {
      await pool.execute(
        `
          INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        row,
      );
    }

    return reply.code(201).send({ id: orderId, total: total.toFixed(2), payment_status: 'unpaid' });
  });

  app.post('/checkout/orders/:id/iyzipay/initiate', async (req: FastifyRequest, reply) => {
    if (!env.FEATURE_IYZICO_PAYMENT) {
      return reply.code(503).send({ error: { message: 'iyzico_feature_disabled' } });
    }
    if (!env.IYZICO_API_KEY || !env.IYZICO_SECRET_KEY) {
      return reply.code(503).send({ error: { message: 'iyzico_not_configured' } });
    }

    const { id } = req.params as { id: string };
    const [orderRows] = await pool.execute<OrderRow[]>(
      `
        SELECT o.id, o.dealer_id, o.total, o.status, o.payment_status, o.payment_ref,
               u.email, u.full_name
          FROM orders o
          INNER JOIN users u ON u.id = o.dealer_id
         WHERE o.id = ?
         LIMIT 1
      `,
      [id],
    );
    const order = orderRows[0];
    if (!order) return reply.code(404).send({ error: { message: 'not_found' } });
    if (order.status === 'cancelled') return badRequest(reply, 'order_cancelled');
    if (order.payment_status === 'paid') return badRequest(reply, 'already_paid');

    const [itemRows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT oi.product_id, oi.total_price, pi.title
          FROM order_items oi
          LEFT JOIN product_i18n pi ON pi.product_id = oi.product_id AND pi.locale = 'tr'
         WHERE oi.order_id = ?
      `,
      [id],
    );
    if (!itemRows.length) return badRequest(reply, 'order_has_no_items');

    const paymentRef = randomUUID();
    const amount = Number(order.total).toFixed(2);
    await pool.execute(
      `
        UPDATE orders
           SET payment_ref = ?, payment_method = 'iyzico', payment_status = 'pending',
               updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
      `,
      [paymentRef, id],
    );
    await pool.execute(
      `
        INSERT INTO payment_attempts (id, order_id, payment_ref, provider, status, amount, request_payload)
        VALUES (?, ?, ?, 'iyzico', 'pending', ?, ?)
      `,
      [randomUUID(), id, paymentRef, amount, JSON.stringify({ source: 'public_checkout' })],
    );

    const rawIp =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.ip ||
      '127.0.0.1';
    const buyerIp = rawIp === '::1' || rawIp === '::ffff:127.0.0.1' ? '127.0.0.1' : rawIp;
    const nameParts = (order.full_name || 'Woody Musteri').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Woody';
    const lastName = nameParts.slice(1).join(' ') || 'Musteri';
    const callbackUrl = `${env.PUBLIC_URL.replace(/\/$/, '')}/api/v1/checkout/iyzipay/callback`;

    const checkout = await createCheckoutForm(
      { apiKey: env.IYZICO_API_KEY, secretKey: env.IYZICO_SECRET_KEY, uri: env.IYZICO_BASE_URL },
      {
        locale: 'tr',
        conversationId: paymentRef,
        price: amount,
        paidPrice: amount,
        currency: 'TRY',
        basketId: id,
        paymentGroup: 'PRODUCT',
        callbackUrl,
        enabledInstallments: [1],
        buyer: {
          id: order.dealer_id,
          name: firstName,
          surname: lastName,
          email: order.email || 'checkout@example.com',
          identityNumber: '11111111111',
          registrationAddress: 'Turkiye',
          city: 'Istanbul',
          country: 'Turkey',
          ip: buyerIp,
        },
        shippingAddress: {
          contactName: `${firstName} ${lastName}`,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Turkiye',
        },
        billingAddress: {
          contactName: `${firstName} ${lastName}`,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Turkiye',
        },
        basketItems: itemRows.map((item) => ({
          id: String(item.product_id),
          name: String(item.title || item.product_id),
          category1: 'Woody Store',
          itemType: 'PHYSICAL' as const,
          price: Number(item.total_price).toFixed(2),
        })),
      },
    );

    if (checkout.status !== 'success' || !checkout.checkoutFormContent) {
      await pool.execute(
        `
          UPDATE orders SET payment_status = 'failed', payment_ref = NULL WHERE id = ?
        `,
        [id],
      );
      await pool.execute(
        `
          UPDATE payment_attempts
             SET status = 'failed', response_payload = ?, last_error = ?
           WHERE payment_ref = ?
        `,
        [JSON.stringify(checkout), checkout.errorMessage || 'iyzico_init_failed', paymentRef],
      );
      return reply.code(502).send({ error: { message: 'iyzico_init_failed' } });
    }

    return {
      provider: 'iyzico',
      checkoutFormContent: checkout.checkoutFormContent,
      token: checkout.token,
      conversationId: paymentRef,
      amount: Number(amount),
    };
  });

  app.post('/checkout/iyzipay/callback', async (req, reply) => {
    const body = (req.body || {}) as Record<string, string>;
    const token = body.token;
    const conversationId = body.conversationId;
    if (!token || !conversationId) return reply.redirect(checkoutUrl('fail'));

    const [rows] = await pool.execute<OrderRow[]>(
      'SELECT id, dealer_id, payment_status FROM orders WHERE payment_ref = ? LIMIT 1',
      [conversationId],
    );
    const order = rows[0];
    if (!order) return reply.redirect(checkoutUrl('fail'));
    if (order.payment_status === 'paid') return reply.redirect(checkoutUrl('success', order.id));

    const detail = await retrieveCheckoutForm(
      { apiKey: env.IYZICO_API_KEY, secretKey: env.IYZICO_SECRET_KEY, uri: env.IYZICO_BASE_URL },
      token,
      conversationId,
    );
    const paid =
      detail.status === 'success' &&
      detail.paymentStatus === 'SUCCESS' &&
      (detail.fraudStatus ?? 0) === 1;

    await pool.execute(
      `
        UPDATE orders
           SET payment_status = ?, status = ?, updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
      `,
      [paid ? 'paid' : 'failed', paid ? 'confirmed' : 'pending', order.id],
    );
    if (paid) {
      await grantOrderEntitlements(order.id, order.dealer_id);
    }
    await pool.execute(
      `
        UPDATE payment_attempts
           SET status = ?, callback_payload = ?, updated_at = CURRENT_TIMESTAMP(3)
         WHERE payment_ref = ?
      `,
      [paid ? 'succeeded' : 'failed', JSON.stringify(detail), conversationId],
    );

    return reply.redirect(checkoutUrl(paid ? 'success' : 'fail', order.id));
  });

  // ============ PayTR (REVIZE 2026-08-30) ============
  // QuickEcommerce PayTRService mimarisinin portu — iFrame API.

  app.post('/checkout/orders/:id/paytr/initiate', async (req: FastifyRequest, reply) => {
    const paytr = await loadPaytrConfig();
    if (!paytr.enabled) {
      return reply.code(503).send({ error: { message: 'paytr_feature_disabled' } });
    }
    if (!isPaytrUsable(paytr)) {
      return reply.code(503).send({ error: { message: 'paytr_not_configured' } });
    }
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as { locale?: string };
    const locale = clean(body.locale).slice(0, 8) || 'tr';

    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT o.id, o.dealer_id, o.total, o.status, o.payment_status,
               o.shipping_name, o.shipping_phone, o.shipping_address, o.shipping_city,
               u.email AS customer_email, u.full_name AS customer_name
          FROM orders o
          INNER JOIN users u ON u.id = o.dealer_id
         WHERE o.id = ?
         LIMIT 1
      `,
      [id],
    );
    const order = rows[0];
    if (!order) return reply.code(404).send({ error: { message: 'order_not_found' } });
    if (order.payment_status === 'paid') return badRequest(reply, 'already_paid');

    const totalKurus = Math.round(Number(order.total) * 100);
    if (!Number.isFinite(totalKurus) || totalKurus <= 0) return badRequest(reply, 'invalid_total');

    const [itemRows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT oi.quantity, oi.unit_price, pi.title
          FROM order_items oi
          LEFT JOIN product_i18n pi ON pi.product_id = oi.product_id AND pi.locale = ?
         WHERE oi.order_id = ?
      `,
      [locale, id],
    );
    const basket = encodePaytrBasket(
      itemRows.map((item) => ({
        name: String(item.title || 'Set'),
        priceKurus: Math.round(Number(item.unit_price) * 100),
        quantity: Number(item.quantity) || 1,
      })),
    );

    const merchantOid = paytrMerchantOid(id);
    await pool.execute(
      `
        UPDATE orders
           SET payment_ref = ?, payment_method = 'paytr', payment_status = 'pending',
               updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
      `,
      [merchantOid, id],
    );
    await pool.execute(
      `
        INSERT INTO payment_attempts (id, order_id, payment_ref, provider, status, amount, request_payload)
        VALUES (?, ?, ?, 'paytr', 'pending', ?, ?)
        ON DUPLICATE KEY UPDATE
          status = 'pending', updated_at = CURRENT_TIMESTAMP(3)
      `,
      [randomUUID(), id, merchantOid, Number(order.total).toFixed(2), JSON.stringify({ source: 'public_checkout', locale })],
    );

    try {
      const result = await createPaytrToken(
        {
          merchantId: paytr.merchantId,
          merchantKey: paytr.merchantKey,
          merchantSalt: paytr.merchantSalt,
          testMode: paytr.testMode,
        },
        {
          merchantOid,
          email: String(order.customer_email || ''),
          paymentAmountKurus: totalKurus,
          userIp: req.ip || '127.0.0.1',
          userBasket: basket,
          currency: toPaytrCurrency('TRY'),
          okUrl: checkoutUrl('success', id, locale),
          failUrl: checkoutUrl('failed', id, locale),
          userName: String(order.shipping_name || order.customer_name || ''),
          userAddress: [order.shipping_address, order.shipping_city].filter(Boolean).join(', '),
          userPhone: String(order.shipping_phone || ''),
          lang: locale === 'tr' ? 'tr' : 'en',
        },
      );
      return { provider: 'paytr', token: result.token, iframeUrl: result.iframeUrl, merchantOid };
    } catch (error) {
      await pool.execute(
        `
          UPDATE payment_attempts
             SET status = 'failed', last_error = ?, updated_at = CURRENT_TIMESTAMP(3)
           WHERE payment_ref = ?
        `,
        [String((error as Error).message || 'paytr_init_failed').slice(0, 500), merchantOid],
      );
      await pool.execute(
        "UPDATE orders SET payment_status = 'failed' WHERE id = ? AND payment_status = 'pending'",
        [id],
      );
      return reply.code(502).send({ error: { message: 'paytr_init_failed' } });
    }
  });

  // PayTR server-to-server bildirimi — auth YOK, yanit DAIMA duz metin "OK"
  // (aksi halde PayTR bildirimi tekrar tekrar gonderir).
  app.post('/checkout/paytr/callback', async (req, reply) => {
    const payload = (req.body || {}) as Record<string, string>;
    const base = {
      merchantOid: payload.merchant_oid,
      status: payload.status,
      totalAmount: payload.total_amount,
      sourceIp: req.ip,
      payload,
    };

    const paytr = await loadPaytrConfig();
    if (!isPaytrUsable(paytr)) {
      await logPaytrCallback({ ...base, outcome: 'feature_disabled' });
      return reply.type('text/plain').send('OK');
    }

    const verification = verifyPaytrCallback(
      { merchantKey: paytr.merchantKey, merchantSalt: paytr.merchantSalt },
      payload,
    );
    if (!verification.verified) {
      // Dogrulanamayan istek siparise DOKUNMAZ ama loglanir; yine OK doneriz.
      await logPaytrCallback({ ...base, outcome: 'hash_mismatch', detail: 'HMAC dogrulamasi basarisiz' });
      return reply.type('text/plain').send('OK');
    }

    const [rows] = await pool.execute<OrderRow[]>(
      'SELECT id, dealer_id, payment_status FROM orders WHERE payment_ref = ? LIMIT 1',
      [verification.merchantOid],
    );
    const order = rows[0];
    if (!order) {
      await logPaytrCallback({ ...base, outcome: 'order_not_found' });
      return reply.type('text/plain').send('OK');
    }
    if (order.payment_status === 'paid') {
      // Idempotent: ayni bildirim ikinci kez islenmez
      await logPaytrCallback({ ...base, outcome: 'duplicate', detail: `order: ${order.id}` });
      return reply.type('text/plain').send('OK');
    }

    const paid = verification.status === 'success';
    await pool.execute(
      `
        UPDATE orders
           SET payment_status = ?, status = ?, updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?
      `,
      [paid ? 'paid' : 'failed', paid ? 'confirmed' : 'pending', order.id],
    );
    if (paid) {
      await grantOrderEntitlements(order.id, order.dealer_id);
    }
    await pool.execute(
      `
        UPDATE payment_attempts
           SET status = ?, callback_payload = ?, updated_at = CURRENT_TIMESTAMP(3)
         WHERE payment_ref = ?
      `,
      [paid ? 'succeeded' : 'failed', JSON.stringify(payload), verification.merchantOid],
    );
    await logPaytrCallback({ ...base, outcome: 'processed', detail: `order: ${order.id} -> ${paid ? 'paid' : 'failed'}` });

    return reply.type('text/plain').send('OK');
  });
}

// Admin: PayTR callback loglari (SSH'siz izleme) — QE paytr-logs ekraninin API'si
export async function registerCheckoutAdmin(app: FastifyInstance) {
  app.get('/paytr/callback-logs', async (req) => {
    const q = (req.query || {}) as { page?: string; limit?: string; outcome?: string; merchant_oid?: string };
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(q.limit) || 25));
    const filters: string[] = [];
    const params: Array<string | number> = [];
    if (clean(q.outcome)) {
      filters.push('outcome = ?');
      params.push(clean(q.outcome));
    }
    if (clean(q.merchant_oid)) {
      filters.push('merchant_oid = ?');
      params.push(clean(q.merchant_oid));
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT id, merchant_oid, status, total_amount, source_ip, outcome, detail, received_at
          FROM paytr_callback_logs
          ${where}
         ORDER BY received_at DESC
         LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `,
      params,
    );
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM paytr_callback_logs ${where}`,
      params,
    );
    return { items: rows, total: Number(countRows[0]?.total || 0), page, limit };
  });

  app.get('/paytr/callback-logs/stats', async () => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
        SELECT outcome, COUNT(*) AS count
          FROM paytr_callback_logs
         GROUP BY outcome
         ORDER BY count DESC
      `,
    );
    return { outcomes: rows };
  });

  // ---------- PayTR magaza ayarlari (admin panel) ----------
  // Sirlar DB'de sifreli durur; buradan ASLA duz metin donmez, yalniz maske.

  app.get('/paytr/settings', async () => {
    const config = await loadPaytrConfig();
    return {
      enabled: config.enabled,
      testMode: config.testMode,
      merchantId: config.merchantId,
      hasMerchantKey: Boolean(config.merchantKey),
      hasMerchantSalt: Boolean(config.merchantSalt),
      merchantKeyPreview: maskSecret(config.merchantKey),
      merchantSaltPreview: maskSecret(config.merchantSalt),
      ready: isPaytrUsable(config),
      source: config.source,
      decryptFailed: config.decryptFailed,
      callbackUrl: `${env.FRONTEND_URL.replace(/\/$/, '')}/api/v1/checkout/paytr/callback`,
    };
  });

  app.put('/paytr/settings', async (req, reply) => {
    const body = (req.body || {}) as Record<string, unknown>;

    const asBool = (value: unknown) =>
      typeof value === 'boolean' ? value : value === 'true' ? true : value === 'false' ? false : undefined;

    const merchantId = typeof body.merchantId === 'string' ? body.merchantId.trim() : undefined;
    if (merchantId !== undefined && merchantId && !/^[0-9]{3,20}$/.test(merchantId)) {
      return reply.code(400).send({ error: { message: 'merchant_id_invalid' } });
    }

    const config = await savePaytrSettings({
      enabled: asBool(body.enabled),
      testMode: asBool(body.testMode),
      merchantId,
      merchantKey: typeof body.merchantKey === 'string' ? body.merchantKey : undefined,
      merchantSalt: typeof body.merchantSalt === 'string' ? body.merchantSalt : undefined,
    });

    return {
      enabled: config.enabled,
      testMode: config.testMode,
      merchantId: config.merchantId,
      hasMerchantKey: Boolean(config.merchantKey),
      hasMerchantSalt: Boolean(config.merchantSalt),
      merchantKeyPreview: maskSecret(config.merchantKey),
      merchantSaltPreview: maskSecret(config.merchantSalt),
      ready: isPaytrUsable(config),
      source: config.source,
      decryptFailed: config.decryptFailed,
    };
  });

  // Cache'i elle bosalt — DB'ye disaridan mudahale edildiginde 30sn beklenmesin.
  app.post('/paytr/settings/refresh', async () => {
    invalidatePaytrConfigCache();
    const config = await loadPaytrConfig();
    return { ready: isPaytrUsable(config), source: config.source };
  });
}
