import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';

import { getGscStatus, inspectGscEntity, listGscEntityIndex } from './service';

const entityType = z.enum(['blog', 'product']);
const locale = z.string().trim().toLowerCase().regex(/^[a-z]{2}(?:-[a-z]{2})?$/).max(8);
const entityQuery = z.object({ type: entityType, locale });
const entityBody = entityQuery.extend({ slug: z.string().trim().min(1).max(255) });

function invalid(reply: FastifyReply, detail: unknown) {
  return reply.code(400).send({ error: { message: 'invalid_gsc_request', detail } });
}

export async function registerSearchConsoleAdmin(app: FastifyInstance) {
  app.get('/search-console/status', async (_req, reply) => {
    const status = await getGscStatus();
    return reply.send(status);
  });

  app.get('/search-console/entity-index', async (req, reply) => {
    const parsed = entityQuery.safeParse(req.query || {});
    if (!parsed.success) return invalid(reply, parsed.error.flatten());
    return reply.send(await listGscEntityIndex(parsed.data.type, parsed.data.locale));
  });

  app.post('/search-console/entity-inspect', async (req, reply) => {
    const parsed = entityBody.safeParse(req.body || {});
    if (!parsed.success) return invalid(reply, parsed.error.flatten());
    try {
      return reply.send(
        await inspectGscEntity(parsed.data.type, parsed.data.locale, parsed.data.slug),
      );
    } catch (error) {
      req.log.error({ err: error }, 'gsc_entity_inspect_failed');
      const message = error instanceof Error ? error.message : 'gsc_entity_inspect_failed';
      const status = message === 'entity_not_found' ? 404 : 502;
      return reply.code(status).send({ error: { message } });
    }
  });
}
