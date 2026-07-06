const CACHE_NAME = 'trip-ojol-v4.0'; 
const ASSETS = [
  './',
  './index.html',
  './calc.js',
  './style.css',
  './manifest.json'
];

// Install Service Worker - Mengunduh aset awal ke penyimpanan cache local HP
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Langsung aktifkan SW baru tanpa menahan sesi aplikasi tua
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Service Worker - Pembersihan otomatis sampah cache versi lama
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
    }).then(() => self.clients.claim()) // Ambil kendali halaman aktif seketika
  );
});

// Fetch Handler - Strategi Pintar: Memuat dari Cache sembari meng-update aset dari jaringan GitHub di background
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchedResponse = fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Tetap aman saat digunakan offline di jalan raya tanpa sinyal internet
        });

        return cachedResponse || fetchedResponse;
      });
    })
  );
});
