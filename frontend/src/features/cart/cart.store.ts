'use client';

// =============================================================
// Sepet (2026-09-26): tarayıcıda kalıcı, üyelikten bağımsız.
// Misafir sepete ekler → satın almada üyelik/giriş → aynı sepetle checkout.
// Fiyat burada yalnız gösterim içindir; tutarı sunucu ürün verisinden hesaplar.
// Bağımlılık yok: localStorage + useSyncExternalStore; sekmeler arası `storage` olayı.
// =============================================================
import { useSyncExternalStore } from 'react';

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  image?: string;
  unitPrice: number;
  minQuantity: number;
  quantity: number;
};

const STORAGE_KEY = 'woody_cart_v1';
const MAX_QUANTITY = 99;
const EMPTY: CartItem[] = [];

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function clampQuantity(quantity: number, minQuantity: number) {
  const min = Math.max(1, Math.floor(minQuantity) || 1);
  return Math.min(MAX_QUANTITY, Math.max(min, Math.floor(quantity) || min));
}

function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const items: CartItem[] = [];
  for (const entry of raw) {
    const item = entry as Partial<CartItem>;
    const productId = String(item?.productId ?? '').trim();
    if (!productId || seen.has(productId)) continue;
    const unitPrice = Number(item.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) continue;
    const minQuantity = Math.max(1, Math.floor(Number(item.minQuantity)) || 1);
    seen.add(productId);
    items.push({
      productId,
      slug: String(item.slug ?? ''),
      title: String(item.title ?? ''),
      image: item.image ? String(item.image) : undefined,
      unitPrice,
      minQuantity,
      quantity: clampQuantity(Number(item.quantity), minQuantity),
    });
  }
  return items;
}

function read(): CartItem[] {
  if (cache) return cache;
  if (typeof window === 'undefined') return EMPTY;
  try {
    cache = sanitize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Depolama kapalıysa sepet bu sekmede bellekte yaşar.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export const cartActions = {
  add(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
    const items = read();
    const existing = items.find((line) => line.productId === item.productId);
    if (existing) {
      write(items.map((line) =>
        line.productId === item.productId
          ? { ...line, ...item, quantity: clampQuantity(line.quantity + (item.quantity ?? 1), item.minQuantity) }
          : line,
      ));
      return;
    }
    write([...items, { ...item, quantity: clampQuantity(item.quantity ?? item.minQuantity, item.minQuantity) }]);
  },
  setQuantity(productId: string, quantity: number) {
    write(read().map((line) =>
      line.productId === productId ? { ...line, quantity: clampQuantity(quantity, line.minQuantity) } : line,
    ));
  },
  /**
   * Sunucudaki güncel ürün verisiyle eşitler (fiyat/başlık/min adet). Satışta
   * olmayan ürünler sepette kalır ama `available` listesinde yer almaz.
   */
  sync(catalog: Record<string, Pick<CartItem, 'slug' | 'title' | 'image' | 'unitPrice' | 'minQuantity'>>) {
    const items = read();
    let changed = false;
    const next = items.map((line) => {
      const fresh = catalog[line.productId];
      if (!fresh) return line;
      const merged: CartItem = {
        ...line,
        slug: fresh.slug,
        title: fresh.title,
        image: fresh.image,
        unitPrice: fresh.unitPrice,
        minQuantity: fresh.minQuantity,
        quantity: clampQuantity(line.quantity, fresh.minQuantity),
      };
      if (JSON.stringify(merged) !== JSON.stringify(line)) changed = true;
      return merged;
    });
    if (changed) write(next);
  },
  remove(productId: string) {
    write(read().filter((line) => line.productId !== productId));
  },
  clear() {
    write([]);
  },
};

/** Sunucu render'ında boş sepet döner; hidrasyondan sonra gerçek içerik gelir. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0) / 100;
}

export const CART_LIMITS = { maxQuantity: MAX_QUANTITY };
export { clampQuantity };
