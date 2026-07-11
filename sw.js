const CACHE = 'palette-generator-v2';
const FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/color-engine.js',
  '/js/ui.js',
  '/js/history.js',
  '/js/detail-panel.js',
  '/js/saved-palettes.js',
  '/js/export.js',
  '/js/drag-drop.js',
  '/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response.ok) {
          caches.open(CACHE).then(cache => cache.put(e.request, response.clone()));
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
