import type { FastifyInstance } from 'fastify';

const NOT_FOUND = { error: { message: 'not_found' } };

export async function registerFooterSectionsPublic(app: FastifyInstance) {
  app.get('/footer_sections/by-slug/:slug', async (_req, reply) => reply.code(404).send(NOT_FOUND));
  app.get('/footer_sections/:id', async (_req, reply) => reply.code(404).send(NOT_FOUND));
  app.get('/footer_sections', async (_req, reply) => reply.send([]));
}

/** Public API: popups + storage FK zinciri gelene kadar stub (RTK uyumu). */
export async function registerPopupsPublicStub(app: FastifyInstance) {
  app.get('/popups', { config: { public: true } }, async (_req, reply) => reply.send([]));
}
