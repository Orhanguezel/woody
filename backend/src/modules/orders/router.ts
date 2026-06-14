import type { FastifyInstance, FastifyReply } from 'fastify';
import { pool } from '@/db/client';

const ORDER_STATUSES = new Set(['pending', 'confirmed', 'shipped', 'completed', 'cancelled']);
const PAYMENT_STATUSES = new Set(['unpaid', 'pending', 'paid', 'failed', 'refunded']);

type OrderUpdateBody = {
  status?: string;
  payment_status?: string;
  admin_note?: string | null;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_district?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  shipping_carrier?: string | null;
  shipping_tracking_no?: string | null;
  shipped_at?: string | null;
};

function badRequest(reply: FastifyReply, message: string) {
  return reply.code(400).send({ error: { message } });
}

function nullable(value: unknown) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || null;
}

export async function registerOrdersProjectAdmin(app: FastifyInstance) {
  app.patch('/orders/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as OrderUpdateBody;
    const patches: string[] = [];
    const values: Array<string | null> = [];

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.has(body.status)) return badRequest(reply, 'invalid_status');
      patches.push('status = ?');
      values.push(body.status);
    }

    if (body.payment_status !== undefined) {
      if (!PAYMENT_STATUSES.has(body.payment_status)) {
        return badRequest(reply, 'invalid_payment_status');
      }
      patches.push('payment_status = ?');
      values.push(body.payment_status);
    }

    if (body.admin_note !== undefined) {
      patches.push('notes = ?');
      values.push(nullable(body.admin_note));
    }

    const shippingFields = [
      'shipping_name',
      'shipping_phone',
      'shipping_address',
      'shipping_city',
      'shipping_district',
      'shipping_postal_code',
      'shipping_country',
      'shipping_carrier',
      'shipping_tracking_no',
      'shipped_at',
    ] as const;
    for (const field of shippingFields) {
      if (body[field] !== undefined) {
        patches.push(`${field} = ?`);
        values.push(nullable(body[field]));
      }
    }

    if (patches.length === 0) return badRequest(reply, 'empty_update');

    values.push(id);
    await pool.execute(
      `UPDATE orders SET ${patches.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      values,
    );

    const [rows] = await pool.execute(
      `
        SELECT o.id, o.dealer_id, u.full_name AS dealer_name, o.seller_id,
               su.full_name AS seller_name, o.status, o.total, o.notes, o.payment_method,
               o.payment_status, o.payment_ref,
               o.shipping_name, o.shipping_phone, o.shipping_address, o.shipping_city,
               o.shipping_district, o.shipping_postal_code, o.shipping_country,
               o.shipping_carrier, o.shipping_tracking_no, o.shipped_at,
               o.created_at, o.updated_at
          FROM orders o
          LEFT JOIN users u ON u.id = o.dealer_id
          LEFT JOIN users su ON su.id = o.seller_id
         WHERE o.id = ?
         LIMIT 1
      `,
      [id],
    );

    const [order] = rows as Record<string, unknown>[];
    if (!order) return reply.code(404).send({ error: { message: 'not_found' } });
    return order;
  });
}
