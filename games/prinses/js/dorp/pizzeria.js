/* 🍕 Pizzeria: jij bent de pizzabakker. Een diertje wil een pizza (in het wolkje: welk beleg en hoeveel).
   Deeg uitrollen, saus smeren met je vinger, kaas strooien, beleg erop (tik op de pizza; tik beleg aan om het eraf
   te halen), de oven in en in punten snijden. Aantal pizza's in noor-prinses-pizza. */
defineRoom({
    key: 'pizzeria',
    name: 'Pizzeria',
    icon: '🍕',
    say: 'De pizzeria',
    build(s0) {
        villageHouse(s0 + 560, 220, 280, '#fecaca', '#16a34a');
        addObj(`<div class="pz-shop">
            <div class="pz-sign">🍕</div>
            <div class="pz-front"><div class="pz-window"><span class="pz-oven-glow">🔥</span><span>🍕</span></div><div class="pz-door"></div></div>
            <div class="pz-awning"></div>
            <div class="tap-hint" style="left:160px;top:-70px">👇</div>
        </div>`, s0 + 110, 120, s0 + 290, openPizzeria);
        addObj('<div class="emoji-obj pz-scooter">🛵</div>', s0 + 560, 330, s0 + 600, (node) => {
            if (node.classList.contains('ride')) return;
            zooAnim(node, 'ride');
            [0, 140, 280].forEach(t => setTimeout(() => playTone(90 + t / 7, 0.12, 0.08, 'sawtooth'), t));
            setTimeout(() => playFreqSweep(200, 500, 0.6, 0.08), 350);
            setTimeout(() => node.classList.remove('ride'), 3000);
        });
        addObj('<div class="emoji-obj" style="font-size:54px">🍅</div>', s0 + 470, 360, s0 + 500, (node) => {
            bounceEl(node, 'jump');
            playFreqSweep(500, 200, 0.15, 0.12);
        });
    }
});

/* ─────────── Pizzeria-overlay ─────────── */
const PZ_KEY = 'noor-prinses-pizza';
const PZ_TOPS = [
    { k: 'champignon', e: '🍄' }, { k: 'tomaat', e: '🍅' }, { k: 'paprika', e: '🫑' },
    { k: 'ananas', e: '🍍' }, { k: 'olijf', e: '🫒' }, { k: 'salami', e: '<i class="pz-salami"></i>' }
];
const PZ_STEPS = [['deeg', '🫓'], ['saus', '🥫'], ['kaas', '🧀'], ['beleg', '🍄'], ['oven', '🔥'], ['snijden', '🔪']];
const PZ_CUSTOMERS = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🐨', '🐷', '🐸', '🦁', '🐵', '🐯'];
const pzOv = document.getElementById('pzOv');
const pz = { step: 'deeg', dough: 0, sauce: 0, cheese: 0, tops: [], sel: 'champignon', cuts: 0, order: null, made: 0, coins: 0, busy: false, drag: null, round: 0 };
let pzOpen = false;
registerOverlay(() => pzOpen, closePizzeria);
try { pz.made = +localStorage.getItem(PZ_KEY) || 0; } catch { /* geen opslag */ }

const pzTop = (k) => PZ_TOPS.find(t => t.k === k);
const pzPizza = () => document.getElementById('pzPizza');

function pzNewCustomer() {
    // Start easy: one kind, a few pieces. Later two or three kinds.
    const kinds = pz.made < 2 ? 1 : pz.made < 5 ? 2 : 1 + Math.floor(Math.random() * 3);
    const pick = PZ_TOPS.slice().sort(() => Math.random() - 0.5).slice(0, kinds);
    pz.order = pick.map(t => ({ k: t.k, n: 1 + Math.floor(Math.random() * (pz.made < 2 ? 3 : 4)) + (pz.made < 2 ? 1 : 0) }));
    pz.round++;
    pz.busy = false;
    Object.assign(pz, { step: 'deeg', dough: 0, sauce: 0, cheese: 0, tops: [], cuts: 0, sel: pick[0].k });
    document.getElementById('pzAnimal').textContent = randomPick(PZ_CUSTOMERS);
    // The wish: a little pizza with exactly that topping on it
    const items = pz.order.flatMap(o => Array(o.n).fill(o.k));
    document.getElementById('pzOrder').innerHTML = items.map((k, i) => {
        const a = i / items.length * Math.PI * 2, r = items.length > 1 ? 30 : 0;
        return `<span style="left:${50 + Math.cos(a) * r}%;top:${50 + Math.sin(a) * r}%">${pzTop(k).e}</span>`;
    }).join('');
    const cust = document.getElementById('pzCustomer');
    cust.classList.remove('leave');
    bounceEl(cust, 'arrive');
    const p = pzPizza();
    p.className = 'pz-pizza';
    p.style.transform = '';
    renderPizza();
}

function renderPizza() {
    const p = pzPizza();
    p.style.setProperty('--dough', 0.35 + pz.dough * 0.65);
    p.style.setProperty('--sauce', pz.sauce);
    p.style.setProperty('--cheese', pz.cheese);
    document.getElementById('pzTops').innerHTML = pz.tops.map((t, i) =>
        `<span class="pz-top" data-i="${i}" style="left:${t.x}%;top:${t.y}%">${pzTop(t.k).e}</span>`).join('');
    document.getElementById('pzCuts').innerHTML = Array.from({ length: pz.cuts }, (_, i) => `<i style="transform:translate(-50%,-50%) rotate(${i * 45}deg)"></i>`).join('');
    const at = PZ_STEPS.findIndex(s => s[0] === pz.step);
    document.getElementById('pzSteps').innerHTML = PZ_STEPS.map(([k, e], i) =>
        `<span class="${i < at ? 'done' : i === at ? 'now' : ''}">${i < at ? '✅' : e}</span>`).join('');
    document.getElementById('pzCoins').textContent = pz.coins;
    renderPizzaTray();
}

function renderPizzaTray() {
    let h = '';
    if (pz.step === 'deeg') h = '<button class="bd-btn pz-btn" data-a="roll">🫓</button>';
    else if (pz.step === 'saus') h = '<button class="bd-btn pz-btn" data-a="sauce">🥫</button>';
    else if (pz.step === 'kaas') h = '<button class="bd-btn pz-btn" data-a="cheese">🧀</button>';
    else if (pz.step === 'beleg') {
        h = PZ_TOPS.map(t => `<button class="bd-btn pz-btn${pz.sel === t.k ? ' on' : ''}" data-a="top" data-v="${t.k}">${t.e}</button>`).join('') +
            '<span class="care-sep"></span><button class="bd-btn pz-btn pz-go" data-a="oven">🔥</button>';
    } else if (pz.step === 'snijden') h = '<button class="bd-btn pz-btn" data-a="cut">🔪</button>';
    const tray = document.getElementById('pzTray');
    tray.innerHTML = h;
    tray.querySelectorAll('.pz-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pizzaAction(b.dataset.a, b.dataset.v);
    }));
}

function pzNext(step) {
    pz.step = step;
    playCorrect();
    ovCheer(pzOv, pzPizza(), ['✨', '⭐']);
    renderPizza();
}

// A free spot on the pizza (in %), for a topping added with the button
function pzSpot() {
    for (let k = 0; k < 30; k++) {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 30;
        const s = { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
        if (pz.tops.every(t => Math.hypot(t.x - s.x, t.y - s.y) > 11)) return s;
    }
    return { x: 50 + (Math.random() - 0.5) * 50, y: 50 + (Math.random() - 0.5) * 50 };
}

function pizzaAction(a, v, at) {
    if (pz.busy) return;
    const p = pzPizza();
    if (a === 'roll' && pz.step === 'deeg') {
        pz.dough = Math.min(1, pz.dough + 0.34);
        zooAnim(document.getElementById('pzPin'), 'roll');
        playFreqSweep(180, 120, 0.3, 0.12);
        renderPizza();
        if (pz.dough >= 1) setTimeout(() => pzNext('saus'), 400);
    } else if (a === 'sauce' && pz.step === 'saus') {
        pzSauce(0.25);
    } else if (a === 'cheese' && pz.step === 'kaas') {
        pz.cheese = Math.min(1, pz.cheese + 0.34);
        for (let i = 0; i < 6; i++) setTimeout(() => playTone(1800 + Math.random() * 800, 0.03, 0.05, 'triangle'), i * 50);
        zooAnim(p, 'sprinkle');
        renderPizza();
        if (pz.cheese >= 1) setTimeout(() => pzNext('beleg'), 400);
    } else if (a === 'top' && pz.step === 'beleg') {
        if (v) pz.sel = v;
        if (pz.tops.length >= 16) { bounceEl(p, 'nope'); return; }
        pz.tops.push({ k: pz.sel, ...(at || pzSpot()) });
        playFreqSweep(400, 800, 0.1, 0.1);
        renderPizza();
        const last = p.querySelector('.pz-top:last-child');
        if (last) bounceEl(last, 'jump');
    } else if (a === 'oven' && pz.step === 'beleg') {
        pzBake();
    } else if (a === 'cut' && pz.step === 'snijden') {
        pz.cuts++;
        playFreqSweep(1200, 600, 0.2, 0.08);
        renderPizza();
        if (pz.cuts >= 4) pzServe();
    }
}

function pzSauce(amount) {
    if (pz.sauce >= 1) return;
    const before = pz.sauce;
    pz.sauce = Math.min(1, pz.sauce + amount);
    if (Math.floor(before * 8) !== Math.floor(pz.sauce * 8)) playFreqSweep(300, 220, 0.08, 0.08);
    renderPizza();
    if (pz.sauce >= 1) setTimeout(() => pzNext('kaas'), 300);
}

// Does what's on the pizza match the wish?
function pzMatches() {
    const kinds = new Set([...pz.order.map(o => o.k), ...pz.tops.map(t => t.k)]);
    return [...kinds].every(k => (pz.order.find(o => o.k === k) || { n: 0 }).n === pz.tops.filter(t => t.k === k).length);
}

function pzBake() {
    if (!pzMatches()) {
        // Not quite: the customer shakes their head and points at the wish
        bounceEl(document.getElementById('pzCustomer'), 'nope');
        bounceEl(document.getElementById('pzBubble'), 'pulse');
        playTone(330, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(262, 0.2, 0.1, 'triangle'), 140);
        return;
    }
    pz.busy = true;
    pz.step = 'oven';
    const round = pz.round;
    renderPizza();
    const p = pzPizza(), oven = document.getElementById('pzOven');
    const pr = p.getBoundingClientRect(), or = oven.getBoundingClientRect();
    const dx = or.left + or.width / 2 - (pr.left + pr.width / 2), dy = or.top + or.height * 0.62 - (pr.top + pr.height / 2);
    p.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
    playFreqSweep(500, 250, 0.5, 0.1);
    setTimeout(() => {
        if (round !== pz.round || !pzOpen) return;
        oven.classList.add('on');
        startNoise('dryer');
        p.classList.add('baked');
    }, 600);
    setTimeout(() => {
        stopNoise();
        oven.classList.remove('on');
        if (round !== pz.round || !pzOpen) return;
        [1568, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.1, 'sine'), i * 220));
        p.style.transform = '';
        pz.busy = false;
        setTimeout(() => round === pz.round && pzNext('snijden'), 600);
    }, 3200);
}

function pzServe() {
    pz.busy = true;
    pz.made++;
    try { localStorage.setItem(PZ_KEY, pz.made); } catch { /* geen opslag */ }
    const cust = document.getElementById('pzCustomer');
    const p = pzPizza();
    const round = pz.round;
    setTimeout(() => {
        if (round !== pz.round || !pzOpen) return;
        ovFly(pzOv, p, cust, '🍕', 600).then(() => {
            bounceEl(cust, 'jump');
            ovCheer(pzOv, cust);
            playWin();
            const pay = Math.min(6, pz.tops.length);
            const till = document.getElementById('pzKassa');
            for (let i = 0; i < pay; i++) {
                setTimeout(() => ovFly(pzOv, cust, till, '🪙', 450).then(() => {
                    pz.coins++;
                    document.getElementById('pzCoins').textContent = pz.coins;
                    bounceEl(till, 'jump');
                    playTone(COUNT_NOTES[i % COUNT_NOTES.length], 0.2, 0.1, 'triangle');
                }), 400 + i * 300);
            }
            setTimeout(() => cust.classList.add('leave'), 800 + pay * 300);
            setTimeout(() => { if (round === pz.round && pzOpen) pzNewCustomer(); }, 1500 + pay * 300);
        });
        p.classList.add('gone');
    }, 400);
}

// On the pizza itself: roll, smear sauce, sprinkle cheese, place or remove a topping, cut
pzPizza().addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (pz.busy) return;
    const top = e.target.closest('.pz-top');
    if (pz.step === 'beleg' && top) {
        pz.tops.splice(+top.dataset.i, 1);
        playFreqSweep(800, 400, 0.1, 0.1);
        renderPizza();
        return;
    }
    const r = pzPizza().getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
    if (pz.step === 'saus') {
        pz.drag = { x: e.clientX, y: e.clientY };
        pzPizza().setPointerCapture(e.pointerId);
        return;
    }
    if (pz.step === 'beleg') {
        if (Math.hypot(x - 50, y - 50) < 40) pizzaAction('top', null, { x, y });
        return;
    }
    pizzaAction({ deeg: 'roll', kaas: 'cheese', snijden: 'cut' }[pz.step]);
});
pzPizza().addEventListener('pointermove', (e) => {
    if (!pz.drag) return;
    const d = Math.hypot(e.clientX - pz.drag.x, e.clientY - pz.drag.y);
    pz.drag = { x: e.clientX, y: e.clientY };
    pzSauce(d / 900);
});
['pointerup', 'pointercancel'].forEach(t => pzPizza().addEventListener(t, () => { pz.drag = null; }));

function openPizzeria() {
    pzOpen = true;
    pzOv.classList.add('open');
    pzNewCustomer();
    playMusicBox();
}

function closePizzeria() {
    pzOpen = false;
    pz.busy = false;
    stopNoise();
    pz.round++;
    pzOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('pzClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closePizzeria(); });
pzOv.addEventListener('pointerdown', (e) => e.stopPropagation());
