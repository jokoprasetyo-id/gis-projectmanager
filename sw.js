const CACHE_NAME = 'gpm-cache-v1';

const urlsToCache = [
  './',
  './index.html',
  './logo.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache berhasil dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Pengecualian untuk request ke API eksternal (seperti Firebase Firebase)
  // Biarkan request Firebase selalu berjalan melalui jaringan internet
  if (event.request.url.includes('firebaseio.com') || event.request.url.includes('googleapis.com')) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - kembalikan response dari cache (bikin aplikasi loading super cepat)
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
