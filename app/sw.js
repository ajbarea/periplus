const CACHE = 'periplus-v2';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'assets/brand.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return; // let cross-origin (maps links, etc.) pass

  if (req.mode === 'navigate') {
    // stale-while-revalidate: instant cached shell, refresh in the background
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('index.html');
      const network = fetch(req)
        .then((res) => { cache.put('index.html', res.clone()); return res; })
        .catch(() => null);
      return cached || (await network) || cache.match('./');
    })());
    return;
  }

  // cache-first for static assets
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
