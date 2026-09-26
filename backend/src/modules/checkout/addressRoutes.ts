// =============================================================
// Adres defteri + harita tamamlama + yönetici adres düzeltme (2026-09-26).
// Public (üye): /checkout/address-book[/:id], /geo/search, /geo/reverse
// Admin: /orders/:id/addresses[/:type], /users/:id/addresses, /customer-addresses/:id
// =============================================================
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'crypto';

import { requireAuth, type JwtUser } from '@shared/shared-backend/middleware/auth';
import { pool } from '@/db/client';
import { AddressError, normalizeAddress, normalizeBilling } from './addresses';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  normalizeBookEntry,
  updateAddress,
  type AddressBookInput,
} from './addressBook';
import { geoReverse, geoSearch } from './geo';

const UUID_RE = /^[0-9a-f-]{36}$/i;

function geoUserAgent() {
  const app = (process.env.APP_NAME || process.env.NEXT_PUBLIC_APP_NAME || 'site').trim();
  const site = (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || '').trim();
  return `${app} address-autocomplete${site ? ` (${site})` : ''}`;
}

function userIdOf(req: FastifyRequest) {
  return String((req as unknown as { user?: JwtUser }).user?.sub || '');
}

function fail(reply: FastifyReply, error: unknown) {
  if (error instanceof AddressError) return reply.code(400).send({ error: { message: error.message } });
  throw error;
}

export async function registerAddressRoutesPublic(app: FastifyInstance) {
  app.get('/checkout/address-book', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = userIdOf(req);
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email, full_name, phone FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
      [userId],
    );
    if (!users[0]) return reply.code(401).send({ error: { message: 'login_required' } });
    return {
      account: {
        email: String(users[0].email ?? ''),
        name: String(users[0].full_name ?? ''),
        phone: String(users[0].phone ?? ''),
      },
      addresses: await listAddresses(userId),
    };
  });

  app.post('/checkout/address-book', { preHandler: [requireAuth] }, async (req, reply) => {
    try {
      const id = await createAddress(userIdOf(req), normalizeBookEntry((req.body ?? {}) as AddressBookInput));
      return reply.code(201).send({ id, addresses: await listAddresses(userIdOf(req)) });
    } catch (error) {
      return fail(reply, error);
    }
  });

  app.put('/checkout/address-book/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!UUID_RE.test(id)) return reply.code(400).send({ error: { message: 'invalid_id' } });
    try {
      const ok = await updateAddress(id, normalizeBookEntry((req.body ?? {}) as AddressBookInput), userIdOf(req));
      if (!ok) return reply.code(404).send({ error: { message: 'not_found' } });
      return { id, addresses: await listAddresses(userIdOf(req)) };
    } catch (error) {
      return fail(reply, error);
    }
  });

  app.delete('/checkout/address-book/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!UUID_RE.test(id)) return reply.code(400).send({ error: { message: 'invalid_id' } });
    const ok = await deleteAddress(id, userIdOf(req));
    if (!ok) return reply.code(404).send({ error: { message: 'not_found' } });
    return { addresses: await listAddresses(userIdOf(req)) };
  });

  app.get('/geo/search', async (req, reply) => {
    const { q } = (req.query ?? {}) as { q?: string };
    try {
      return { results: await geoSearch(String(q ?? ''), geoUserAgent()) };
    } catch (err) {
      req.log.warn({ err, event: 'geo_search_failed' }, 'geo_search_failed');
      return reply.code(502).send({ error: { message: 'geo_unavailable' } });
    }
  });

  app.get('/geo/reverse', async (req, reply) => {
    const { lat, lon } = (req.query ?? {}) as { lat?: string; lon?: string };
    try {
      return { results: await geoReverse(Number(lat), Number(lon), geoUserAgent()) };
    } catch (err) {
      req.log.warn({ err, event: 'geo_reverse_failed' }, 'geo_reverse_failed');
      return reply.code(502).send({ error: { message: 'geo_unavailable' } });
    }
  });
}

type OrderAddressBody = AddressBookInput;

export async function registerAddressRoutesAdmin(app: FastifyInstance) {
  app.get('/orders/:id/addresses', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!UUID_RE.test(id)) return reply.code(400).send({ error: { message: 'invalid_id' } });
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM order_addresses WHERE order_id = ?', [id]);
    const [orders] = await pool.execute<RowDataPacket[]>('SELECT dealer_id FROM orders WHERE id = ? LIMIT 1', [id]);
    if (!orders[0]) return reply.code(404).send({ error: { message: 'not_found' } });
    const dto = (type: string) => {
      const row = rows.find((item) => item.type === type);
      if (!row) return null;
      return {
        name: String(row.full_name ?? ''),
        phone: String(row.phone ?? ''),
        address: String(row.address ?? ''),
        district: String(row.district ?? ''),
        city: String(row.city ?? ''),
        postalCode: String(row.postal_code ?? ''),
        country: String(row.country ?? 'TR'),
        invoiceType: row.invoice_type === 'corporate' ? 'corporate' : 'individual',
        identityNumber: String(row.identity_number ?? ''),
        companyName: String(row.company_name ?? ''),
        taxOffice: String(row.tax_office ?? ''),
        taxNumber: String(row.tax_number ?? ''),
      };
    };
    return { customerId: String(orders[0].dealer_id), shipping: dto('shipping'), billing: dto('billing') };
  });

  // Sipariş adresini düzelt: order_addresses + (teslimatta) orders.shipping_* birlikte güncellenir.
  app.put('/orders/:id/addresses/:type', async (req, reply) => {
    const { id, type } = req.params as { id: string; type: string };
    if (!UUID_RE.test(id) || !['shipping', 'billing'].includes(type)) {
      return reply.code(400).send({ error: { message: 'invalid_request' } });
    }
    const [orders] = await pool.execute<RowDataPacket[]>('SELECT id FROM orders WHERE id = ? LIMIT 1', [id]);
    if (!orders[0]) return reply.code(404).send({ error: { message: 'not_found' } });
    const body = (req.body ?? {}) as OrderAddressBody;
    try {
      const value =
        type === 'shipping'
          ? { ...normalizeAddress(body, true)!, invoiceType: null, identityNumber: '', companyName: '', taxOffice: '', taxNumber: '' }
          : normalizeBilling({ ...body, sameAsShipping: false }, null);
      await pool.execute(
        `INSERT INTO order_addresses (id, order_id, type, invoice_type, full_name, company_name, tax_office,
           tax_number, identity_number, phone, address, district, city, postal_code, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE invoice_type = VALUES(invoice_type), full_name = VALUES(full_name),
           company_name = VALUES(company_name), tax_office = VALUES(tax_office), tax_number = VALUES(tax_number),
           identity_number = VALUES(identity_number), phone = VALUES(phone), address = VALUES(address),
           district = VALUES(district), city = VALUES(city), postal_code = VALUES(postal_code), country = VALUES(country)`,
        [
          randomUUID(), id, type, value.invoiceType, value.fullName || null, value.companyName || null,
          value.taxOffice || null, value.taxNumber || null, value.identityNumber || null, value.phone || null,
          value.address, value.district || null, value.city, value.postalCode || null, value.country || 'TR',
        ],
      );
      if (type === 'shipping') {
        await pool.execute(
          `UPDATE orders SET shipping_name = ?, shipping_phone = ?, shipping_address = ?, shipping_city = ?,
             shipping_district = ?, shipping_postal_code = ?, shipping_country = ? WHERE id = ?`,
          [value.fullName, value.phone, value.address, value.city, value.district || null, value.postalCode || null, value.country || 'TR', id],
        );
      }
      req.log.info({ event: 'order_address_updated', orderId: id, type }, 'order_address_updated');
      return { ok: true };
    } catch (error) {
      return fail(reply, error);
    }
  });

  app.get('/users/:id/addresses', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!UUID_RE.test(id)) return reply.code(400).send({ error: { message: 'invalid_id' } });
    return { addresses: await listAddresses(id) };
  });

  app.post('/users/:id/addresses', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!UUID_RE.test(id)) return reply.code(400).send({ error: { message: 'invalid_id' } });
    try {
      await createAddress(id, normalizeBookEntry((req.body ?? {}) as AddressBookInput));
      return reply.code(201).send({ addresses: await listAddresses(id) });
    } catch (error) {
      return fail(reply, error);
    }
  });

  app.put('/customer-addresses/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!UUID_RE.test(id)) return reply.code(400).send({ error: { message: 'invalid_id' } });
    try {
      const ok = await updateAddress(id, normalizeBookEntry((req.body ?? {}) as AddressBookInput));
      return ok ? { ok: true } : reply.code(404).send({ error: { message: 'not_found' } });
    } catch (error) {
      return fail(reply, error);
    }
  });

  app.delete('/customer-addresses/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!UUID_RE.test(id)) return reply.code(400).send({ error: { message: 'invalid_id' } });
    const ok = await deleteAddress(id);
    return ok ? { ok: true } : reply.code(404).send({ error: { message: 'not_found' } });
  });
}
