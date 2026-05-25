const CACHE = 'bruno-v5';

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/bruno.css',
  './js/assets.js',
  './js/config.js',
  './js/state.js',
  './js/ui.js',
  './js/progress.js',
  './js/phoenix.js',
  './js/challenges.js',
  './js/notifications.js',
  './js/main.js',
  './manifest.json',
  './icons/icon.svg'
];

// Pre-cache all app files on install
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Delete old caches on activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    for (const c of list) {
      if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
    }
    return clients.openWindow('./');
  }));
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Google Fonts: try network first, cache result, fall back to cache offline
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else: serve from cache, fall back to network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
