/* 🛸 Ruimtehaven: het ruimteschip voor ruimtereizen, een planetenbord, een ruimtehondje en een tankpomp.
   Ruimtereis (overlay, drie stappen):
   1. sterrenkaart: kies een planeet (gestempelde planeten staan in het ruimtepaspoort, localStorage);
   2. vliegen: stuur de raket met je vinger omhoog/omlaag, vang sterren, bots (zonder straf) tegen rotsjes;
      getekend op een canvas;
   3. landen: de planeet met dingen om aan te tikken, dan weer "verder vliegen". */
const TRIP_KEY = 'noor-prinses-planeten';
const TRIP_MS = 14000;     // flight time to a planet
const PLANETS = [
    { k: 'snoep', name: 'Snoepplaneet', icon: '🍭', c1: '#f9a8d4', c2: '#c084fc', items: ['🍭', '🍬', '🧁', '🍩', '🍫', '🍪'], fx: ['🍬', '✨', '💖'] },
    { k: 'ijs', name: 'IJsplaneet', icon: '🧊', c1: '#e0f2fe', c2: '#38bdf8', items: ['⛄', '🐧', '❄️', '🧊', '🦭', '🏔️'], fx: ['❄️', '✨'] },
    { k: 'dino', name: 'Dinoplaneet', icon: '🦕', c1: '#bef264', c2: '#4d7c0f', items: ['🦕', '🦖', '🌋', '🥚', '🌴', '🦴'], fx: ['💥', '🍃'] },
    { k: 'regenboog', name: 'Regenboogplaneet', icon: '🌈', c1: '#fde68a', c2: '#f472b6', items: ['🌈', '🦄', '☁️', '⭐', '🎨', '💖'], fx: ['🌈', '💖', '⭐'] },
    { k: 'bloemen', name: 'Bloemenplaneet', icon: '🌸', c1: '#fbcfe8', c2: '#22c55e', items: ['🌷', '🌻', '🌸', '🐝', '🦋', '🍄'], fx: ['🌸', '🦋'] },
    { k: 'muziek', name: 'Muziekplaneet', icon: '🎵', c1: '#c4b5fd', c2: '#4338ca', items: ['🎹', '🥁', '🎺', '🎸', '🎻', '🎷'], fx: ['🎵', '🎶'] }
];
// Where the things stand on a planet (% of the landing scene)
const PLANET_SPOTS = [[14, 58], [32, 74], [50, 56], [66, 76], [82, 58], [90, 80]];
let tripVisited = new Set();
try {
    const d = JSON.parse(localStorage.getItem(TRIP_KEY));
    if (Array.isArray(d)) tripVisited = new Set(d.filter(k => PLANETS.some(p => p.k === k)));
} catch (e) {}

defineRoom({
    key: 'ruimtehaven',
    name: 'Ruimtehaven',
    icon: '🛸',
    say: 'De ruimtehaven',
    build(x) {
        addObj(`<div class="rh-board">${PLANETS.map((p, i) => `<span style="animation-delay:${-i * 0.4}s">${p.icon}</span>`).join('')}<b>🗺️ Planeten</b></div>`, x + 40, 100, x + 160, (node) => {
            zooAnim(node, 'twinkle');
            PLANETS.forEach((p, i) => setTimeout(() => playTone(784 + i * 120, 0.12, 0.06, 'sine'), i * 90));
        });
        addObj(`<div class="rh-ship"><div class="dome"><span>👸</span></div><div class="hull"><i></i><i></i><i></i><i></i><i></i></div><div class="legs"></div>
            <div class="tap-hint" style="left:120px;top:-40px">👇</div></div>`, x + 250, 170, x + 400, openTrip);
        addObj('<div class="rh-dog"><span class="d">🐶</span><span class="helm"></span></div>', x + 580, 270, x + 600, (node) => {
            zooAnim(node, 'hop');
            [520, 620].forEach((f, i) => setTimeout(() => playTone(f, 0.1, 0.12, 'square'), i * 160));
        });
        addObj('<div class="rh-pump"><div class="body"><span>⛽</span><i></i></div><div class="hose"></div></div>', x + 680, 230, x + 700, (node) => {
            zooAnim(node, 'fill');
            playFreqSweep(200, 900, 1, 0.08);
        });
    }
});

/* ─────────── Ruimtereis (overlay) ─────────── */
const rtEl = document.getElementById('tripOv');
const rtCanvas = document.getElementById('tripCanvas');
const rtCtx = rtCanvas.getContext('2d');
let tripOpen = false;
const trip = { phase: 'map', planet: null, t0: 0, last: 0, raf: 0, W: 0, H: 0, dpr: 1, y: 0, ty: 0, stars: [], things: [], bg: [], got: 0, bonk: 0, landT: 0 };

function tripPhase(ph) {
    trip.phase = ph;
    rtEl.dataset.phase = ph;
}

/* ── 1. Sterrenkaart ── */
function tripMap() {
    tripPhase('map');
    cancelAnimationFrame(trip.raf);
    stopNoise();
    document.getElementById('tripMap').innerHTML = PLANETS.map(p =>
        `<button class="rt-planet${tripVisited.has(p.k) ? ' seen' : ''}" data-k="${p.k}" style="--c1:${p.c1};--c2:${p.c2}">
            <span class="ball"><span>${p.icon}</span></span><small>${p.name}</small></button>`).join('');
    document.querySelectorAll('.rt-planet').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bounceEl(b, 'jump');
        playPop();
        setTimeout(() => tripFly(PLANETS.find(p => p.k === b.dataset.k)), 250);
    }));
    document.getElementById('tripPass').textContent = `📕 ${tripVisited.size} / ${PLANETS.length}`;
    document.getElementById('tripTitle').textContent = '🗺️ Waar vliegen we heen?';
}

/* ── 2. Vliegen ── */
function tripFit() {
    const r = rtCanvas.getBoundingClientRect();
    trip.dpr = window.devicePixelRatio || 1;
    trip.W = r.width;
    trip.H = r.height;
    rtCanvas.width = Math.round(r.width * trip.dpr);
    rtCanvas.height = Math.round(r.height * trip.dpr);
}

function tripFly(planet) {
    trip.planet = planet;
    tripPhase('fly');
    tripFit();
    document.getElementById('tripTitle').textContent = `🚀 Naar de ${planet.name}!`;
    document.getElementById('tripGoal').textContent = planet.icon;
    trip.y = trip.ty = trip.H / 2;
    trip.things = [];
    trip.got = 0;
    trip.bonk = 0;
    trip.landT = 0;
    trip.t0 = performance.now();
    trip.last = 0;
    trip.next = 0;
    // Three layers of stars for depth
    trip.bg = Array.from({ length: 90 }, () => ({ x: Math.random() * trip.W, y: Math.random() * trip.H, z: [0.2, 0.5, 1][Math.floor(Math.random() * 3)] }));
    tripScore();
    startNoise('dryer');
    playFreqSweep(200, 800, 0.8, 0.1);
    cancelAnimationFrame(trip.raf);
    trip.raf = requestAnimationFrame(tripLoop);
}

function tripScore() { document.getElementById('tripStars').textContent = `⭐ ${trip.got}`; }

function tripSpawn() {
    const r = Math.random();
    const kind = r < 0.55 ? 'star' : r < 0.85 ? 'rock' : 'deco';
    const thing = { kind, x: trip.W + 60, y: 40 + Math.random() * (trip.H - 80), vy: (Math.random() - 0.5) * 30, rot: 0, hit: false };
    if (kind === 'star') thing.e = randomPick(['⭐', '⭐', '🌟', '💫']);
    if (kind === 'rock') thing.e = randomPick(['🪨', '☄️']);
    if (kind === 'deco') { thing.e = randomPick(['🛸', '🐱', '🌙', '🪐', '👽']); thing.y = 40 + Math.random() * trip.H * 0.3; }
    thing.s = kind === 'deco' ? 60 : kind === 'rock' ? 54 : 46;
    trip.things.push(thing);
}

function tripLoop(t) {
    if (!tripOpen || trip.phase !== 'fly') return;
    const dt = Math.min(0.05, (t - (trip.last || t)) / 1000);
    trip.last = t;
    trip.dt = dt;
    const k = Math.min(1, (t - trip.t0) / TRIP_MS);
    document.getElementById('tripRocket').style.left = (k * 100) + '%';
    const speed = trip.W * 0.45;
    const rx = trip.W * 0.18;
    trip.y += (trip.ty - trip.y) * Math.min(1, dt * 6);
    // Spawn things until the planet comes into view
    trip.next -= dt;
    if (k < 0.85 && trip.next <= 0) { tripSpawn(); trip.next = 0.45 + Math.random() * 0.5; }
    trip.things.forEach(th => {
        th.x -= speed * dt * (th.kind === 'deco' ? 0.5 : 1);
        th.y += th.vy * dt;
        th.rot += dt * (th.kind === 'rock' ? 2 : 0);
        if (th.hit || th.kind === 'deco') return;
        if (Math.hypot(th.x - rx, th.y - trip.y) < 50) {
            th.hit = true;
            if (th.kind === 'star') {
                trip.got++;
                tripScore();
                playTone(1200 + (trip.got % 6) * 120, 0.1, 0.08, 'sine');
                bounceEl(document.getElementById('tripStars'), 'jump');
            } else {
                // Bonk! The rock bounces away, the rocket wobbles; nothing is lost
                trip.bonk = 0.5;
                th.vy = (th.y < trip.y ? -1 : 1) * 260;
                playTone(140, 0.12, 0.15, 'triangle');
            }
        }
    });
    trip.things = trip.things.filter(th => th.x > -80 && !(th.kind === 'star' && th.hit));
    trip.bonk = Math.max(0, trip.bonk - dt);
    tripDraw(k, rx, t / 1000);
    if (k >= 1) {
        trip.landT += dt;
        if (trip.landT > 1.2) { tripLand(trip.planet); return; }
    }
    trip.raf = requestAnimationFrame(tripLoop);
}

function tripPlanetDraw(c, p, x, y, r) {
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, p.c1);
    g.addColorStop(1, p.c2);
    c.shadowColor = p.c1;
    c.shadowBlur = 30;
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.shadowBlur = 0;
    c.font = `${r * 0.9}px sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(p.icon, x, y + r * 0.05);
}

function tripDraw(k, rx, ts) {
    const c = rtCtx;
    const { W, H } = trip;
    c.setTransform(trip.dpr, 0, 0, trip.dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    // Stars streaming past (faster when closer)
    c.fillStyle = '#fff';
    trip.bg.forEach(s => {
        s.x -= W * 0.5 * s.z * (trip.dt || 0.016) * (1 + s.z);
        if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
        c.globalAlpha = 0.3 + s.z * 0.7;
        c.fillRect(s.x, s.y, 2 + s.z * 8, 1 + s.z * 1.5);
    });
    c.globalAlpha = 1;
    // The planet grows in from the right at the end of the trip
    if (k > 0.8) {
        const p = Math.min(1, (k - 0.8) / 0.2 + trip.landT);
        tripPlanetDraw(c, trip.planet, W + 40 - p * W * 0.42, H / 2, H * (0.15 + p * 0.45));
    }
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    trip.things.forEach(th => {
        c.save();
        c.translate(th.x, th.y);
        c.rotate(th.rot);
        c.font = `${th.s}px sans-serif`;
        c.globalAlpha = th.kind === 'deco' ? 0.8 : 1;
        c.fillText(th.e, 0, 0);
        c.restore();
    });
    // Rocket with a flame; flies into the planet at the end
    const fx = rx + (k >= 1 ? trip.landT * W * 0.5 : 0);
    const wob = trip.bonk > 0 ? Math.sin(ts * 60) * 0.3 : Math.sin(ts * 3) * 0.05;
    c.save();
    c.translate(fx, trip.y);
    c.rotate(Math.PI / 4 + wob + (trip.ty - trip.y) * 0.002);
    c.font = '72px sans-serif';
    c.fillText('🚀', 0, 0);
    c.restore();
    c.save();
    c.translate(fx - 50, trip.y + 4);
    const fl = c.createRadialGradient(0, 0, 2, 0, 0, 30);
    fl.addColorStop(0, '#fef08a');
    fl.addColorStop(0.5, 'rgba(251,146,60,0.8)');
    fl.addColorStop(1, 'rgba(251,146,60,0)');
    c.fillStyle = fl;
    c.beginPath(); c.ellipse(0, 0, 26 + Math.random() * 8, 12, 0, 0, Math.PI * 2); c.fill();
    c.restore();
}

function tripSteer(e) {
    if (trip.phase !== 'fly') return;
    const r = rtCanvas.getBoundingClientRect();
    trip.ty = Math.max(40, Math.min(trip.H - 40, e.clientY - r.top));
}
rtCanvas.addEventListener('pointerdown', (e) => { e.stopPropagation(); tripSteer(e); try { rtCanvas.setPointerCapture(e.pointerId); } catch (err) {} });
rtCanvas.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType !== 'mouse') tripSteer(e); });

/* ── 3. Landen ── */
function tripLand(p) {
    tripPhase('land');
    stopNoise();
    const first = !tripVisited.has(p.k);
    tripVisited.add(p.k);
    try { localStorage.setItem(TRIP_KEY, JSON.stringify([...tripVisited])); } catch (e) {}
    document.getElementById('tripPass').textContent = `📕 ${tripVisited.size} / ${PLANETS.length}`;
    document.getElementById('tripTitle').textContent = `${p.icon} Welkom op de ${p.name}!`;
    const land = document.getElementById('tripLand');
    land.style.setProperty('--c1', p.c1);
    land.style.setProperty('--c2', p.c2);
    land.innerHTML = `<div class="tl-sky"><span class="tl-planet" style="--c1:${p.c1};--c2:${p.c2}"></span></div><div class="tl-ground"></div>
        <span class="tl-rocket">🚀</span>
        ${p.items.map((it, i) => `<button class="tl-thing" data-i="${i}" style="left:${PLANET_SPOTS[i][0]}%;top:${PLANET_SPOTS[i][1]}%;animation-delay:${-i * 0.5}s">${it}</button>`).join('')}
        <div class="tl-stamp${first ? ' new' : ''}">${p.icon}<small>${first ? 'Nieuwe stempel!' : 'Al geweest ✓'}</small></div>
        <div class="tl-got">⭐ ${trip.got} sterren gevangen</div>`;
    land.querySelectorAll('.tl-thing').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        tripThing(p, b, +b.dataset.i);
    }));
    playWin();
    if (first) setTimeout(() => { ovCheer(rtEl, land.querySelector('.tl-stamp'), ['⭐', '🎉', p.icon]); playCorrect(); }, 700);
}

function tripThing(p, b, i) {
    zooAnim(b, 'boing');
    ovCheer(rtEl, b, p.fx);
    if (p.k === 'muziek') {
        // Every instrument plays its own little tune
        const base = [523, 587, 659, 698, 784, 880][i];
        const wave = ['sine', 'square', 'sawtooth', 'triangle', 'sine', 'triangle'][i];
        [0, 4, 7, 12].forEach((s, j) => setTimeout(() => playTone(base * Math.pow(2, s / 12), 0.18, 0.08, wave), j * 130));
    } else if (p.k === 'dino') {
        if (i < 2) zooRoar(); else playTone(110 + i * 20, 0.25, 0.15, 'triangle');
    } else if (p.k === 'ijs') {
        [1568, 2093, 2637].forEach((f, j) => setTimeout(() => playTone(f, 0.15, 0.05, 'sine'), j * 90));
    } else {
        playFreqSweep(500 + i * 120, 1200 + i * 120, 0.2, 0.08);
    }
}

function openTrip() {
    tripOpen = true;
    rtEl.classList.add('open');
    tripMap();
}
function closeTrip() {
    tripOpen = false;
    cancelAnimationFrame(trip.raf);
    stopNoise();
    rtEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('tripBack').addEventListener('pointerdown', (e) => { e.stopPropagation(); playPop(); tripMap(); });
document.getElementById('tripClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeTrip(); });
window.addEventListener('resize', () => { if (tripOpen && trip.phase === 'fly') tripFit(); });
rtEl.addEventListener('pointerdown', (e) => e.stopPropagation());
