const CACHE_NAME = 'kbtech-utility-v1';

const urlsToCache = [
  './', 
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest', 
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
  './android/android-launchericon-512-512.png',
  './android/android-launchericon-192-192.png'
];

// INSTALL: Assets ko cache mein dalna
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // addAll ki jagah ek-ek karke add karne se agar ek file miss ho toh SW fail nahi hota
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => console.error("Failed to cache:", url, err));
          })
        );
      })
  );
  self.skipWaiting(); // Naya SW turant activate ho jaye
});

// ACTIVATE: Purane caches saaf karna
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
  return self.clients.claim();
});

// FETCH: Network se mangwana aur cache mein update karna
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Currency API ko cache nahi karna hai
  if (event.request.url.includes('api.exchangerate-api.com')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;

        // Nayi files ko cache mein sath ke sath save karna
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
