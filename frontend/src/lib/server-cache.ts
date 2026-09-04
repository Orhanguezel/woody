import 'server-only';

// =============================================================
// FILE: src/lib/server-cache.ts
// SSR surecinde yasayan kucuk TTL cache + tek-ucus (single-flight).
//
// NEDEN GEREKLI
// Sayfalarin bir kismi `export const dynamic = 'force-dynamic'`
// (generateStaticParams + headers() birlikte kullanildiginda
// DYNAMIC_SERVER_USAGE 500 uretiyordu). force-dynamic altinda Next'in
// fetch cache'i devre disi kalir; `next: { revalidate }` ipucu verilse
// bile her sayfa render'i backend'e yeniden gider.
//
// Olculen sonuc (2 gun, canli): 65.596 istegin 51.042'si (%77,8)
// site_settings cagrisiydi ve bunlarin %94'u SSR'dan geliyordu —
// yani ayni birkac ayar satiri saniyede defalarca sorgulaniyordu.
//
// Bu katman Next'in cache semantiginden BAGIMSIZ calisir: ayni Node
// surecinde tutulan basit bir Map. Ayrica ayni anahtar icin es zamanlı
// istekler tek bir upstream cagrisinda birlestirilir, boylece trafik
// ani yukseldiginde suru etkisi (thundering herd) olusmaz.
//
// Cache SUREC ICIDIR: deploy/restart sonrasi bosalir, PM2 cluster'da
// her surec kendi kopyasini tutar. Ayar degisikliginin yansimasi en
// kotu ihtimalle TTL kadar gecikir — cagiranlarin verdigi revalidate
// suresi neyse o (site_settings icin 600sn, tasarim token'lari 30sn).
// =============================================================

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

/** Sinirsiz buyumeyi onler; anahtar sayisi ayar sayisi kadar oldugu icin bolca yeterli. */
const MAX_ENTRIES = 500;

function prune(): void {
  if (store.size <= MAX_ENTRIES) return;
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt <= now) store.delete(k);
  }
  // Hala buyukse en eskiden baslayarak at.
  if (store.size > MAX_ENTRIES) {
    const excess = store.size - MAX_ENTRIES;
    let i = 0;
    for (const k of store.keys()) {
      if (i++ >= excess) break;
      store.delete(k);
    }
  }
}

/**
 * `key` icin degeri getirir; taze kopya varsa upstream'e HIC gitmez.
 * Ayni anahtar icin es zamanlı cagrilar tek upstream istegini paylasir.
 *
 * @param ttlSeconds 0 veya negatifse cache atlanir (her zaman taze).
 */
export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) return loader();

  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  // Ayni anahtar zaten yolda — yeni istek acma, onu bekle.
  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const p = (async () => {
    try {
      const value = await loader();
      store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
      prune();
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, p);
  return p as Promise<T>;
}

/** Test/elle temizlik icin. Anahtar verilmezse tumunu bosaltir. */
export function clearServerCache(key?: string): void {
  if (key) store.delete(key);
  else store.clear();
}
