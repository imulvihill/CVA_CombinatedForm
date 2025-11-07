// sw.js

const CACHE_NAME = 'sca-cupping-app-v1';
// Lista de archivos para cachear
const URLS_TO_CACHE = [
  'index.html',
  'manifest.json',
  // CDNs
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Evento Install: se dispara cuando el SW se instala
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('Falló el cacheo de archivos:', err);
      })
  );
});

// Evento Activate: se dispara cuando el SW se activa
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento Fetch: se dispara cada vez que la app pide un recurso (imagen, script, etc.)
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    // Estrategia: Cache primero, luego Red (Cache-First)
    caches.match(event.request)
      .then((response) => {
        // Si el recurso está en el caché, lo devuelve
        if (response) {
          return response;
        }
        
        // Si no, lo busca en la red
        return fetch(event.request).then(
          (networkResponse) => {
            // (Opcional) Si queremos cachear nuevos recursos dinámicamente
            // if (networkResponse && networkResponse.status === 200) {
            //   caches.open(CACHE_NAME).then((cache) => {
            //     cache.put(event.request, networkResponse.clone());
            //   });
            // }
            return networkResponse;
          }
        ).catch(err => {
          console.error('Service Worker: Fetch failed', err);
        });
      })
  );
});
