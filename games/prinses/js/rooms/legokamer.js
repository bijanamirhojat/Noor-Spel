/* 🧱 Legokamer: bouwen met steentjes. Kies een kleur, sleep een steentje (of tik erop) naar de groene
   bouwplaat; het valt op wat er al staat. Een gebouwd steentje kun je weer oppakken en verschuiven,
   of van de plaat af slepen. Het bouwwerk blijft bewaard (noor-prinses-lego) en staat in het klein op de tafel. */
const LG_COLS = 16;
const LG_ROWS = 12;
const LG_MAX = 120;
const LG_KEY = 'noor-prinses-lego';
const LG_COLORS = [
    { k: 'rood', c: '#ef4444' }, { k: 'oranje', c: '#fb923c' }, { k: 'geel', c: '#facc15' }, { k: 'groen', c: '#22c55e' },
    { k: 'blauw', c: '#3b82f6' }, { k: 'roze', c: '#f472b6' }, { k: 'paars', c: '#a855f7' }, { k: 'wit', c: '#f8fafc' }
];
// w/h in noppen en rijen; deco = een poppetje of bloemetje zonder kleur
const LG_PIECES = {
    b1: { w: 1, h: 1 }, b2: { w: 2, h: 1 }, b3: { w: 3, h: 1 }, b4: { w: 4, h: 1 },
    hoog: { w: 2, h: 2 }, raam: { w: 2, h: 2, name: 'raam' }, deur: { w: 2, h: 3, name: 'deur' },
    dakl: { w: 2, h: 1, name: 'dak' }, dakr: { w: 2, h: 1, name: 'dak' },
    tulp: { w: 1, h: 1, deco: '🌷', name: 'bloem' }, prinses: { w: 1, h: 1, deco: '👸', name: 'prinses' },
    poes: { w: 1, h: 1, deco: '🐱', name: 'poes' }, ster: { w: 1, h: 1, deco: '⭐', name: 'ster' }
};
const LG_TRAY = ['b1', 'b2', 'b3', 'b4', 'hoog', 'raam', 'deur', 'dakl', 'dakr', 'tulp', 'prinses', 'poes', 'ster'];
// Voorbeeldhuisje op de tafel zolang Noor zelf nog niets gebouwd heeft
const LG_SAMPLE = [['b3', 0, 4], ['deur', 7, 7], ['b3', 0, 9], ['raam', 7, 4], ['b1', 0, 6], ['b1', 0, 6], ['b3', 0, 9], ['b3', 0, 9],
    ['b4', 2, 4], ['b4', 2, 8], ['dakl', 5, 4], ['b4', 5, 6], ['dakr', 5, 10], ['dakl', 5, 6], ['dakr', 5, 8],
    ['tulp', 0, 2], ['tulp', 0, 13], ['prinses', 0, 14]];

defineRoom({
    key: 'legokamer',
    name: 'Legokamer',
    icon: '🧱',
    say: 'De legokamer!',
    lampX: 470,
    build(x) {
        place(el('<div class="lg-wainscot"></div>'), x, 300);
        addObj(`<div class="lg-bin">
            <div class="pile">${[0, 1, 2, 3, 4, 5, 6].map(i => `<i style="--c:${LG_COLORS[(i * 3) % 8].c};--i:${i}"></i>`).join('')}</div>
            <div class="tub"><b>🧱</b></div>
        </div>`, x + 30, 316, x + 100, (node) => {
            bounceEl(node, 'jump');
            for (let i = 0; i < 7; i++) setTimeout(() => playTone(1300 + Math.random() * 900, 0.03, 0.1, 'square'), i * 55);
            sparkleShower(x + 95, 320, 10);
        });
        lgTableNode = addObj(`<div class="lg-table">
            <div class="lg-mini"><div class="lg-area"></div><div class="lg-plate"></div></div>
            <div class="top"></div><div class="leg l"></div><div class="leg r"></div>
            <div class="tap-hint" style="left:130px;top:-48px">👇</div>
        </div>`, x + 240, 112, x + 390, () => openLego());
        renderLegoMini();
        addObj(`<div class="lg-tower">${['#3b82f6', '#facc15', '#22c55e', '#f472b6', '#ef4444'].map((c, i) =>
            `<div class="lg-brick lg-pos" style="--x:0;--y:${i};--w:2;--h:1;--c:${c};--i:${i}"></div>`).join('')}</div>`, x + 620, 260, x + 610, (node) => {
            node.classList.remove('hop'); void node.offsetWidth; node.classList.add('hop');
            [523, 587, 659, 784, 880].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.18, 'triangle'), i * 110));
        });
        addObj('<div class="lg-loose"><div class="lg-brick lg-pos" style="--x:0;--y:0;--w:2;--h:1;--c:#3b82f6"></div></div>', x + 545, 428, x + 560, (node) => {
            bounceEl(node, 'wobble');
            playFreqSweep(900, 300, 0.25, 0.15);
            showToast('🦶 Au! 🧱', 1800, 'Au! Op een legosteentje gestapt!');
        });
    }
});

/* ─────────── Bewaren ─────────── */
let lgTableNode = null;
let lgBricks = lgLoad();
let lgNextId = lgBricks.length + 1;

function lgLoad() {
    try {
        const d = JSON.parse(localStorage.getItem(LG_KEY));
        if (Array.isArray(d)) {
            const list = d.filter(b => b && LG_PIECES[b.k] && Number.isInteger(b.c) && LG_COLORS[b.c] && Number.isInteger(b.x))
                .slice(0, LG_MAX)
                .map((b, i) => ({ id: i + 1, k: b.k, c: b.c, x: Math.max(0, Math.min(LG_COLS - LG_PIECES[b.k].w, b.x)), y: Number(b.y) || 0 }));
            return lgSettle(list);
        }
    } catch (e) {}
    return [];
}

function lgSave() {
    try { localStorage.setItem(LG_KEY, JSON.stringify(lgBricks.map(b => ({ k: b.k, c: b.c, x: b.x, y: b.y })))); } catch (e) {}
}

/* ─────────── Stapelen ─────────── */
// Everything falls straight down onto whatever is below it (bottom row first)
function lgSettle(list) {
    const top = new Array(LG_COLS).fill(0);
    const out = [];
    list.slice().sort((a, b) => a.y - b.y || a.id - b.id).forEach(b => {
        const p = LG_PIECES[b.k];
        const y = Math.max(...top.slice(b.x, b.x + p.w));
        if (y + p.h > LG_ROWS) return;
        for (let i = b.x; i < b.x + p.w; i++) top[i] = y + p.h;
        out.push({ ...b, y });
    });
    return out;
}

function lgLandRow(x, w) {
    let y = 0;
    lgBricks.forEach(b => {
        const p = LG_PIECES[b.k];
        if (b.x < x + w && b.x + p.w > x) y = Math.max(y, b.y + p.h);
    });
    return y;
}

function lgBrickHTML(b, extra = '') {
    const p = LG_PIECES[b.k];
    const inner = p.deco ? `<span>${p.deco}</span>` : b.k === 'raam' ? '<i class="pane"></i>' : b.k === 'deur' ? '<i class="door"></i>' : '';
    return `<div class="lg-brick lg-pos k-${b.k}${p.deco ? ' deco' : ''}${extra}" style="--x:${b.x};--y:${b.y};--w:${p.w};--h:${p.h};--c:${LG_COLORS[b.c].c}">${inner}</div>`;
}

function renderLegoMini() {
    if (!lgTableNode) return;
    let list = lgBricks;
    if (!list.length) list = lgSettle(LG_SAMPLE.map(([k, c, x], i) => ({ id: i, k, c, x, y: i })));
    lgTableNode.querySelector('.lg-area').innerHTML = list.map(b => lgBrickHTML(b)).join('');
}

/* ─────────── Bouwen (overlay) ─────────── */
const lgEl = document.getElementById('lgOv');
const lgArea = document.getElementById('lgArea');
const lgShadow = document.getElementById('lgShadow');
let legoOpen = false;
registerOverlay(() => legoOpen, closeLego);
const lg = { color: 0, u: 30, drag: null, nextCol: 0, busy: false };
const lgNodes = new Map();

function lgFit() {
    const r = document.getElementById('lgStage').getBoundingClientRect();
    lg.u = Math.max(12, Math.floor(Math.min(r.width / LG_COLS, (r.height - 8) / (LG_ROWS * 1.2 + 0.7))));
    lgEl.style.setProperty('--u', lg.u + 'px');
}

function lgRender() {
    const seen = new Set();
    lgBricks.forEach(b => {
        seen.add(b.id);
        let n = lgNodes.get(b.id);
        if (!n) {
            n = el(lgBrickHTML(b));
            n.dataset.id = b.id;
            n.addEventListener('pointerdown', (e) => lgDown(e, { src: 'brick', id: b.id }));
            lgArea.appendChild(n);
            lgNodes.set(b.id, n);
        }
        if (+n.style.getPropertyValue('--y') !== b.y) {
            // Falling a long way takes a bit longer
            const d = Math.abs(+n.style.getPropertyValue('--y') - b.y);
            n.style.transitionDuration = `0.15s, ${Math.min(0.5, 0.14 + d * 0.035)}s`;
            n.style.setProperty('--y', b.y);
        }
        n.style.setProperty('--x', b.x);
    });
    lgNodes.forEach((n, id) => { if (!seen.has(id)) { n.remove(); lgNodes.delete(id); } });
    document.getElementById('lgCount').textContent = `🧱 ${lgBricks.length}`;
    document.getElementById('lgHint').textContent = lgBricks.length ? '🎨 Kies een kleur en bouw maar!' : '👉 Sleep een blokje naar de groene plaat!';
}

function lgRenderTray() {
    const tray = document.getElementById('lgTray');
    tray.innerHTML = '';
    LG_TRAY.forEach(k => {
        const p = LG_PIECES[k];
        const b = el(`<button class="lg-tile${p.deco ? ' deco' : ''}" aria-label="${p.name || 'blokje'}" style="--w:${p.w};--h:${p.h}">${lgBrickHTML({ k, c: lg.color, x: 0, y: 0 })}</button>`);
        b.addEventListener('pointerdown', (e) => lgDown(e, { src: 'tray', k, node: b }));
        tray.appendChild(b);
    });
}

function lgRenderColors() {
    const box = document.getElementById('lgColors');
    box.innerHTML = '';
    LG_COLORS.forEach((col, i) => {
        const b = el(`<button class="lg-color${i === lg.color ? ' sel' : ''}" aria-label="${col.k}" style="--c:${col.c}"></button>`);
        b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            lg.color = i;
            box.querySelectorAll('.lg-color').forEach((s, j) => s.classList.toggle('sel', j === i));
            lgRenderTray();
            playTone(500 + i * 60, 0.1, 0.12, 'sine');
            if (window.speechSynthesis) speechSynthesis.cancel();
            speak(col.k);
        });
        box.appendChild(b);
    });
}

function lgClick() {
    playTone(1800, 0.03, 0.12, 'square');
    setTimeout(() => playTone(1150, 0.05, 0.1, 'triangle'), 30);
}

// The brick lands: a small squash and a click
function lgLanded(id, ms) {
    setTimeout(() => {
        const n = lgNodes.get(id);
        if (!n || !legoOpen) return;
        n.classList.remove('land'); void n.offsetWidth; n.classList.add('land');
        lgClick();
    }, ms);
}

// Add a brick that starts at (fx, fy) in plate units and falls onto the build
function lgDrop(piece, col, fx, fy) {
    const p = LG_PIECES[piece.k];
    const y = lgLandRow(col, p.w);
    const b = { id: lgNextId++, k: piece.k, c: piece.c, x: col, y };
    const n = el(lgBrickHTML({ ...b, x: fx, y: fy }));
    n.dataset.id = b.id;
    n.style.transition = 'none';
    n.addEventListener('pointerdown', (e) => lgDown(e, { src: 'brick', id: b.id }));
    lgArea.appendChild(n);
    lgNodes.set(b.id, n);
    lgBricks.push(b);
    void n.offsetWidth;
    n.style.transition = '';
    const ms = Math.min(500, 140 + Math.max(0, fy - y) * 35);
    n.style.transitionDuration = `0.15s, ${ms / 1000}s`;
    lgRender();
    lgLanded(b.id, ms);
    lgSave();
    if (lgBricks.length === 10) setTimeout(() => speak('Wat bouw jij mooi!'), ms + 200);
    return b;
}

function lgFits(col, w, h) { return lgLandRow(col, w) + h <= LG_ROWS; }

function lgTooHigh() {
    bounceEl(lgArea, 'nope');
    playTone(220, 0.15, 0.1, 'triangle');
    speak('Te hoog!');
}

// A quick tap on a piece in the tray drops it on the plate by itself, left to right
function lgAutoPlace(k) {
    if (lgBricks.length >= LG_MAX) { speak('De plaat is vol!'); return; }
    const p = LG_PIECES[k];
    for (let t = 0; t < LG_COLS; t++) {
        let col = (lg.nextCol + t) % LG_COLS;
        if (col + p.w > LG_COLS) continue;
        if (!lgFits(col, p.w, p.h)) continue;
        lg.nextCol = col + p.w;
        lgDrop({ k, c: lg.color }, col, col, LG_ROWS);
        if (p.deco) speak(p.name);
        return;
    }
    lgTooHigh();
}

/* ── Slepen ── */
function lgDown(e, info) {
    e.stopPropagation();
    if (lg.drag || lg.busy) return;
    const r = lgEl.getBoundingClientRect();
    lg.drag = { ...info, pid: e.pointerId, sx: e.clientX, sy: e.clientY, t0: performance.now(), moved: false, ghost: null, ox: 0, oy: 0, r };
    try { lgEl.setPointerCapture(e.pointerId); } catch (err) {}
    if (info.src === 'tray') {
        const p = LG_PIECES[info.k];
        lg.drag.piece = { k: info.k, c: lg.color };
        // Hold it above the finger, so the finger doesn't hide it
        lgMakeGhost(lg.drag.piece, -p.w * lg.u / 2, -p.h * lg.u * 1.2 - lg.u * 0.7);
        lgMove(e);
        playTone(700, 0.05, 0.1, 'triangle');
    } else {
        const n = lgNodes.get(info.id);
        if (n) { n.classList.remove('wiggle'); void n.offsetWidth; n.classList.add('wiggle'); }
    }
}

function lgMakeGhost(piece, ox, oy) {
    const g = el(lgBrickHTML({ ...piece, x: 0, y: 0 }, ' ghost'));
    lgEl.appendChild(g);
    Object.assign(lg.drag, { ghost: g, ox, oy });
}

// Pick a built brick up: the ones on top of it fall down
function lgLift(e) {
    const d = lg.drag;
    const n = lgNodes.get(d.id);
    const b = lgBricks.find(q => q.id === d.id);
    if (!n || !b) { lg.drag = null; return; }
    const nr = n.getBoundingClientRect();
    d.piece = { k: b.k, c: b.c };
    lgBricks = lgSettle(lgBricks.filter(q => q.id !== d.id));
    n.remove();
    lgNodes.delete(d.id);
    lgRender();
    lgSave();
    lgMakeGhost(d.piece, nr.left - d.sx, nr.top - d.sy);
    playTone(900, 0.05, 0.1, 'triangle');
}

// Where would the dragged piece land? null when it is not above the plate
function lgTarget(d) {
    const p = LG_PIECES[d.piece.k];
    const a = lgArea.getBoundingClientRect();
    const gr = d.ghost.getBoundingClientRect();
    const cx = gr.left + gr.width / 2;
    if (cx < a.left - lg.u || cx > a.right + lg.u || gr.bottom < a.top - lg.u || gr.top > a.bottom + lg.u * 2) return null;
    const col = Math.max(0, Math.min(LG_COLS - p.w, Math.round((gr.left - a.left) / lg.u)));
    return { col, y: lgLandRow(col, p.w), fx: (gr.left - a.left) / lg.u, fy: Math.max(0, (a.bottom - gr.bottom) / (lg.u * 1.2)) };
}

function lgMove(e) {
    const d = lg.drag;
    if (!d || e.pointerId !== d.pid) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8) {
        d.moved = true;
        if (d.src === 'brick') lgLift(e);
        if (!lg.drag) return;
    }
    if (!d.ghost) return;
    d.ghost.style.left = (e.clientX - d.r.left + d.ox) + 'px';
    d.ghost.style.top = (e.clientY - d.r.top + d.oy) + 'px';
    const t = lgTarget(d);
    const p = LG_PIECES[d.piece.k];
    lgShadow.classList.toggle('show', !!t);
    if (t) {
        lgShadow.classList.toggle('bad', t.y + p.h > LG_ROWS);
        lgShadow.style.cssText = `--x:${t.col};--y:${Math.min(t.y, LG_ROWS - p.h)};--w:${p.w};--h:${p.h}`;
    }
}

function lgUp(e) {
    const d = lg.drag;
    if (!d || e.pointerId !== d.pid) return;
    lg.drag = null;
    lgShadow.classList.remove('show');
    if (d.src === 'brick' && !d.moved) {
        // Just a tap on a built brick
        const b = lgBricks.find(q => q.id === d.id);
        lgClick();
        if (b) speak(LG_PIECES[b.k].deco ? LG_PIECES[b.k].name : LG_COLORS[b.c].k);
        return;
    }
    if (!d.ghost) return;
    const quick = d.src === 'tray' && !d.moved && performance.now() - d.t0 < 400;
    const t = quick ? null : lgTarget(d);
    const p = LG_PIECES[d.piece.k];
    if (quick) {
        d.ghost.remove();
        lgAutoPlace(d.piece.k);
    } else if (t && t.y + p.h <= LG_ROWS && lgBricks.length < LG_MAX) {
        d.ghost.remove();
        lgDrop(d.piece, t.col, t.fx, t.fy);
        if (p.deco && d.src === 'tray') speak(p.name);
    } else {
        if (t) lgTooHigh();
        else if (d.src === 'brick') _playWhoosh();
        // Off the plate: the piece disappears
        d.ghost.classList.add('poof');
        setTimeout(() => d.ghost.remove(), 300);
    }
}

function lgCancelDrag() {
    if (!lg.drag) return;
    if (lg.drag.ghost) lg.drag.ghost.remove();
    lg.drag = null;
    lgShadow.classList.remove('show');
}

lgEl.addEventListener('pointermove', lgMove);
lgEl.addEventListener('pointerup', lgUp);
lgEl.addEventListener('pointercancel', lgCancelDrag);

/* ── Klaar en opruimen ── */
function lgTool(t, btn) {
    if (lg.busy) return;
    if (t === 'klaar') {
        if (lgBricks.length < 3) { bounceEl(btn, 'nope'); speak('Bouw eerst nog wat meer!'); return; }
        lgArea.classList.remove('cheer'); void lgArea.offsetWidth; lgArea.classList.add('cheer');
        playCorrect();
        ovCheer(lgEl, lgArea, ['✨', '⭐', '💖', '🧱']);
        speak(randomPick(['Wat een mooi bouwwerk!', 'Goed gebouwd!', 'Wauw, wat heb jij dat knap gebouwd!']));
        earnSticker('legokamer', btn);
    } else if (t === 'weg') {
        if (!lgBricks.length) { bounceEl(btn, 'nope'); return; }
        lg.busy = true;
        lgCancelDrag();
        const list = lgBricks.slice().sort((a, b) => b.y - a.y);
        list.forEach((b, i) => setTimeout(() => {
            const n = lgNodes.get(b.id);
            if (n) n.classList.add('gone');
            if (i % 2 === 0) playTone(1400 - i * 8, 0.04, 0.08, 'square');
        }, i * 35));
        setTimeout(() => {
            lgBricks = [];
            lg.nextCol = 0;
            lg.busy = false;
            lgRender();
            lgSave();
            speak('Alles opgeruimd!');
        }, list.length * 35 + 350);
    }
}

document.querySelectorAll('.lg-tool').forEach(b => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); lgTool(b.dataset.t, b); }));

function lgResize() { if (legoOpen) lgFit(); }
window.addEventListener('resize', lgResize);

function openLego() {
    legoOpen = true;
    lgEl.classList.add('open');
    lg.busy = false;
    lgFit();
    lgRenderColors();
    lgRenderTray();
    lgRender();
    speak(lgBricks.length ? 'Verder bouwen!' : 'Lego bouwen! Sleep een blokje naar de groene plaat.');
}

function closeLego() {
    lgCancelDrag();
    legoOpen = false;
    lg.busy = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    lgEl.classList.remove('open');
    renderLegoMini();
    _playWhoosh();
}
document.getElementById('lgClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeLego(); });
lgEl.addEventListener('pointerdown', (e) => e.stopPropagation());
