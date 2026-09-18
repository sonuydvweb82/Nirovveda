/* Nirovveda Service Worker — PWA offline support
   Scope: caches app shell so the UI loads offline; API calls fail gracefully.
   Read-only data (landing page, research data) is cached and available offline.
   Writes queue in-app via localStorage and sync on reconnect. */
const CACHE_NAME = 'nirovveda-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation & API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls: network only (do not serve stale)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Same-origin navigation: network-first, fall back to cached shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((res) => {
          if (res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return res;
        })
    )
  );
});

// Message to notify clients when going offline/online
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});