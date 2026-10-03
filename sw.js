const params = new URL(self.location.href).searchParams;
const RELEASE_ID = params.get('release') || 'dev';
const CACHE_NAME = `noors-games-${RELEASE_ID}`;

// Relative URLs keep this working on both localhost and GitHub Pages subpaths.
const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './icons/favicon.svg',
    './icons/apple-touch-icon.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './games/shared.css',
    './games/shared.js',
    './games/aankleden.html',
    './games/bellen.html',
    './games/boerderij.html',
    './games/bommetjes.html',
    './games/cijfers.html',
    './games/draakjes.html',
    './games/flip.html',
    './games/kamer.html',
    './games/kiekeboe.html',
    './games/kleuren.html',
    './games/kleurenmixen.html',
    './games/kleurensorteren.html',
    './games/letters.html',
    './games/memory.html',
    './games/mixen.html',
    './games/muziektuin.html',
    './games/piano.html',
    './games/pizza.html',
    './games/plaatjefout.html',
    './games/poetsen.html',
    './games/prinses.html',
    './games/prinses/css/village.css',
    './games/prinses/css/dorp/markt.css',
    './games/prinses/css/dorp/ijssalon.css',
    './games/prinses/css/sky.css',
    './games/prinses/css/wolken/weermakerij.css',
    './games/prinses/css/wolken/wolkenkasteel.css',
    './games/prinses/css/core.css',
    './games/prinses/css/map.css',
    './games/prinses/css/outside.css',
    './games/prinses/css/overlay.css',
    './games/prinses/css/rooms/badkamer.css',
    './games/prinses/css/rooms/bakkerij.css',
    './games/prinses/css/rooms/balzaal.css',
    './games/prinses/css/rooms/borduurkamer.css',
    './games/prinses/css/rooms/cadeaukamer.css',
    './games/prinses/css/rooms/dierensalon.css',
    './games/prinses/css/rooms/eetkamer.css',
    './games/prinses/css/rooms/elvenkamer.css',
    './games/prinses/css/rooms/hartjeskamer.css',
    './games/prinses/css/rooms/ijskamer.css',
    './games/prinses/css/rooms/juwelierskamer.css',
    './games/prinses/css/rooms/kasteelhal.css',
    './games/prinses/css/rooms/nagelsalon.css',
    './games/prinses/css/rooms/ouderslaapkamer.css',
    './games/prinses/css/parents.css',
    './games/prinses/css/rooms/poppenhuis.css',
    './games/prinses/css/rooms/regenboogzaal.css',
    './games/prinses/css/rooms/slaapkamer.css',
    './games/prinses/css/rooms/speelkamer.css',
    './games/prinses/css/rooms/spiegelkamer.css',
    './games/prinses/css/rooms/sterrenkamer.css',
    './games/prinses/css/rooms/torenkamer.css',
    './games/prinses/css/rooms/troonzaal.css',
    './games/prinses/css/sea.css',
    './games/prinses/css/stickers.css',
    './games/prinses/js/village.js',
    './games/prinses/js/dorp/dorpsplein.js',
    './games/prinses/js/dorp/markt.js',
    './games/prinses/js/dorp/ijssalon.js',
    './games/prinses/js/sky.js',
    './games/prinses/js/wolken/wolkenpoort.js',
    './games/prinses/js/wolken/weermakerij.js',
    './games/prinses/js/wolken/wolkenkasteel.js',
    './games/prinses/js/core.js',
    './games/prinses/js/engine.js',
    './games/prinses/js/main.js',
    './games/prinses/js/map.js',
    './games/prinses/js/outside.js',
    './games/prinses/js/rooms/badkamer.js',
    './games/prinses/js/rooms/bakkerij.js',
    './games/prinses/js/rooms/balzaal.js',
    './games/prinses/js/rooms/borduurkamer.js',
    './games/prinses/js/rooms/cadeaukamer.js',
    './games/prinses/js/rooms/dierensalon.js',
    './games/prinses/js/rooms/eetkamer.js',
    './games/prinses/js/rooms/elvenkamer.js',
    './games/prinses/js/rooms/hartjeskamer.js',
    './games/prinses/js/rooms/ijskamer.js',
    './games/prinses/js/rooms/juwelierskamer.js',
    './games/prinses/js/rooms/kasteelhal.js',
    './games/prinses/js/rooms/nagelsalon.js',
    './games/prinses/js/rooms/ouderslaapkamer.js',
    './games/prinses/js/parents.js',
    './games/prinses/js/rooms/poppenhuis.js',
    './games/prinses/js/rooms/regenboogzaal.js',
    './games/prinses/js/rooms/slaapkamer.js',
    './games/prinses/js/rooms/speelkamer.js',
    './games/prinses/js/rooms/spiegelkamer.js',
    './games/prinses/js/rooms/sterrenkamer.js',
    './games/prinses/js/rooms/torenkamer.js',
    './games/prinses/js/rooms/troonzaal.js',
    './games/prinses/js/sea.js',
    './games/prinses/js/stickers.js',
    './games/prinses/js/wand.js',
    './games/prinses/js/world.js',
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

    // Network-first for scripts and styles too: the princess game is split over many
    // files, and mixing a fresh page with stale cached code from an older release breaks it.
    if (isSameOrigin && /\.(js|css)$/.test(url.pathname)) {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(request);
                if (fresh && fresh.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, fresh.clone());
                }
                return fresh;
            } catch (_) {
                return (await caches.match(request)) || Response.error();
            }
        })());
        return;
    }

    // Cache-first for other static assets with background refresh.
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
