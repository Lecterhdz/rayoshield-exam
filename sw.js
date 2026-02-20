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
    '/manifest.json'
    '/assets/logo.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Cachear solo lo que existe, ignorar errores
                return Promise.all(
                    ASSETS.map(url => 
                        fetch(url)
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                                // Ignorar 404s
                                return Promise.resolve();
                            })
                            .catch(() => Promise.resolve()) // Ignorar errores de red
                    )
                );
            })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        )
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(cached => cached || fetch(e.request)
                .then(response => {
                    // Cachear nuevas peticiones exitosas
                    if (response.ok && e.request.method === 'GET') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(e.request, clone))
                            .catch(() => {});
                    }
                    return response;
                })
                .catch(() => caches.match('/index.html')) // Fallback
            )
    );
});
