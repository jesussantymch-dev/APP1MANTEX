const CACHE_NAME = 'mantenimiento-textil-v2';
const urlsToCache = [
  './index.html',
  './style.css',
  './app.js',
  './cerradora automática.JPG',
  './juki.png',
  './Recta mecánica.jpg',
  './Cerradora perimetral.JPG',
  './remalladora mecanica.JPG',
  './Remalladora neumatica.jpg',
  './Cerradora estatica.JFIF',
  './Pilera.png',
  './corregidora.jpg',
  './Plana.jpg',
  './Recta triple arrastre.jpg'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés antiguas
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
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones para modo offline
self.addEventListener('fetch', event => {
  if (event.request.url.includes('script.google.com')) {
    return; // Las peticiones a Google Sheets se manejan directo en app.js
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // En caso de fallo de red total para archivos estáticos
      })
  );
});