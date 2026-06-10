import { randomUUID } from 'crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';

import { pool } from '@/db/client';

const waitlistSchema = z.object({
  email: z.string().trim().email().max(255),
  product_key: z.string().trim().min(2).max(100),
  locale: z.string().trim().max(10).optional().nullable(),
  source: z.string().trim().max(32).optional().default('website'),
});

function badRequest(reply: FastifyReply, message: string, detail?: unknown) {
  return reply.code(400).send({ error: { message, detail } });
}

export async function registerWaitlistPublic(app: FastifyInstance) {
  app.post('/waitlist-signups', {
    config: {
      rateLimit: { max: 20, timeWindow: '1 hour' },
    },
  }, async (req, reply) => {
    const parsed = waitlistSchema.safeParse(req.body || {});
    if (!parsed.success) return badRequest(reply, 'invalid_waitlist_signup', parsed.error.flatten());
    const data = parsed.data;
    const id = randomUUID();
    await pool.execute(
      `
        INSERT INTO waitlist_signups (id, email, product_key, locale, source)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE locale = VALUES(locale), source = VALUES(source)
      `,
      [id, data.email.toLowerCase(), data.product_key, data.locale || null, data.source || 'website'],
    );
    return reply.code(201).send({ success: true });
  });
}
