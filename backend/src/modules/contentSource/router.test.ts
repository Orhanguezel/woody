import { afterEach, describe, expect, test } from 'bun:test';
import Fastify from 'fastify';

import { registerContentSourcePublic } from './router';

const originalContentKey = process.env.CONTENT_SOURCE_API_KEY;
const originalCommerceKey = process.env.TANITIO_COMMERCE_API_KEY;

afterEach(() => {
  if (originalContentKey === undefined) delete process.env.CONTENT_SOURCE_API_KEY;
  else process.env.CONTENT_SOURCE_API_KEY = originalContentKey;
  if (originalCommerceKey === undefined) delete process.env.TANITIO_COMMERCE_API_KEY;
  else process.env.TANITIO_COMMERCE_API_KEY = originalCommerceKey;
});

describe('Woody Tanitio content contract', () => {
  test('base URL and /contract expose the same authenticated v1.4 contract', async () => {
    process.env.CONTENT_SOURCE_API_KEY = 'content-test-key';
    process.env.TANITIO_COMMERCE_API_KEY = 'commerce-test-key';
    const app = Fastify();
    await app.register(registerContentSourcePublic, { prefix: '/api/v1' });

    for (const url of ['/api/v1/content-source', '/api/v1/content-source/contract']) {
      const response = await app.inject({ method: 'GET', url, headers: { 'x-api-key': 'content-test-key' } });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: 'woody-tanitio-web-connection@1.4',
        schemaVersion: '1.0',
        tenantKey: 'woody',
        content: { articles: true, products: true },
        commerce: { enabled: true, auth: 'hmac-sha256', keyId: 'woody', pii: false },
        editorial: { enabled: true, auth: 'hmac-sha256', drafts: true, schedule: true, publish: true },
      });
    }
    await app.close();
  });

  test('base URL remains fail-closed without a valid content key', async () => {
    process.env.CONTENT_SOURCE_API_KEY = 'content-test-key';
    const app = Fastify();
    await app.register(registerContentSourcePublic, { prefix: '/api/v1' });
    const response = await app.inject({ method: 'GET', url: '/api/v1/content-source' });
    expect(response.statusCode).toBe(401);
    await app.close();
  });
});
