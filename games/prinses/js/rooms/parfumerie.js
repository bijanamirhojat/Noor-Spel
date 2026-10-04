/* 💐 Parfumerie: zelf parfum mengen. Flesjes komen op de plank (localStorage);
   tik op een flesje en de prinses wordt ermee bespoten. */
const PF_KEY = 'noor-prinses-parfums';
const PF_MAX_LAYERS = 5;
const PF_SLOTS = 6;
const PF_ING = [
    { k: 'roos', e: '🌹', c: '#f43f5e', h: 350 },
    { k: 'bloesem', e: '🌸', c: '#f9a8d4', h: 330 },
    { k: 'lavendel', e: '🪻', c: '#a78bfa', h: 265 },
    { k: 'zon', e: '🌼', c: '#facc15', h: 50 },
    { k: 'sinaas', e: '🍊', c: '#fb923c', h: 28 },
    { k: 'munt', e: '🍃', c: '#4ade80', h: 140 },
    { k: 'bes', e: '🫐', c: '#60a5fa', h: 220 },
    { k: 'snoep', e: '🍬', c: '#f0abfc', h: 300 },
    { k: 'aardbei', e: '🍓', c: '#ef4444', h: 0 }
];
const PF_CAPS = [['crown', '👑'], ['gem', '💎'], ['bow', '🎀'], ['star', '⭐'], ['flower', '🌸'], ['heart', '💖']];
// Bottle body (clip for the liquid), neck, and the liquid's top/bottom y
const PF_BOTTLES = {
    round: { icon: '🔮', body: 'M50 46 a40 40 0 1 0 0.1 0 Z', top: 46, bottom: 126 },
    heart: { icon: '💗', body: 'M50 128 C10 100 8 70 26 56 C38 47 48 52 50 60 C52 52 62 47 74 56 C92 70 90 100 50 128 Z', top: 50, bottom: 128 },
    tall: { icon: '🧪', body: 'M30 44 Q30 38 36 38 L64 38 Q70 38 70 44 L70 124 Q70 130 64 130 L36 130 Q30 130 30 124 Z', top: 38, bottom: 130 },
    gem: { icon: '💎', body: 'M50 128 L14 74 L30 48 L70 48 L86 74 Z', top: 48, bottom: 128 }
};
const PF_ING_BY = Object.fromEntries(PF_ING.map(i => [i.k, i]));

let parfums = [];
try {
    const d = JSON.parse(localStorage.getItem(PF_KEY));
    if (Array.isArray(d)) parfums = d.filter(p => p && PF_BOTTLES[p.b] && Array.isArray(p.ing)).slice(-PF_SLOTS);
} catch (e) {}

function savePerfumes() {
    try { localStorage.setItem(PF_KEY, JSON.stringify(parfums)); } catch (e) {}
}

// One bottle as svg; id must be unique on the page (clipPath)
function bottleSVG(p, id) {
    const b = PF_BOTTLES[p.b];
    const ing = p.ing.map(k => PF_ING_BY[k]).filter(Boolean);
    const layerH = (b.bottom - b.top) / PF_MAX_LAYERS;
    let liquid = '';
    if (ing.length && p.mixed) {
        const stops = ing.map((g, i) => `<stop offset="${ing.length > 1 ? i / (ing.length - 1) : 0}" stop-color="${g.c}"/>`).join('');
        const top = b.bottom - layerH * ing.length;
        liquid = `<defs><linearGradient id="${id}mix" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient></defs>
            <rect x="0" y="${top}" width="100" height="${b.bottom - top + 4}" fill="url(#${id}mix)"/>
            <path d="M0 ${top} q12.5 -5 25 0 t25 0 t25 0 t25 0 V${top + 6} H0 Z" fill="rgba(255,255,255,0.35)"/>
            ${[[34, 0.5], [58, 0.3], [46, 0.75], [66, 0.65]].map(([x, f]) => `<circle cx="${x}" cy="${top + (b.bottom - top) * f}" r="2.5" fill="rgba(255,255,255,0.7)"/>`).join('')}`;
    } else {
        liquid = ing.map((g, i) => `<rect x="0" y="${b.bottom - layerH * (i + 1)}" width="100" height="${layerH + 1}" fill="${g.c}"/>`).join('');
    }
    const cap = PF_CAPS.find(c => c[0] === p.cap);
    return `<svg viewBox="0 -6 100 140" data-pf="${id}">
        <defs><clipPath id="${id}clip"><path d="${b.body}"/></clipPath></defs>
        <rect x="41" y="${b.top - 18}" width="18" height="22" rx="3" fill="rgba(255,255,255,0.6)" stroke="#fff" stroke-width="2"/>
        <path d="${b.body}" fill="rgba(255,255,255,0.35)"/>
        <g clip-path="url(#${id}clip)">${liquid}</g>
        <path d="${b.body}" fill="none" stroke="#fff" stroke-width="3"/>
        <path d="M30 ${b.top + 18} Q26 ${(b.top + b.bottom) / 2} 32 ${b.bottom - 16}" stroke="rgba(255,255,255,0.8)" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${cap ? `<text x="50" y="${b.top - 18}" font-size="22" text-anchor="middle">${cap[1]}</text>` : `<rect x="38" y="${b.top - 26}" width="24" height="10" rx="4" fill="#f9a8d4"/>`}
    </svg>`;
}

defineRoom({
    key: 'parfumerie',
    name: 'Parfumerie',
    icon: '💐',
    say: 'De parfumerie',
    build(x) {
        addObj(`<div class="pf-lab">
            <div class="flasks"><span style="--c:#f43f5e"></span><span style="--c:#a78bfa;height:70px"></span><span style="--c:#4ade80;height:46px"></span><span style="--c:#facc15"></span></div>
            <div class="top"></div><div class="front"><span>🌹</span><span>🪻</span><span>🍋</span></div>
            <div class="tap-hint" style="left:90px;top:-40px">👇</div>
        </div>`, x + 50, 250, x + 170, openPerfume);
        place(el('<div class="pf-sign">🌸 Parfum 🌸</div>'), x + 470, 60);
        [120, 240].forEach(y => place(el('<div class="pf-shelf"></div>'), x + 360, y + 88));
        for (let i = 0; i < PF_SLOTS; i++) {
            const sx = x + 400 + (i % 3) * 120;
            const sy = 120 + Math.floor(i / 3) * 120;
            addObj(`<div class="pf-slot" data-i="${i}"></div>`, sx - 32, sy, sx, () => {
                const p = parfums[i];
                if (p) sprayPerfume(p);
            });
        }
        addObj('<div class="emoji-obj pf-pot">🌷</div>', x + 300, 370, x + 320, (node) => {
            const r = node.getBoundingClientRect();
            const pt = screenToWorld(r.left + r.width / 2, r.top);
            for (let i = 0; i < 24; i++) spawnSparkle(pt.x, pt.y, { speed: 120, hue: 330 + Math.random() * 40, size: 6 + Math.random() * 4 });
            playFreqSweep(800, 1400, 0.25, 0.1);
        });
        renderPerfumeShelf();
    }
});

function renderPerfumeShelf() {
    document.querySelectorAll('.pf-slot').forEach(s => {
        const i = +s.dataset.i;
        const p = parfums[i];
        s.classList.toggle('has', !!p);
        s.innerHTML = p ? bottleSVG(p, 'pfs' + i) : '';
    });
}

// Pssst! The princess smells lovely now
function sprayPerfume(p) {
    const ing = p.ing.map(k => PF_ING_BY[k]).filter(Boolean);
    startNoise('shower');
    setTimeout(stopNoise, 450);
    setTimeout(() => [1319, 1568, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.08, 'sine'), i * 90)), 400);
    twirl();
    for (let i = 0; i < 70; i++) {
        const g = randomPick(ing);
        spawnSparkle(state.x + (Math.random() - 0.5) * 140, FEET_Y - 40 - Math.random() * 170, {
            vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 40, g: -10, hue: g.h, size: 4 + Math.random() * 6, max: 1.8
        });
    }
    ing.slice(0, 4).forEach((g, i) => setTimeout(() => {
        const n = el(`<div class="magic-fly">${g.e}</div>`);
        n.style.setProperty('--dx', ((Math.random() - 0.5) * 160) + 'px');
        n.style.setProperty('--dy', (-90 - Math.random() * 60) + 'px');
        place(n, state.x - 18, FEET_Y - 170);
        setTimeout(() => n.remove(), 3300);
    }, i * 200));
    showToast(`${ing.map(g => g.e).join('')} Mmm, wat ruik je lekker!`, 1800);
}

/* ─────────── Parfum maken (overlay) ─────────── */
const pfEl = document.getElementById('pfOv');
let pfOpen = false;
let pfBusy = false;
let pfTab = 'ing';
let pf = null;
const PF_TABS = [['b', '🧴'], ['ing', '🌸'], ['cap', '👑']];

function newPerfume() {
    pf = { b: 'round', ing: [], cap: 'crown', mixed: false };
}

function renderPfBottle() {
    document.getElementById('pfStage').innerHTML = bottleSVG(pf, 'pfm');
}

function renderPfTabs() {
    const box = document.getElementById('pfTabs');
    box.innerHTML = PF_TABS.map(([k, ic]) => `<button class="du-tab${pfTab === k ? ' active' : ''}" data-k="${k}">${ic}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pfTab = b.dataset.k;
        renderPfTabs();
        renderPfOpts();
        playPop();
    }));
}

function renderPfOpts() {
    const box = document.getElementById('pfOpts');
    if (pfTab === 'b') {
        box.innerHTML = Object.keys(PF_BOTTLES).map(k => `<button class="du-opt pf-opt${pf.b === k ? ' sel' : ''}" data-v="${k}">${bottleSVG({ b: k, ing: [], cap: null }, 'pfo' + k)}</button>`).join('');
    } else if (pfTab === 'ing') {
        box.innerHTML = PF_ING.map(g => `<button class="du-opt" data-v="${g.k}" style="background:radial-gradient(circle, #fff 45%, ${g.c}55)">${g.e}</button>`).join('');
    } else {
        box.innerHTML = PF_CAPS.map(([k, ic]) => `<button class="du-opt${pf.cap === k ? ' sel' : ''}" data-v="${k}">${ic}</button>`).join('');
    }
    box.querySelectorAll('.du-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickPf(b.dataset.v, b);
    }));
}

function pfWiggle() {
    const st = document.getElementById('pfStage');
    st.classList.remove('wiggle'); void st.offsetWidth; st.classList.add('wiggle');
    playTone(220, 0.12, 0.1, 'triangle');
}

function pfStagePt(x, y) {
    const svg = document.querySelector('#pfStage svg');
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const p = pt.matrixTransform(svg.getScreenCTM());
    const o = pfEl.getBoundingClientRect();
    return { x: p.x - o.left, y: p.y - o.top };
}

function pfSparkle() {
    const c = pfStagePt(50, 80);
    for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '💖', '🌸', '⭐']);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 90;
        s.style.left = c.x + 'px';
        s.style.top = c.y + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        pfEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function pickPf(v, btn) {
    if (pfBusy) return;
    if (pfTab === 'b') {
        pf.b = v;
        renderPfBottle();
        renderPfOpts();
        pfSparkle();
        playFreqSweep(600, 1200, 0.2, 0.1);
    } else if (pfTab === 'cap') {
        pf.cap = v;
        renderPfBottle();
        renderPfOpts();
        pfSparkle();
        playFreqSweep(900, 1600, 0.2, 0.1);
    } else {
        if (pf.ing.length >= PF_MAX_LAYERS) { pfWiggle(); return; }
        // The flower drops into the bottle, plop!
        pfBusy = true;
        const g = PF_ING_BY[v];
        const br = btn.getBoundingClientRect();
        const o = pfEl.getBoundingClientRect();
        const drop = document.createElement('div');
        drop.className = 'din-ghost';
        drop.textContent = g.e;
        drop.style.left = (br.left + br.width / 2 - o.left) + 'px';
        drop.style.top = (br.top + br.height / 2 - o.top) + 'px';
        pfEl.appendChild(drop);
        const to = pfStagePt(50, PF_BOTTLES[pf.b].top - 4);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            drop.classList.add('fly');
            drop.style.left = to.x + 'px';
            drop.style.top = to.y + 'px';
            drop.style.transform = 'translate(-50%, -50%) scale(0.5)';
        }));
        setTimeout(() => {
            drop.remove();
            pf.ing.push(v);
            pf.mixed = false;
            renderPfBottle();
            playFreqSweep(900, 300, 0.15, 0.15);
            setTimeout(() => playTone(500 + pf.ing.length * 120, 0.12, 0.1, 'sine'), 120);
            pfBusy = false;
        }, 420);
    }
}

document.getElementById('pfShake').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (pfBusy) return;
    if (!pf.ing.length) { pfWiggle(); return; }
    pfBusy = true;
    const st = document.getElementById('pfStage');
    st.classList.add('shake');
    [0, 150, 300, 450, 600].forEach(t => setTimeout(() => playFreqSweep(700 + Math.random() * 400, 300, 0.1, 0.1), t));
    setTimeout(() => {
        st.classList.remove('shake');
        pf.mixed = true;
        renderPfBottle();
        pfSparkle();
        playCorrect();
        pfBusy = false;
    }, 800);
});
document.getElementById('pfEmpty').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (pfBusy) return;
    pf.ing = [];
    pf.mixed = false;
    renderPfBottle();
    playFreqSweep(600, 150, 0.4, 0.12);
});
document.getElementById('pfDone').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (pfBusy) return;
    if (!pf.ing.length) {
        pfWiggle();
        if (pfTab !== 'ing') { pfTab = 'ing'; renderPfTabs(); renderPfOpts(); }
        return;
    }
    const made = { b: pf.b, ing: pf.ing.slice(), cap: pf.cap, mixed: pf.mixed };
    parfums.push(made);
    if (parfums.length > PF_SLOTS) parfums.shift();
    savePerfumes();
    renderPerfumeShelf();
    playWin();
    closePerfume();
    setTimeout(() => sprayPerfume(made), 300);
    const slot = document.querySelector(`.pf-slot[data-i="${parfums.length - 1}"]`);
    if (slot) { slot.classList.remove('new'); void slot.offsetWidth; slot.classList.add('new'); }
});
document.getElementById('pfClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closePerfume();
});
pfEl.addEventListener('pointerdown', (e) => e.stopPropagation());

function openPerfume() {
    pfOpen = true;
    pfEl.classList.add('open');
    newPerfume();
    pfTab = 'ing';
    renderPfBottle();
    renderPfTabs();
    renderPfOpts();
    playMusicBox();
}

function closePerfume() {
    pfOpen = false;
    pfBusy = false;
    pfEl.classList.remove('open');
    pfEl.querySelectorAll('.din-ghost').forEach(g => g.remove());
    _playWhoosh();
}
