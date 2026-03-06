const CACHE_NAME = 'noors-games-v10';

// Relative URLs keep this working on both localhost and GitHub Pages subpaths.
const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './games/shared.css',
    './games/shared.js',
    './games/aankleden.html',
    './games/bellen.html',
    './games/cijfers.html',
    './games/flip.html',
    './games/kamer.html',
    './games/kiekeboe.html',
    './games/kleuren.html',
    './games/kleurenmixen.html',
    './games/kleurensorteren.html',
    './games/letters.html',
    './games/memory.html',
    './games/muziektuin.html',
    './games/piano.html',
    './games/pizza.html',
    './games/plaatjefout.html',
    './games/poetsen.html',
    './games/sokken.html',
    './games/zaklamp.html',
    './games/zoekenvind.html',
    './kleurplaten/index.json',
    './kleurplaten/eenhoorn.svg',
    './kleurplaten/ijs_katje.svg',
    './kleurplaten/ijsjes.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await Promise.all(
            PRECACHE_URLS.map((url) =>
                cache.add(url).catch(() => null)
            )
        );
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())));
        await self.clients.claim();
    })());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    const isLocal =
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '0.0.0.0';

    if (isLocal) {
        event.respondWith(fetch(request));
        return;
    }

    const isSameOrigin = url.origin === self.location.origin;
    const isNavigation = request.mode === 'navigate';

    // Network-first for HTML/navigation so updates appear quickly in iPad PWA.
    if (isNavigation || (isSameOrigin && request.headers.get('accept')?.includes('text/html'))) {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, fresh.clone());
                return fresh;
            } catch (_) {
                const cached = await caches.match(request);
                if (cached) return cached;
                return caches.match('./index.html');
            }
        })());
        return;
    }

    // Cache-first for static assets with background refresh.
    event.respondWith((async () => {
        const cached = await caches.match(request);
        if (cached) {
            if (isSameOrigin) {
                fetch(request)
                    .then((response) => {
                        if (response && response.status === 200 && response.type === 'basic') {
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
                        }
                    })
                    .catch(() => {});
            }
            return cached;
        }

        const response = await fetch(request);
        if (isSameOrigin && response && response.status === 200 && response.type === 'basic') {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    })());
});
