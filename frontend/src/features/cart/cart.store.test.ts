/// <reference types="bun-types" />
import { beforeEach, describe, expect, test } from 'bun:test';

const memory = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, value),
  },
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
};

const { cartActions, cartCount, cartTotal, clampQuantity } = await import('./cart.store');

function stored() {
  return JSON.parse(memory.get('woody_cart_v1') || '[]') as Array<{ productId: string; quantity: number; unitPrice: number }>;
}

const base = { productId: 'p1', slug: 'basic', title: 'Basic', unitPrice: 2500, minQuantity: 3 };

describe('cart store', () => {
  beforeEach(() => cartActions.clear());

  test('ilk eklemede ürünün minimum adedi kadar eklenir, tekrar eklemede artar', () => {
    cartActions.add(base);
    expect(stored()[0].quantity).toBe(3);
    cartActions.add({ ...base, quantity: 1 });
    expect(stored()[0].quantity).toBe(4);
  });

  test('adet minimumun altına ve 99 üstüne çıkmaz', () => {
    cartActions.add(base);
    cartActions.setQuantity('p1', 1);
    expect(stored()[0].quantity).toBe(3);
    cartActions.setQuantity('p1', 500);
    expect(stored()[0].quantity).toBe(99);
    expect(clampQuantity(0, 1)).toBe(1);
  });

  test('sunucu fiyatıyla eşitlenir; toplam ve adet doğru hesaplanır', () => {
    cartActions.add(base);
    cartActions.add({ productId: 'p2', slug: 'junior', title: 'Junior', unitPrice: 100, minQuantity: 1 });
    cartActions.sync({ p1: { slug: 'basic', title: 'Basic', unitPrice: 2600, minQuantity: 3 } });
    const items = stored();
    expect(items[0].unitPrice).toBe(2600);
    expect(cartCount(items as never)).toBe(4);
    expect(cartTotal(items as never)).toBe(2600 * 3 + 100);
  });

  test('kaldırma ve temizleme', () => {
    cartActions.add(base);
    cartActions.remove('p1');
    expect(stored()).toEqual([]);
  });
});
