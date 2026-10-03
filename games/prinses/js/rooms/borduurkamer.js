/* 🧵 Borduurkamer */
defineRoom({
    key: 'borduurkamer',
    name: 'Borduurkamer',
    icon: '🧵',
    say: 'De borduurkamer',
    build(re) {
        addObj(`<div class="emb-station">
            <div class="leg" style="left:40px;transform:rotate(8deg)"></div>
            <div class="leg" style="left:178px;transform:rotate(-8deg)"></div>
            <div class="hoop">❤️</div>
            <span class="needle">🧵</span>
            <div class="tap-hint" style="left:115px;top:-60px">👇</div>
        </div>`, re + 285, 150, re + 530, () => openEmbroid(null));
        addObj('<div class="yarn">🧶</div>', re + 190, 350, re + 220, () => { playFreqSweep(400, 800, 0.2, 0.1); burst(re + 220, 370, 24); });
        state.artFrames = EMB_SLOTS.map(([x, y], i) => {
            const f = addObj('<div class="art-frame"><div class="art"></div></div>', re + x, y, re + x + 58, () => openEmbroid(i));
            return f;
        });
    }
});

/* ─────────── Borduurkamer ─────────── */
const EMB_N = 12;
const EMB_KEY = 'noor-prinses-borduurwerk';
const EMB_SLOTS = [[30, 70], [160, 70], [530, 70], [660, 70], [30, 215], [660, 215]];
const EMB_COLORS = {
    '1': '#f472b6', '2': '#ef4444', '3': '#fb923c', '4': '#facc15', '5': '#22c55e', '6': '#38bdf8',
    '7': '#2563eb', '8': '#a855f7', '9': '#92400e', 'a': '#1f2937', 'b': '#ffffff', 'c': '#fbcfe8'
};
const EMB_PATTERNS = [
    { e: '❤️', rows: [
        '............', '.222....222.', '22222..22222', '222222222222', '22b222222222', '222222222222',
        '.2222222222.', '..22222222..', '...222222...', '....2222....', '.....22.....', '............'] },
    { e: '🌸', rows: [
        '............', '...11..11...', '..1111111...', '..1144411...', '...14441....', '..1144411...',
        '..1111111...', '...11511....', '.....5..55..', '.55..5.55...', '..55555.....', '.....5......'] },
    { e: '⭐', rows: [
        '............', '.....44.....', '.....44.....', '....4444....', '444444444444', '.4444444444.',
        '..44444444..', '...444444...', '..44444444..', '..444..444..', '.444....444.', '............'] },
    { e: '🌈', rows: [
        '............', '............', '...222222...', '..23333332..', '.2344444432.', '234555555432',
        '234567765432', '23456..65432', '2345....5432', 'bbb......bbb', 'bbbb....bbbb', '............'] }
];
const embEl = document.getElementById('embroid');
const embSvg = document.getElementById('embSvg');
let embOpen = false;
const emb = {
    cells: Array(EMB_N * EMB_N).fill('.'),
    color: '1',
    tool: 'needle',
    guide: null,
    slot: null,
    drawing: false,
    lastCell: -1,
    lastSnd: 0,
    perfectShown: false
};
let artSlots = loadArt();

function loadArt() {
    try {
        const d = JSON.parse(localStorage.getItem(EMB_KEY));
        if (d && Array.isArray(d.slots)) {
            return EMB_SLOTS.map((_, i) => {
                const a = d.slots[i];
                return a && typeof a.cells === 'string' && a.cells.length === EMB_N * EMB_N ? a : null;
            });
        }
    } catch (e) {}
    return EMB_SLOTS.map(() => null);
}

function saveArt() {
    try { localStorage.setItem(EMB_KEY, JSON.stringify({ slots: artSlots })); } catch (e) {}
}

function artSVG(cells) {
    let r = '';
    for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (c === '.' || !EMB_COLORS[c]) continue;
        r += `<rect x="${i % EMB_N}" y="${Math.floor(i / EMB_N)}" width="1.02" height="1.02" fill="${EMB_COLORS[c]}"/>`;
    }
    return `<svg viewBox="0 0 ${EMB_N} ${EMB_N}" shape-rendering="crispEdges"><rect width="${EMB_N}" height="${EMB_N}" fill="#fdf6e3"/>${r}</svg>`;
}

function renderWallFrames() {
    if (!state.artFrames) return;
    state.artFrames.forEach((f, i) => {
        const a = artSlots[i];
        f.classList.toggle('empty', !a);
        f.querySelector('.art').innerHTML = a ? artSVG(a.cells) : '🧵';
    });
}

function stitchMarkup(i, c, isNew) {
    const x = (i % EMB_N) * 10, y = Math.floor(i / EMB_N) * 10;
    const col = EMB_COLORS[c];
    return `<g class="st${isNew ? ' stitch-new' : ''}" data-i="${i}">
        <line x1="${x + 1.8}" y1="${y + 1.8}" x2="${x + 8.2}" y2="${y + 8.2}" stroke="${col}" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="${x + 8.2}" y1="${y + 1.8}" x2="${x + 1.8}" y2="${y + 8.2}" stroke="${col}" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="${x + 8.2}" y1="${y + 1.8}" x2="${x + 1.8}" y2="${y + 8.2}" stroke="#fff" stroke-width="0.7" stroke-linecap="round" opacity=".45"/>
    </g>`;
}

function renderEmbroid() {
    let guide = '';
    if (emb.guide !== null) {
        EMB_PATTERNS[emb.guide].rows.join('').split('').forEach((c, i) => {
            if (c === '.') return;
            const x = (i % EMB_N) * 10, y = Math.floor(i / EMB_N) * 10;
            guide += `<rect x="${x + 1}" y="${y + 1}" width="8" height="8" rx="2" fill="${EMB_COLORS[c]}" opacity=".28"/>`;
        });
    }
    let stitches = '';
    emb.cells.forEach((c, i) => { if (c !== '.') stitches += stitchMarkup(i, c, false); });
    embSvg.innerHTML = `
        <defs><pattern id="aida" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#fdf6e3"/>
            <circle cx="0" cy="0" r="1.1" fill="#e2d5b6"/><circle cx="10" cy="0" r="1.1" fill="#e2d5b6"/>
            <circle cx="0" cy="10" r="1.1" fill="#e2d5b6"/><circle cx="10" cy="10" r="1.1" fill="#e2d5b6"/>
            <path d="M0 5 H10 M5 0 V10" stroke="#f3ead3" stroke-width="0.5"/>
        </pattern></defs>
        <rect width="120" height="120" fill="url(#aida)"/>
        <g id="embGuide">${guide}</g>
        <g id="embStitches">${stitches}</g>`;
}

function setCell(i, c, animate) {
    if (emb.cells[i] === c) return false;
    emb.cells[i] = c;
    const layer = document.getElementById('embStitches');
    const old = layer.querySelector(`.st[data-i="${i}"]`);
    if (old) old.remove();
    if (c !== '.') layer.insertAdjacentHTML('beforeend', stitchMarkup(i, c, animate));
    return true;
}

function embCellAt(e) {
    const r = embSvg.getBoundingClientRect();
    const col = Math.floor(((e.clientX - r.left) / r.width) * EMB_N);
    const row = Math.floor(((e.clientY - r.top) / r.height) * EMB_N);
    if (col < 0 || row < 0 || col >= EMB_N || row >= EMB_N) return -1;
    return row * EMB_N + col;
}

function floodFill(start, c) {
    const target = emb.cells[start];
    if (target === c) return 0;
    const stack = [start];
    const seen = new Set();
    let n = 0;
    while (stack.length) {
        const i = stack.pop();
        if (seen.has(i) || emb.cells[i] !== target) continue;
        seen.add(i);
        setCell(i, c, true);
        n++;
        const x = i % EMB_N, y = Math.floor(i / EMB_N);
        if (x > 0) stack.push(i - 1);
        if (x < EMB_N - 1) stack.push(i + 1);
        if (y > 0) stack.push(i - EMB_N);
        if (y < EMB_N - 1) stack.push(i + EMB_N);
    }
    return n;
}

function embApply(e, isDown) {
    const i = embCellAt(e);
    if (i < 0 || (!isDown && i === emb.lastCell)) return;
    emb.lastCell = i;
    const now = performance.now();
    if (emb.tool === 'fill') {
        if (!isDown) return;
        if (floodFill(i, emb.color)) {
            playFreqSweep(300, 1200, 0.35, 0.12);
            embSpark(e.clientX, e.clientY, 10);
        }
    } else if (emb.tool === 'erase') {
        if (setCell(i, '.', false) && now - emb.lastSnd > 90) {
            emb.lastSnd = now;
            playTone(2400, 0.03, 0.08, 'square');
            setTimeout(() => playTone(2000, 0.03, 0.08, 'square'), 50);
        }
    } else if (setCell(i, emb.color, true) && now - emb.lastSnd > 60) {
        emb.lastSnd = now;
        playTone(1500 + Math.random() * 600, 0.04, 0.06, 'triangle');
    }
    checkPerfect();
}

function checkPerfect() {
    if (emb.guide === null || emb.perfectShown) return;
    const target = EMB_PATTERNS[emb.guide].rows.join('');
    for (let i = 0; i < target.length; i++) {
        if (target[i] !== '.' && emb.cells[i] !== target[i]) return;
    }
    emb.perfectShown = true;
    playWin();
    const r = embSvg.getBoundingClientRect();
    for (let k = 0; k < 4; k++) setTimeout(() => embSpark(r.left + Math.random() * r.width, r.top + Math.random() * r.height, 10), k * 200);
    const save = document.getElementById('embSave');
    if (save) { save.classList.remove('hint'); void save.offsetWidth; save.classList.add('hint'); }
}

function embSpark(cx, cy, n) {
    const o = embEl.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '⭐', '💖', '🌟', '💫']);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 60;
        s.style.left = (cx - o.left) + 'px';
        s.style.top = (cy - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        embEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function renderSpools() {
    const box = document.getElementById('spools');
    box.innerHTML = Object.entries(EMB_COLORS).map(([k, c]) =>
        `<button class="spool${emb.color === k ? ' sel' : ''}" data-c="${k}"><span style="background-color:${c}"></span></button>`).join('');
    box.querySelectorAll('.spool').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        emb.color = b.dataset.c;
        if (emb.tool === 'erase') emb.tool = 'needle';
        box.querySelectorAll('.spool').forEach(x => x.classList.toggle('sel', x === b));
        renderEmbTools();
        playPop();
    }));
}

function renderEmbTools() {
    const box = document.getElementById('embTools');
    const tools = [['needle', '🪡', 'Naald'], ['erase', '✂️', 'Tornen'], ['fill', '🪣', 'Emmer']];
    box.innerHTML =
        tools.map(([id, ic, label]) => `<button class="emb-tool${emb.tool === id ? ' sel' : ''}" data-t="${id}">${ic}<small>${label}</small></button>`).join('') +
        '<span class="care-sep"></span>' +
        EMB_PATTERNS.map((pt, i) => `<button class="emb-tool${emb.guide === i ? ' sel' : ''}" data-g="${i}">${pt.e}</button>`).join('') +
        '<span class="care-sep"></span>' +
        '<button class="emb-tool" id="embClear">🧽<small>Leeg</small></button>' +
        `<button class="emb-tool${emb.hasArt ? '' : ' hidden'}" id="embRemove">🗑️<small>Van muur</small></button>` +
        '<button class="emb-tool big" id="embSave">🖼️<small>Ophangen</small></button>';
    box.querySelectorAll('.emb-tool[data-t]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        emb.tool = b.dataset.t;
        renderEmbTools();
        playPop();
    }));
    box.querySelectorAll('.emb-tool[data-g]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const g = +b.dataset.g;
        emb.guide = emb.guide === g ? null : g;
        emb.perfectShown = false;
        if (emb.guide !== null) {
            // Pick the pattern's main colour so tracing can start right away
            const counts = {};
            EMB_PATTERNS[g].rows.join('').split('').forEach(c => { if (c !== '.') counts[c] = (counts[c] || 0) + 1; });
            emb.color = Object.entries(counts).sort((a, b2) => b2[1] - a[1])[0][0];
            emb.tool = 'needle';
            renderSpools();
        }
        renderEmbroid();
        renderEmbTools();
        playSparkleSound();
    }));
    document.getElementById('embClear').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        emb.cells.fill('.');
        emb.perfectShown = false;
        renderEmbroid();
        playFreqSweep(900, 200, 0.4, 0.12);
    });
    document.getElementById('embRemove').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (!emb.hasArt) return;
        artSlots[emb.slot] = null;
        saveArt();
        renderWallFrames();
        closeEmbroid(true);
        playFreqSweep(800, 200, 0.4, 0.12);
    });
    document.getElementById('embSave').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        hangArt();
    });
}

function hangArt() {
    if (emb.cells.every(c => c === '.')) {
        const b = document.querySelector('.emb-tool[data-t="needle"]');
        if (b) { b.classList.remove('hint'); void b.offsetWidth; b.classList.add('hint'); }
        return;
    }
    let slot = emb.slot;
    if (slot === null) slot = artSlots.findIndex(a => !a);
    if (slot === -1) {
        // Wall is full: replace the oldest picture
        slot = artSlots.reduce((best, a, i) => (a.t < artSlots[best].t ? i : best), 0);
    }
    artSlots[slot] = { cells: emb.cells.join(''), t: Date.now() };
    saveArt();
    renderWallFrames();
    closeEmbroid(true);
    playWin();
    showToast('🖼️ Opgehangen! Wat mooi!');
    const [fx, fy] = EMB_SLOTS[slot];
    const x = roomX('borduurkamer') + fx + 58;
    walkTo(x, null);
    for (let k = 0; k < 3; k++) setTimeout(() => sparkleShower(x, fy - 10, 30), k * 250);
    const frame = state.artFrames[slot];
    frame.classList.remove('tap');
    void frame.offsetWidth;
    frame.classList.add('tap');
}

function sizeEmbFrame() {
    const st = document.getElementById('embStage').getBoundingClientRect();
    const size = Math.max(160, Math.min(st.width, st.height) * 0.96);
    const f = document.getElementById('embFrame');
    f.style.width = f.style.height = size + 'px';
}

embSvg.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    emb.drawing = true;
    emb.lastCell = -1;
    embApply(e, true);
});
embSvg.addEventListener('pointermove', (e) => {
    if (emb.drawing) embApply(e, false);
});
window.addEventListener('pointerup', () => { emb.drawing = false; });
embEl.addEventListener('pointerdown', (e) => e.stopPropagation());

function openEmbroid(slot) {
    embOpen = true;
    embEl.classList.add('open');
    emb.slot = slot;
    emb.guide = null;
    emb.tool = 'needle';
    emb.perfectShown = false;
    const a = slot === null ? null : artSlots[slot];
    emb.hasArt = !!a;
    emb.cells = a ? a.cells.split('') : Array(EMB_N * EMB_N).fill('.');
    renderSpools();
    renderEmbTools();
    renderEmbroid();
    sizeEmbFrame();
    playMusicBox();
}

function closeEmbroid(silent) {
    embOpen = false;
    embEl.classList.remove('open');
    emb.drawing = false;
    if (!silent) _playWhoosh();
}
document.getElementById('embClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeEmbroid(false);
});
window.addEventListener('resize', () => { if (embOpen) sizeEmbFrame(); });
