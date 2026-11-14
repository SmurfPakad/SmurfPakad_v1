// SmurfPakad service worker (scope: /cryptoflow/)
// Network-first for pages and assets so a redeploy is picked up immediately;
// the cache is only an offline fallback. API calls are never intercepted, so the
// app's own offline handling sees real network errors.
const CACHE_NAME = 'smurfpakad-v2';
const BASE = '/cryptoflow/';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(BASE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(req)) || (req.mode === 'navigate' ? caches.match(BASE) : Response.error()))
  );
});

// Push notification for high-risk alerts
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification('SmurfPakad alert', {
      body: data.message || 'High-risk transaction detected',
      icon: BASE + 'icons/icon-192.png',
      tag: 'aml-alert',
      data: { url: BASE + 'warroom' },
      actions: [
        { action: 'investigate', title: 'Investigate' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'investigate') {
    event.waitUntil(clients.openWindow(BASE + 'warroom'));
  }
});
