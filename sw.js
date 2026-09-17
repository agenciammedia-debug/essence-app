const CACHE_NAME = 'essence-cache-v2';
const STATIC_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Nunca cachear llamadas al Apps Script (datos dinámicos)
  if (url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first para el shell estático
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        return resp;
      });
    })
  );
});
