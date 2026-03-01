// SW
const CACHE_VERSION = 'v1.0.7-fix';
const CACHE_NAME = `tutodecode-${CACHE_VERSION}`;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      // Nettoyage ultra agressif : on supprime tous les anciens caches
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  // Network first ultra-simple pour forcer la mise à jour des assets
  e.respondWith(
    fetch(e.request).catch(async () => {
      return caches.match(e.request);
    })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});