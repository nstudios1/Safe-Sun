const CACHE = 'safesun-v2';
const BASE = new URL('./', self.registration.scope).pathname;
const ASSETS = [BASE, BASE + 'manifest.json', BASE + 'icon-192.png', BASE + 'icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match(BASE)));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
