// Service Worker Version (Cache Busting)
const CACHE_NAME = 'calc-app-cache-v2.4'; 

// List of all files to cache on install
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // External Libraries (if you trust the CDN to be stable)
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
    // Assets (Assume a standard icon directory setup)
    '/icons/icon-512x512.png',
    '/icons/icon-192x192.png',
    // Add other common icon sizes as needed from manifest.json
    // Note: The rest of the JS/CSS is inline in index.html, so it's inherently cached with index.html
];

// --- INSTALL EVENT ---
self.addEventListener('install', (event) => {
    // Force the service worker to activate immediately
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching App Shell');
                // Cache all necessary files
                return cache.addAll(urlsToCache);
            })
    );
});

// --- ACTIVATE EVENT ---
self.addEventListener('activate', (event) => {
    // Clear old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Claim control of clients immediately
    return self.clients.claim(); 
});

// --- FETCH EVENT (Serving cached content) ---
self.addEventListener('fetch', (event) => {
    // Strategy: Cache-First for static assets, Network-Fallback for all others
    
    // Check if the request is for a network-only resource (like the custom fonts or complex data)
    // Here, we treat everything as Cache-First as the app is mostly static HTML/JS/CSS
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // No cache hit - Fetch from network
                return fetch(event.request).then((networkResponse) => {
                    
                    // Optional: Update the cache with new data for the next time
                    return caches.open(CACHE_NAME).then((cache) => {
                         // Only cache successful GET requests for resources not exceeding a size limit
                         if (event.request.method === 'GET' && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            // Clone the response because it's a stream and can only be consumed once
                            cache.put(event.request, networkResponse.clone());
                         }
                         return networkResponse;
                    });
                }).catch((error) => {
                    // This catch is for when network fetch fails (i.e., user is offline)
                    console.error('[Service Worker] Fetch failed; returning fallback:', error);
                    // Since this is a utility app, we return null or a basic fallback page if needed
                    // For single-page app, the index.html fallback is already covered by cache-first strategy.
                });
            })
    );
});
