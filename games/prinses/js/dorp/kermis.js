/* 🎡 Kermis: reuzenrad, suikerspinkraam, eendjes vissen en een grijpmachine.
   Eendjes vissen: tik een eendje, het hengeltje vist hem op en onder het eendje zit een prijsje.
   Grijpmachine: tik in de kast om de grijper te verplaatsen, dan "Pak!". De knuffel valt in het bakje; haal hem
   er zelf uit, dan gaat hij mee naar huis in de knuffelmand in de slaapkamer (KNUFFEL_KEY).
   Prijzen van het eendjes vissen komen op de prijzenplank in de kamer (localStorage). */
const KERMIS_KEY = 'noor-prinses-kermis';
const KNUFFEL_KEY = 'noor-prinses-knuffels';
let knuffels = [];
try {
    const d = JSON.parse(localStorage.getItem(KNUFFEL_KEY));
    if (Array.isArray(d)) knuffels = d.filter(p => typeof p === 'string' && p.length <= 8).slice(-30);
} catch (e) {}
const KERMIS_SMALL = ['🎈', '🍭', '🪀', '🎀', '🍬', '🪁', '🧃', '🎏'];
const KERMIS_BIG = ['⭐', '👑', '🏆', '💎'];
const KERMIS_PLUSH = ['🧸', '🐰', '🦄', '🐻', '🐶', '🐱', '🐼', '🐸', '🐵', '🐧'];
let kermisPrizes = [];
try {
    const d = JSON.parse(localStorage.getItem(KERMIS_KEY));
    if (Array.isArray(d)) kermisPrizes = d.filter(p => typeof p === 'string' && p.length <= 8).slice(-30);
} catch (e) {}

function kermisTune() {
    [523, 659, 784, 659, 523, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 0.07, 'square'), i * 110));
}

// A prize flies into the tray of the overlay and is kept for the shelf in the room
function kermisWin(prize, ov, fromEl, trayId) {
    kermisPrizes.push(prize);
    if (kermisPrizes.length > 30) kermisPrizes = kermisPrizes.slice(-30);
    try { localStorage.setItem(KERMIS_KEY, JSON.stringify(kermisPrizes)); } catch (e) {}
    const tray = document.getElementById(trayId);
    return ovFly(ov, fromEl, tray, prize, 700).then(() => {
        renderKermisTrays();
        bounceEl(tray, 'jump');
        playCorrect();
    });
}

function renderKermisTrays() {
    const last = kermisPrizes.slice(-8).join('');
    const mand = document.getElementById('kcMand');
    if (mand) mand.innerHTML = `🧺 ${knuffels.length}<span>${knuffels.slice(-8).join('')}</span>`;
    ['kdTray'].forEach(id => {
        const t = document.getElementById(id);
        if (t) t.innerHTML = `🏆 ${kermisPrizes.length}<span>${last}</span>`;
    });
    const shelf = document.getElementById('kermisShelf');
    if (shelf) shelf.innerHTML = kermisPrizes.length ? kermisPrizes.slice(-8).map(p => `<span>${p}</span>`).join('') : '<small>Prijzen 🏆</small>';
}

defineRoom({
    key: 'kermis',
    name: 'Kermis',
    icon: '🎡',
    say: 'De kermis',
    build(x) {
        place(el(`<div class="km-lights">${Array.from({ length: 16 }, (_, i) => `<i style="animation-delay:${-i * 0.15}s"></i>`).join('')}</div>`), x, 10);
        addObj(`<div class="km-wheel"><div class="legs"></div><div class="spin">${Array.from({ length: 8 }, (_, i) =>
            `<div class="spoke" style="rotate:${i * 45}deg"><div class="gondola" style="--g:${['#f472b6', '#38bdf8', '#facc15', '#4ade80'][i % 4]}"></div></div>`).join('')}<div class="hub"></div></div></div>`,
        x + 520, -40, x + 650, (node) => {
            node.classList.toggle('fast');
            playFreqSweep(node.classList.contains('fast') ? 300 : 800, node.classList.contains('fast') ? 800 : 300, 0.6, 0.1);
        });
        addObj(`<div class="km-stall km-ducks"><div class="awning"></div><div class="name">🦆 Eendjes vissen</div>
            <div class="pool"><span>🦆</span><span>🦆</span><span>🦆</span></div>
            <div class="tap-hint" style="left:80px;top:-50px">👇</div></div>`, x + 20, 190, x + 130, openKermisDucks);
        addObj(`<div class="km-claw"><div class="top">🧸 Grijpmachine</div><div class="glass"><div class="arm"></div><div class="pile">🐰🦄🐻<br>🐶🧸🐼🐸</div></div><div class="base"><span class="slot"></span><span class="btn"></span></div>
            <div class="tap-hint" style="left:40px;top:-50px">👇</div></div>`, x + 270, 130, x + 330, openKermisClaw);
        addObj('<div class="km-candy"><div class="cloud"></div><div class="stick"></div><div class="tub"></div><div class="name">🍭 Suikerspin</div></div>', x + 420, 230, x + 470, (node) => {
            const s = ((+node.dataset.s || 0) + 1) % 5;
            node.dataset.s = s;
            node.className = node.className.replace(/\bs\d\b/g, '').trim() + ' s' + s;
            if (s === 0) {
                // All gone: nom nom!
                [400, 300, 400, 300].forEach((f, i) => setTimeout(() => playTone(f, 0.07, 0.1, 'triangle'), i * 110));
                const r = node.getBoundingClientRect();
                const p = screenToWorld(r.left + r.width / 2, r.top + 20);
                for (let i = 0; i < 20; i++) spawnSparkle(p.x, p.y, { hue: 320 + Math.random() * 30, speed: 140 });
            } else {
                playFreqSweep(600 + s * 150, 900 + s * 150, 0.3, 0.07);
            }
        });
        place(el('<div class="km-shelf" id="kermisShelf"></div>'), x + 30, 70);
        renderKermisTrays();
    }
});

/* ─────────── Eendjes vissen (overlay) ─────────── */
const kdEl = document.getElementById('kermisDuckOv');
const kdStage = document.getElementById('kdStage');
const kdLine = document.getElementById('kdLine');
let kermisDuckOpen = false;
const kd = { ducks: [], raf: 0, last: 0, busy: false };
const KD_N = 8;

function kdBuild() {
    kdStage.querySelectorAll('.kd-duck').forEach(d => d.remove());
    kd.ducks = [];
    for (let i = 0; i < KD_N; i++) {
        const node = el('<div class="kd-duck"><div class="flip"><span class="front">🦆</span><span class="back"></span></div><i class="loop"></i></div>');
        kdStage.appendChild(node);
        const d = { node, a: i / KD_N * Math.PI * 2, out: false };
        node.addEventListener('pointerdown', (e) => { e.stopPropagation(); kdFish(d); });
        kd.ducks.push(d);
    }
}

function kdPos(a) {
    const W = kdStage.clientWidth, H = kdStage.clientHeight;
    return { x: W / 2 + Math.cos(a) * W * 0.36, y: H * 0.62 + Math.sin(a) * H * 0.2 };
}

function kdStep(t) {
    if (!kermisDuckOpen) return;
    const dt = Math.min(0.05, (t - (kd.last || t)) / 1000);
    kd.last = t;
    kd.ducks.forEach(d => {
        if (d.out) return;
        d.a += dt * 0.35;
        const p = kdPos(d.a);
        // Ducks in front are a bit bigger; facing the way they swim
        const z = 0.85 + (Math.sin(d.a) + 1) * 0.15;
        const face = Math.sin(d.a) > 0 ? -1 : 1;
        d.node.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${z})`;
        d.node.style.zIndex = Math.round(10 + Math.sin(d.a) * 5);
        d.node.querySelector('.front').style.transform = `scaleX(${face})`;
    });
    kd.raf = requestAnimationFrame(kdStep);
}

function kdFish(d) {
    if (kd.busy || d.out) return;
    kd.busy = true;
    d.out = true;
    const s = kdStage.getBoundingClientRect();
    const r = d.node.getBoundingClientRect();
    const x = r.left + r.width / 2 - s.left;
    const y = r.top - s.top;
    // The line comes down onto the duck...
    kdLine.style.left = x + 'px';
    kdLine.style.transition = 'height 0.5s ease-in';
    kdLine.style.height = Math.max(0, y + 10) + 'px';
    playFreqSweep(1200, 500, 0.5, 0.08);
    setTimeout(() => {
        // ...and pulls it up out of the water
        playFreqSweep(500, 1300, 0.5, 0.1);
        kdLine.style.transition = 'height 0.6s ease-out';
        kdLine.style.height = (s.height * 0.12) + 'px';
        d.node.style.transition = 'transform 0.6s ease-out';
        d.node.style.transform = `translate(${x}px, ${s.height * 0.12 + 40}px) translate(-50%, -50%) scale(1.5)`;
        d.node.style.zIndex = 30;
    }, 550);
    setTimeout(() => {
        // Turn it over: what's underneath?
        const big = Math.random() < 0.25;
        const prize = randomPick(big ? KERMIS_BIG : KERMIS_SMALL);
        d.node.querySelector('.back').textContent = prize;
        d.node.classList.add('flipped');
        if (big) { kermisTune(); ovCheer(kdEl, d.node, ['⭐', '🎉', '✨']); } else playSparkleSound();
        setTimeout(() => kermisWin(prize, kdEl, d.node.querySelector('.back'), 'kdTray'), 700);
    }, 1250);
    setTimeout(() => {
        // Back in the water
        kdLine.style.height = '0px';
        d.node.classList.remove('flipped');
        d.node.style.transition = 'transform 0.5s ease-in';
        const p = kdPos(d.a);
        d.node.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
        playFreqSweep(700, 300, 0.25, 0.1);
        setTimeout(() => { d.node.style.transition = ''; d.out = false; kd.busy = false; }, 500);
    }, 2900);
}

function openKermisDucks() {
    kermisDuckOpen = true;
    kdEl.classList.add('open');
    kdBuild();
    kd.busy = false;
    kdLine.style.height = '0px';
    renderKermisTrays();
    kd.last = 0;
    cancelAnimationFrame(kd.raf);
    kd.raf = requestAnimationFrame(kdStep);
    kermisTune();
}
function closeKermisDucks() {
    kermisDuckOpen = false;
    cancelAnimationFrame(kd.raf);
    kdEl.classList.remove('open');
    renderKermisTrays();
    _playWhoosh();
}
document.getElementById('kermisDuckClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeKermisDucks(); });
kdEl.addEventListener('pointerdown', (e) => e.stopPropagation());

/* ─────────── Grijpmachine (overlay) ─────────── */
const kcEl = document.getElementById('kermisClawOv');
const kcGlass = document.getElementById('kcGlass');
const kcClaw = document.getElementById('kcClaw');
let kermisClawOpen = false;
// Claw x in % of the glass; plush: { node, x (%), e }
const kc = { x: 50, busy: false, plush: [], won: null };

function kcFill() {
    kcGlass.querySelectorAll('.kc-plush').forEach(p => p.remove());
    kc.plush = [];
    for (let i = 0; i < 7; i++) kcAddPlush(24 + i * 11 + (Math.random() - 0.5) * 4);
}
function kcAddPlush(x) {
    const e = randomPick(KERMIS_PLUSH);
    const node = el(`<span class="kc-plush" style="left:${x}%;rotate:${(Math.random() - 0.5) * 40}deg">${e}</span>`);
    kcGlass.appendChild(node);
    kc.plush.push({ node, x, e });
}

function kcMove(x) {
    kc.x = Math.max(22, Math.min(92, x));
    kcClaw.style.left = kc.x + '%';
    playFreqSweep(300, 360, 0.25, 0.06);
}

kcGlass.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (kc.busy) return;
    const r = kcGlass.getBoundingClientRect();
    kcMove((e.clientX - r.left) / r.width * 100);
});

function kcGrab() {
    if (kc.won) {
        // First take your cuddly toy out of the tray
        bounceEl(document.getElementById('kcBakje'), 'jump');
        document.getElementById('kcHint').textContent = 'Haal eerst je knuffel uit het bakje! 👇';
        return;
    }
    if (kc.busy) return;
    kc.busy = true;
    const btn = document.getElementById('kcGrab');
    bounceEl(btn, 'jump');
    // Toddler-friendly: anything close enough under the claw gets caught
    const near = kc.plush.filter(p => Math.abs(p.x - kc.x) < 9).sort((a, b) => Math.abs(a.x - kc.x) - Math.abs(b.x - kc.x))[0];
    kcClaw.classList.add('down');
    playFreqSweep(700, 300, 0.8, 0.07);
    setTimeout(() => {
        kcClaw.classList.add('closed');
        playTone(200, 0.1, 0.12, 'square');
        if (near) {
            near.node.remove();
            kcClaw.querySelector('.held').textContent = near.e;
            kc.plush.splice(kc.plush.indexOf(near), 1);
        }
        kcClaw.classList.remove('down');
        playFreqSweep(300, 700, 0.8, 0.07);
    }, 900);
    setTimeout(() => {
        if (!near) {
            // Nothing: open again and try once more
            kcClaw.classList.remove('closed');
            const h = document.getElementById('kcHint');
            h.textContent = 'Bijna! Zet de grijper boven een knuffel 👆';
            bounceEl(h, 'pulse');
            kc.busy = false;
            return;
        }
        // Carry it to the chute on the left and drop it
        kcClaw.style.left = '8%';
        setTimeout(() => {
            kcClaw.classList.remove('closed');
            kcClaw.querySelector('.held').textContent = '';
            const chute = document.getElementById('kcChute');
            const drop = el(`<span class="kc-drop">${near.e}</span>`);
            chute.appendChild(drop);
            playFreqSweep(900, 200, 0.4, 0.1);
            setTimeout(() => {
                // Out of the chute into the tray at the bottom: tap it to take it out
                const bakje = document.getElementById('kcBakje');
                ovFly(kcEl, drop, bakje, near.e, 350).then(() => {
                    drop.remove();
                    bakje.innerHTML = `<button class="kc-won">${near.e}</button><div class="tap-hint">👇</div>`;
                    bakje.querySelector('.kc-won').addEventListener('pointerdown', (e) => { e.stopPropagation(); kcTakeOut(); });
                    kc.won = near.e;
                    kermisTune();
                    ovCheer(kcEl, bakje, ['💖', '✨', '🎉']);
                    document.getElementById('kcHint').textContent = 'Gewonnen! Haal je knuffel uit het bakje 👇';
                });
                kcMove(50);
                kcAddPlush(24 + Math.random() * 66);
                kc.busy = false;
            }, 500);
        }, 900);
    }, 1900);
}
// Take the toy out of the tray: it goes home into the cuddly toy basket in the bedroom
function kcTakeOut() {
    const e = kc.won;
    if (!e) return;
    kc.won = null;
    const bakje = document.getElementById('kcBakje');
    const btn = bakje.querySelector('.kc-won');
    knuffels.push(e);
    if (knuffels.length > 30) knuffels = knuffels.slice(-30);
    try { localStorage.setItem(KNUFFEL_KEY, JSON.stringify(knuffels)); } catch (err) {}
    playCorrect();
    const mand = document.getElementById('kcMand');
    ovFly(kcEl, btn, mand, e, 700).then(() => {
        renderKermisTrays();
        renderPlushBasket();
        bounceEl(mand, 'jump');
        showToast(`${e} gaat mee naar huis, in je knuffelmand! 🧺`, 2000);
        document.getElementById('kcHint').textContent = 'Nog een keer? 🧸';
    });
    bakje.innerHTML = '';
}

document.getElementById('kcGrab').addEventListener('pointerdown', (e) => { e.stopPropagation(); kcGrab(); });

function openKermisClaw() {
    kermisClawOpen = true;
    kcEl.classList.add('open');
    kc.busy = false;
    kcClaw.className = 'kc-claw';
    document.getElementById('kcBakje').innerHTML = '';
    kcClaw.querySelector('.held').textContent = '';
    kcFill();
    kcMove(50);
    document.getElementById('kcHint').textContent = 'Tik in de kast om de grijper te verplaatsen, dan Pak!';
    renderKermisTrays();
    kermisTune();
}
function closeKermisClaw() {
    kermisClawOpen = false;
    if (kc.won) {
        // Forgot it in the tray: it comes home anyway
        knuffels.push(kc.won);
        try { localStorage.setItem(KNUFFEL_KEY, JSON.stringify(knuffels)); } catch (err) {}
        kc.won = null;
        renderPlushBasket();
    }
    kcEl.classList.remove('open');
    renderKermisTrays();
    _playWhoosh();
}
document.getElementById('kermisClawClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeKermisClaw(); });
kcEl.addEventListener('pointerdown', (e) => e.stopPropagation());
