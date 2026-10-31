/* 📺 Dierenkamer en mensenkamer: een groot scherm aan de muur vol dieren of mensen.
   Tik er een aan en hij springt uit het scherm en loopt echt door de kamer (tik hem dan aan: geluidje en iets leuks).
   Het scherm zelf (de rand) kiest er eentje voor je; de afstandsbediening stuurt ze allemaal terug in het scherm.
   Mensen met alleen een hoofd-emoji (body) krijgen een getekend lijfje met benen die meelopen. */
const SK_MAX = 8;          // per kamer; de oudste gaat terug in het scherm
const SK_FX = 1100;

function skSeq(notes, step, type = 'triangle', vol = 0.1) {
    notes.forEach((f, i) => setTimeout(() => playTone(f, step / 1000 * 0.9, vol, type), i * step));
}

// tile: op het scherm, real: in de kamer (anders tile), size: px, fly: zweeft, fx: wat er bij tikken uit komt
const SK_ANIMALS = [
    { tile: '🐶', real: '🐕', size: 90, fx: '🦴', snd: () => [0, 220].forEach(t => setTimeout(() => playFreqSweep(500, 300, 0.12, 0.18), t)) },
    { tile: '🐱', real: '🐈', size: 80, fx: '🧶', snd: () => { playFreqSweep(600, 900, 0.2, 0.1); setTimeout(() => playFreqSweep(900, 500, 0.35, 0.1), 200); } },
    { tile: '🐰', real: '🐇', size: 70, fx: '🥕', snd: () => zooSqueak() },
    { tile: '🦁', size: 100, fx: '💥', snd: () => zooRoar() },
    { tile: '🐘', size: 140, fx: '💦', snd: () => zooTrumpet() },
    { tile: '🦒', size: 150, fx: '🌿', snd: () => playFreqSweep(200, 260, 0.5, 0.1) },
    { tile: '🐵', real: '🐒', size: 90, fx: '🍌', snd: () => zooMonkey() },
    { tile: '🐷', real: '🐖', size: 90, fx: '💩', snd: () => [0, 160].forEach(t => setTimeout(() => playFreqSweep(260, 180, 0.12, 0.2), t)) },
    { tile: '🐮', real: '🐄', size: 130, fx: '🥛', snd: () => { playTone(150, 0.9, 0.18, 'sawtooth'); playFreqSweep(170, 120, 0.9, 0.12); } },
    { tile: '🐑', size: 90, fx: '☁️', snd: () => [0, 90, 180, 270].forEach(t => setTimeout(() => playTone(420, 0.09, 0.12, 'sawtooth'), t)) },
    { tile: '🐴', real: '🐎', size: 130, fx: '🍎', snd: () => [0, 110, 220, 330, 440].forEach((t, i) => setTimeout(() => playTone(900 - i * 90, 0.1, 0.1, 'sawtooth'), t)) },
    { tile: '🐸', size: 64, fx: '🪰', snd: () => [0, 200].forEach(t => setTimeout(() => playFreqSweep(180, 120, 0.1, 0.2), t)) },
    { tile: '🐧', size: 74, fx: '🐟', snd: () => skSeq([900, 1100, 900], 110, 'square', 0.06) },
    { tile: '🐔', size: 70, fx: '🥚', snd: () => skSeq([700, 760, 700, 1000], 120, 'square', 0.06) },
    { tile: '🦆', size: 66, fx: '🫧', snd: () => [0, 180].forEach(t => setTimeout(() => playFreqSweep(500, 380, 0.1, 0.12), t)) },
    { tile: '🐻', size: 100, fx: '🍯', snd: () => playFreqSweep(140, 90, 0.7, 0.15) },
    { tile: '🦄', size: 100, fx: '🌈', snd: () => skSeq([1047, 1319, 1568, 2093], 90, 'sine') },
    { tile: '🦖', size: 150, fx: '💥', snd: () => { zooRoar(); setTimeout(() => playFreqSweep(120, 60, 0.6, 0.15), 300); } }
];

// shirt/pants: lijfje onder een hoofd-emoji; zonder = de emoji heeft zelf al een heel lijf
const SK_PEOPLE = [
    { tile: '👮‍♀️', shirt: '#1e40af', pants: '#1e293b', fx: '🚨', snd: () => skSeq([700, 950, 700, 950], 260, 'sine', 0.08) },
    { tile: '👩‍🚒', shirt: '#dc2626', pants: '#7f1d1d', fx: '💦', snd: () => { startNoise('dryer'); setTimeout(stopNoise, 600); } },
    { tile: '👩‍🍳', shirt: '#f8fafc', pants: '#334155', fx: '🧁', snd: () => skSeq([523, 659, 784], 120) },
    { tile: '👩‍⚕️', shirt: '#bae6fd', pants: '#0e7490', fx: '❤️‍🩹', snd: () => skSeq([880, 0, 880], 150, 'sine', 0.08) },
    { tile: '🧑‍🚀', shirt: '#e5e7eb', pants: '#94a3b8', fx: '🚀', snd: () => playFreqSweep(200, 1200, 0.8, 0.1) },
    { tile: '👷', shirt: '#f97316', pants: '#1d4ed8', fx: '🔨', snd: () => skSeq([200, 200, 200], 180, 'square', 0.08) },
    { tile: '🧑‍🌾', shirt: '#16a34a', pants: '#a16207', fx: '🌽', snd: () => skSeq([392, 440, 494, 392], 140) },
    { tile: '👩‍🎤', shirt: '#a21caf', pants: '#111827', fx: '🎵', snd: () => skSeq([659, 784, 880, 784, 659], 150, 'sine') },
    { tile: '🤡', shirt: '#facc15', pants: '#2563eb', fx: '🎈', snd: () => [0, 260].forEach(t => setTimeout(() => playFreqSweep(400, 250, 0.18, 0.15), t)) },
    { tile: '👵', shirt: '#c084fc', pants: '#6b21a8', fx: '🍪', snd: () => skSeq([523, 494, 523], 160) },
    { tile: '🎅', shirt: '#dc2626', pants: '#991b1b', fx: '🎁', snd: () => skSeq([330, 330, 330], 220, 'sine', 0.12) },
    { tile: '🤴', shirt: '#7c3aed', pants: '#4c1d95', fx: '👑', snd: () => skSeq([523, 659, 784, 1047], 130, 'square', 0.06) },
    { tile: '👶', shirt: '#fbcfe8', pants: '#f9a8d4', small: true, fx: '🍼', snd: () => skSeq([1200, 1500, 1200], 100, 'sine') },
    { tile: '🧚‍♀️', size: 100, fly: true, fx: '✨', snd: () => skSeq([1568, 1760, 2093, 2349], 80, 'sine') },
    { tile: '🦸‍♀️', size: 110, fly: true, fx: '⭐', snd: () => playFreqSweep(300, 1500, 0.5, 0.1) },
    { tile: '🧙‍♀️', size: 110, fx: '🪄', snd: () => { playSparkleSound(); playFreqSweep(800, 1600, 0.4, 0.08); } },
    { tile: '💃', size: 110, fx: '🌹', snd: () => skSeq([440, 554, 659, 554, 440, 554], 140, 'sine') },
    { tile: '🧜‍♀️', size: 110, fx: '🫧', snd: () => [0, 120, 240, 360].forEach(t => setTimeout(() => playFreqSweep(500, 1100, 0.08, 0.08), t)) }
];

const SK_ROOMS = {};       // room key -> { list, screen, x }

function addScreenRoom(key, name, icon, items) {
    defineRoom({
        key, name, icon,
        say: name === 'Dierenkamer' ? 'De dierenkamer' : 'De mensenkamer',
        build(x) {
            const tiles = items.map((it, i) => `<span class="sk-tile" data-i="${i}">${it.tile}</span>`).join('');
            const screen = addObj(`<div class="sk-tv"><div class="sk-scr">${tiles}</div><div class="sk-led"></div>
                <div class="tap-hint" style="left:236px;top:-40px">👇</div></div>`, x + 150, 76, x + 400, () => skSpawn(key, randomPick(items)));
            SK_ROOMS[key] = { list: [], screen, x };
            screen.querySelectorAll('.sk-tile').forEach(t => t.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (state.busy) return;
                bounceEl(t, 'jump');
                playPop();
                skSpawn(key, items[+t.dataset.i], t);
                earnSticker(key, t);
            }));
            place(el('<div class="sk-cabinet"><i></i><i></i></div>'), x + 30, 290);
            addObj('<div class="emoji-obj sk-remote">🎛️</div>', x + 52, 250, x + 110, skAllBack.bind(null, key));
            addObj(`<div class="emoji-obj sk-plant">${key === 'dierenkamer' ? '🌳' : '🪴'}</div>`, x + 700, 300, x + 700, (node) => {
                bounceEl(node, 'wobble');
                sparkleShower(x + 740, 320, 14);
            });
        },
        tick: (dt) => skTick(key, dt)
    });
}

function skPersonHTML(it) {
    if (!it.shirt) return `<span class="sk-emo" style="font-size:${it.size}px">${it.tile}</span>`;
    return `<div class="sk-person${it.small ? ' small' : ''}" style="--shirt:${it.shirt};--pants:${it.pants}">
        <span class="sk-head">${it.tile}</span><div class="sk-torso"></div><div class="sk-leg l"></div><div class="sk-leg r"></div></div>`;
}

// Out of the screen (from the tapped tile, or the middle) onto the floor
function skSpawn(key, it, tile) {
    const room = SK_ROOMS[key];
    if (room.list.length >= SK_MAX) skBack(key, room.list[0]);
    const r = (tile || room.screen.querySelector('.sk-scr')).getBoundingClientRect();
    const from = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    const c = {
        it, x: room.x + 80 + Math.random() * 640, y: 418 + Math.random() * 60,
        tx: 0, wait: 1.2, busy: true, face: 1
    };
    c.tx = c.x;
    const inner = it.shirt ? skPersonHTML(it) : `<span class="sk-emo" style="font-size:${it.size || 110}px">${it.real || it.tile}</span>`;
    c.node = place(el(`<div class="sk-real${it.fly ? ' fly' : ''}"><div class="sk-grow"><div class="sk-flip"><div class="sk-body">${inner}</div></div></div></div>`), from.x, from.y + 30);
    c.node.style.zIndex = c.y > FEET_Y ? 11 : 9;
    c.node.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        skTapReal(c);
    });
    room.list.push(c);
    playFreqSweep(300, 1400, 0.35, 0.1);
    burst(from.x, from.y, 18);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        c.node.classList.add('out');
        c.node.style.left = c.x + 'px';
        c.node.style.top = c.y + 'px';
    }));
    setTimeout(() => {
        c.node.classList.add('landed');
        burst(c.x, c.y - 10, 14);
        it.snd();
        c.busy = false;
    }, 800);
}

function skTapReal(c) {
    if (c.busy) return;
    c.wait = Math.max(c.wait, 1.2);
    zooAnim(c.node.querySelector('.sk-body'), 'sk-hop');
    c.it.snd();
    const h = (c.it.size || (c.it.small ? 90 : 150));
    for (let i = 0; i < 3; i++) {
        const f = place(el(`<div class="sk-fx">${i ? '💖' : c.it.fx}</div>`), c.x + (i - 1) * 30, c.y - h - 10);
        f.style.animationDelay = i * 0.12 + 's';
        setTimeout(() => f.remove(), SK_FX + 400);
    }
    burst(c.x, c.y - h / 2, 12);
}

// Back into the screen
function skBack(key, c) {
    const room = SK_ROOMS[key];
    room.list = room.list.filter(o => o !== c);
    c.busy = true;
    const r = room.screen.querySelector('.sk-scr').getBoundingClientRect();
    const to = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    c.node.classList.remove('out', 'landed');
    c.node.classList.add('back');
    c.node.style.left = to.x + 'px';
    c.node.style.top = to.y + 30 + 'px';
    setTimeout(() => c.node.remove(), 750);
}

function skAllBack(key) {
    const room = SK_ROOMS[key];
    if (!room.list.length) {
        bounceEl(room.screen, 'pulse');
        return;
    }
    room.list.slice().forEach((c, i) => setTimeout(() => skBack(key, c), i * 120));
    playFreqSweep(1400, 300, 0.5, 0.1);
}

// Walk around the room: a little way, stand still, again
function skTick(key, dt) {
    const room = SK_ROOMS[key];
    if (!room) return;
    for (const c of room.list) {
        if (c.busy) continue;
        if (c.wait > 0) {
            c.wait -= dt;
            if (c.wait <= 0) {
                c.tx = Math.max(room.x + 70, Math.min(room.x + 730, c.x + (Math.random() - 0.5) * 420));
                if (Math.abs(c.tx - c.x) < 40) c.wait = 0.5;
            }
            continue;
        }
        const d = c.tx - c.x;
        const step = (c.it.size >= 130 ? 60 : 90) * dt;
        if (Math.abs(d) <= step) {
            c.x = c.tx;
            c.wait = 1 + Math.random() * 3;
            c.node.classList.remove('walk');
        } else {
            c.x += Math.sign(d) * step;
            // Emoji look left, so walking right = mirrored
            const face = d > 0 ? -1 : 1;
            if (face !== c.face) {
                c.face = face;
                c.node.querySelector('.sk-flip').style.transform = `scaleX(${face})`;
            }
            c.node.classList.add('walk');
        }
        c.node.style.left = c.x + 'px';
    }
}

addScreenRoom('dierenkamer', 'Dierenkamer', '🐾', SK_ANIMALS);
addScreenRoom('mensenkamer', 'Mensenkamer', '🧑‍🤝‍🧑', SK_PEOPLE);
