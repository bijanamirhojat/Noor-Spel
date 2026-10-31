/* 🐾 Stokstaartjes: overal holletjes waar stokstaartjes uit omhoog komen, rondkijken en weer wegduiken, in allerlei
   kleuren (ook glitter, regenboog en sterren, die zijn zeldzaam). Tik er een aan als hij boven is en hij komt in het
   album aan de muur; tik op een leeg holletje en er komt er meteen een. De wachter op de rots fluit: dan komen ze
   allemaal tegelijk kijken. Het familietje rechts krijgt bij elke tik een andere kleur. Gevonden kleuren in
   noor-prinses-stokstaartjes. */
const MK_KEY = 'noor-prinses-stokstaartjes';
// main / belly colour; rare = komt minder vaak boven
const MK_COLORS = [
    { k: 'bruin', a: '#c8955a', b: '#f1dcb4' }, { k: 'roze', a: '#f472b6', b: '#fce7f3' },
    { k: 'blauw', a: '#38bdf8', b: '#e0f2fe' }, { k: 'paars', a: '#a78bfa', b: '#ede9fe' },
    { k: 'groen', a: '#4ade80', b: '#dcfce7' }, { k: 'geel', a: '#facc15', b: '#fef9c3' },
    { k: 'oranje', a: '#fb923c', b: '#ffedd5' }, { k: 'wit', a: '#f1f5f9', b: '#fff' },
    { k: 'nacht', a: '#475569', b: '#94a3b8' },
    { k: 'glitter', a: 'url(#mkGold)', b: '#fef3c7', rare: true },
    { k: 'regenboog', a: 'url(#mkRainbow)', b: '#fff', rare: true },
    { k: 'sterren', a: 'url(#mkStars)', b: '#c7d2fe', rare: true }
];
// Holes: x in the room, y of the hole, size (further back = smaller)
const MK_HOLES = [[50, 352, 0.9], [230, 340, 0.85], [470, 345, 0.88], [140, 432, 1.2], [330, 442, 1.2], [520, 428, 1.15], [690, 446, 1.2]];
let mkFound = new Set();
try { mkFound = new Set(JSON.parse(localStorage.getItem(MK_KEY) || '[]')); } catch { /* geen opslag */ }
const mkBurrows = [];
let mkFamily = [];

function mkColor(k) { return MK_COLORS.find(c => c.k === k); }
function mkRandomColor() {
    const pool = Math.random() < 0.2 ? MK_COLORS.filter(c => c.rare) : MK_COLORS.filter(c => !c.rare);
    return randomPick(pool).k;
}

function meerkatSVG() {
    return `<svg class="stk-svg" viewBox="0 0 60 120">
        <path class="mb" d="M36 96 Q56 98 53 116 Q51 120 47 117 Q49 104 34 104 Z"/>
        <ellipse class="mb" cx="30" cy="76" rx="16" ry="30"/>
        <ellipse class="ml" cx="30" cy="81" rx="9" ry="22"/>
        <ellipse class="mb" cx="23" cy="108" rx="7" ry="3.5"/><ellipse class="mb" cx="37" cy="108" rx="7" ry="3.5"/>
        <ellipse class="mb arm" cx="23" cy="62" rx="4" ry="10" transform="rotate(18 23 62)"/>
        <ellipse class="mb arm" cx="37" cy="62" rx="4" ry="10" transform="rotate(-18 37 62)"/>
        <g class="stk-head">
            <circle cx="18.5" cy="27" r="3.4" fill="#4a3426"/><circle cx="41.5" cy="27" r="3.4" fill="#4a3426"/>
            <ellipse class="mb" cx="30" cy="32" rx="12.5" ry="13"/>
            <ellipse class="ml" cx="30" cy="41" rx="6.5" ry="5.5"/>
            <ellipse cx="24.5" cy="31" rx="4.4" ry="3.8" fill="#4a3426"/><ellipse cx="35.5" cy="31" rx="4.4" ry="3.8" fill="#4a3426"/>
            <g class="stk-eyes"><circle cx="24.5" cy="31" r="2" fill="#111"/><circle cx="35.5" cy="31" r="2" fill="#111"/>
                <circle cx="25.3" cy="30.2" r="0.8" fill="#fff"/><circle cx="36.3" cy="30.2" r="0.8" fill="#fff"/></g>
            <ellipse cx="30" cy="43" rx="2.2" ry="1.6" fill="#3f2a1d"/>
            <circle cx="20" cy="38" r="2.2" fill="#f9a8d4" opacity=".6"/><circle cx="40" cy="38" r="2.2" fill="#f9a8d4" opacity=".6"/>
        </g>
    </svg><span class="stk-glit">✨</span><span class="stk-glit g2">✨</span>`;
}

// Paint a meerkat holder in one of the colours
function mkPaint(node, k) {
    const c = mkColor(k);
    node.dataset.c = k;
    node.style.setProperty('--mk', c.a);
    node.style.setProperty('--mkb', c.b);
}

function mkSqueak() {
    [1500, 1900, 1600].forEach((f, i) => setTimeout(() => playTone(f + Math.random() * 200, 0.06, 0.07, 'square'), i * 70));
}

function mkCollect(k, node) {
    if (mkFound.has(k)) return;
    mkFound.add(k);
    try { localStorage.setItem(MK_KEY, JSON.stringify([...mkFound])); } catch { /* geen opslag */ }
    mkRenderAlbum();
    const slot = document.querySelector(`.stk-album [data-c="${k}"]`);
    if (slot) bounceEl(slot, 'pulse');
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 3);
    sparkleShower(p.x, p.y - 40, mkColor(k).rare ? 40 : 16);
    playSparkleSound();
    if (mkFound.size === MK_COLORS.length) {
        setTimeout(() => { playWin(); showToast('🐾 Alle stokstaartjes gevonden! 🌈'); mkAlarm(); }, 700);
    }
}

function mkRenderAlbum() {
    const a = document.querySelector('.stk-album .slots');
    if (!a) return;
    a.innerHTML = MK_COLORS.map(c => `<span class="stk-slot${mkFound.has(c.k) ? ' got' : ''}" data-c="${c.k}" style="--mk:${c.a};--mkb:${c.b}">${meerkatSVG()}</span>`).join('');
    document.querySelector('.stk-album b').textContent = `${mkFound.size}/${MK_COLORS.length}`;
}

defineRoom({
    key: 'stokstaartjes',
    name: 'Stokstaartjes',
    icon: '🐾',
    say: 'De stokstaartjes',
    build(x) {
        // Gradients for the special colours (url(#...) in the CSS fill)
        place(el(`<svg class="stk-defs" width="0" height="0"><defs>
            <linearGradient id="mkGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".45" stop-color="#f59e0b"/><stop offset=".55" stop-color="#fef3c7"/><stop offset="1" stop-color="#d97706"/></linearGradient>
            <linearGradient id="mkRainbow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef4444"/><stop offset=".2" stop-color="#f97316"/><stop offset=".4" stop-color="#facc15"/><stop offset=".6" stop-color="#4ade80"/><stop offset=".8" stop-color="#60a5fa"/><stop offset="1" stop-color="#a855f7"/></linearGradient>
            <pattern id="mkStars" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#312e81"/><circle cx="3" cy="4" r="1.1" fill="#fff"/><circle cx="10" cy="9" r="0.8" fill="#fde047"/><circle cx="7" cy="13" r="0.6" fill="#fff"/></pattern>
        </defs></svg>`), x, 0);
        place(el('<div class="stk-dune"></div>'), x - 10, 250);
        place(el('<div class="stk-dune d2"></div>'), x + 380, 270);
        place(el('<div class="emoji-obj stk-cactus">🌵</div>'), x + 610, 236);
        addObj(`<div class="stk-album"><div class="slots"></div><b></b></div>`, x + 400, 40, x + 520, (node) => {
            bounceEl(node, 'pulse');
            node.querySelectorAll('.stk-slot.got').forEach((s, i) => setTimeout(() => bounceEl(s, 'jump'), i * 80));
            mkSqueak();
        });
        // The lookout on his rock
        addObj(`<div class="stk-rock"><div class="stone"></div><div class="stk-guard">${meerkatSVG()}</div>
            <div class="tap-hint" style="left:44px;top:-60px">👇</div></div>`, x + 250, 150, x + 330, mkAlarm);
        mkPaint(document.querySelector('.stk-guard'), 'bruin');
        MK_HOLES.forEach(([hx, hy, s], i) => {
            const node = place(el(`<div class="stk-burrow" style="--s:${s}"><div class="stk-clip"><div class="stk-who">${meerkatSVG()}</div></div>
                <div class="stk-mound"><i></i></div></div>`), x + hx, hy - 128 * s);
            node.style.zIndex = hy > 400 ? 9 : 2;
            const b = { node, who: node.querySelector('.stk-who'), up: false, t: 1 + i * 0.7 + Math.random() * 2 };
            mkPaint(b.who, mkRandomColor());
            node.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (state.busy) return;
                if (!b.up) { mkUp(b); return; }
                zooAnim(b.who, 'stk-hop');
                mkSqueak();
                mkCollect(b.who.dataset.c, b.who);
                earnSticker('stokstaartjes', node);
                b.t = Math.max(b.t, 2.5);
            });
            mkBurrows.push(b);
        });
        mkFamily = [[700, 256, 1], [752, 258, 0.62], [648, 252, 0.85]].map(([fx, fy, s], i) => {
            const n = addObj(`<div class="stk-fam" style="--s:${s};animation-delay:${-i * 0.5}s">${meerkatSVG()}</div>`, x + fx - 30, fy, x + fx, (node) => {
                const ks = MK_COLORS.map(c => c.k);
                const k = ks[(ks.indexOf(node.dataset.c) + 1) % ks.length];
                mkPaint(node, k);
                zooAnim(node, 'stk-hop');
                mkSqueak();
                mkCollect(k, node);
            });
            mkPaint(n, ['bruin', 'roze', 'blauw'][i]);
            return n;
        });
        mkRenderAlbum();
    },
    tick(dt) {
        for (const b of mkBurrows) {
            b.t -= dt;
            if (b.t > 0) continue;
            if (b.up) mkDown(b);
            else mkUp(b);
        }
    }
});

function mkUp(b) {
    if (b.up) return;
    mkPaint(b.who, mkRandomColor());
    b.up = true;
    b.t = 2.5 + Math.random() * 2.5;
    b.node.classList.add('up');
    if (inRoom('stokstaartjes')) playFreqSweep(700, 1300, 0.12, 0.04);
}

function mkDown(b) {
    b.up = false;
    b.t = 1.2 + Math.random() * 4;
    b.node.classList.remove('up');
}

// The lookout whistles: everyone comes up to look
function mkAlarm() {
    const guard = document.querySelector('.stk-guard');
    zooAnim(guard, 'stk-hop');
    [0, 220, 440].forEach(t => setTimeout(() => playFreqSweep(1800, 2600, 0.15, 0.08), t));
    mkBurrows.forEach((b, i) => setTimeout(() => { mkDown(b); mkUp(b); b.t = 4 + Math.random(); }, 300 + i * 90));
}
