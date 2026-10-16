/* 🧸 Troetelberenkamer: in elke andere kamer (binnen, buiten, onder water, dorp, dierentuin, wolken, ruimte)
   zit een troetelbeer verstopt. Hij gluurt achter een ding in die kamer vandaan (hideCareBears, vanuit main.js,
   als alles gebouwd is). Tik erop en hij gaat naar de troetelberenkamer, waar de planken zich langzaam vullen.
   Tik op een leeg plekje en je hoort in welke kamer die beer nog verstopt zit.
   Alle beren thuis? Met de 🙈-knop verstoppen ze zich weer (op dezelfde plekken).
   Gevonden beren staan in noor-prinses-troetelberen. */
const BEAR_KEY = 'noor-prinses-troetelberen';
const BEAR_COLS = 12;
const BEAR_W = 50;                // bear in the room: width / height
const BEAR_H = 58;
const BEAR_STYLES = [
    { c: '#f472b6', l: '#fce7f3', s: '💗' }, { c: '#facc15', l: '#fef9c3', s: '☀️' },
    { c: '#60a5fa', l: '#dbeafe', s: '🌙' }, { c: '#4ade80', l: '#dcfce7', s: '🍀' },
    { c: '#c084fc', l: '#f3e8ff', s: '🌈' }, { c: '#fb923c', l: '#ffedd5', s: '⭐' },
    { c: '#7dd3fc', l: '#f0f9ff', s: '☁️' }, { c: '#f87171', l: '#fee2e2', s: '🍓' },
    { c: '#2dd4bf', l: '#ccfbf1', s: '🌸' }, { c: '#a78bfa', l: '#ede9fe', s: '💫' }
];
// Rooms where the automatic hiding place is too well hidden: behind which object, on which side (l / r / t)
const BEAR_SPOTS = {
    ouderslaapkamer: { obj: 'big-bed', side: 't' }, hartjeskamer: { obj: 'heart-cushion', side: 't' },
    minigolf: { obj: 'gg-sticks', side: 't' }, kapsalon: { obj: 'salon-station', side: 'r' },
    kasteelhal: { obj: 'frame', side: 't' }, feestzaal: { obj: 'party-table', side: 'l' },
    kristalgrot: { obj: 'kg-geode', side: 'l' }, spookhuis: { obj: 'sp-cauldron', side: 'r' },
    zooingang: { obj: 'zi-gate', side: 'l' }, regenboogmakerij: { obj: 'rb-easel', side: 'r' },
    spiraal: { obj: 'sv-comet', side: 'l' }, balzaal: { obj: 'orchestra', side: 'r' },
    spiegelkamer: { obj: 'mirror', side: 'l' }, apenhuis: { obj: 'za-tree', side: 'l' }
};
let bearsFound = new Set();
const bearNodes = {};             // room key -> hidden bear in that room

try {
    const saved = JSON.parse(localStorage.getItem(BEAR_KEY));
    if (Array.isArray(saved)) bearsFound = new Set(saved.filter(k => typeof k === 'string'));
} catch (e) {}

function saveBears() {
    try { localStorage.setItem(BEAR_KEY, JSON.stringify([...bearsFound])); } catch (e) {}
}

// Every room but this one has a bear, in the order of the sticker book
function bearRooms() {
    return stickerPages().flatMap(p => p.scene.rooms).filter(r => r.key !== 'troetelberen');
}
function bearStyle(i) { return BEAR_STYLES[i % BEAR_STYLES.length]; }
function bearCount() { return bearRooms().filter(r => bearsFound.has(r.key)).length; }

function careBearSVG(st) {
    return `<svg viewBox="0 0 60 70" class="cb-svg">
        <circle cx="14" cy="11" r="8" fill="${st.c}"/><circle cx="46" cy="11" r="8" fill="${st.c}"/>
        <circle cx="14" cy="11" r="4" fill="${st.l}"/><circle cx="46" cy="11" r="4" fill="${st.l}"/>
        <ellipse cx="12" cy="47" rx="6" ry="9" fill="${st.c}" transform="rotate(20 12 47)"/>
        <ellipse cx="48" cy="47" rx="6" ry="9" fill="${st.c}" transform="rotate(-20 48 47)"/>
        <ellipse cx="20" cy="65" rx="8" ry="5" fill="${st.c}"/><ellipse cx="40" cy="65" rx="8" ry="5" fill="${st.c}"/>
        <ellipse cx="30" cy="51" rx="17" ry="16" fill="${st.c}"/>
        <ellipse cx="30" cy="52" rx="11" ry="10" fill="${st.l}"/>
        <text x="30" y="56.5" font-size="12" text-anchor="middle">${st.s}</text>
        <circle cx="30" cy="23" r="17" fill="${st.c}"/>
        <ellipse cx="30" cy="30" rx="8" ry="6" fill="${st.l}"/>
        <ellipse cx="30" cy="27" rx="3.5" ry="2.5" fill="#831843"/>
        <path d="M27 31 Q30 34 33 31" stroke="#831843" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <circle cx="23" cy="20" r="2.4" fill="#1f2937"/><circle cx="37" cy="20" r="2.4" fill="#1f2937"/>
        <circle cx="23.8" cy="19.2" r="0.8" fill="#fff"/><circle cx="37.8" cy="19.2" r="0.8" fill="#fff"/>
        <circle cx="18" cy="27" r="3" fill="#fda4af" opacity="0.7"/><circle cx="42" cy="27" r="3" fill="#fda4af" opacity="0.7"/>
    </svg>`;
}

function bearSlotPos(i) {
    return { x: 20 + (i % BEAR_COLS) * 54, y: 26 + Math.floor(i / BEAR_COLS) * 60 };
}

defineRoom({
    key: 'troetelberen',
    name: 'Troetelberenkamer',
    icon: '🧸',
    say: 'De troetelberenkamer!',
    lampX: 735,
    build(x) {
        const rooms = bearRooms();
        const rows = Math.ceil(rooms.length / BEAR_COLS);
        for (let r = 0; r < rows; r++) place(el(`<div class="cb-shelf" style="--r:${r}"></div>`), x + 14, bearSlotPos(r * BEAR_COLS).y + 54);
        rooms.forEach((room, i) => {
            const p = bearSlotPos(i);
            const slot = place(el(`<div class="cb-slot" data-k="${room.key}">${careBearSVG(bearStyle(i))}<b>?</b></div>`), x + p.x, p.y);
            slot.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (state.busy || overlayOpen()) return;
                bounceEl(slot, 'jump');
                if (bearsFound.has(room.key)) {
                    [1047, 1319, 1568].forEach((f, k) => setTimeout(() => playTone(f, 0.15, 0.08, 'sine'), k * 70));
                    sparkleShower(x + p.x + 25, p.y + 20, 10);
                    showToast(`${bearStyle(i).s} Gevonden in ${room.icon} ${room.name}`, 1800);
                } else {
                    playFreqSweep(500, 350, 0.15, 0.1);
                    showToast(`🧸 Nog verstopt in ${room.icon} ${room.name}`, 2200);
                }
            });
        });
        place(el('<div class="cb-count" id="cbCount"></div>'), x + 684, 120);
        addObj(`<div class="cb-big">${careBearSVG({ c: '#f9a8d4', l: '#fdf2f8', s: '💖' })}
            <div class="tap-hint" style="left:50%;top:-40px">👇</div></div>`, x + 690, 300, x + 700, (node) => {
            bounceEl(node, 'jump');
            [523, 659, 784, 1047].forEach((f, k) => setTimeout(() => playTone(f, 0.2, 0.08, 'triangle'), k * 90));
            const n = bearCount(), all = bearRooms().length;
            if (n === all) showToast('🧸 Alle troetelberen zijn thuis! 💖', 2600);
            else showToast(`🧸 ${n} / ${all} gevonden. Zoek in alle kamers!`, 2400);
        });
        addObj(`<div class="cb-hide" id="cbHide">🙈 Verstoppen!<div class="tap-hint" style="left:50%;top:-40px">👇</div></div>`,
            x + 684, 206, x + 700, hideBearsAgain);
        renderBearRoom();
    }
});

function renderBearRoom() {
    document.querySelectorAll('.cb-slot').forEach(s => s.classList.toggle('has', bearsFound.has(s.dataset.k)));
    const c = document.getElementById('cbCount');
    if (c) c.innerHTML = `🧸<br>${bearCount()} / ${bearRooms().length}`;
    const hide = document.getElementById('cbHide');
    if (hide) hide.classList.toggle('show', bearCount() === bearRooms().length);
}

// All bears home: they run off the shelves and hide again
function hideBearsAgain() {
    if (bearCount() < bearRooms().length) return;
    state.busy = true;
    const slots = [...document.querySelectorAll('.cb-slot.has')];
    slots.forEach((s, k) => {
        s.style.setProperty('--dx', (k % 2 ? 1 : -1) * (150 + (k * 37) % 300) + 'px');
        setTimeout(() => s.classList.add('away'), k * 18);
    });
    for (let k = 0; k < 8; k++) setTimeout(() => playFreqSweep(500 + k * 80, 1400 + k * 80, 0.12, 0.06), k * 170);
    showToast('🙈 De troetelberen gaan zich weer verstoppen! Zoek ze maar!', 3000);
    setTimeout(() => {
        bearsFound.clear();
        saveBears();
        slots.forEach(s => s.classList.remove('away'));
        renderBearRoom();
        hideCareBears();
        state.busy = false;
    }, slots.length * 18 + 1200);
}

/* ─────────── Verstoppen ─────────── */
function bearHash(s) {
    let h = 7;
    for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h;
}

// Places around an object where a bear can peek out from behind it
function bearPeeks(o, v) {
    const out = [];
    const y = Math.max(o.y, o.y + (o.h - BEAR_H) * 0.6);
    out.push({ x: o.x - BEAR_W * 0.55, y, side: 'l' });
    out.push({ x: o.x + o.w - BEAR_W * 0.45, y, side: 'r' });
    if (o.w > BEAR_W + 20) out.push({ x: o.x + o.w * 0.25 + ((v * 7) % 40), y: o.y - BEAR_H * 0.55, side: 't' });
    return out;
}

// All hiding places in a room (its scene must be displayed, to measure the objects)
function bearOptions(key, i) {
    const sc = ROOM_AT[key].scene;
    const rx = ROOM_AT[key].idx * ROOM_W;
    const pick = BEAR_SPOTS[key];
    return [...sc.el.querySelectorAll(':scope > .obj')]
        // Not behind an emoji: how big that is depends on the device's font
        .filter(n => n.dataset.room === key && !n.matches('.lift, .castle-door, .koets, .emoji-obj'))
        .map(n => ({ n, x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight }))
        .filter(o => o.w >= 50 && o.h >= 50 && o.w <= 520 && o.h <= 420)
        .flatMap(o => bearPeeks(o, i).map(p => ({ ...p, n: o.n })))
        .filter(p => p.x >= rx + 12 && p.x + BEAR_W <= rx + ROOM_W - 12 && p.y >= 8 && p.y + BEAR_H <= 470)
        .filter(p => !pick || (p.n.classList.contains(pick.obj) && p.side === pick.side));
}

// How much of a bear at p stays uncovered: by the object it hides behind and everything drawn over it
function bearPeekPart(sc, p) {
    const kids = [...sc.el.children];
    const covers = kids.slice(kids.indexOf(p.n))
        .filter(n => n === p.n || n.classList.contains('obj'))
        .map(n => ({ x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight }));
    let free = 0;
    for (let a = 1; a < 6; a++) for (let c = 1; c < 6; c++) {
        const px = p.x + BEAR_W * a / 6, py = p.y + BEAR_H * c / 6;
        if (!covers.some(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h)) free++;
    }
    return free / 25;
}

function hideCareBears() {
    const shown = scene;
    bearRooms().forEach((room, i) => {
        if (bearsFound.has(room.key)) return;
        const sc = ROOM_AT[room.key].scene;
        sc.el.style.display = '';
        const opts = bearOptions(room.key, i);
        // Start at a fixed place per room, but skip places where too little of the bear peeks out
        // (object sizes differ per device, e.g. emoji, so this is measured here)
        const h = bearHash(room.key);
        const ordered = opts.map((_, k) => opts[(h + k) % opts.length]);
        const spot = ordered.find(p => bearPeekPart(sc, p) >= 0.4) || ordered[0]
            || { x: ROOM_AT[room.key].idx * ROOM_W + 30 + h % 600, y: 400, side: 'l', n: null };
        if (sc !== shown) sc.el.style.display = 'none';
        const node = el(`<div class="cb-hidden peek-${spot.side}">${careBearSVG(bearStyle(i))}</div>`);
        node.style.position = 'absolute';
        node.style.left = Math.round(spot.x) + 'px';
        node.style.top = Math.round(spot.y) + 'px';
        node.style.animationDelay = -(h % 50) / 10 + 's';
        if (spot.n) sc.el.insertBefore(node, spot.n);
        else sc.el.appendChild(node);
        bearNodes[room.key] = node;
        node.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (state.busy || overlayOpen()) return;
            findCareBear(room, node, i);
        });
    });
}

function findCareBear(room, node, i) {
    if (bearsFound.has(room.key)) return;
    bearsFound.add(room.key);
    saveBears();
    renderBearRoom();
    delete bearNodes[room.key];
    const p = { x: parseFloat(node.style.left) + BEAR_W / 2, y: parseFloat(node.style.top) + BEAR_H / 2 };
    // Out from its hiding place, on top of everything, a little dance and up it goes
    node.parentNode.appendChild(node);
    node.style.animationDelay = '0s';
    node.classList.add('found');
    burst(p.x, p.y, 30);
    sparkleShower(p.x, p.y, 30);
    [659, 784, 988, 1319].forEach((f, k) => setTimeout(() => playTone(f, 0.2, 0.1, 'triangle'), k * 90));
    setTimeout(() => node.remove(), 1700);
    const n = bearCount(), all = bearRooms().length;
    setTimeout(() => {
        if (n === all) {
            showToast('🧸 Alle troetelberen gevonden! Ze zijn allemaal thuis! 💖', 3500);
            playWin();
            spellRain(['🧸', '💖', '🌈', '⭐']);
        } else {
            showToast(`🧸 Gevonden! ${n} / ${all}`, 2000);
        }
    }, 600);
}
