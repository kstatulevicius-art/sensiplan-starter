// Workbox over CDN. This requires one online visit to cache shell.
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Precache will be empty in this simple setup; runtime caching below handles assets.
// You can later switch to injectManifest with a build step if needed.

// App shell & static assets
workbox.routing.registerRoute(
  ({request}) => ['document','script','style','font'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'app-shell',
  })
);

// Images
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [ new workbox.expiration.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60*60*24*30 }) ]
  })
);
