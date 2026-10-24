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
    './games/prinses/css/kaartjes.css',
    './games/prinses/css/lights.css',
    './games/prinses/css/dorp/markt.css',
    './games/prinses/css/dorp/ijssalon.css',
    './games/prinses/css/dorp/boerderij.css',
    './games/prinses/css/dorp/bloemenwinkel.css',
    './games/prinses/css/dorp/station.css',
    './games/prinses/css/dorp/spookhuis.css',
    './games/prinses/css/dorp/moestuin.css',
    './games/prinses/css/rooms/wc.css',
    './games/prinses/css/dorp/strand.css',
    './games/prinses/css/dorp/pluktuin.css',
    './games/prinses/css/dorp/vlinderkas.css',
    './games/prinses/css/dorp/kermis.css',
    './games/prinses/css/dierentuin.css',
    './games/prinses/css/dierentuin/ingang.css',
    './games/prinses/css/dierentuin/apenhuis.css',
    './games/prinses/css/dierentuin/savanne.css',
    './games/prinses/css/dierentuin/pinguins.css',
    './games/prinses/css/dierentuin/olifanten.css',
    './games/prinses/css/rooms/minigolf.css',
    './games/prinses/css/sky.css',
    './games/prinses/css/wolken/weermakerij.css',
    './games/prinses/css/wolken/wolkenkasteel.css',
    './games/prinses/css/wolken/regenboogmakerij.css',
    './games/prinses/css/wolken/raketwolk.css',
    './games/prinses/css/ruimte.css',
    './games/prinses/css/ruimte/maan.css',
    './games/prinses/css/ruimte/spiraal.css',
    './games/prinses/css/ruimte/poezenplaneten.css',
    './games/prinses/css/ruimte/ruimtehaven.css',
    './games/prinses/css/tokens.css',
    './games/prinses/css/core.css',
    './games/prinses/css/map.css',
    './games/prinses/css/outside.css',
    './games/prinses/css/piraten.css',
    './games/prinses/css/overlay.css',
    './games/prinses/css/rooms/badkamer.css',
    './games/prinses/css/rooms/bakkerij.css',
    './games/prinses/css/rooms/ranjakamer.css',
    './games/prinses/css/rooms/smoothiebar.css',
    './games/prinses/css/rooms/balzaal.css',
    './games/prinses/css/rooms/borduurkamer.css',
    './games/prinses/css/rooms/cadeaukamer.css',
    './games/prinses/css/rooms/dierensalon.css',
    './games/prinses/css/rooms/kristalgrot.css',
    './games/prinses/css/rooms/eetkamer.css',
    './games/prinses/css/rooms/elvenkamer.css',
    './games/prinses/css/rooms/kapsalon.css',
    './games/prinses/css/rooms/eetzaal.css',
    './games/prinses/css/rooms/trofeekamer.css',
    './games/prinses/css/rooms/parfumerie.css',
    './games/prinses/css/rooms/glitterkamer.css',
    './games/prinses/css/rooms/muziekkamer.css',
    './games/prinses/css/rooms/lieveheersbeestjes.css',
    './games/prinses/css/rooms/fotostudio.css',
    './games/prinses/css/rooms/plakboek.css',
    './games/prinses/css/rooms/legokamer.css',
    './games/prinses/css/rooms/basketbal.css',
    './games/prinses/css/rooms/troetelberen.css',
    './games/prinses/css/rooms/halloween.css',
    './games/prinses/css/rooms/knopjeskamer.css',
    './games/prinses/css/rooms/dokterskamer.css',
    './games/prinses/css/rooms/feestzaal.css',
    './games/prinses/css/unicornstyle.css',
    './games/prinses/css/unicorncare.css',
    './games/prinses/css/rooms/zwembad.css',
    './games/prinses/css/rooms/hartjeskamer.css',
    './games/prinses/css/rooms/ijskamer.css',
    './games/prinses/css/rooms/juwelierskamer.css',
    './games/prinses/css/rooms/kasteelhal.css',
    './games/prinses/css/rooms/nagelsalon.css',
    './games/prinses/css/rooms/ouderslaapkamer.css',
    './games/prinses/css/rooms/werkkamer.css',
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
    './games/prinses/js/kaartjes.js',
    './games/prinses/js/lights.js',
    './games/prinses/js/dorp/dorpsplein.js',
    './games/prinses/js/dorp/markt.js',
    './games/prinses/js/dorp/ijssalon.js',
    './games/prinses/js/dorp/boerderij.js',
    './games/prinses/js/dorp/bloemenwinkel.js',
    './games/prinses/js/dorp/station.js',
    './games/prinses/js/dorp/spookhuis.js',
    './games/prinses/js/dorp/moestuin.js',
    './games/prinses/js/rooms/wc.js',
    './games/prinses/js/dorp/strand.js',
    './games/prinses/js/dorp/pluktuin.js',
    './games/prinses/js/dorp/vlinderkas.js',
    './games/prinses/js/dorp/kermis.js',
    './games/prinses/js/dierentuin.js',
    './games/prinses/js/dierentuin/ingang.js',
    './games/prinses/js/dierentuin/apenhuis.js',
    './games/prinses/js/dierentuin/savanne.js',
    './games/prinses/js/dierentuin/pinguins.js',
    './games/prinses/js/dierentuin/olifanten.js',
    './games/prinses/js/rooms/minigolf.js',
    './games/prinses/js/sky.js',
    './games/prinses/js/wolken/wolkenpoort.js',
    './games/prinses/js/wolken/weermakerij.js',
    './games/prinses/js/wolken/wolkenkasteel.js',
    './games/prinses/js/wolken/regenboogmakerij.js',
    './games/prinses/js/wolken/raketwolk.js',
    './games/prinses/js/ruimte.js',
    './games/prinses/js/ruimte/maan.js',
    './games/prinses/js/ruimte/spiraal.js',
    './games/prinses/js/ruimte/poezenplaneten.js',
    './games/prinses/js/ruimte/ruimtehaven.js',
    './games/prinses/js/core.js',
    './games/prinses/js/overlay.js',
    './games/prinses/js/audio.js',
    './games/prinses/js/engine.js',
    './games/prinses/js/main.js',
    './games/prinses/js/map.js',
    './games/prinses/js/outside.js',
    './games/prinses/js/piraten.js',
    './games/prinses/js/rooms/badkamer.js',
    './games/prinses/js/rooms/bakkerij.js',
    './games/prinses/js/rooms/ranjakamer.js',
    './games/prinses/js/rooms/smoothiebar.js',
    './games/prinses/js/rooms/balzaal.js',
    './games/prinses/js/rooms/borduurkamer.js',
    './games/prinses/js/rooms/cadeaukamer.js',
    './games/prinses/js/rooms/dierensalon.js',
    './games/prinses/js/rooms/kristalgrot.js',
    './games/prinses/js/rooms/eetkamer.js',
    './games/prinses/js/rooms/elvenkamer.js',
    './games/prinses/js/rooms/kapsalon.js',
    './games/prinses/js/rooms/eetzaal.js',
    './games/prinses/js/rooms/trofeekamer.js',
    './games/prinses/js/rooms/parfumerie.js',
    './games/prinses/js/rooms/glitterkamer.js',
    './games/prinses/js/rooms/muziekkamer.js',
    './games/prinses/js/rooms/lieveheersbeestjes.js',
    './games/prinses/js/rooms/fotostudio.js',
    './games/prinses/js/rooms/plakboek.js',
    './games/prinses/js/rooms/legokamer.js',
    './games/prinses/js/rooms/basketbal.js',
    './games/prinses/js/rooms/troetelberen.js',
    './games/prinses/js/rooms/halloween.js',
    './games/prinses/js/rooms/knopjeskamer.js',
    './games/prinses/js/rooms/dokterskamer.js',
    './games/prinses/js/rooms/feestzaal.js',
    './games/prinses/js/unicornstyle.js',
    './games/prinses/js/unicorncare.js',
    './games/prinses/js/rooms/zwembad.js',
    './games/prinses/js/rooms/hartjeskamer.js',
    './games/prinses/js/rooms/ijskamer.js',
    './games/prinses/js/rooms/juwelierskamer.js',
    './games/prinses/js/rooms/kasteelhal.js',
    './games/prinses/js/rooms/nagelsalon.js',
    './games/prinses/js/rooms/ouderslaapkamer.js',
    './games/prinses/js/rooms/werkkamer.js',
    './games/prinses/js/parents.js',
    './games/prinses/js/rooms/poppenhuis.js',
    './games/prinses/js/rooms/regenboogzaal.js',
    './games/prinses/js/rooms/slaapkamer.js',
    './games/prinses/js/rooms/pyjama.js',
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
            // cache: 'reload' skips the browser's HTTP cache (GitHub Pages says max-age=600),
            // otherwise a new release can be filled with files from the previous one
            PRECACHE_URLS.map((url) =>
                cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
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

// Always ask the server whether a file changed (a cheap 304 when it didn't),
// instead of trusting the browser's HTTP cache for up to 10 minutes after a deploy.
function fetchFresh(request) {
    if (request.mode === 'navigate') {
        // Safari refuses redirected responses for page loads; fall back to the plain request then
        return fetch(request.url, { cache: 'no-cache', credentials: 'same-origin' })
            .then((res) => (res.redirected ? fetch(request) : res));
    }
    return fetch(new Request(request, { cache: 'no-cache' }));
}

// Games are opened as games/x.html?v=<release>, but precached without the query
function fromCache(request) {
    return caches.match(request, { ignoreSearch: true });
}

// On slow wifi, don't keep the child waiting: after NETWORK_TIMEOUT use the cached copy
// (the fetch still finishes in the background and refreshes the cache).
const NETWORK_TIMEOUT = 2500;

function networkFirst(event, request, fallback) {
    const network = fetchFresh(request).then(async (fresh) => {
        if (fresh && fresh.ok && !fresh.redirected) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, fresh.clone());
        }
        return fresh;
    });
    event.waitUntil(network.catch(() => {}));
    const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT));
    return (async () => {
        const first = await Promise.race([network.catch(() => null), timeout]);
        if (first && first.ok) return first;
        const cached = await fromCache(request);
        if (cached) return cached;
        // Nothing cached: wait for the network after all (or show the server's answer)
        try {
            return first || (await network);
        } catch {
            return fallback();
        }
    })();
}

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

    // "Updates zoeken" must see what is on the server, never a cached copy
    if (isSameOrigin && url.searchParams.has('check')) {
        event.respondWith(fetch(request, { cache: 'no-store' }));
        return;
    }

    // Network-first for HTML/navigation so updates appear quickly in iPad PWA.
    if (isNavigation || (isSameOrigin && request.headers.get('accept')?.includes('text/html'))) {
        event.respondWith(networkFirst(event, request, async () => caches.match('./index.html')));
        return;
    }

    // Network-first for scripts and styles too: the princess game is split over many
    // files, and mixing a fresh page with stale cached code from an older release breaks it.
    if (isSameOrigin && /\.(js|css)$/.test(url.pathname)) {
        event.respondWith(networkFirst(event, request, async () => Response.error()));
        return;
    }

    // Cache-first for other static assets with background refresh.
    event.respondWith((async () => {
        const cached = await fromCache(request);
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
