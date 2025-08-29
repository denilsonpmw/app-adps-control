// Service Worker básico para cache offline
const CACHE_NAME = 'adps-control-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  // Adicione outros arquivos estáticos se necessário
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
