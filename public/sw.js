const CACHE = 'safesun-v2';
const ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];
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
    e.respondWith(fetch(req).catch(() => caches.match('/')));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});

// Bring the app to the foreground when the user taps a notification.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if ('focus' in c) { try { await c.focus(); return; } catch {} } }
    if (self.clients.openWindow) await self.clients.openWindow('/');
  })());
});

// Optional: handle push payloads if a push subscription is added later.
self.addEventListener('push', (e) => {
  let data = { title: 'Safe Sun', body: 'Check the UV now.' };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [300, 150, 300, 150, 600],
    requireInteraction: true,
    tag: 'safesun',
  }));
});

// Allow the page to schedule a background reapply notification. Uses
// Notification Triggers (Chrome/Android) when available so the alert fires
// even if the page is closed; otherwise falls back to a setTimeout while the
// service worker is alive.
self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SCHEDULE_REAPPLY' && typeof msg.at === 'number') {
    const delay = Math.max(0, msg.at - Date.now());
    const title = msg.title || 'Safe Sun';
    const body = msg.body || 'Time to re-apply sunscreen!';
    const opts = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [500, 200, 500, 200, 500, 200, 800],
      requireInteraction: true,
      tag: 'safesun-reapply',
      renotify: true,
    };
    try {
      // Notification Triggers (origin-trial / Chromium). Fires even if closed.
      if ('showTrigger' in Notification.prototype) {
        // eslint-disable-next-line no-undef
        opts.showTrigger = new TimestampTrigger(msg.at);
        self.registration.showNotification(title, opts);
        return;
      }
    } catch {}
    // Fallback: schedule while SW is alive.
    setTimeout(() => {
      self.registration.showNotification(title, opts);
    }, delay);
  }
  if (msg.type === 'CANCEL_REAPPLY') {
    self.registration.getNotifications({ tag: 'safesun-reapply', includeTriggered: true }).then((list) => {
      list.forEach((n) => n.close());
    }).catch(() => {});
  }
});
