const CACHE_NAME = 'kbtech-utility-v1'; 

const urlsToCache = [
  // --- 1. Internal App Shell (आंतरिक फ़ाइलें) ---
  '/', 
  '/index.html',
  '/manifest.json',
  
  // --- 2. External CDN Dependencies (बाहरी निर्भरताएँ) ---
  // Tailwind CSS
  'https://cdn.tailwindcss.com',
  // Lucide Icons (Used for all icons in the app)
  'https://unpkg.com/lucide@latest', 
  // Chart.js (Used for EMI, SIP, and BMR charts)
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js', 
  
  // --- 3. Icon Files (आइकॉन फ़ाइलें) ---
  // PWABuilder ने जो आइकॉन जनरेट किए थे, उनमें से कुछ मुख्य आइकॉन:
  // (Note: आपको यहाँ अपने manifest.json में मौजूद सभी 452 आइकॉन के पथ जोड़ने होंगे)
  '/android/android-launchericon-512-512.png',
  '/android/android-launchericon-192-192.png',
  '/windows11/Square150x150Logo.scale-400.png',
  '/ios/1024.png'
  // ... (Add all other icon paths here, e.g., '/ios/180.png', '/windows11/SmallTile.scale-100.png', etc.)
];

// INSTALL Event: Caching Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ACTIVATE Event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// FETCH Event: Cache-First Strategy
self.addEventListener('fetch', event => {
  
  if (event.request.method !== 'GET') return;
  
  // Exclude external API calls that should not be cached (like currency exchange API)
  if (event.request.url.includes('api.exchangerate-api.com')) {
      return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return resource from cache if found
        if (response) {
          return response;
        }

        // Fetch from network if not in cache
        return fetch(event.request).then(
          networkResponse => {
            
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Only cache if the URL is in the list or is an http/https resource
            if (urlsToCache.includes(event.request.url) || event.request.url.startsWith('http')) {
                const responseToCache = networkResponse.clone();
                
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
            }

            return networkResponse;
          }
        ).catch(error => {
            // Fallback for when network fails and item is NOT in cache
            // You can implement a custom offline page here if desired.
        });
      })
  );
});
