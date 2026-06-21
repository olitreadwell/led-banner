// Service worker for the LED Banner PWA. Scope: /
// Cache-first so the app loads and runs with no network connection.
// Bump CACHE on every asset change so returning users get fresh JS/CSS instead
// of a stale cache-first copy (skipWaiting + clients.claim roll it out at once).
const CACHE = 'led-banner-v12';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/main.js',
  '/js/components.js',
  '/js/features/index.js',
  '/js/features/motion.js',
  '/js/features/font.js',
  '/js/features/size.js',
  '/js/features/brightness.js',
  '/js/features/glow.js',
  '/js/features/direction.js',
  '/js/features/mirror.js',
  '/js/features/blink.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  // addAll fails the whole install if any URL 404s; add individually and
  // ignore misses (e.g. '/' if the host doesn't serve a directory index).
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {}))),
      ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  // Only handle our own origin; let cross-origin requests hit the network.
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches
            .open(CACHE)
            .then((cache) => cache.put(request, clone))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match('/index.html')); // offline fallback
    }),
  );
});
