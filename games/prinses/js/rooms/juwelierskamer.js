/* 💍 Juwelierskamer */
defineRoom({
    key: 'juwelierskamer',
    name: 'Juwelierskamer',
    icon: '💍',
    say: 'De juwelierskamer',
    build(rj) {
        [[40, '👑💍'], [610, '💎📿']].forEach(([x, j]) => place(el(`<div class="jewel-case"><div class="glass">${[...j].filter(c => c.trim()).map(c => `<span>${c}</span>`).join('')}</div><div class="stand"></div></div>`), rj + x, 190));
        addObj(`<div class="musicbox"><div class="box"></div><span class="ballerina">💃</span><div class="lid"></div></div>`, rj + 220, 210, rj + 300, openMusicBox);
        addObj(`<div class="bead-table"><div class="top"></div><div class="legs"></div>
            <div class="bowl" style="left:20px">🔴🟡🔵</div><div class="bowl" style="left:92px">💗💜💚</div><div class="bowl" style="left:164px">⭐🌸💎</div>
            <div class="tap-hint" style="left:100px;top:-30px">👇</div></div>`, rj + 380, 260, rj + 500, openBeads);
    }
});

/* ─────────── Juwelierskamer: kralen ─────────── */
const BEAD_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#3b82f6', '#a855f7', '#f472b6', '#ffffff', '#fcd34d'];
const BEAD_SHAPES = ['round', 'heart', 'star', 'flower', 'diamond'];
const PENDANTS = [['💖', '💖'], ['⭐', '⭐'], ['🐚', '🐚'], ['💎', '💎'], ['🌸', '🌸'], ['none', '🚫']];
const bd = { color: 7, beads: [], pendant: null };
let beadOpen = false;

function beadShape(shape, c, x, y, r) {
    const st = `stroke="rgba(0,0,0,0.25)" stroke-width="${r * 0.12}"`;
    const shine = `<circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.22}" fill="#fff" opacity=".7"/>`;
    if (shape === 'heart') {
        return `<path d="M${x} ${y + r * 0.9} C${x - r * 1.6} ${y - r * 0.1} ${x - r * 0.7} ${y - r * 1.3} ${x} ${y - r * 0.4} C${x + r * 0.7} ${y - r * 1.3} ${x + r * 1.6} ${y - r * 0.1} ${x} ${y + r * 0.9} Z" fill="${c}" ${st}/>${shine}`;
    }
    if (shape === 'star') {
        let d = '';
        for (let i = 0; i < 10; i++) {
            const rad = i % 2 === 0 ? r * 1.15 : r * 0.5;
            const a = -Math.PI / 2 + (i * Math.PI) / 5;
            d += (i ? 'L' : 'M') + (x + Math.cos(a) * rad).toFixed(1) + ' ' + (y + Math.sin(a) * rad).toFixed(1) + ' ';
        }
        return `<path d="${d}Z" fill="${c}" ${st}/>`;
    }
    if (shape === 'flower') {
        let h = '';
        for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5;
            h += `<circle cx="${(x + Math.cos(a) * r * 0.6).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.6).toFixed(1)}" r="${r * 0.5}" fill="${c}" ${st}/>`;
        }
        return h + `<circle cx="${x}" cy="${y}" r="${r * 0.38}" fill="#fde047"/>`;
    }
    if (shape === 'diamond') {
        return `<path d="M${x} ${y - r * 1.1} L${x + r * 0.85} ${y} L${x} ${y + r * 1.1} L${x - r * 0.85} ${y} Z" fill="${c}" ${st}/>${shine}`;
    }
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${st}/>${shine}`;
}

// Beads are spaced evenly along a quadratic curve (the drooping string)
function necklaceMarkup(neck, p0, p1, p2, r, newIdx) {
    if (!neck || !neck.beads.length) return '';
    const at = (t) => [
        (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
        (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
    ];
    let h = `<path d="M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}" stroke="#fde68a" stroke-width="${r * 0.3}" fill="none"/>`;
    const n = neck.beads.length;
    const mid = at(0.5);
    if (neck.pendant) {
        h += `<text x="${mid[0]}" y="${mid[1] + r * 2.4}" font-size="${r * 3.2}" text-anchor="middle" dominant-baseline="central">${neck.pendant}</text>`;
    }
    neck.beads.forEach((b, i) => {
        const [x, y] = at((i + 1) / (n + 1));
        const rx = Math.round(x * 10) / 10, ry = Math.round(y * 10) / 10;
        h += `<g${i === newIdx ? ' class="bd-new"' : ''}>${beadShape(b.s, BEAD_COLORS[b.c] || '#f472b6', rx, ry, r)}</g>`;
    });
    return h;
}

function renderBeads(newIdx) {
    const svg = document.getElementById('bdSvg');
    const neck = { beads: bd.beads, pendant: bd.pendant };
    svg.innerHTML = `<path d="M30 30 Q150 270 270 30" stroke="#d8b4fe" stroke-width="3" stroke-dasharray="4 6" fill="none"/>
        <circle cx="30" cy="30" r="7" fill="#fcd34d"/><circle cx="270" cy="30" r="7" fill="#fcd34d"/>
        ${necklaceMarkup(neck, [30, 30], [150, 270], [270, 30], 15, newIdx)}`;
}

function renderBeadTray() {
    const tray = document.getElementById('bdTray');
    tray.innerHTML =
        BEAD_COLORS.map((c, i) => `<button class="bd-btn${bd.color === i ? ' sel' : ''}" data-c="${i}"><span class="sw" style="background:${c}"></span></button>`).join('') +
        '<span class="care-sep"></span>' +
        BEAD_SHAPES.map(sh => `<button class="bd-btn" data-s="${sh}"><svg viewBox="-20 -20 40 40">${beadShape(sh, BEAD_COLORS[bd.color], 0, 0, 13)}</svg></button>`).join('') +
        '<span class="care-sep"></span>' +
        PENDANTS.map(([v, ic]) => `<button class="bd-btn${(bd.pendant || 'none') === v ? ' sel' : ''}" data-p="${v}">${ic}</button>`).join('') +
        '<span class="care-sep"></span>' +
        '<button class="bd-btn" id="bdUndo">⌫<small>Terug</small></button>' +
        '<button class="bd-btn" id="bdClear">🧽<small>Leeg</small></button>' +
        '<button class="bd-btn" id="bdWear" style="border-color:#86efac">✅<small>Omdoen</small></button>';
    tray.querySelectorAll('[data-c]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bd.color = +b.dataset.c;
        renderBeadTray();
        playPop();
    }));
    tray.querySelectorAll('[data-s]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (bd.beads.length >= 14) return;
        bd.beads.push({ s: b.dataset.s, c: bd.color });
        renderBeads(bd.beads.length - 1);
        playTone(900 + bd.beads.length * 70, 0.12, 0.12, 'triangle');
    }));
    tray.querySelectorAll('[data-p]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bd.pendant = b.dataset.p === 'none' ? null : b.dataset.p;
        renderBeads();
        renderBeadTray();
        playSparkleSound();
    }));
    document.getElementById('bdUndo').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bd.beads.pop();
        renderBeads();
        playFreqSweep(700, 300, 0.12, 0.1);
    });
    document.getElementById('bdClear').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bd.beads = [];
        bd.pendant = null;
        renderBeads();
        renderBeadTray();
        playFreqSweep(900, 200, 0.4, 0.12);
    });
    document.getElementById('bdWear').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        state.look.neck = bd.beads.length ? { beads: bd.beads.slice(), pendant: bd.pendant } : null;
        applyLook();
        saveLook();
        playWin();
        closeBeads(true);
        twirl();
        sparkleShower(state.x, 200, 40);
        showToast('💍 Wat een mooie ketting!');
    });
}

function openBeads() {
    beadOpen = true;
    const cur = state.look.neck;
    bd.beads = cur ? cur.beads.slice() : [];
    bd.pendant = cur ? cur.pendant : null;
    document.getElementById('beadOv').classList.add('open');
    renderBeads();
    renderBeadTray();
    playMusicBox();
}

function closeBeads(silent) {
    beadOpen = false;
    document.getElementById('beadOv').classList.remove('open');
    if (!silent) _playWhoosh();
}
document.getElementById('bdClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeBeads(false);
});
document.getElementById('beadOv').addEventListener('pointerdown', (e) => e.stopPropagation());

function openMusicBox(node) {
    const open = node.classList.toggle('open');
    if (!open) { playFreqSweep(600, 300, 0.2, 0.1); return; }
    const notes = [1319, 1175, 1047, 988, 1047, 1175, 1319, 1568, 1319, 1175, 1047, 880];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.08, 'sine'), i * 260));
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top);
    for (let i = 0; i < 30; i++) spawnSparkle(c.x, c.y + 40, { speed: 120, hue: 320 });
    clearTimeout(node._t);
    node._t = setTimeout(() => node.classList.remove('open'), 7000);
}
