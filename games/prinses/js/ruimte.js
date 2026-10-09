/* ─────────── Ruimte ───────────
   Een eigen wereld (scene 'ruimte') met de kamers uit js/ruimte/*.js. De prinses zweeft er (floatyScene)
   en draagt een astronautenhelm. Erheen: met de raket op de raketwolk (js/wolken/raketwolk.js);
   terug: met de raket op de maan. */

function buildSpace() {
    buildRooms('r-room');
    for (let i = 0; i < 40; i++) {
        const s = place(el(`<div class="r-star">${Math.random() < 0.2 ? '✦' : '·'}</div>`), Math.random() * WORLD_W, -480 + Math.random() * 820);
        s.style.animationDelay = (-Math.random() * 3) + 's';
        s.style.fontSize = (14 + Math.random() * 22) + 'px';
    }
    ROOMS.forEach((room, i) => room.build(i * ROOM_W));
}

function rocketRumble(ms) {
    startNoise('dryer');
    playFreqSweep(80, 400, ms / 1000, 0.12);
    setTimeout(stopNoise, ms - 200);
}

// A rocket that flies to another world (uses rideCarriage: .drive/.arrive are a launch and a landing here)
function addRocket(x, y, walkX, toKey) {
    const up = toKey === 'ruimte';
    const node = addObj(`<div class="koets rocket">
        <div class="k-ride"><div class="rk-body"><div class="rk-win"><span>${up ? '🐱' : '👽'}</span></div><div class="rk-fin l"></div><div class="rk-fin r"></div></div><div class="rk-flame"></div></div>
        <div class="rk-sign">${up ? '🚀 Naar de ruimte' : '☁️ Naar de wolken'}</div>
        <div class="tap-hint" style="left:62px;top:-40px">👇</div>
    </div>`, x, y, walkX, (n) => rideCarriage(n, toKey, { sound: rocketRumble, toast: up ? '🚀 De ruimte!' : '☁️ Terug in de wolken!' }));
    return { node, walkX };
}

function meow(pitch = 1) {
    playFreqSweep(600 * pitch, 950 * pitch, 0.15, 0.1);
    setTimeout(() => playFreqSweep(950 * pitch, 520 * pitch, 0.35, 0.1), 150);
}
function purr() {
    for (let i = 0; i < 10; i++) setTimeout(() => playTone(55 + (i % 2) * 8, 0.09, 0.12, 'sawtooth'), i * 95);
}

// A cat planet: a round planet with ears, a face, whiskers, a tail and maybe a collar ring
const CAT_COLORS = { roze: '#f472b6', blauw: '#38bdf8', geel: '#facc15', groen: '#4ade80', paars: '#a78bfa', oranje: '#fb923c' };
function catPlanetHTML(c, size, opts = {}) {
    const ring = opts.ring ? `<div class="ring back" style="--r:${opts.ring}"></div>` : '';
    const ringF = opts.ring ? `<div class="ring front" style="--r:${opts.ring}"></div>` : '';
    return `<div class="catpl${opts.sleepy ? ' sleepy' : ''}" style="--c:${c};--s:${size}px">
        ${ring}<div class="tail"></div><div class="ear l"></div><div class="ear r"></div>
        <div class="ball"><div class="eye l"></div><div class="eye r"></div><div class="nose"></div><div class="mouth">ω</div><div class="wh l"></div><div class="wh r"></div></div>
        ${ringF}${opts.sleepy ? '<span class="zz">💤</span>' : ''}</div>`;
}
// Tap a cat planet: happy eyes, meow and hearts
function catPlanetHappy(node, pitch) {
    const p = node.classList.contains('catpl') ? node : node.querySelector('.catpl');
    p.classList.remove('happy'); void p.offsetWidth; p.classList.add('happy');
    meow(pitch);
    setTimeout(purr, 500);
    setTimeout(() => p.classList.remove('happy'), 1800);
}
