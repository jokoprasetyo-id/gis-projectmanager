const CACHE_NAME = 'gpm-cache-v2'; // Versi dinaikkan agar otomatis update

const urlsToCache = [
  './index.html',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Memaksa update Service Worker baru
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Menggunakan metode yang tidak akan error/crash meski ada file yang gagal di-cache
      console.log('Membuka cache...');
      return Promise.allSettled(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => console.warn('Gagal cache:', url, err));
        })
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firebaseio.com') || event.request.url.includes('googleapis.com')) {
      return; // Biarkan Firebase konek ke internet langsung
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Jika offline dan file tidak ada di cache, arahkan ke index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
