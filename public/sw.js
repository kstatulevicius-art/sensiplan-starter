// Minimal placeholder SW: just claim clients. Replace with Workbox for real offline caching.
self.addEventListener('install', (e) => { self.skipWaiting() });
self.addEventListener('activate', (e) => { self.clients.claim() });
