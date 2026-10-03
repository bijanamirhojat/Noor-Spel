/* 🧁 Bakkerij */
defineRoom({
    key: 'bakkerij',
    name: 'Bakkerij',
    icon: '🧁',
    say: 'De bakkerij',
    build(rbk) {
        place(el('<div class="awning"></div>'), rbk, 0).style.width = ROOM_W + 'px';
        addObj(`<div class="oven"><div class="pipe"></div><div class="body"></div><div class="knobs"><span></span><span></span><span></span></div><div class="window"></div><div class="tap-hint" style="left:70px;top:-44px">👇</div></div>`, rbk + 40, 200, rbk + 240, openBakery);
        place(el(`<div class="counter"><div class="top"></div><div class="front"></div>
            <span style="left:10px">🥣</span><span style="left:70px">🥚</span><span style="left:120px">🧈</span><span style="left:180px">🍓</span><span style="left:226px">🍫</span></div>`), rbk + 250, 300);
        const vit = addObj(`<div class="vitrine">${Array.from({ length: 6 }, (_, i) => `<div class="vit-slot empty" data-i="${i}"></div>`).join('')}</div>`, rbk + 470, 120, rbk + 620, null);
        state.vitrine = vit;
        vit.querySelectorAll('.vit-slot').forEach(slot => slot.addEventListener('pointerdown', (e) => {
            if (!bakes[+slot.dataset.i]) return;
            slot.classList.remove('yum'); void slot.offsetWidth; slot.classList.add('yum');
            [0, 200, 400].forEach(t => setTimeout(() => playTone(300, 0.08, 0.15, 'triangle'), t));
        }));
        addObj('<div class="emoji-obj" style="font-size:60px">👩‍🍳</div>', rbk + 690, 360, rbk + 680, () => { playCorrect(); sparkleShower(rbk + 700, 300, 30); });
    }
});

/* ─────────── Bakkerij ─────────── */
const BAKE_KEY = 'noor-prinses-bakkerij';
const BK_GLAZES = [
    { c: '#f9a8d4', d: '#ec4899' }, { c: '#92400e', d: '#78350f' }, { c: '#fef3c7', d: '#fcd34d' },
    { c: '#86efac', d: '#22c55e' }, { c: '#93c5fd', d: '#3b82f6' }, { c: 'url(#bkRb)', d: '#a855f7', rb: true }
];
const BK_TOPS = [
    { t: 'sprinkles', icon: '🎉' }, { t: '🍓' }, { t: '🍒' }, { t: '💖' }, { t: '⭐' }, { t: '🌸' }, { t: 'cream', icon: '🍦' }, { t: '🕯️' }, { t: '🍫' }
];
let bakes = [null, null, null, null, null, null];
try {
    const d = JSON.parse(localStorage.getItem(BAKE_KEY));
    if (Array.isArray(d)) bakes = Array.from({ length: 6 }, (_, i) => d[i] && d[i].shape ? d[i] : null);
} catch (e) {}
const bk = { step: 'shape', item: null, top: 0, bites: 0, busy: false };
let bakeOpen = false;

function bakeSVG(it, idp = 'bk') {
    const baked = it.baked;
    const dough = baked ? '#f59e0b' : '#fef3c7';
    const doughD = baked ? '#b45309' : '#fde68a';
    const g = it.glaze != null ? BK_GLAZES[it.glaze] : null;
    const gc = g ? (g.rb ? `url(#${idp}Rb)` : g.c) : null;
    let h = `<defs><linearGradient id="${idp}Rb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#f87171"/><stop offset=".2" stop-color="#fb923c"/><stop offset=".4" stop-color="#fde047"/>
        <stop offset=".6" stop-color="#4ade80"/><stop offset=".8" stop-color="#60a5fa"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs>`;
    if (it.shape === 'cupcake') {
        h += `<path d="M48 118 L152 118 L138 188 L62 188 Z" fill="#f472b6"/>
              ${[62, 78, 94, 110, 126, 142].map(x => `<path d="M${x} 118 L${x + 3 - (x - 100) * 0.12} 188" stroke="#fbcfe8" stroke-width="5"/>`).join('')}
              <ellipse cx="100" cy="116" rx="56" ry="26" fill="${dough}" stroke="${doughD}" stroke-width="3"/>`;
        if (gc) h += `<path d="M42 118 Q40 96 62 92 Q60 68 86 66 Q90 44 112 50 Q136 46 138 70 Q162 74 158 96 Q166 116 150 122 Q100 132 50 122 Z" fill="${gc}" stroke="${g.d}" stroke-width="3"/>
                      <path d="M70 92 Q100 84 130 92 M84 70 Q102 64 120 72" stroke="rgba(255,255,255,0.6)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    } else if (it.shape === 'cake') {
        h += `<rect x="28" y="92" width="144" height="92" rx="12" fill="${dough}" stroke="${doughD}" stroke-width="3"/>
              <rect x="28" y="134" width="144" height="10" fill="${baked ? '#f472b6' : '#fbcfe8'}"/>`;
        if (gc) h += `<path d="M24 100 Q24 82 44 82 L156 82 Q176 82 176 100 L176 108 Q168 122 160 108 Q150 126 140 108 Q128 124 118 108 Q106 126 96 108 Q84 122 74 108 Q62 126 52 108 Q40 122 24 108 Z" fill="${gc}" stroke="${g.d}" stroke-width="3"/>`;
    } else if (it.shape === 'donut') {
        h += `<circle cx="100" cy="112" r="72" fill="${dough}" stroke="${doughD}" stroke-width="3"/>`;
        if (gc) h += `<path d="M100 48 Q124 44 140 60 Q164 66 162 94 Q176 116 160 136 Q156 164 128 168 Q108 184 86 170 Q58 172 48 148 Q26 128 40 104 Q36 72 62 62 Q78 44 100 48 Z" fill="${gc}" stroke="${g.d}" stroke-width="3"/>`;
        h += `<circle cx="100" cy="112" r="22" fill="#fff7ed" stroke="${doughD}" stroke-width="3"/>`;
    } else {
        h += `<circle cx="100" cy="112" r="74" fill="${dough}" stroke="${doughD}" stroke-width="3"/>
              ${baked ? [[70, 90], [126, 84], [98, 140], [140, 128], [62, 132]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#78350f"/>`).join('') : ''}`;
        if (gc) h += `<path d="M100 56 Q130 52 146 74 Q166 96 156 124 Q150 156 120 164 Q94 172 70 158 Q42 142 46 110 Q46 78 72 64 Q84 56 100 56 Z" fill="${gc}" stroke="${g.d}" stroke-width="3" opacity=".95"/>`;
    }
    (it.tops || []).forEach(tp => { h += topMarkup(tp); });
    (it.bitesAt || []).forEach(([x, y]) => { h += `<circle cx="${x}" cy="${y}" r="26" fill="#fde4ec"/>`; });
    return h;
}

function topMarkup(tp) {
    if (tp.t === 'sprinkles') {
        const cols = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#fff'];
        let r = '<g class="bk-top">';
        for (let i = 0; i < 9; i++) {
            const a = (i * 137) % 360, d = 6 + (i * 7) % 14;
            const x = tp.x + Math.cos(a) * d, y = tp.y + Math.sin(a) * d;
            r += `<rect x="${x - 4}" y="${y - 1.5}" width="8" height="3" rx="1.5" fill="${cols[i % cols.length]}" transform="rotate(${(i * 53) % 180} ${x} ${y})"/>`;
        }
        return r + '</g>';
    }
    if (tp.t === 'cream') {
        return `<g class="bk-top"><circle cx="${tp.x - 8}" cy="${tp.y + 4}" r="10" fill="#fff"/><circle cx="${tp.x + 8}" cy="${tp.y + 4}" r="10" fill="#fff"/><circle cx="${tp.x}" cy="${tp.y - 6}" r="11" fill="#fff"/><path d="M${tp.x} ${tp.y - 22} q5 5 0 10" fill="#fff"/></g>`;
    }
    const size = tp.t === '🕯️' ? 30 : 22;
    return `<text class="bk-top" x="${tp.x}" y="${tp.y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${tp.t}</text>`;
}

function renderBake() {
    const svg = document.getElementById('bkSvg');
    svg.innerHTML = bk.item ? bakeSVG(bk.item) : '';
}

function setBkHint(t) { document.getElementById('bkHint').textContent = t; }

function renderBkTray() {
    const tray = document.getElementById('bkTray');
    const it = bk.item;
    if (bk.step === 'shape') {
        setBkHint('Wat ga je bakken?');
        tray.innerHTML = [['cupcake', '🧁'], ['cake', '🎂'], ['donut', '🍩'], ['cookie', '🍪']].map(([v, ic]) =>
            `<button class="bk-btn big" data-shape="${v}">${ic}</button>`).join('');
        tray.querySelectorAll('[data-shape]').forEach(b => b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            bk.item = { shape: b.dataset.shape, baked: false, glaze: null, tops: [] };
            bk.step = 'bake';
            renderBake();
            renderBkTray();
            playPop();
        }));
        return;
    }
    if (bk.step === 'bake') {
        setBkHint('In de oven!');
        tray.innerHTML = '<button class="bk-btn big" id="bkBake">🔥<small>Bakken</small></button>';
        document.getElementById('bkBake').addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            bakeIt();
        });
        return;
    }
    setBkHint(it.glaze == null ? 'Kies een glazuur!' : 'Kies iets lekkers en tik op je gebak!');
    tray.innerHTML =
        BK_GLAZES.map((g, i) => `<button class="bk-btn${it.glaze === i ? ' sel' : ''}" data-glaze="${i}"><span class="sw" style="background:${g.rb ? 'linear-gradient(90deg,#f87171,#fde047,#4ade80,#60a5fa,#c084fc)' : g.c}"></span></button>`).join('') +
        (it.glaze != null ? '<span class="care-sep"></span>' + BK_TOPS.map((t, i) => `<button class="bk-btn${bk.top === i ? ' sel' : ''}" data-top="${i}">${t.icon || t.t}</button>`).join('') : '') +
        '<span class="care-sep"></span>' +
        '<button class="bk-btn" id="bkEat">😋<small>Opeten</small></button>' +
        '<button class="bk-btn" id="bkShelf">🍽️<small>Vitrine</small></button>' +
        '<button class="bk-btn" id="bkNew">🔄<small>Nieuw</small></button>';
    tray.querySelectorAll('[data-glaze]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        it.glaze = +b.dataset.glaze;
        renderBake();
        renderBkTray();
        playFreqSweep(500, 900, 0.25, 0.1);
    }));
    tray.querySelectorAll('[data-top]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bk.top = +b.dataset.top;
        renderBkTray();
        playPop();
    }));
    document.getElementById('bkEat').addEventListener('pointerdown', (e) => { e.stopPropagation(); biteIt(); });
    document.getElementById('bkShelf').addEventListener('pointerdown', (e) => { e.stopPropagation(); shelfIt(); });
    document.getElementById('bkNew').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bk.item = null;
        bk.step = 'shape';
        renderBake();
        renderBkTray();
    });
}

function bakeIt() {
    if (bk.busy) return;
    bk.busy = true;
    const svg = document.getElementById('bkSvg');
    const timer = document.getElementById('bkTimer');
    svg.classList.add('baking');
    timer.classList.add('show');
    document.getElementById('bkTray').innerHTML = '';
    setBkHint('Even wachten... tik tak');
    for (let i = 0; i < 8; i++) setTimeout(() => playTone(i % 2 ? 1500 : 1200, 0.04, 0.08, 'square'), i * 300);
    setTimeout(() => {
        svg.classList.remove('baking');
        timer.classList.remove('show');
        bk.item.baked = true;
        renderBake();
        [1568, 2093, 2637].forEach((f, i) => setTimeout(() => playTone(f, 0.5, 0.12, 'sine'), i * 120));
        const r = svg.getBoundingClientRect();
        bkSpark(r.left + r.width / 2, r.top + r.height * 0.4, 14, ['☁️', '✨', '💨']);
        bk.step = 'decorate';
        bk.busy = false;
        renderBkTray();
    }, 2500);
}

function bkSpark(cx, cy, n, icons = ['✨', '⭐', '💖', '🌟']) {
    const o = document.getElementById('bakeOv').getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const sp = document.createElement('span');
        sp.className = 'scope-spark';
        sp.textContent = randomPick(icons);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 60;
        sp.style.left = (cx - o.left) + 'px';
        sp.style.top = (cy - o.top) + 'px';
        sp.style.setProperty('--dx', Math.cos(a) * d + 'px');
        sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
        document.getElementById('bakeOv').appendChild(sp);
        setTimeout(() => sp.remove(), 900);
    }
}

// Tap on the bake to place the chosen topping right there
document.getElementById('bkSvg').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const it = bk.item;
    if (!it || bk.step !== 'decorate' || it.glaze == null || bk.busy) return;
    const svg = document.getElementById('bkSvg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (loc.x < 10 || loc.x > 190 || loc.y < 20 || loc.y > 190) return;
    if (it.tops.length > 40) it.tops.shift();
    it.tops.push({ t: BK_TOPS[bk.top].t, x: Math.round(loc.x), y: Math.round(loc.y) });
    svg.insertAdjacentHTML('beforeend', topMarkup(it.tops[it.tops.length - 1]));
    playTone(1000 + Math.random() * 600, 0.08, 0.1, 'triangle');
});

function biteIt() {
    if (bk.busy || !bk.item) return;
    const it = bk.item;
    it.bitesAt = it.bitesAt || [];
    const spots = [[160, 80], [40, 100], [150, 160], [60, 170], [100, 60]];
    it.bitesAt.push(spots[it.bitesAt.length % spots.length]);
    renderBake();
    [0, 150].forEach(t => setTimeout(() => playTone(260 + Math.random() * 60, 0.08, 0.18, 'triangle'), t));
    const r = document.getElementById('bkSvg').getBoundingClientRect();
    bkSpark(r.left + r.width / 2, r.top + r.height / 2, 6, ['😋', '🍪', '✨']);
    if (it.bitesAt.length >= 4) {
        bk.busy = true;
        setTimeout(() => {
            playWin();
            showToast('😋 Mmm, op! Lekker!');
            bk.item = null;
            bk.step = 'shape';
            bk.busy = false;
            renderBake();
            renderBkTray();
        }, 500);
    }
}

function saveBakes() {
    try { localStorage.setItem(BAKE_KEY, JSON.stringify(bakes)); } catch (e) {}
}

function renderVitrine() {
    if (!state.vitrine) return;
    state.vitrine.querySelectorAll('.vit-slot').forEach((slot, i) => {
        const b = bakes[i];
        slot.classList.toggle('empty', !b);
        slot.innerHTML = b ? `<svg viewBox="0 0 200 200">${bakeSVG(b, 'v' + i)}</svg>` : '';
    });
}

function shelfIt() {
    if (bk.busy || !bk.item) return;
    let slot = bakes.findIndex(b => !b);
    if (slot === -1) {
        bakes.shift();
        bakes.push(null);
        slot = 5;
    }
    const { shape, baked, glaze, tops } = bk.item;
    bakes[slot] = { shape, baked, glaze, tops: tops.slice() };
    saveBakes();
    renderVitrine();
    playWin();
    showToast('🍽️ In de vitrine! Wat mooi!');
    bk.item = null;
    bk.step = 'shape';
    renderBake();
    renderBkTray();
}

function openBakery() {
    bakeOpen = true;
    document.getElementById('bakeOv').classList.add('open');
    renderBake();
    renderBkTray();
    playMusicBox();
}

function closeBakery() {
    if (bk.busy) return;
    bakeOpen = false;
    document.getElementById('bakeOv').classList.remove('open');
    _playWhoosh();
}
document.getElementById('bkClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeBakery();
});
document.getElementById('bakeOv').addEventListener('pointerdown', (e) => e.stopPropagation());
