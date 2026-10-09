/* ─────────── Stickerboek ───────────
   Elke kamer (binnen, buiten, onder water) heeft een sticker. Je verdient hem door
   de hoofdactiviteit te doen (een ding met 👇) of met een paar verschillende dingen
   in die kamer te spelen. Het boek heeft een bladzijde per verdieping/gebied. */
const STICKER_KEY = 'noor-prinses-stickers';
const STICKER_TAPS = 3;           // distinct objects needed when no main activity is used
const stickerOv = document.getElementById('stickOv');
const stickerBtn = document.getElementById('stickBtn');
let stickOpen = false;
let stickPage = 0;
let stickers = new Set();
const stickFresh = new Set();     // earned since the book was last opened
const stickObjs = {};             // room key -> number of tappable objects
const stickTapped = {};           // room key -> Set of tapped objects

try {
    const saved = JSON.parse(localStorage.getItem(STICKER_KEY));
    if (Array.isArray(saved)) stickers = new Set(saved.filter(k => typeof k === 'string'));
} catch (e) {}

function saveStickers() {
    try { localStorage.setItem(STICKER_KEY, JSON.stringify([...stickers])); } catch (e) {}
}

// Book pages: the floors from top to bottom, then buiten, onder water, het dorp, de dierentuin and de wolken
function stickerPages() {
    return [
        ...WINGS.slice().reverse().map(w => ({ icon: w.icon, name: w.name, color: w.color, scene: SCENES[w.key] })),
        { icon: '🌳', name: 'Buiten', color: '#22c55e', scene: SCENES.out },
        { icon: '🧜‍♀️', name: 'Onder water', color: '#06b6d4', scene: SCENES.sea },
        { icon: VILLAGE.icon, name: VILLAGE.name, color: VILLAGE.color, scene: SCENES.dorp },
        { icon: ZOO.icon, name: ZOO.name, color: ZOO.color, scene: SCENES.dierentuin },
        { icon: SKY.icon, name: SKY.name, color: SKY.color, scene: SCENES.wolken }
    ];
}

function stickerCount() {
    return Object.keys(ROOM_AT).filter(k => stickers.has(k)).length;
}

function updateStickerBtn() {
    stickerBtn.querySelector('.stick-count').textContent = stickerCount();
    updateBookStand();
}

// Called by addObj while a scene is being built: the room is where the princess walks to
function registerStickerObj(node, walkX) {
    if (node.matches('.lift, .castle-door, .koets')) return;
    const room = ROOMS[Math.max(0, Math.min(ROOMS.length - 1, Math.floor(walkX / ROOM_W)))];
    node.dataset.room = room.key;
    stickObjs[room.key] = (stickObjs[room.key] || 0) + 1;
}

// Called when an object is tapped
function stickerTap(node) {
    const key = node.dataset.room;
    if (!key || stickers.has(key)) return;
    const set = stickTapped[key] || (stickTapped[key] = new Set());
    set.add(node);
    const main = !!node.querySelector('.tap-hint');
    if (main || set.size >= Math.min(STICKER_TAPS, stickObjs[key])) earnSticker(key, node);
}

function earnSticker(key, fromNode) {
    if (stickers.has(key) || !ROOM_AT[key]) return;
    stickers.add(key);
    stickFresh.add(key);
    saveStickers();
    const room = ROOM_AT[key].scene.rooms[ROOM_AT[key].idx];

    // Sticker flies from the object to the book button
    const pf = playfield.getBoundingClientRect();
    const from = fromNode ? fromNode.getBoundingClientRect() : princessEl().getBoundingClientRect();
    const to = stickerBtn.getBoundingClientRect();
    const fly = el(`<div class="sticker-fly">${room.icon}</div>`);
    fly.style.left = (from.left + from.width / 2 - pf.left - 40) + 'px';
    fly.style.top = (from.top + from.height / 3 - pf.top - 40) + 'px';
    playfield.appendChild(fly);
    requestAnimationFrame(() => requestAnimationFrame(() => fly.classList.add('pop')));
    setTimeout(() => {
        fly.classList.add('go');
        fly.style.left = (to.left + to.width / 2 - pf.left - 40) + 'px';
        fly.style.top = (to.top + to.height / 2 - pf.top - 40) + 'px';
    }, 700);
    setTimeout(() => {
        fly.remove();
        updateStickerBtn();
        stickerBtn.classList.remove('bump');
        void stickerBtn.offsetWidth;
        stickerBtn.classList.add('bump');
        playTone(1568, 0.15, 0.1, 'sine');
        setTimeout(() => playTone(2093, 0.25, 0.1, 'sine'), 110);
    }, 1450);
    [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.1, 'triangle'), i * 90));

    // A full page (or the whole book) gets its own party
    const page = stickerPages().find(p => p.scene === ROOM_AT[key].scene);
    const all = stickerCount() === Object.keys(ROOM_AT).length;
    const pageFull = page.scene.rooms.every(r => stickers.has(r.key));
    setTimeout(() => {
        if (all) {
            showToast('📒 Alle stickers! Ruil je boek in voor een trofee! 🏆', 3500);
            playWin();
            spellRain(['⭐', '💖', '👑', '✨']);
        } else if (pageFull) {
            showToast(`📒 Bladzijde vol! ${page.icon} 🎉`, 2600);
            playWin();
            sparkleShower(state.x, 80, 60);
        } else {
            showToast(`${room.icon} Sticker!`, 1500);
        }
    }, 1500);
}

function stickerSlot(room, color, i) {
    const has = stickers.has(room.key);
    const rot = ((i * 37) % 13) - 6;
    return `<button class="sticker${has ? '' : ' empty'}${stickFresh.has(room.key) ? ' fresh' : ''}" data-k="${room.key}" style="--c:${color};--r:${rot}deg">
        <span class="st-icon">${room.icon}</span><small>${room.name}</small></button>`;
}

function renderStickerPage() {
    const pages = stickerPages();
    const page = pages[stickPage];
    const got = page.scene.rooms.filter(r => stickers.has(r.key)).length;
    const full = got === page.scene.rooms.length;
    document.getElementById('stickPage').style.setProperty('--c', page.color);
    document.getElementById('stickHead').innerHTML = `<span class="sh-icon">${page.icon}</span> ${page.name}
        <span class="sh-count">${full ? '👑' : '⭐'} ${got} / ${page.scene.rooms.length}</span>`;
    const grid = document.getElementById('stickGrid');
    grid.innerHTML = page.scene.rooms.map((r, i) => stickerSlot(r, page.color, i)).join('');
    grid.classList.toggle('full', full);
    grid.querySelectorAll('.sticker').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        b.classList.remove('wiggle');
        void b.offsetWidth;
        b.classList.add('wiggle');
        if (b.classList.contains('empty')) playFreqSweep(500, 350, 0.15, 0.1);
        else playSparkleSound();
    }));
    document.getElementById('stickTabs').innerHTML = pages.map((p, i) => {
        const done = p.scene.rooms.every(r => stickers.has(r.key));
        return `<button class="stick-tab${i === stickPage ? ' on' : ''}${done ? ' done' : ''}" data-i="${i}" style="--c:${p.color}">${p.icon}</button>`;
    }).join('');
    document.querySelectorAll('.stick-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        turnStickerPage(+b.dataset.i);
    }));
    document.getElementById('stickTotal').textContent = `${stickerCount()} / ${Object.keys(ROOM_AT).length}` + (trophies ? `  🏆 ${trophies}` : '');
    // Whole book full: trade it in for a trophy
    document.getElementById('stickTrade').classList.toggle('show', stickerCount() === Object.keys(ROOM_AT).length);
}

function turnStickerPage(i) {
    const n = stickerPages().length;
    const next = (i + n) % n;
    if (next === stickPage) return;
    const book = document.getElementById('stickPage');
    book.classList.remove('turn-l', 'turn-r');
    void book.offsetWidth;
    book.classList.add(next > stickPage ? 'turn-r' : 'turn-l');
    stickPage = next;
    playFreqSweep(900, 1300, 0.12, 0.08);
    renderStickerPage();
}

function openStickers() {
    if (state.busy || overlayOpen()) return;
    stickOpen = true;
    // Open on the page of the floor/area the princess is in
    stickPage = Math.max(0, stickerPages().findIndex(p => p.scene === scene));
    renderStickerPage();
    stickerOv.classList.add('open');
    playPop();
}

function closeStickers() {
    stickOpen = false;
    stickFresh.clear();
    stickerOv.classList.remove('open');
}

stickerBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    openStickers();
});
document.getElementById('stickClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeStickers();
});
document.getElementById('stickTrade').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    tradeStickers();
});
document.getElementById('stickPrev').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    turnStickerPage(stickPage - 1);
});
document.getElementById('stickNext').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    turnStickerPage(stickPage + 1);
});
stickerOv.addEventListener('pointerdown', (e) => e.stopPropagation());
