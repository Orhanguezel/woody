import type { FastifyInstance, FastifyReply } from 'fastify';
import { pool } from '@/db/client';

const ORDER_STATUSES = new Set(['pending', 'confirmed', 'shipped', 'completed', 'cancelled']);
const PAYMENT_STATUSES = new Set(['unpaid', 'pending', 'paid', 'failed', 'refunded']);

type OrderUpdateBody = {
  status?: string;
  payment_status?: string;
  admin_note?: string | null;
};

function badRequest(reply: FastifyReply, message: string) {
  return reply.code(400).send({ error: { message } });
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
      values.push(
        typeof body.admin_note === 'string' && body.admin_note.trim() ? body.admin_note.trim() : null,
      );
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
               o.payment_status, o.payment_ref, o.created_at, o.updated_at
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
