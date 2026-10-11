/* 💡 Dag en nacht, en lampen in het kasteel.
   Het wordt vanzelf af en toe nacht (DAY_S seconden dag, NIGHT_S nacht), of je wisselt met de ☀️/🌙-knop.
   Elke kamer krijgt een donker laagje (.night-shade) dat 's nachts zichtbaar wordt. In het kasteel
   hangt in elke kamer een lamp (tik erop, of gebruik de 💡-lichtknop): is de lamp aan, dan is de kamer
   's nachts lekker licht. Buiten wordt het donker met sterretjes; onder water en in de ruimte niet.
   Een kamer kan de plek van de lamp kiezen met `lampX` in defineRoom (standaard 640). */
const DAY_S = 240;
const NIGHT_S = 120;
const LAMP_Y = 26;
const NO_NIGHT = ['sea', 'ruimte'];
const lights = { night: false, t: 0, on: new Set(), shades: {}, lamps: {}, hinted: new Set() };

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
