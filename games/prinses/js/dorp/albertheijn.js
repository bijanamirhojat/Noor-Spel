/* 🛒 Albert Heijn: eerst een mandje pakken, dan zelf spulletjes uit de schappen in het mandje doen
   (tik iets in het mandje aan om het terug te leggen). Bij de kassa piept alles over de band en staat
   op het schermpje hoeveel muntjes het kost. Zelf het goede aantal muntjes op het schaaltje leggen
   en betalen; te weinig of te veel en de caissière zegt het. Dan het bonnetje aantikken en alles gaat
   in de tas mee naar huis. Aantal keer boodschappen gedaan in noor-prinses-ah. */
defineRoom({
    key: 'albertheijn',
    name: 'Albert Heijn',
    icon: '🛒',
    say: 'De Albert Heijn',
    build(s0) {
        addObj(`<div class="ah-store">
            <div class="ah-band">Albert Heijn</div>
            <div class="ah-glass">
                <div class="ah-shelf-peek"><span>🍞🥛🧀</span><span>🍎🍌🥒</span></div>
                <div class="ah-doors"><i class="l"></i><i class="r"></i></div>
            </div>
            <div class="tap-hint" style="left:300px;top:-50px">👇</div>
        </div>`, s0 + 80, 110, s0 + 380, (node) => {
            node.classList.add('open');
            playFreqSweep(500, 900, 0.25, 0.06);
            setTimeout(() => { node.classList.remove('open'); openAH(); }, 450);
        });
        addObj('<div class="emoji-obj ah-cart">🛒</div>', s0 + 640, 330, s0 + 660, (node) => {
            if (node.classList.contains('roll')) return;
            zooAnim(node, 'roll');
            for (let t = 0; t < 900; t += 150) setTimeout(() => playTone(300 + Math.random() * 60, 0.05, 0.05, 'square'), t);
            setTimeout(() => node.classList.remove('roll'), 1600);
        });
    }
});

/* ─────────── Albert Heijn-overlay ─────────── */
const AH_KEY = 'noor-prinses-ah';
const AH_GOODS = [
    { e: '🍞', p: 2 }, { e: '🥛', p: 1 }, { e: '🧀', p: 3 }, { e: '🥚', p: 2 },
    { e: '🍎', p: 1 }, { e: '🍌', p: 1 }, { e: '🥒', p: 1 }, { e: '🍅', p: 1 },
    { e: '🍫', p: 2 }, { e: '🍪', p: 2 }, { e: '🧃', p: 1 }, { e: '🍝', p: 2 }
];
const AH_MAX = 10;
const AH_CASHIERS = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🐷', '🐨'];
const ahOv = document.getElementById('ahOv');
const ah = { phase: 'basket', items: [], total: 0, dish: 0, busy: false, round: 0, done: 0 };
let ahOpen = false;
registerOverlay(() => ahOpen, closeAH);
try { ah.done = +localStorage.getItem(AH_KEY) || 0; } catch { /* geen opslag */ }

const ahSum = () => ah.items.reduce((s, g) => s + g.p, 0);
const ahCoins = (n) => '<i class="ah-c">🪙</i>'.repeat(n);

function ahStart() {
    ah.round++;
    Object.assign(ah, { phase: 'basket', items: [], total: 0, dish: 0, busy: false });
    ahOv.className = 'ahov open';
    document.getElementById('ahCashier').textContent = randomPick(AH_CASHIERS);
    document.getElementById('ahBelt').innerHTML = '';
    document.getElementById('ahTasItems').innerHTML = '';
    document.getElementById('ahAgain').classList.remove('show');
    ahRenderShelves();
    ahRenderBasket();
    ahRenderScreen();
    speak('Pak eerst een mandje!');
}

function ahRenderShelves() {
    const rows = [0, 4, 8].map(i => AH_GOODS.slice(i, i + 4));
    document.getElementById('ahShelves').innerHTML = rows.map((row, r) => `<div class="ah-row">${row.map((g, k) =>
        `<button class="ah-good" data-i="${r * 4 + k}"><span class="ah-e">${g.e}</span><span class="ah-price">${ahCoins(g.p)}</span></button>`).join('')}</div>`).join('');
    document.querySelectorAll('.ah-good').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        ahPick(b, AH_GOODS[+b.dataset.i]);
    }));
}

function ahRenderBasket() {
    document.getElementById('ahBItems').innerHTML = ah.items.map((g, i) => `<span data-i="${i}">${g.e}</span>`).join('');
    document.getElementById('ahGo').classList.toggle('show', ah.phase === 'shop' && ah.items.length > 0);
}

function ahRenderScreen() {
    document.getElementById('ahTotal').textContent = ah.total;
    document.getElementById('ahDots').innerHTML = ahCoins(ah.total);
    document.getElementById('ahDishN').textContent = ah.dish || '';
    document.getElementById('ahDishCoins').innerHTML = Array.from({ length: ah.dish }, () => '<button class="ah-dcoin">🪙</button>').join('');
}

function ahTakeBasket() {
    if (ah.phase !== 'basket') return;
    ah.phase = 'shop';
    ahOv.classList.add('has-basket');
    playPop();
    bounceEl(document.getElementById('ahBasket'), 'jump');
    speak('Doe de boodschappen in je mandje.');
}

function ahNo(node, say) {
    bounceEl(node, 'nope');
    playTone(330, 0.12, 0.1, 'triangle');
    setTimeout(() => playTone(262, 0.18, 0.1, 'triangle'), 140);
    if (say) speak(say);
}

function ahPick(btn, good) {
    if (ah.phase === 'basket') {
        bounceEl(document.getElementById('ahStack'), 'jump');
        ahNo(btn, 'Pak eerst een mandje!');
        return;
    }
    if (ah.phase !== 'shop' || ah.busy) return;
    if (ahSum() + good.p > AH_MAX || ah.items.length >= 8) {
        ahNo(btn, 'Je mandje is vol! Ga maar naar de kassa.');
        bounceEl(document.getElementById('ahGo'), 'pulse');
        return;
    }
    ah.items.push(good);
    playPop();
    const basket = document.getElementById('ahBasket');
    const round = ah.round;
    ovFly(ahOv, btn, basket, good.e, 500).then(() => {
        if (round !== ah.round) return;
        ahRenderBasket();
        bounceEl(basket, 'jump');
        playTone(600 + ah.items.length * 70, 0.12, 0.1, 'sine');
    });
    document.getElementById('ahGo').classList.add('show');
}

// Put something back: tap it in the basket
function ahPutBack(i) {
    if (ah.phase !== 'shop' || ah.busy || !ah.items[i]) return;
    ah.items.splice(i, 1);
    playFreqSweep(800, 400, 0.12, 0.08);
    ahRenderBasket();
}

// To the till: everything goes over the belt and beeps; the screen counts up
function ahToTill() {
    if (ah.phase !== 'shop' || !ah.items.length || ah.busy) return;
    ah.phase = 'kassa';
    ah.busy = true;
    ahOv.classList.add('checkout');
    ahRenderBasket();
    playCorrect();
    const round = ah.round;
    const belt = document.getElementById('ahBelt');
    const basket = document.getElementById('ahBasket');
    const scanner = document.getElementById('ahScanner');
    setTimeout(() => ah.items.forEach((g, i) => setTimeout(() => {
        if (round !== ah.round || !ahOpen) return;
        basket.querySelector('.ah-binside span')?.remove();
        ovFly(ahOv, basket, scanner, g.e, 450).then(() => {
            if (round !== ah.round || !ahOpen) return;
            belt.insertAdjacentHTML('beforeend', `<span>${g.e}</span>`);
            ah.total += g.p;
            ahRenderScreen();
            bounceEl(document.getElementById('ahScreen'), 'pulse');
            playTone(1760, 0.09, 0.08, 'square');
            if (i === ah.items.length - 1) setTimeout(() => round === ah.round && ahStartPay(), 500);
        });
    }, i * 650)), 600);
}

function ahStartPay() {
    ah.phase = 'pay';
    ah.busy = false;
    ahOv.classList.add('paying');
    const purse = document.getElementById('ahPurse');
    purse.innerHTML = Array.from({ length: AH_MAX + 2 }, () => '<button class="ah-pcoin">🪙</button>').join('');
    purse.querySelectorAll('.ah-pcoin').forEach(c => c.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        ahGiveCoin(c);
    }));
    speak(`Dat is ${ah.total} ${ah.total === 1 ? 'muntje' : 'muntjes'}. Leg het goede aantal muntjes op het schaaltje.`);
}

function ahGiveCoin(coin) {
    if (ah.phase !== 'pay' || ah.busy || coin.classList.contains('used')) return;
    coin.classList.add('used');
    ah.dish++;
    const n = ah.dish;
    ovFly(ahOv, coin, document.getElementById('ahDish'), '🪙', 350).then(() => {
        ahRenderScreen();
        playTone(COUNT_NOTES[(n - 1) % COUNT_NOTES.length], 0.2, 0.1, 'triangle');
    });
}

// Tap a coin on the dish to take it back into the purse
function ahTakeCoin() {
    if (ah.phase !== 'pay' || ah.busy || !ah.dish) return;
    ah.dish--;
    const used = [...document.querySelectorAll('.ah-pcoin.used')].pop();
    if (used) used.classList.remove('used');
    playFreqSweep(900, 500, 0.1, 0.08);
    ahRenderScreen();
}

function ahPay() {
    if (ah.phase !== 'pay' || ah.busy) return;
    const cashier = document.getElementById('ahCashier');
    if (ah.dish !== ah.total) {
        ahNo(document.getElementById('ahDish'), ah.dish < ah.total
            ? `Dat is nog niet genoeg. Het is ${ah.total}, er moeten er nog meer bij!`
            : `Oei, dat is te veel! Het is maar ${ah.total}. Haal er een paar terug.`);
        bounceEl(cashier, 'nope');
        bounceEl(document.getElementById('ahScreen'), 'pulse');
        return;
    }
    ah.busy = true;
    const round = ah.round;
    ovFly(ahOv, document.getElementById('ahDish'), cashier, '🪙', 450).then(() => {
        if (round !== ah.round || !ahOpen) return;
        ah.dish = 0;
        ahRenderScreen();
        bounceEl(cashier, 'jump');
        ovCheer(ahOv, cashier);
        playCorrect();
        speak('Goed zo! Tik op het bonnetje.');
        ah.phase = 'bon';
        ah.busy = false;
        ahOv.classList.remove('paying');
        ahOv.classList.add('printing');
        for (let i = 0; i < 8; i++) setTimeout(() => playTone(2200 + (i % 2) * 300, 0.04, 0.04, 'square'), i * 90);
    });
}

// Tap the receipt: everything goes in the bag, off you go
function ahTakeAll() {
    if (ah.phase !== 'bon') return;
    ah.phase = 'done';
    ah.done++;
    try { localStorage.setItem(AH_KEY, ah.done); } catch { /* geen opslag */ }
    ahOv.classList.remove('printing');
    ahOv.classList.add('bagging');
    const round = ah.round;
    const belt = document.getElementById('ahBelt');
    const tas = document.getElementById('ahTas');
    [...belt.children].forEach((s, i) => setTimeout(() => {
        if (round !== ah.round || !ahOpen) return;
        ovFly(ahOv, s, tas, s.textContent, 450).then(() => {
            document.getElementById('ahTasItems').insertAdjacentHTML('beforeend', `<span>${s.textContent}</span>`);
            bounceEl(tas, 'jump');
            playTone(700 + i * 60, 0.1, 0.08, 'sine');
        });
        s.style.visibility = 'hidden';
    }, 300 + i * 220));
    setTimeout(() => {
        if (round !== ah.round || !ahOpen) return;
        playWin();
        ovCheer(ahOv, tas);
        speak('Alles mee naar huis!');
        document.getElementById('ahAgain').classList.add('show');
    }, 800 + belt.children.length * 220);
}

function openAH() {
    ahOpen = true;
    ahStart();
    playMusicBox();
}

function closeAH() {
    ahOpen = false;
    ah.round++;
    ahOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('ahStack').addEventListener('pointerdown', (e) => { e.stopPropagation(); ahTakeBasket(); });
document.getElementById('ahBItems').addEventListener('pointerdown', (e) => {
    const s = e.target.closest('span[data-i]');
    if (s) { e.stopPropagation(); ahPutBack(+s.dataset.i); }
});
document.getElementById('ahGo').addEventListener('pointerdown', (e) => { e.stopPropagation(); ahToTill(); });
document.getElementById('ahDish').addEventListener('pointerdown', (e) => {
    if (e.target.closest('.ah-dcoin')) { e.stopPropagation(); ahTakeCoin(); }
});
document.getElementById('ahPay').addEventListener('pointerdown', (e) => { e.stopPropagation(); ahPay(); });
document.getElementById('ahBon').addEventListener('pointerdown', (e) => { e.stopPropagation(); ahTakeAll(); });
document.getElementById('ahAgainBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); playPop(); ahStart(); });
document.getElementById('ahClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeAH(); });
ahOv.addEventListener('pointerdown', (e) => e.stopPropagation());
