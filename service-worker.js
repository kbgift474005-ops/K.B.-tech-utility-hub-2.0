const CACHE_NAME = 'calcuplanner-v1';

// Files jo hum cache karna chahte hain
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // External Libraries (CDNs)
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
    // App Assets (Aapko yeh folder structure banana hoga)
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-144x144.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 1. Install Event: Cache all assets
self.addEventListener('install', event => {
    // Service worker ko tab tak rukne ke liye kehta hai jab tak caching complete na ho jaye
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and added all resources');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to cache resources:', err);
            })
    );
});

// 2. Fetch Event: Cache-First Strategy
self.addEventListener('fetch', event => {
    // Cross-origin requests ko ignore karein
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Agar cache hit hua, toh cache se response do
                if (response) {
                    return response;
                }
                
                // Agar cache mein nahi mila, toh network se fetch karo aur dynamic cache karo
                return fetch(event.request).then(
                    response => {
                        // Response valid nahi hai, toh return karo
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();

                        // Dynamic caching: Sirf zaroori aur choti files cache karein
                        if (event.request.method === 'GET' && !event.request.url.includes('/api/')) {
                             caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return response;
                    }
                );
            })
            // Agar network se bhi fetch na ho paye (offline hone par), toh error de dein
            .catch(error => {
                console.error('Fetching failed:', error);
                // Optional: Offline page dikha sakte hain
                // return caches.match('/offline.html');
            })
    );
});

// 3. Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Service Worker ko immediately control claim karne ke liye
    return self.clients.claim();
});

