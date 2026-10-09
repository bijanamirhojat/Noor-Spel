/* 🦋 Vlinderkas: een glazen kas vol planten en vlinders.
   Binnen: geef de rupsjes 3 blaadjes, dan spinnen ze een cocon; tik 3 keer op de cocon en er komt een vlinder uit.
   Alle uitgekomen vlinders vliegen rond in de kas (en in de kamer) en worden bewaard (localStorage). */
const BFLY_KEY = 'noor-prinses-vlinders';
const BFLY_MAX = 12;           // flying around at the same time
const BFLY_FEED = 3;
const BFLY_TAPS = 3;
const BFLY_COLORS = [
    ['#f472b6', '#fde047'], ['#38bdf8', '#a78bfa'], ['#fb923c', '#1f2937'], ['#4ade80', '#fde047'],
    ['#c084fc', '#f9a8d4'], ['#f87171', '#fef08a'], ['#22d3ee', '#f0abfc'], ['#facc15', '#2563eb']
];
// Some butterflies are tiny, some are big
const BFLY_SIZES = [0.6, 0.8, 1, 1.3, 1.7];
function bflyNew() {
    return { c: Math.floor(Math.random() * BFLY_COLORS.length), z: randomPick(BFLY_SIZES) };
}
// Saved as { c: colour index, z: size }; older saves were just the colour index
let bflySaved = [];
try {
    const d = JSON.parse(localStorage.getItem(BFLY_KEY));
    if (Array.isArray(d)) {
        bflySaved = d.map(b => (Number.isInteger(b) ? { c: b, z: randomPick(BFLY_SIZES) } : b))
            .filter(b => b && Number.isInteger(b.c) && b.c >= 0 && b.c < BFLY_COLORS.length && BFLY_SIZES.includes(b.z));
        localStorage.setItem(BFLY_KEY, JSON.stringify(bflySaved));
    }
} catch (e) {}

function bflyHTML(b, cls = '') {
    const [c1, c2] = BFLY_COLORS[b.c];
    return `<div class="bfly ${cls}" style="--c1:${c1};--c2:${c2};--z:${b.z}"><i class="w l"></i><i class="w r"></i><b></b></div>`;
}
function bflyChime() {
    [1047, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.07, 'sine'), i * 80));
}

defineRoom({
    key: 'vlinderkas',
    name: 'Vlinderkas',
    icon: '🦋',
    say: 'De vlinderkas',
    build(x) {
        place(el('<div class="vk-roof"></div>'), x, -500);
        place(el('<div class="vk-sign">🦋 Vlinderkas</div>'), x + 40, 60);
        addObj(`<div class="vk-table"><div class="top"></div><div class="leg l"></div><div class="leg r"></div>
            <div class="vk-pot" style="left:20px"><span class="plant">🌿</span><span class="cat">🐛</span></div>
            <div class="vk-pot" style="left:120px"><span class="plant">🌿</span><div class="cocoon"></div></div>
            <div class="vk-pot" style="left:220px"><span class="plant">🌿</span><span class="cat" style="animation-delay:-0.6s">🐛</span></div>
            <div class="tap-hint" style="left:130px;top:-80px">👇</div></div>`, x + 220, 220, x + 370, openButterfly);
        addObj('<div class="vk-bigpot"><span class="fl">🌺</span><div class="pot"></div></div>', x + 620, 230, x + 650, (node) => {
            node.classList.remove('grow'); void node.offsetWidth; node.classList.add('grow');
            playFreqSweep(400, 900, 0.3, 0.1);
            sparkleShower(x + 670, 220, 20);
        });
        addObj('<div class="vk-mist"><span>💦</span></div>', x + 500, 0, x + 520, (node) => {
            bounceEl(node, 'jump');
            startNoise('shower');
            setTimeout(stopNoise, 900);
            for (let i = 0; i < 40; i++) spawnSparkle(x + 400 + Math.random() * 260, 30 + Math.random() * 30, { vx: (Math.random() - 0.5) * 30, vy: 60 + Math.random() * 80, g: 40, hue: 190 + Math.random() * 20, size: 3 + Math.random() * 3, max: 2 });
        });
        place(el('<div class="vk-air" id="bflyRoomAir"></div>'), x, -200);
        renderBflyRoom();
    }
});

// The saved butterflies flutter around in the room too (CSS paths, tap one to make it dance)
function renderBflyRoom() {
    const air = document.getElementById('bflyRoomAir');
    if (!air) return;
    const list = bflySaved.slice(-6);
    air.innerHTML = list.map((b, i) =>
        `<div class="vk-flutter" style="left:${60 + (i * 127) % 640}px;top:${200 + (i * 71) % 260}px;animation-delay:${-i * 1.3}s;animation-duration:${7 + (i % 3)}s">${bflyHTML(b)}</div>`).join('');
    air.querySelectorAll('.vk-flutter').forEach(f => f.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bounceEl(f.firstElementChild, 'jump');
        bflyChime();
        const r = f.getBoundingClientRect();
        const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
        for (let k = 0; k < 16; k++) spawnSparkle(p.x, p.y, { speed: 120, max: 1 });
    }));
}

/* ─────────── Vlinderkas (overlay) ─────────── */
const bfEl = document.getElementById('bflyOv');
const bfStage = document.getElementById('bflyStage');
let butterflyOpen = false;
// pots: { stage: 'cat' | 'cocoon' | 'empty', n }, flies: flying butterflies inside the overlay
const bf = { pots: [], flies: [], raf: 0, last: 0 };

function bfFlowers() { return [...bfStage.querySelectorAll('.vk-flower')]; }

function bfHint() {
    const s = bf.pots.map(p => p.stage);
    document.getElementById('bflyHint').textContent = s.includes('cocoon') && !s.includes('cat')
        ? 'Tik op de cocon! 😴' : s.includes('cat') ? 'Geef de rupsjes een blaadje 🍃 (tik op een rups)' : 'Er komen nieuwe rupsjes…';
    document.getElementById('bflyCount').textContent = `🦋 ${bflySaved.length}`;
}

function bfRenderPot(i) {
    const p = bf.pots[i];
    const node = bfStage.querySelector(`.vk-opot[data-i="${i}"] .who`);
    if (p.stage === 'cat') {
        node.innerHTML = `<span class="cat" style="--s:${0.7 + p.n * 0.22}">🐛</span>`;
    } else if (p.stage === 'cocoon') {
        node.innerHTML = '<div class="cocoon big"></div>';
    } else {
        node.innerHTML = '';
    }
}

function bfNewCat(i) {
    bf.pots[i] = { stage: 'cat', n: 0 };
    bfRenderPot(i);
    const n = bfStage.querySelector(`.vk-opot[data-i="${i}"] .who`);
    bounceEl(n, 'jump');
    bfHint();
}

function bfTapPot(i) {
    const p = bf.pots[i];
    const pot = bfStage.querySelector(`.vk-opot[data-i="${i}"]`);
    const who = pot.querySelector('.who');
    if (p.stage === 'cat' && !p.busy) {
        // Nom nom: a leaf flies in and the caterpillar grows a bit
        p.busy = true;
        ovFly(bfEl, document.getElementById('bflyLeaves'), who, '🍃', 500).then(() => {
            p.busy = false;
            p.n++;
            [300, 360, 300, 360].forEach((f, k) => setTimeout(() => playTone(f, 0.06, 0.1, 'triangle'), k * 110));
            ovCheer(bfEl, who, ['🍃', '💚']);
            if (p.n >= BFLY_FEED) {
                bfRenderPot(i);
                setTimeout(() => {
                    // Time for a nap: spin a cocoon
                    p.stage = 'cocoon';
                    p.n = 0;
                    bfRenderPot(i);
                    playFreqSweep(800, 300, 0.6, 0.08);
                    bfHint();
                }, 700);
            } else bfRenderPot(i);
            const cat = who.querySelector('.cat');
            if (cat) cat.classList.add('munch');
        });
    } else if (p.stage === 'cocoon') {
        p.n++;
        const c = who.querySelector('.cocoon');
        c.classList.remove('wiggle'); void c.offsetWidth; c.classList.add('wiggle');
        playTone(500 + p.n * 150, 0.12, 0.1, 'sine');
        if (p.n >= BFLY_TAPS) bfHatch(i, who);
    }
}

function bfHatch(i, who) {
    const b = bflyNew();
    bf.pots[i] = { stage: 'empty', n: 0 };
    bfRenderPot(i);
    bflySaved.push(b);
    if (bflySaved.length > 40) bflySaved = bflySaved.slice(-40);
    try { localStorage.setItem(BFLY_KEY, JSON.stringify(bflySaved)); } catch (e) {}
    const s = bfStage.getBoundingClientRect();
    const r = who.getBoundingClientRect();
    bfAddFly(b, r.left + r.width / 2 - s.left, r.top - s.top, true);
    playWin();
    setTimeout(bflyChime, 400);
    ovCheer(bfEl, who, ['✨', '💖', '🌸', '⭐']);
    bfHint();
    setTimeout(() => { if (butterflyOpen) bfNewCat(i); }, 3500);
}

function bfAddFly(b, x, y, fresh) {
    if (bf.flies.length >= BFLY_MAX) {
        const old = bf.flies.shift();
        old.node.remove();
    }
    const node = el(bflyHTML(b, fresh ? 'fresh' : ''));
    bfStage.appendChild(node);
    const f = { node, x, y, tx: x, ty: y - 160, land: -1, rest: 0, ph: Math.random() * 6, face: 1 };
    node.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        // Shoo! A happy loop up high
        f.land = -1;
        f.rest = 0;
        f.tx = Math.random() * bfStage.clientWidth;
        f.ty = 20 + Math.random() * 60;
        node.classList.remove('resting');
        bflyChime();
        ovCheer(bfEl, node, ['✨', '💫']);
    });
    bf.flies.push(f);
    bfPick(f);
    if (fresh) { f.tx = x; f.ty = Math.max(20, y - 200); }
    return f;
}

// Choose where to go next: somewhere in the air, or land on a flower for a while
function bfPick(f) {
    const W = bfStage.clientWidth, H = bfStage.clientHeight;
    const flowers = bfFlowers();
    if (Math.random() < 0.35 && flowers.length) {
        const k = Math.floor(Math.random() * flowers.length);
        const s = bfStage.getBoundingClientRect();
        const r = flowers[k].getBoundingClientRect();
        f.land = k;
        f.tx = r.left + r.width / 2 - s.left;
        f.ty = r.top - s.top + 4;
    } else {
        f.land = -1;
        f.tx = 30 + Math.random() * (W - 60);
        f.ty = 20 + Math.random() * H * 0.55;
    }
}

function bfStep(t) {
    if (!butterflyOpen) return;
    const dt = Math.min(0.05, (t - (bf.last || t)) / 1000);
    bf.last = t;
    bf.flies.forEach(f => {
        f.ph += dt * 3;
        if (f.rest > 0) {
            f.rest -= dt;
            if (f.rest <= 0) { f.node.classList.remove('resting'); bfPick(f); }
        } else {
            const dx = f.tx - f.x, dy = f.ty - f.y;
            const d = Math.hypot(dx, dy);
            if (d < 6) {
                if (f.land >= 0) { f.rest = 2 + Math.random() * 3; f.node.classList.add('resting'); } else bfPick(f);
            } else {
                const sp = Math.min(d, 110 * dt);
                f.x += dx / d * sp;
                f.y += dy / d * sp + (f.land >= 0 && d < 40 ? 0 : Math.sin(f.ph * 2) * 30 * dt);
                if (Math.abs(dx) > 4) f.face = dx > 0 ? 1 : -1;
            }
        }
        f.node.style.transform = `translate(${f.x - 30}px, ${f.y - 40}px) scaleX(${f.face}) rotate(${f.rest > 0 ? 0 : Math.sin(f.ph) * 10}deg)`;
    });
    bf.raf = requestAnimationFrame(bfStep);
}

bfStage.querySelectorAll('.vk-opot').forEach(p => p.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    bfTapPot(+p.dataset.i);
}));

function openButterfly() {
    butterflyOpen = true;
    bfEl.classList.add('open');
    bf.flies.forEach(f => f.node.remove());
    bf.flies = [];
    bf.pots = [];
    [0, 1, 2].forEach(i => bfNewCat(i));
    const s = bfStage.getBoundingClientRect();
    bflySaved.slice(-BFLY_MAX).forEach(b => {
        const f = bfAddFly(b, 40 + Math.random() * (s.width - 80), 30 + Math.random() * s.height * 0.5, false);
        f.x = f.tx; f.y = f.ty;
        bfPick(f);
    });
    bfHint();
    bf.last = 0;
    cancelAnimationFrame(bf.raf);
    bf.raf = requestAnimationFrame(bfStep);
    playMusicBox();
}

function closeButterfly() {
    butterflyOpen = false;
    cancelAnimationFrame(bf.raf);
    bfEl.classList.remove('open');
    renderBflyRoom();
    _playWhoosh();
}
document.getElementById('bflyClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeButterfly(); });
bfEl.addEventListener('pointerdown', (e) => e.stopPropagation());
