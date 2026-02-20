
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

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => 
            Promise.all(ASSETS.map(url => 
                fetch(url).then(r => r.ok ? cache.put(url, r) : Promise.resolve())
                .catch(() => Promise.resolve())
            ))
        )
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => 
            cached || fetch(e.request).then(r => {
                if (r.ok && e.request.method === 'GET') {
                    caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone())).catch(()=>{});
                }
                return r;
            }).catch(() => caches.match('/index.html'))
        )
    );
});

