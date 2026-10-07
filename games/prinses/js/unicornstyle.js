/* 🦄 Eenhoorn-verkleedkist (op de eenhoornweide): vacht, manen, hoorn, hoefjes, hoofd en patroon.
   De look staat in localStorage en wordt gebruikt door unicornSVG() in js/outside.js. */
const UNI_KEY = 'noor-prinses-eenhoorn';
const UNI_COATS = {
    wit: ['#ffffff', '#e9d5ff'], roze: ['#fce7f3', '#f9a8d4'], lila: ['#ede9fe', '#c4b5fd'], blauw: ['#e0f2fe', '#93c5fd'],
    mint: ['#dcfce7', '#86efac'], geel: ['#fef9c3', '#fde047'], grijs: ['#e5e7eb', '#9ca3af'], nacht: ['#374151', '#111827']
};
const UNI_MANES = {
    regenboog: ['#ef4444', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a855f7'],
    roze: ['#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d'],
    blauw: ['#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#1d4ed8'],
    paars: ['#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce'],
    goud: ['#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207'],
    zilver: ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#e2e8f0', '#f1f5f9'],
    snoep: ['#fbcfe8', '#bae6fd', '#fde68a', '#bbf7d0', '#e9d5ff', '#fecaca'],
    vuur: ['#fef08a', '#facc15', '#fb923c', '#f97316', '#ef4444', '#b91c1c']
};
const UNI_HORNS = {
    goud: { c: ['#fcd34d', '#f59e0b'] }, zilver: { c: ['#e5e7eb', '#9ca3af'] }, roze: { c: ['#f9a8d4', '#db2777'] },
    regenboog: { c: ['#fcd34d', '#a855f7'], rainbow: true }, kristal: { c: ['#cffafe', '#22d3ee'] }
};
const UNI_HOOVES = ['#f472b6', '#a855f7', '#38bdf8', '#facc15', '#4ade80', '#111827', '#ffffff'];
const UNI_HEADS = {
    flowers: '<text x="121" y="8" font-size="8" text-anchor="middle">🌸</text><text x="127" y="2" font-size="8" text-anchor="middle">🌼</text><text x="133" y="-3" font-size="8" text-anchor="middle">🌷</text>',
    bow: '<text x="126" y="6" font-size="13" text-anchor="middle">🎀</text>',
    crown: '<text x="127" y="4" font-size="12" text-anchor="middle">👑</text>',
    tiara: '<path d="M127 11 Q137 1 149 9" stroke="#e5e7eb" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="137" cy="5" r="2.6" fill="#38bdf8" stroke="#fff"/><circle cx="131" cy="8" r="1.6" fill="#f472b6"/><circle cx="144" cy="6" r="1.6" fill="#f472b6"/>'
};
const UNI_PATTERNS = {
    stars: { icon: '⭐', svg: [[58, 62], [82, 52], [104, 66], [72, 78], [94, 80]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="9" text-anchor="middle">⭐</text>`).join('') },
    hearts: { icon: '💖', svg: [[58, 62], [82, 52], [104, 66], [72, 78], [94, 80]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="9" text-anchor="middle">💖</text>`).join('') },
    dots: { icon: '🔵', svg: [[52, 58, '#f472b6'], [66, 50, '#60a5fa'], [80, 62, '#facc15'], [98, 52, '#4ade80'], [110, 66, '#a855f7'], [62, 74, '#fb923c'], [88, 78, '#38bdf8'], [104, 80, '#f472b6']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`).join('') },
    glitter: { icon: '✨', svg: [[56, 58], [76, 50], [96, 58], [66, 74], [88, 72], [108, 70]].map(([x, y], i) =>
        `<path class="uglit" style="animation-delay:${i * -0.25}s" d="M${x} ${y - 5} L${x + 1.4} ${y - 1.4} L${x + 5} ${y} L${x + 1.4} ${y + 1.4} L${x} ${y + 5} L${x - 1.4} ${y + 1.4} L${x - 5} ${y} L${x - 1.4} ${y - 1.4} Z" fill="#fff" stroke="#fde047" stroke-width="0.8"/>`).join('') }
};
const UNI_DEFAULT = { coat: 'wit', mane: 'regenboog', horn: 'goud', hoof: '#f472b6', head: 'none', pattern: 'none' };
let uniLook = { ...UNI_DEFAULT };
try {
    const d = JSON.parse(localStorage.getItem(UNI_KEY));
    if (d && typeof d === 'object') {
        if (UNI_COATS[d.coat]) uniLook.coat = d.coat;
        if (UNI_MANES[d.mane]) uniLook.mane = d.mane;
        if (UNI_HORNS[d.horn]) uniLook.horn = d.horn;
        if (UNI_HOOVES.includes(d.hoof)) uniLook.hoof = d.hoof;
        if (d.head === 'none' || UNI_HEADS[d.head]) uniLook.head = d.head;
        if (d.pattern === 'none' || UNI_PATTERNS[d.pattern]) uniLook.pattern = d.pattern;
    }
} catch (e) {}

// Redraw the unicorn outside (keeps its classes: walking, ridden, flying...)
function applyUniLook() {
    const u = document.getElementById('unicorn');
    if (u) u.querySelector('.uflip').innerHTML = unicornSVG(uniLook, 'u');
}

/* ─────────── Verkleedkist (overlay) ─────────── */
const uniEl = document.getElementById('uniOv');
let uniOpen = false;
let uniTab = 'coat';
const UNI_TABS = [['coat', '🎨'], ['mane', '💇'], ['horn', '🦄'], ['hoof', '👢'], ['head', '👑'], ['pattern', '✨']];
const UNI_HEAD_ICONS = { none: '🚫', flowers: '🌸', bow: '🎀', crown: '👑', tiara: '💎' };

function renderUniPreview() {
    document.getElementById('uniPreview').innerHTML = unicornSVG(uniLook, 'up');
}

function renderUniTabs() {
    const box = document.getElementById('uniTabs');
    box.innerHTML = UNI_TABS.map(([k, ic]) => `<button class="du-tab${uniTab === k ? ' active' : ''}" data-k="${k}">${ic}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        uniTab = b.dataset.k;
        renderUniTabs();
        renderUniOpts();
        playPop();
    }));
}

function swatch(bg) { return `<span class="sw" style="background:${bg}"></span>`; }

function renderUniOpts() {
    const box = document.getElementById('uniOpts');
    let opts = [];
    if (uniTab === 'coat') opts = Object.entries(UNI_COATS).map(([k, [f, l]]) => [k, `<span class="sw" style="background:${f};box-shadow:inset 0 0 0 4px ${l}"></span>`]);
    if (uniTab === 'mane') opts = Object.entries(UNI_MANES).map(([k, m]) => [k, swatch(`linear-gradient(180deg, ${m.join(', ')})`)]);
    if (uniTab === 'horn') opts = Object.entries(UNI_HORNS).map(([k, h]) => [k, swatch(h.rainbow ? `linear-gradient(180deg, ${UNI_MANES.regenboog.join(', ')})` : `linear-gradient(180deg, ${h.c[0]}, ${h.c[1]})`)]);
    if (uniTab === 'hoof') opts = UNI_HOOVES.map(c => [c, swatch(c)]);
    if (uniTab === 'head') opts = Object.entries(UNI_HEAD_ICONS);
    if (uniTab === 'pattern') opts = [['none', '🚫'], ...Object.entries(UNI_PATTERNS).map(([k, p]) => [k, p.icon])];
    box.innerHTML = opts.map(([v, html]) => `<button class="du-opt${uniLook[uniTab] === v ? ' sel' : ''}" data-v="${v}">${html}</button>`).join('');
    box.querySelectorAll('.du-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        uniLook[uniTab] = b.dataset.v;
        renderUniPreview();
        renderUniOpts();
        uniSparkle();
    }));
}

function uniSparkle() {
    const pv = document.getElementById('uniPreview');
    pv.classList.remove('pop'); void pv.offsetWidth; pv.classList.add('pop');
    const r = pv.getBoundingClientRect();
    const o = uniEl.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '⭐', '💖', '🌈']);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 90;
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.top + r.height * 0.45 - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        uniEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    [1319, 1760].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.08, 'sine'), i * 60));
}

function openUniStyle() {
    uniOpen = true;
    uniEl.classList.add('open');
    renderUniPreview();
    renderUniTabs();
    renderUniOpts();
    playMusicBox();
}

function closeUniStyle() {
    uniOpen = false;
    uniEl.classList.remove('open');
    try { localStorage.setItem(UNI_KEY, JSON.stringify(uniLook)); } catch (e) {}
    applyUniLook();
    const u = document.getElementById('unicorn');
    if (u) {
        u.classList.remove('neigh'); void u.offsetWidth; u.classList.add('neigh');
        sparkleShower(state.uniX, 200, 50);
    }
    playFreqSweep(500, 1400, 0.4, 0.12);
}

document.getElementById('uniRandom').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    uniLook = {
        coat: randomPick(Object.keys(UNI_COATS)), mane: randomPick(Object.keys(UNI_MANES)), horn: randomPick(Object.keys(UNI_HORNS)),
        hoof: randomPick(UNI_HOOVES), head: randomPick(Object.keys(UNI_HEAD_ICONS)), pattern: randomPick(['none', ...Object.keys(UNI_PATTERNS)])
    };
    renderUniPreview();
    renderUniOpts();
    uniSparkle();
    playFreqSweep(300, 1500, 0.4, 0.12);
});
document.getElementById('uniDone').addEventListener('pointerdown', (e) => { e.stopPropagation(); playWin(); closeUniStyle(); });
document.getElementById('uniClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeUniStyle(); });
uniEl.addEventListener('pointerdown', (e) => e.stopPropagation());
