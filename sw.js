const CACHE_NAME = 'rayoshield-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/app.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/exams.js',
    '/js/scoring.js',
    '/js/certificate.js',
    '/manifest.json',
    '/assets/logo.png'
];

// Instalar Service Worker
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Activar Service Worker
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
});

// Interceptar peticiones
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
