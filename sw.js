const CACHE_NAME = 'reserva-carritos-v3';
const ASSETS = ['/reserva-carritos/icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Llamadas al GAS y Cloudflare — siempre red
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('workers.dev')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // index.html — siempre red, nunca caché
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request));
    return;
  }

  // Resto de assets — red primero, caché como respaldo
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
