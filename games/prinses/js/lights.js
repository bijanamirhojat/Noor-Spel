/* 💡 Dag en nacht, en lampen in het kasteel.
   Het wordt vanzelf af en toe nacht (DAY_S seconden dag, NIGHT_S nacht), of je wisselt met de ☀️/🌙-knop.
   Elke kamer krijgt een donker laagje (.night-shade) dat 's nachts zichtbaar wordt. In het kasteel
   hangt in elke kamer een lamp (tik erop, of gebruik de 💡-lichtknop): is de lamp aan, dan is de kamer
   's nachts lekker licht. Buiten wordt het donker met sterretjes; onder water en in de ruimte niet.
   Een kamer kan de plek van de lamp kiezen met `lampX` in defineRoom (standaard 640).
   Buiten 's nachts: lantaarnpalen gaan aan (tik = aan/uit), ramen van het kasteel en de huisjes
   gloeien, de zon wordt een maan, er vliegen vuurvliegjes en de eenhoorn slaapt (tik = wakker maken). */
const DAY_S = 240;
const NIGHT_S = 120;
const LAMP_Y = 26;
const NO_NIGHT = ['sea', 'ruimte'];
const lights = { night: false, t: 0, on: new Set(), shades: {}, lamps: {}, hinted: new Set(), lanterns: [], uniAwake: 0 };
// Outside: where lantern posts stand (no lanterns on the water or the beach)
const LANTERN_SCENES = ['out', 'dorp', 'dierentuin'];
const NO_LANTERN = ['meer', 'piratenbaai', 'strand'];
const UNI_AWAKE_MS = 60000;

function buildLights() {
    Object.values(SCENES).forEach(sc => {
        if (NO_NIGHT.includes(sc.key)) return;
        const inside = !!sc.inside;
        sc.rooms.forEach((room, i) => {
            const x = i * ROOM_W;
            const lx = room.lampX !== undefined ? room.lampX : 640;
            const shade = el(`<div class="night-shade${inside ? '' : ' outdoor'}" style="--lx:${lx}px;--ly:${LAMP_Y + 520}px"></div>`);
            shade.style.left = x + 'px';
            sc.el.appendChild(shade);
            lights.shades[room.key] = shade;
            if (!inside) return;
            const lamp = el(`<div class="lamp"><div class="cord"></div><div class="shade-top"></div><div class="bulb"></div><div class="beam"></div></div>`);
            lamp.style.left = (x + lx - 30) + 'px';
            lamp.style.top = '-500px';
            lamp.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (overlayOpen()) return;
                toggleLamp(room.key);
            });
            sc.el.appendChild(lamp);
            lights.lamps[room.key] = lamp;
        });
    });
    buildNightOutside();
    // Check the room and run the clock
    setInterval(lightsTick, 500);
    updateLightBtns();
}

function currentRoomKey() { return ROOMS[state.room] && ROOMS[state.room].key; }

function toggleLamp(key) {
    const on = !lights.on.has(key);
    if (on) lights.on.add(key); else lights.on.delete(key);
    lights.lamps[key].classList.toggle('on', on);
    lights.shades[key].classList.toggle('lit', on);
    // Click!
    playTone(on ? 1400 : 900, 0.03, 0.15, 'square');
    setTimeout(() => playTone(on ? 1800 : 600, 0.03, 0.1, 'square'), 40);
    const sw = document.getElementById('lampBtn');
    sw.classList.toggle('on', on);
    sw.classList.remove('call');
    if (on && lights.night) {
        const lx = parseFloat(lights.lamps[key].style.left) + 30;
        for (let i = 0; i < 20; i++) spawnSparkle(lx, LAMP_Y + 60, { speed: 120, hue: 45 + Math.random() * 15, size: 4 + Math.random() * 5 });
    }
}

function setNight(night, quiet) {
    if (lights.night === night) return;
    lights.night = night;
    lights.t = 0;
    if (night) lights.hinted.clear();
    playfield.classList.toggle('is-night', night);
    updateLightBtns();
    nightOutside(night);
    if (quiet) return;
    if (night) {
        showToast('🌙 Het wordt nacht! Doe de lampen aan 💡', 2600);
        [784, 659, 523, 392].forEach((f, i) => setTimeout(() => playTone(f, 0.4, 0.06, 'sine'), i * 220));
    } else {
        showToast('☀️ Goedemorgen! Het is weer dag!', 2200);
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.07, 'triangle'), i * 160));
    }
}

function updateLightBtns() {
    const dn = document.getElementById('dayBtn');
    dn.textContent = lights.night ? '🌙' : '☀️';
    dn.classList.toggle('moon', lights.night);
    const key = currentRoomKey();
    const sw = document.getElementById('lampBtn');
    const hasLamp = !!(scene && scene.inside && lights.lamps[key]);
    sw.classList.toggle('show', hasLamp);
    sw.classList.toggle('on', hasLamp && lights.on.has(key));
    // At night in a dark room: the light switch wiggles once to help
    if (hasLamp && lights.night && !lights.on.has(key)) {
        if (!lights.hinted.has(key)) {
            lights.hinted.add(key);
            sw.classList.remove('call'); void sw.offsetWidth; sw.classList.add('call');
        }
    }
}

let lightsLast = '';
function lightsTick() {
    const key = scene.key + ':' + currentRoomKey();
    if (key !== lightsLast) {
        lightsLast = key;
        updateLightBtns();
    }
    unicornSleepTick();
    fireflies();
    if (document.hidden || overlayOpen() || state.busy) return;
    lights.t += 0.5;
    if (lights.t >= (lights.night ? NIGHT_S : DAY_S)) setNight(!lights.night);
}

document.getElementById('dayBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (state.busy || overlayOpen()) return;
    setNight(!lights.night);
});
document.getElementById('lampBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (state.busy || overlayOpen()) return;
    const key = currentRoomKey();
    if (lights.lamps[key]) toggleLamp(key);
});

/* ─────────── Buiten 's nachts ─────────── */
function buildNightOutside() {
    LANTERN_SCENES.forEach(key => {
        const sc = SCENES[key];
        sc.rooms.forEach((room, i) => {
            if (NO_LANTERN.includes(room.key)) return;
            const ln = el('<div class="lantern"><div class="ln-head"><i></i></div><div class="ln-pole"></div><div class="ln-glow"></div></div>');
            ln.style.left = (i * ROOM_W + 14) + 'px';
            ln.style.top = (FEET_Y - 240) + 'px';
            ln.querySelector('.ln-head').addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (overlayOpen()) return;
                const on = ln.classList.toggle('on');
                playTone(on ? 1400 : 900, 0.03, 0.15, 'square');
                if (on) burst(i * ROOM_W + 39, FEET_Y - 220, 16);
            });
            sc.el.appendChild(ln);
            lights.lanterns.push(ln);
        });
        // Glowing windows: a warm copy on top of the dark layer, for some of the windows
        sc.el.querySelectorAll('.d-house').forEach(h => {
            h.querySelectorAll('.d-win').forEach(w => {
                if (!w.classList.contains('lit') && Math.random() < 0.45) return;
                nightWindow(sc.el, parseFloat(h.style.left) + 4 + parseFloat(w.style.left), parseFloat(h.style.top) + 4 + parseFloat(w.style.top), 52, 62, '22px 22px 4px 4px');
            });
        });
        sc.el.querySelectorAll('.tower').forEach(t => {
            t.querySelectorAll('.win').forEach(w => {
                nightWindow(sc.el, parseFloat(t.style.left) + 40, parseFloat(t.style.top) + parseFloat(w.style.top), 50, 70, '25px 25px 0 0');
            });
        });
    });
}

function nightWindow(worldEl, x, y, w, h, radius) {
    const g = el(`<div class="night-win" style="width:${w}px;height:${h}px;border-radius:${radius}"></div>`);
    g.style.left = x + 'px';
    g.style.top = y + 'px';
    g.style.animationDelay = (-Math.random() * 4) + 's';
    worldEl.appendChild(g);
}

function nightOutside(night) {
    lights.lanterns.forEach(ln => ln.classList.toggle('on', night));
    document.querySelectorAll('.lamppost').forEach(lp => lp.classList.toggle('on', night));
    const sun = document.querySelector('.sun');
    if (sun) sun.textContent = night ? '🌜' : '🌞';
    if (!night) lights.uniAwake = 0;
    unicornSleepTick();
}

// At night the unicorn sleeps in the meadow (unless you are riding it, or just woke it up)
function unicornSleepTick() {
    const u = unicornEl();
    if (!u) return;
    const sleep = lights.night && !state.riding && performance.now() > lights.uniAwake;
    if (sleep && !u.classList.contains('sleeping')) u.classList.add('sleeping');
    if (!sleep) u.classList.remove('sleeping');
    if (sleep && scene.key === 'out' && Math.random() < 0.6) {
        const z = el('<div class="zzz">💤</div>');
        place(z, state.uniX + (u.classList.contains('left') ? -70 : 40), FEET_Y - 150);
        setTimeout(() => z.remove(), 2200);
    }
}

function unicornAsleep() {
    const u = unicornEl();
    return !!u && u.classList.contains('sleeping');
}

function wakeUnicorn() {
    lights.uniAwake = performance.now() + UNI_AWAKE_MS;
    const u = unicornEl();
    u.classList.remove('sleeping');
    u.classList.remove('neigh'); void u.offsetWidth; u.classList.add('neigh');
    playFreqSweep(500, 1100, 0.25, 0.1);
    setTimeout(() => playFreqSweep(1100, 700, 0.35, 0.08), 250);
    sparkleShower(state.uniX, FEET_Y - 180, 30);
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak(randomPick(['Hihihi! Ik lag te slapen! Wil je een ritje?', 'Gaap… goedemorgen! O nee, het is nog nacht!']));
}

// Fireflies dance outside at night
function fireflies() {
    if (!lights.night || !LANTERN_SCENES.includes(scene.key) || document.hidden || overlayOpen()) return;
    for (let i = 0; i < 3; i++) {
        spawnSparkle(state.camX + Math.random() * state.viewW, 230 + Math.random() * 200, {
            vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 20, g: 0,
            hue: 60 + Math.random() * 30, size: 3 + Math.random() * 3, max: 1.8 + Math.random()
        });
    }
}
