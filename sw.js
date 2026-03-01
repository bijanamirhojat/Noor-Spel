const CACHE_NAME = 'noors-games-v5';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/games/shared.css',
    '/games/shared.js',
    '/games/aankleden.html',
    '/games/bellen.html',
    '/games/cijfers.html',
    '/games/flip.html',
    '/games/kamer.html',
    '/games/kiekeboe.html',
    '/games/kleuren.html',
    '/games/kleurenmixen.html',
    '/games/kleurensorteren.html',
    '/games/letters.html',
    '/games/memory.html',
    '/games/muziektuin.html',
    '/games/piano.html',
    '/games/pizza.html',
    '/games/plaatjefout.html',
    '/games/poetsen.html',
    '/games/sokken.html',
    '/games/zaklamp.html',
    '/games/zoekenvind.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

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

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '0.0.0.0') {
        event.respondWith(fetch(event.request));
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
    );
});
