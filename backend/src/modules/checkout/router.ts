import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';
import { createCheckoutForm, retrieveCheckoutForm } from '@shared/shared-backend/modules/payments';
import { env } from '@/core/env';
import { pool } from '@/db/client';

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
  items?: CheckoutItem[];
  notes?: string;
};

type ProductRow = RowDataPacket & {
  id: string;
  price: string;
  title: string;
  category_name: string | null;
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

function checkoutUrl(status: string, orderId?: string) {
  const base = env.FRONTEND_URL.replace(/\/$/, '');
  const params = new URLSearchParams({ payment: status });
  if (orderId) params.set('order', orderId);
  return `${base}/tr/store/checkout?${params.toString()}`;
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
    const q = (req.query || {}) as { locale?: string };
    const locale = clean(q.locale).slice(0, 8) || 'tr';
    const [rows] = await pool.execute(
      `
        SELECT p.id, p.price, p.image_url, p.stock_quantity, p.product_code,
               pi.locale, pi.title, pi.slug, pi.description, pi.alt,
               pi.meta_title, pi.meta_description
          FROM products p
          INNER JOIN product_i18n pi ON pi.product_id = p.id AND pi.locale = ?
         WHERE p.item_type = 'product'
           AND p.is_active = 1
         ORDER BY p.order_num ASC, p.created_at DESC
      `,
      [locale],
    );
    return rows;
  });

  app.get('/store/products/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const q = (req.query || {}) as { locale?: string };
    const locale = clean(q.locale).slice(0, 8) || 'tr';
    const [rows] = await pool.execute(
      `
        SELECT p.id, p.price, p.image_url, p.stock_quantity, p.product_code,
               pi.locale, pi.title, pi.slug, pi.description, pi.alt,
               pi.meta_title, pi.meta_description
          FROM products p
          INNER JOIN product_i18n pi ON pi.product_id = p.id AND pi.locale = ?
         WHERE pi.slug = ?
           AND p.item_type = 'product'
           AND p.is_active = 1
         LIMIT 1
      `,
      [locale, slug],
    );
    const [product] = rows as Record<string, unknown>[];
    if (!product) return reply.code(404).send({ error: { message: 'not_found' } });
    return product;
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

    await pool.execute(
      `
        INSERT INTO orders (id, dealer_id, status, total, notes, payment_status)
        VALUES (?, ?, 'pending', ?, ?, 'unpaid')
      `,
      [orderId, customerId, total.toFixed(2), clean(body.notes) || null],
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
      'SELECT id, payment_status FROM orders WHERE payment_ref = ? LIMIT 1',
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
}
