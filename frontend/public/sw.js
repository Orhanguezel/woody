const VERSION = 'pwa-v5';
const SHELL = `${VERSION}-shell`;
const STATIC = `${VERSION}-static`;
const PAGE = `${VERSION}-page`;
const OFFLINE = '/offline.html';
// Yalnizca var olan dosyalar. (Tek 404 install'u kirmasin diye asagida dayanikli yukleme yapilir.)
const SHELL_ASSETS = [OFFLINE, '/favicon.svg'];
const STATIC_RE = /\.(?:avif|webp|png|jpe?g|svg|gif|ico|woff2?|ttf|otf)$/i;
const SKIP_RE = /\/api\/|\/site_settings|\/_next\//;

self.addEventListener('install', (event) => {
  // Dayanikli: addAll yerine tek tek add + allSettled — bir asset 404 olsa bile install cokmesin.
  event.waitUntil(
    caches.open(SHELL).then((cache) =>
      Promise.allSettled(SHELL_ASSETS.map((asset) => cache.add(asset))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

async function put(cacheName, request, response) {
  if (response && response.ok && response.type === 'basic') {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin || SKIP_RE.test(url.pathname)) return;

  if (request.mode === 'navigate') {
    // NETWORK-FIRST: deploy sonrasi eski sayfa kabugu (eski menu/chunk) sunulmasin.
    // Cache yalnizca offline fallback olarak kullanilir.
    event.respondWith(
      fetch(request)
        .then((response) => put(PAGE, request, response))
        .catch(async () => {
          const cache = await caches.open(PAGE);
          const cached = await cache.match(request);
          return cached || caches.match(OFFLINE);
        }),
    );
    return;
  }

  if (STATIC_RE.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => put(STATIC, request, response))
        .catch(() => caches.match(request)),
    );
  }
});
