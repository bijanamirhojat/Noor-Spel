/* 🚩 Vlaggentoren: helemaal bovenin het kasteel, tussen de wolken. Maak je eigen vlag (patroon, kleuren, plaatje)
   en hijs hem in de mast; dan wappert hij ook op de torens buiten op het kasteelplein (--flag-* op :root, .my-flag).
   De vlag staat in noor-prinses-vlag. */
const FL_KEY = 'noor-prinses-vlag';
const FL_PATS = ['effen', 'liggend', 'staand', 'schuin'];
const FL_COLORS = ['#f472b6', '#ef4444', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#ffffff', '#1e293b'];
const FL_SYMS = ['', '👑', '⭐', '💖', '🦄', '🌸', '🐱', '🌈', '🏰', '🌙'];
let flag = null;           // the hoisted flag
try { flag = JSON.parse(localStorage.getItem(FL_KEY)); } catch { /* geen opslag */ }
const fl = { draft: null, part: 1 };

function flagBg(f) {
    const dir = { liggend: '180deg', staand: '90deg', schuin: '135deg' }[f.pat];
    return dir ? `linear-gradient(${dir}, ${f.c1} 50%, ${f.c2} 50%)` : f.c1;
}

// The hoisted flag also flies on the castle towers outside
function applyFlag() {
    const root = document.documentElement;
    root.classList.toggle('my-flag', !!flag);
    if (!flag) return;
    root.style.setProperty('--flag-bg', flagBg(flag));
    root.style.setProperty('--flag-sym', `"${flag.sym}"`);
}

defineRoom({
    key: 'vlaggentoren',
    name: 'Vlaggentoren',
    icon: '🚩',
    say: 'De vlaggentoren, helemaal bovenin!',
    lampX: 700,
    build(x) {
        for (let i = 0; i < 4; i++) {
            const c = place(el('<div class="cloud"></div>'), x + 200 + i * 160, 40 + (i % 2) * 120);
            c.style.animationDelay = -i * 2 + 's';
        }
        place(el('<div class="fl-wall">' + '<i></i>'.repeat(9) + '</div>'), x, 300);
        addObj(`<div class="fl-mast"><div class="pole"></div><div class="rope"></div><div class="knob"></div>
            <div class="fl-flag" id="flFlag"><span></span></div>
            <div class="tap-hint" style="left:90px;top:200px">👇</div></div>`, x + 400, 10, x + 380, openFlag);
        addObj('<div class="emoji-obj fl-scope">🔭</div>', x + 620, 230, x + 640, (node) => {
            bounceEl(node, 'wobble');
            const sights = ['🏘️', '🦁', '🌈', '🐬', '⛵', '🦄', '🎡'];
            showToast(`🔭 ${randomPick(sights)} ${randomPick(sights)}`, 1500);
            playFreqSweep(600, 1200, 0.3, 0.06);
        });
        addObj('<div class="emoji-obj fl-bird">🐦</div>', x + 250, 262, x + 270, (node) => {
            zooAnim(node, 'fly');
            [0, 120, 240].forEach(t => setTimeout(() => playTone(2200 + Math.random() * 600, 0.06, 0.06, 'sine'), t));
            setTimeout(() => node.classList.remove('fly'), 3000);
        });
        renderMastFlag(true);
        applyFlag();
    }
});

function renderMastFlag(up) {
    const f = document.getElementById('flFlag');
    if (!f) return;
    const d = flag || { pat: 'schuin', c1: '#f472b6', c2: '#ffffff', sym: '👑' };
    f.style.background = flagBg(d);
    f.querySelector('span').textContent = d.sym;
    if (up !== undefined) f.classList.toggle('down', !up);
}

/* ─────────── Vlag maken (overlay) ─────────── */
const flOv = document.getElementById('flOv');
let flOpen = false;
registerOverlay(() => flOpen, closeFlag);

function renderFlagMaker() {
    const d = fl.draft;
    const pv = document.getElementById('flPreview');
    pv.style.background = flagBg(d);
    pv.querySelector('span').textContent = d.sym;
    pv.dataset.pat = d.pat;
    pv.dataset.part = d.pat === 'effen' ? 1 : fl.part;
    const small = (f) => `<span class="fl-mini" style="background:${flagBg(f)}"></span>`;
    document.getElementById('flTray').innerHTML =
        `<div class="fl-row">${FL_PATS.map(p => `<button class="bd-btn fl-btn${d.pat === p ? ' on' : ''}" data-a="pat" data-v="${p}">${small({ ...d, pat: p })}</button>`).join('')}</div>
         <div class="fl-row">${FL_COLORS.map(c => `<button class="bd-btn fl-btn" data-a="color" data-v="${c}"><span class="sw" style="background:${c}"></span></button>`).join('')}</div>
         <div class="fl-row">${FL_SYMS.map(s => `<button class="bd-btn fl-btn${d.sym === s ? ' on' : ''}" data-a="sym" data-v="${s}">${s || '⬜'}</button>`).join('')}
            <span class="care-sep"></span><button class="bd-btn fl-btn fl-go" data-a="hoist">⬆️🚩</button></div>`;
    flOv.querySelectorAll('.fl-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        flagAction(b.dataset.a, b.dataset.v);
    }));
}

function flagAction(a, v) {
    const d = fl.draft;
    if (a === 'pat') {
        d.pat = v;
        playPop();
    } else if (a === 'color') {
        // Colour the chosen half, then go on to the other half
        if (d.pat === 'effen' || fl.part === 1) d.c1 = v; else d.c2 = v;
        if (d.pat !== 'effen') fl.part = fl.part === 1 ? 2 : 1;
        playFreqSweep(500, 800, 0.1, 0.08);
    } else if (a === 'sym') {
        d.sym = v;
        playSparkleSound();
    } else if (a === 'hoist') {
        hoistFlag();
        return;
    }
    bounceEl(document.getElementById('flPreview'), 'jump');
    renderFlagMaker();
}

// Tap a half of the preview to choose which half gets the next colour
document.getElementById('flPreview').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const d = fl.draft;
    if (d.pat === 'effen') return;
    const r = e.currentTarget.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width, w = (e.clientY - r.top) / r.height;
    const second = d.pat === 'liggend' ? w > 0.5 : d.pat === 'staand' ? u > 0.5 : u + w > 1;
    fl.part = second ? 2 : 1;
    playPop();
    renderFlagMaker();
});

function hoistFlag() {
    flag = { ...fl.draft };
    try { localStorage.setItem(FL_KEY, JSON.stringify(flag)); } catch { /* geen opslag */ }
    closeFlag();
    renderMastFlag(false);
    applyFlag();
    // Up the mast it goes, with a fanfare
    requestAnimationFrame(() => requestAnimationFrame(() => renderMastFlag(true)));
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.1, 'square'), 200 + i * 220));
    const x = roomX('vlaggentoren') + 470;
    setTimeout(() => { playWin(); for (let i = 0; i < 4; i++) setTimeout(() => sparkleShower(x, 30, 30), i * 250); }, 1800);
    earnSticker('vlaggentoren', document.getElementById('flFlag'));
}

function openFlag() {
    flOpen = true;
    fl.draft = flag ? { ...flag } : { pat: 'liggend', c1: '#f472b6', c2: '#ffffff', sym: '👑' };
    fl.part = 1;
    flOv.classList.add('open');
    renderFlagMaker();
    playPop();
}

function closeFlag() {
    flOpen = false;
    flOv.classList.remove('open');
}

document.getElementById('flClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeFlag(); });
flOv.addEventListener('pointerdown', (e) => e.stopPropagation());
