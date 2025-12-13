const CACHE_NAME = 'kb-calc-v1';
const urlsToCache = [
    '/',
    '/index.html',
    // --- आपकी CSS/JS/LIBRARIES ---
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
    // --- Icons (मान लें कि ये रूट फोल्डर में हैं) ---
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 1. इंस्टॉलेशन: आवश्यक फ़ाइलों को कैश करें
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and adding assets.');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to cache required assets:', err);
            })
    );
});

// 2. फ़ेच: कैश से या नेटवर्क से डेटा दें
self.addEventListener('fetch', (event) => {
    // केवल GET रिक्वेस्ट और http/https स्कीमा के लिए कैशिंग
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // अगर कैश में है, तो कैश से लौटाएँ
                if (response) {
                    return response;
                }
                
                // अगर कैश में नहीं है, तो नेटवर्क से फ़ेच करें
                return fetch(event.request);
            })
            .catch(() => {
                // अगर नेटवर्क से भी फेल हो जाए (जैसे ऑफ़लाइन होने पर), 
                // तो यहाँ आप एक ऑफ़लाइन पेज दिखा सकते हैं (जो हमने कैश किया है)
                return caches.match('/index.html'); 
            })
    );
});

// 3. एक्टिवेशन: पुराने कैश को साफ़ करें
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
