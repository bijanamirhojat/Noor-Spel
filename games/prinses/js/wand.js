/* ─────────── Toverstaf ─────────── */
let lastCast = 0;
let spellDeck = [];

function wandPos() {
    return {
        x: state.x + state.facing * (0.38 * PRINCESS_W),
        y: FEET_Y - PRINCESS_H + 0.3 * PRINCESS_H - (state.riding ? RIDE_LIFT : 0) - state.alt
    };
}

function viewRange() {
    return { left: state.camX, right: state.camX + state.viewW, top: -state.offsetY / state.scale };
}

function tempEl(html, x, y, ms) {
    const n = place(el(html), x, y);
    setTimeout(() => n.remove(), ms);
    return n;
}

const SPELLS = [
    { name: '🌷 Bloementover!', cast: spellFlowers },
    { name: '🦋 Vlindertover!', cast: spellButterflies },
    { name: '❄️ Het sneeuwt!', cast: () => spellRain(['❄️', '❄️', '⭐']) },
    { name: '🍬 Snoepregen!', cast: () => spellRain(['🍬', '🍭', '🧁', '🍓']) },
    { name: '💖 Hartjesregen!', cast: () => spellRain(['💖', '💕', '💗']) },
    { name: '🌈 Toverkleuren!', cast: spellColors },
    { name: '🫧 Bellen blazen!', cast: spellBubbles },
    { name: '🐸 Dierentover!', cast: spellAnimals },
    { name: '🍄 Groot!', cast: () => spellSize('magic-grow') },
    { name: '🐭 Klein!', cast: () => spellSize('magic-tiny') },
    { name: '☁️ Zweven!', cast: spellFloat },
    { name: '🌈 Regenboog!', cast: spellRainbow },
    { name: '👗 Nieuwe jurk!', cast: spellDress },
    { name: '💎 Diamantmagneet!', cast: spellMagnet }
];

function castSpell() {
    const now = performance.now();
    if (state.busy || overlayOpen() || now - lastCast < 700) return;
    lastCast = now;

    const p = princessEl();
    p.classList.remove('casting');
    void p.offsetWidth;
    p.classList.add('casting');
    setTimeout(() => p.classList.remove('casting'), 700);
    const d = p.querySelector('.dancer');
    d.classList.remove('cast');
    void d.offsetWidth;
    d.classList.add('cast');
    setTimeout(() => d.classList.remove('cast'), 600);

    // Magic sound + glitter fountain from the wand
    [1047, 1319, 1568, 2093, 2637, 3136].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.08, 'sine'), i * 45));
    const w = wandPos();
    for (let i = 0; i < 40; i++) {
        spawnSparkle(w.x, w.y, {
            vx: (Math.random() - 0.5) * 300,
            vy: -150 - Math.random() * 300,
            g: 260,
            hue: randomPick([45, 300, 330, 190]),
            size: 5 + Math.random() * 6,
            max: 1.2
        });
    }

    if (!spellDeck.length) spellDeck = shuffle(SPELLS.map((_, i) => i));
    const spell = SPELLS[spellDeck.pop()];
    showToast(`🪄 ${spell.name}`, 1300);
    setTimeout(spell.cast, 250);
}

document.getElementById('wandBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    castSpell();
});

function spellFlowers() {
    const kinds = ['🌷', '🌸', '🌼', '🌹', '🌻', '🌺'];
    for (let i = 0; i < 10; i++) {
        const x = state.x + (i - 4.5) * 48 + (Math.random() - 0.5) * 16;
        if (x < 20 || x > WORLD_W - 20) continue;
        const f = place(el(`<div class="magic-flower">${randomPick(kinds)}</div>`), x - 24, 408 + (i % 2) * 14);
        f.style.animationDelay = (i * 0.06) + 's';
        setTimeout(() => f.classList.add('bye'), 6000 + i * 60);
        setTimeout(() => f.remove(), 6700 + i * 60);
        setTimeout(() => burst(x, 440, 8), i * 60);
    }
    playCorrect();
}

function spellButterflies() {
    const w = wandPos();
    const kinds = ['🦋', '🦋', '🐝', '🐞', '🦋'];
    for (let i = 0; i < 9; i++) {
        const f = tempEl(`<div class="magic-fly">${randomPick(kinds)}</div>`, w.x - 18, w.y - 18, 3300);
        f.style.setProperty('--dx', ((Math.random() - 0.5) * 700) + 'px');
        f.style.setProperty('--dy', (-120 - Math.random() * 300) + 'px');
        f.style.animationDelay = (i * 0.08) + 's';
    }
}

function spellRain(kinds) {
    const v = viewRange();
    for (let i = 0; i < 40; i++) {
        const x = v.left + Math.random() * (v.right - v.left);
        const y = v.top - 40;
        const dur = 2.2 + Math.random() * 1.6;
        const f = tempEl(`<div class="magic-fall">${randomPick(kinds)}</div>`, x, y, (dur + 1.4) * 1000);
        f.style.setProperty('--dist', (FEET_Y - y) + 'px');
        f.style.setProperty('--dur', dur + 's');
        f.style.animationDelay = (Math.random() * 1.2) + 's';
        f.style.animationFillMode = 'both';
    }
    playSparkleSound();
}

function spellColors() {
    playfield.classList.remove('color-magic');
    void playfield.offsetWidth;
    playfield.classList.add('color-magic');
    setTimeout(() => playfield.classList.remove('color-magic'), 4300);
    playMusicBox();
}

function spellBubbles() {
    const w = wandPos();
    for (let i = 0; i < 14; i++) {
        const size = 36 + Math.random() * 40;
        const b = place(el('<div class="bubble"></div>'), w.x - size / 2 + (Math.random() - 0.5) * 40, w.y - size / 2);
        b.style.width = b.style.height = size + 'px';
        const dur = 4 + Math.random() * 2.5;
        b.style.setProperty('--dx', ((Math.random() - 0.5) * 300) + 'px');
        b.style.setProperty('--dur', dur + 's');
        b.style.animationDelay = (i * 0.15) + 's';
        b.style.animationFillMode = 'both';
        const t = setTimeout(() => b.remove(), (dur + i * 0.15) * 1000);
        b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            clearTimeout(t);
            const r = b.getBoundingClientRect();
            const pt = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
            b.remove();
            for (let k = 0; k < 16; k++) spawnSparkle(pt.x, pt.y, { hue: 190 + Math.random() * 120, speed: 160 });
            playFreqSweep(900 + Math.random() * 600, 1800, 0.08, 0.2);
        });
    }
    playFreqSweep(300, 600, 0.4, 0.1);
}

function spellAnimals() {
    const animals = ['🐰', '🐣', '🦄', '🐼', '🐨', '🦊', '🐧', '🐹', '🦔', '🐢'];
    const v = viewRange();
    let changed = 0;
    world.querySelectorAll('.emoji-obj, .bloom, .ball-guest, .carousel').forEach(node => {
        if (node.children.length) return;
        const r = node.getBoundingClientRect();
        const pt = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
        if (pt.x < v.left - 40 || pt.x > v.right + 40) return;
        const orig = node.textContent;
        const next = orig === '🐸' ? '🤴' : randomPick(animals);
        node.classList.remove('poof');
        void node.offsetWidth;
        node.classList.add('poof');
        setTimeout(() => { node.textContent = next; }, 200);
        burst(pt.x, pt.y, 20);
        changed++;
        setTimeout(() => {
            node.classList.remove('poof');
            void node.offsetWidth;
            node.classList.add('poof');
            setTimeout(() => { node.textContent = orig; }, 200);
        }, 5500);
    });
    if (!changed) spellButterflies();
    playFreqSweep(1500, 300, 0.4, 0.15);
}

function spellSize(cls) {
    const d = princessEl().querySelector('.dancer');
    d.classList.remove('magic-grow', 'magic-tiny');
    void d.offsetWidth;
    d.classList.add(cls);
    setTimeout(() => d.classList.remove(cls), 2400);
    if (cls === 'magic-grow') playFreqSweep(200, 600, 0.8, 0.15);
    else playFreqSweep(1600, 2600, 0.5, 0.1);
}

function spellFloat() {
    if (state.riding) { spellRainbow(); return; }
    state.busy = true;
    playFreqSweep(400, 1200, 1.2, 0.1);
    tween(2800, (t) => {
        state.anim.dy = -130 * Math.sin(Math.PI * t);
        state.anim.rot = 8 * Math.sin(t * Math.PI * 4);
        if (Math.random() < 0.5) spawnSparkle(state.x + (Math.random() - 0.5) * 40, FEET_Y + state.anim.dy, { vy: 40, g: 0, hue: 200 });
    }, () => {
        resetAnim();
        state.busy = false;
    });
}

function spellRainbow() {
    const sr = document.getElementById('screenRainbow');
    sr.classList.add('show');
    state.partyUntil = performance.now() + 3500;
    playMusicBox();
    setTimeout(() => sr.classList.remove('show'), 3500);
}

function spellDress() {
    let next = state.dressIdx;
    while (next === state.dressIdx) next = Math.floor(Math.random() * DRESSES.length);
    state.dressIdx = next;
    applyDress();
    twirl();
    burst(state.x, 340, 50);
    playSparkleSound();
}

function spellMagnet() {
    const v = viewRange();
    const targets = scene.gems.filter(g => !g.got && g.x > v.left && g.x < v.right);
    if (!targets.length) { spellRain(['💎', '⭐', '💖']); return; }
    targets.forEach((g, i) => {
        setTimeout(() => {
            g.node.classList.add('magnet');
            g.node.style.left = state.x + 'px';
            g.node.style.top = (FEET_Y - 120 - state.alt) + 'px';
            g.x = state.x;
            setTimeout(() => collectGem(g), 700);
        }, i * 150);
    });
}

