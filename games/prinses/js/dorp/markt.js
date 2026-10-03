/* 🍎 Markt: boodschappen doen met een lijstje en betalen met muntjes */
defineRoom({
    key: 'markt',
    name: 'Markt',
    icon: '🍎',
    say: 'De markt',
    build(m0) {
        villageHouse(m0 + 20, 200, 320, '#fed7aa', '#b91c1c', { flowers: true });
        villageHouse(m0 + 580, 200, 300, '#d9f99d', '#7c3aed');
        addObj(`<div class="stall">
            <div class="st-awning"></div>
            <div class="st-pole l"></div><div class="st-pole r"></div>
            <span class="st-seller">🐻</span>
            <div class="st-counter"><span>🍎🍌🍓</span><span>🥕🥦🍇</span></div>
            <div class="tap-hint" style="left:150px;top:-40px">👇</div>
        </div>`, m0 + 240, 150, m0 + 400, openMarket);
        addObj('<div class="emoji-obj crate">🍉</div>', m0 + 110, 360, m0 + 150, (node) => { bounceEl(node, 'wobble'); playTone(160, 0.15, 0.2, 'triangle'); });
        addObj('<div class="emoji-obj hen">🐔</div>', m0 + 640, 360, m0 + 620, (node) => {
            bounceEl(node, 'wobble');
            [0, 140, 280].forEach((t, i) => setTimeout(() => playFreqSweep(900 - i * 80, 700, 0.08, 0.12), t));
        });
        addObj('<div class="emoji-obj">💐</div>', m0 + 30, 370, m0 + 70, flowerPop);
    }
});

/* ─────────── Markt-overlay ─────────── */
const MK_GOODS = [
    { e: '🍎', p: 1 }, { e: '🍌', p: 1 }, { e: '🥕', p: 1 }, { e: '🥚', p: 1 }, { e: '🍐', p: 1 },
    { e: '🍓', p: 2 }, { e: '🍇', p: 2 }, { e: '🥦', p: 2 }, { e: '🧀', p: 3 }, { e: '🍉', p: 3 }
];
const MK_SELLERS = ['🐻', '🐷', '🐮', '🦊', '🐰'];
const marketOv = document.getElementById('marketOv');
const mk = { list: [], phase: 'shop', paid: 0, total: 0, rounds: 0, busy: false };
let marketOpen = false;

function newShoppingList() {
    // Small lists first: two things, later up to three with doubles. Never more than 8 coins.
    const kinds = mk.rounds === 0 ? 2 : 2 + Math.floor(Math.random() * 2);
    let list;
    do {
        list = shuffle(MK_GOODS.slice()).slice(0, kinds).map(g => ({ ...g, need: mk.rounds > 0 && g.p === 1 && Math.random() < 0.5 ? 2 : 1, got: 0 }));
    } while (list.reduce((s, g) => s + g.p * g.need, 0) > 8);
    mk.list = list;
    mk.total = list.reduce((s, g) => s + g.p * g.need, 0);
    mk.paid = 0;
    mk.phase = 'shop';
    document.getElementById('mkSeller').textContent = randomPick(MK_SELLERS);
    document.getElementById('mkBasket').innerHTML = '';
    document.getElementById('mkAgain').classList.remove('show');
    marketOv.classList.remove('paying', 'done');
    renderMarket();
}

function coinsHTML(n) { return '<span class="mk-coin">🪙</span>'.repeat(n); }

function renderMarket() {
    document.getElementById('mkList').innerHTML = `<div class="mk-list-title">📝</div>` + mk.list.map(g =>
        `<div class="mk-line${g.got >= g.need ? ' ok' : ''}">${Array.from({ length: g.need }, (_, i) => `<span class="${i < g.got ? 'have' : ''}">${g.e}</span>`).join('')}</div>`).join('');
}

function renderGoods() {
    document.getElementById('mkGoods').innerHTML = MK_GOODS.map((g, i) =>
        `<button class="mk-good" data-i="${i}"><span class="mk-e">${g.e}</span><span class="mk-price">${coinsHTML(g.p)}</span></button>`).join('');
    document.querySelectorAll('.mk-good').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickGood(b, MK_GOODS[+b.dataset.i]);
    }));
}

function pickGood(btn, good) {
    if (mk.phase !== 'shop' || mk.busy) return;
    const line = mk.list.find(g => g.e === good.e && g.got < g.need);
    if (!line) {
        // Not on the list (or already enough): a gentle "no"
        bounceEl(btn, 'nope');
        playTone(330, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(262, 0.18, 0.1, 'triangle'), 140);
        bounceEl(document.getElementById('mkList'), 'pulse');
        return;
    }
    line.got++;
    playPop();
    const basket = document.getElementById('mkBasket');
    ovFly(marketOv, btn, basket, good.e, 550).then(() => {
        basket.insertAdjacentHTML('beforeend', `<span>${good.e}</span>`);
        bounceEl(basket, 'jump');
        playTone(660 + 100 * mk.list.reduce((s, g) => s + g.got, 0), 0.15, 0.1, 'sine');
    });
    renderMarket();
    if (mk.list.every(g => g.got >= g.need)) {
        mk.busy = true;
        setTimeout(() => { mk.busy = false; startPaying(); }, 800);
    }
}

function startPaying() {
    mk.phase = 'pay';
    marketOv.classList.add('paying');
    playCorrect();
    document.getElementById('mkSlots').innerHTML = Array.from({ length: mk.total }, (_, i) => `<div class="mk-slot" data-i="${i}">${i + 1}</div>`).join('');
    document.getElementById('mkCount').textContent = '';
    const purse = document.getElementById('mkPurse');
    purse.innerHTML = Array.from({ length: mk.total + 2 }, () => '<button class="mk-pcoin">🪙</button>').join('');
    purse.querySelectorAll('.mk-pcoin').forEach(c => c.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        payCoin(c);
    }));
}

const COUNT_NOTES = [523, 587, 659, 698, 784, 880, 988, 1047];

function payCoin(coin) {
    if (mk.phase !== 'pay' || coin.classList.contains('used') || mk.paid >= mk.total) return;
    coin.classList.add('used');
    const slot = document.querySelector(`.mk-slot[data-i="${mk.paid}"]`);
    mk.paid++;
    const n = mk.paid;
    ovFly(marketOv, coin, slot, '🪙', 450).then(() => {
        slot.classList.add('paid');
        const count = document.getElementById('mkCount');
        count.textContent = n;
        bounceEl(count, 'jump');
        playTone(COUNT_NOTES[(n - 1) % COUNT_NOTES.length], 0.25, 0.12, 'triangle');
        playTone(2400, 0.05, 0.05, 'square');
        if (n === mk.total) marketPaid();
    });
}

function marketPaid() {
    mk.phase = 'done';
    mk.rounds++;
    marketOv.classList.add('done');
    const seller = document.getElementById('mkSeller');
    bounceEl(seller, 'jump');
    setTimeout(() => {
        playWin();
        ovCheer(marketOv, seller);
        document.getElementById('mkBasket').insertAdjacentHTML('afterbegin', '<span class="mk-bag">🛍️</span>');
        document.getElementById('mkAgain').classList.add('show');
    }, 350);
}

function openMarket() {
    marketOpen = true;
    marketOv.classList.add('open');
    renderGoods();
    newShoppingList();
    playMusicBox();
}

function closeMarket() {
    marketOpen = false;
    marketOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('mkAgainBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); playPop(); newShoppingList(); });
document.getElementById('mkClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeMarket(); });
marketOv.addEventListener('pointerdown', (e) => e.stopPropagation());
