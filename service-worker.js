const CACHE_NAME = 'kb-utility-hub-v2.0.1'; // Cache version
// उन सभी फ़ाइलों की सूची जिन्हें ऑफ़लाइन पहुँच के लिए कैश किया जाना चाहिए
const urlsToCache = [
  './', // index.html के लिए आवश्यक है
  './index.html',
  './manifest.json',
  './service-worker.js',
  // Lucide Icons (CDN) - यह आमतौर पर मुश्किल होता है, इसलिए हम सिर्फ़ लोकल फ़ाइलों को कैश करेंगे
  // Tailwind CSS (CDN) - इसे भी छोड़ रहे हैं क्योंकि यह CDN पर है।
  // अगर आप अपनी कोई CSS, JS, या इमेज फ़ाइलें इस्तेमाल करते हैं, तो उन्हें यहाँ जोड़ें।
  // उदाहरण के लिए:
  // './css/style.css', 
  // './js/app.js', 
  // './icons/icon-192x192.png',
];

// इंस्टॉल इवेंट: कैशिंग शुरू करें
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        // ensure all essential files are cached
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Failed to cache some files:', err);
        });
      })
  );
  self.skipWaiting(); // नया SW तुरंत सक्रिय हो जाएगा
});

// सक्रियण इवेंट: पुराने कैशे साफ़ करें
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // सुनिश्चित करें कि SW तुरंत नियंत्रित करना शुरू कर दे
});

// फ़ेच इवेंट: कैश से सामग्री लौटाएँ, यदि उपलब्ध हो
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // कैशे में मिला, कैशे से लौटाएँ
        if (response) {
          return response;
        }
        // कैशे में नहीं मिला, नेटवर्क से प्राप्त करें
        return fetch(event.request);
      })
  );
});


