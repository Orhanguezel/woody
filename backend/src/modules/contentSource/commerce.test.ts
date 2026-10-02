import { createHmac } from 'crypto';
import { afterEach, describe, expect, test } from 'bun:test';

import { commerceOrdersById, verifyCommerceRequest } from './commerce';

const originalCurrent = process.env.TANITIO_COMMERCE_API_KEY;
const originalPrevious = process.env.TANITIO_COMMERCE_API_KEY_PREVIOUS;

afterEach(() => {
  if (originalCurrent === undefined) delete process.env.TANITIO_COMMERCE_API_KEY;
  else process.env.TANITIO_COMMERCE_API_KEY = originalCurrent;
  if (originalPrevious === undefined) delete process.env.TANITIO_COMMERCE_API_KEY_PREVIOUS;
  else process.env.TANITIO_COMMERCE_API_KEY_PREVIOUS = originalPrevious;
});

function request(keyId: string, secret: string, nonce: string, url = '/api/v1/content-source/commerce/health') {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', secret).update(`GET\n${url}\n${timestamp}\n${nonce}`).digest('hex');
  return {
    method: 'GET',
    protocol: 'https',
    url,
    raw: { url },
    query: Object.fromEntries(new URL(url, 'https://woodyvearkadaslari.com').searchParams),
    headers: {
      'x-tanitio-key-id': keyId,
      'x-tanitio-timestamp': timestamp,
      'x-tanitio-nonce': nonce,
      'x-tanitio-signature': signature,
    },
  } as any;
}

function reply() {
  const state = { status: 200, body: undefined as unknown };
  return {
    state,
    code(status: number) { state.status = status; return this; },
    send(body?: unknown) { state.body = body; return this; },
  } as any;
}

describe('commerce HMAC key rotation', () => {
  test('accepts the current key', () => {
    process.env.TANITIO_COMMERCE_API_KEY = 'current-secret';
    process.env.TANITIO_COMMERCE_API_KEY_PREVIOUS = 'previous-secret';
    expect(verifyCommerceRequest(request('woody', 'current-secret', 'current_nonce_0001'), reply())).toBe(true);
  });

  test('accepts the previous key only during the overlap window', () => {
    process.env.TANITIO_COMMERCE_API_KEY = 'current-secret';
    process.env.TANITIO_COMMERCE_API_KEY_PREVIOUS = 'previous-secret';
    expect(verifyCommerceRequest(request('woody-prev', 'previous-secret', 'previous_nonce_001'), reply())).toBe(true);

    delete process.env.TANITIO_COMMERCE_API_KEY_PREVIOUS;
    const rejected = reply();
    expect(verifyCommerceRequest(request('woody-prev', 'previous-secret', 'previous_nonce_002'), rejected)).toBe(false);
    expect(rejected.state.status).toBe(401);
    expect(rejected.state.body).toEqual({ error: { code: 'UNAUTHORIZED' } });
  });

  test('order evidence rejects malformed and duplicate IDs before database access', async () => {
    process.env.TANITIO_COMMERCE_API_KEY = 'current-secret';
    for (const [index, ids] of ['not-an-order', '00000000-0000-0000-0000-000000000001,00000000-0000-0000-0000-000000000001'].entries()) {
      const url = `/api/v1/content-source/commerce/orders/by-id?ids=${ids}`;
      const response = reply();
      await commerceOrdersById(request('woody', 'current-secret', `order_lookup_nonce_${index}`, url), response);
      expect(response.state.status).toBe(422);
      expect(response.state.body).toEqual({ error: { code: 'INVALID_ORDER_IDS' } });
    }
  });
});
