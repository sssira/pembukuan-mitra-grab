const CACHE_NAME = 'trip-ojol-v5.7'; 
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // Langsung aktifkan SW baru
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Langsung kontrol semua tab yang terbuka
      return self.clients.claim();
    })
  );
});

// Fetch Handler (Strategi: Cache First, Fallback to Network)
self.addEventListener('fetch', (e) => {
  // Jangan cache request ke CDN (Tesseract, dll)
  if (e.request.url.includes('cdn.jsdelivr.net') || 
      e.request.url.includes('tesseract')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
