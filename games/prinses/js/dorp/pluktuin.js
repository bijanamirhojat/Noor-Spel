/* 🌼 Pluktuin: een veld vol bloemen om zelf te plukken (de bloementuin buiten is van het kasteel).
   Binnen: op het wensbriefje staan 5 bloemen; pluk ze in het veld en ze vliegen in het boeket.
   Een geplukte bloem groeit vanzelf weer aan. Het aantal boeketten wordt bewaard (localStorage). */
const PICK_KEY = 'noor-prinses-pluktuin';
const PICK_FLOWERS = ['🌷', '🌹', '🌻', '🌼', '🌸', '🌺'];
const PICK_SPOTS = 12;
const PICK_WISH = 5;
let pickBouquets = 0;
try { pickBouquets = Math.max(0, parseInt(localStorage.getItem(PICK_KEY), 10) || 0); } catch (e) {}

function pickPlop() { playFreqSweep(1400, 700, 0.12, 0.12); }

defineRoom({
    key: 'pluktuin',
    name: 'Pluktuin',
    icon: '🌼',
    say: 'De pluktuin',
    build(x) {
        place(el('<div class="farm-fence"></div>'), x, 318);
        place(el('<div class="pk-sign">🌼 Zelf plukken</div>'), x + 30, 200);
        addObj(`<div class="pk-field">${Array.from({ length: 10 }, (_, i) =>
            `<span style="left:${12 + i * 33}px;top:${(i % 2) * 22}px">${PICK_FLOWERS[i % PICK_FLOWERS.length]}</span>`).join('')}
            <div class="tap-hint" style="left:150px;top:-70px">👇</div></div>`, x + 200, 320, x + 360, openPick);
        // Single flowers you can pick right here; they grow back
        [[40, 370], [600, 360], [680, 380], [140, 380]].forEach(([fx, fy], i) => {
            addObj(`<div class="pk-one"><span>${PICK_FLOWERS[(i * 2 + 1) % PICK_FLOWERS.length]}</span></div>`, x + fx, fy, x + fx + 20, (node) => {
                if (node.classList.contains('picked')) return;
                node.classList.add('picked');
                pickPlop();
                const r = node.getBoundingClientRect();
                const p = screenToWorld(r.left + r.width / 2, r.top);
                for (let k = 0; k < 14; k++) spawnSparkle(p.x, p.y, { vy: -80 - Math.random() * 60, vx: (Math.random() - 0.5) * 80, hue: 300 + Math.random() * 80, size: 4 + Math.random() * 4, max: 1.2 });
                setTimeout(() => { node.classList.remove('picked'); playTone(880, 0.1, 0.06, 'sine'); }, 3000);
            });
        });
        addObj('<div class="pk-vase"><span id="pickVaseFlowers">💐</span><div class="pot"></div><b id="pickVaseCount"></b></div>', x + 560, 220, x + 600, (node) => {
            bounceEl(node, 'wobble');
            playTone(659, 0.15, 0.1, 'triangle');
            showToast(pickBouquets ? `💐 ${pickBouquets} boeket${pickBouquets === 1 ? '' : 'ten'} geplukt!` : '💐 Nog geen boeket… ga plukken!', 2200);
        });
        addObj('<div class="flutter" style="animation-delay:-2s">🦋</div>', x + 420, 120, x + 480, butterflyTap);
        addObj('<div class="bee">🐝</div>', x + 700, 180, x + 700, beeBuzz);
        renderPickRoom();
    }
});

function renderPickRoom() {
    const c = document.getElementById('pickVaseCount');
    if (c) c.textContent = pickBouquets ? pickBouquets : '';
}

/* ─────────── Bloemen plukken (overlay) ─────────── */
const pkEl = document.getElementById('pickOv');
const pkField = document.getElementById('pickField');
let pickOpen = false;
const pk = { wish: [], got: 0, spots: [], busy: false };

function pickNewWish() {
    pk.wish = Array.from({ length: PICK_WISH }, () => randomPick(PICK_FLOWERS));
    pk.got = 0;
    pk.busy = false;
    document.getElementById('pickBouquet').classList.remove('done');
    renderPickWish();
    // Make sure every wished flower grows somewhere in the field
    const need = pk.wish.slice();
    pk.spots.forEach(s => {
        if (s.f && need.includes(s.f)) need.splice(need.indexOf(s.f), 1);
    });
    pk.spots.forEach(s => {
        if (need.length && !pk.wish.includes(s.f)) pickGrow(s, need.pop());
    });
}

function renderPickWish() {
    document.getElementById('pickWish').innerHTML = pk.wish.map((f, i) =>
        `<span class="${i < pk.got ? 'got' : ''}${i === pk.got ? ' next' : ''}">${f}</span>`).join('');
    document.getElementById('pickBouquet').querySelector('.flowers').innerHTML = pk.wish.slice(0, pk.got).map((f, i) =>
        `<span style="--r:${(i - (pk.got - 1) / 2) * 16}deg">${f}</span>`).join('');
    document.getElementById('pickCount').textContent = `💐 ${pickBouquets}`;
}

// Choose a flower for an empty spot: prefer one that is still on the wish list
function pickChoose() {
    const next = pk.wish[pk.got];
    if (next && !pk.spots.some(s => s.f === next)) return next;
    const want = pk.wish.slice(pk.got).filter(f => !pk.spots.some(s => s.f === f));
    return want.length && Math.random() < 0.6 ? randomPick(want) : randomPick(PICK_FLOWERS);
}

function pickGrow(s, f) {
    s.f = f;
    s.node.querySelector('.fl').textContent = f;
    s.node.classList.remove('gone', 'nope');
    s.node.classList.remove('grow'); void s.node.offsetWidth; s.node.classList.add('grow');
}

function buildPickField() {
    pkField.innerHTML = '';
    pk.spots = [];
    // A loose grid with some wobble so it looks like a real field
    const cols = 6;
    for (let i = 0; i < PICK_SPOTS; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const node = el(`<button class="pk-flower" style="left:${8 + c * 16.5 + (Math.random() - 0.5) * 5}%;top:${14 + r * 44 + (Math.random() - 0.5) * 8}%;animation-delay:${-Math.random() * 3}s">
            <span class="fl"></span><span class="stem"></span></button>`);
        const s = { node, f: null };
        node.addEventListener('pointerdown', (e) => { e.stopPropagation(); pickTap(s); });
        pkField.appendChild(node);
        pk.spots.push(s);
    }
    pk.spots.forEach(s => pickGrow(s, randomPick(PICK_FLOWERS)));
}

function pickTap(s) {
    if (pk.busy || !s.f) return;
    if (s.f !== pk.wish[pk.got]) {
        // Not this one: a gentle shake, and point at the next one on the card
        s.node.classList.remove('nope'); void s.node.offsetWidth; s.node.classList.add('nope');
        playTone(260, 0.12, 0.08, 'triangle');
        const n = document.querySelector('#pickWish .next');
        if (n) bounceEl(n, 'pulse');
        return;
    }
    const f = s.f;
    s.f = null;
    s.node.classList.add('gone');
    pickPlop();
    pk.busy = true;
    ovFly(pkEl, s.node, document.getElementById('pickBouquet'), f, 550).then(() => {
        pk.got++;
        renderPickWish();
        playTone(523 + pk.got * 90, 0.15, 0.1, 'sine');
        pk.busy = false;
        if (pk.got >= PICK_WISH) pickDone();
    });
    setTimeout(() => { if (pickOpen && !s.f) pickGrow(s, pickChoose()); }, 2200);
}

function pickDone() {
    pk.busy = true;
    pickBouquets++;
    try { localStorage.setItem(PICK_KEY, String(pickBouquets)); } catch (e) {}
    const b = document.getElementById('pickBouquet');
    b.classList.add('done');
    playWin();
    ovCheer(pkEl, b, ['💖', '🌸', '✨', '🎀']);
    document.getElementById('pickCount').textContent = `💐 ${pickBouquets}`;
    renderPickRoom();
    setTimeout(() => { if (pickOpen) pickNewWish(); }, 2400);
}

function openPick() {
    pickOpen = true;
    pkEl.classList.add('open');
    buildPickField();
    pickNewWish();
    playMusicBox();
}

function closePick() {
    pickOpen = false;
    pkEl.classList.remove('open');
    renderPickRoom();
    _playWhoosh();
}
document.getElementById('pickClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closePick(); });
pkEl.addEventListener('pointerdown', (e) => e.stopPropagation());
