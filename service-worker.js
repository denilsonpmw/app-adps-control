// Service Worker com estratégia segura:
// - navigation (HTML): network-first com fallback para cache
// - API requests: network-first com fallback para cache
// - assets estáticos (css/js/png/...): stale-while-revalidate

const CACHE_VERSION = 'v2';
const CACHE_NAME = `adps-control-cache-${CACHE_VERSION}`;
const STATIC_CACHE = `adps-control-static-${CACHE_VERSION}`;
const OFFLINE_URLS = ['/', '/index.html'];

function isNavigationRequest(req) {
  return req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => ![CACHE_NAME, STATIC_CACHE].includes(k)).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Timeout helper for network-first
function networkWithTimeout(request, timeoutMs) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(null), timeoutMs);
    fetch(request).then(response => {
      clearTimeout(timeoutId);
      resolve(response);
    }).catch(() => resolve(null));
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Handle navigation requests with network-first (short timeout)
  if (isNavigationRequest(req)) {
    event.respondWith((async () => {
      const networkResp = await networkWithTimeout(req, 500);
      if (networkResp && networkResp.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, networkResp.clone());
        return networkResp;
      }
      const cached = await caches.match(req);
      if (cached) return cached;
      return caches.match('/index.html');
    })());
    return;
  }

  // API requests: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        const resp = await fetch(req);
        if (resp && resp.ok) {
          const c = await caches.open(CACHE_NAME);
          c.put(req, resp.clone());
        }
        return resp;
      } catch (e) {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }

  // Static assets: stale-while-revalidate
  if (req.method === 'GET' && (req.destination === 'script' || req.destination === 'style' || req.destination === 'image' || req.url.match(/\.(?:js|css|png|jpg|jpeg|svg|woff2?)$/))) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(req);
      const networkPromise = fetch(req).then(networkResp => {
        if (networkResp && networkResp.ok) cache.put(req, networkResp.clone());
        return networkResp;
      }).catch(() => null);
      return cached || await networkPromise || new Response('', { status: 404 });
    })());
    return;
  }

  // Default: try network, fallback cache
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
