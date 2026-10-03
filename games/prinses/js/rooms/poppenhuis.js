/* 🏠 Poppenhuis */
defineRoom({
    key: 'poppenhuis',
    name: 'Poppenhuis',
    icon: '🏠',
    say: 'Het poppenhuis',
    build(rdh) {
        addObj(`<div class="dollhouse-prop">
            <div class="roof"></div>
            <div class="body">${DH_ROOMS.map(r => `<span style="background:${r.bg}">${r.icon}</span>`).join('')}</div>
            <div class="tap-hint" style="left:120px;top:-44px">👇</div>
        </div>`, rdh + 270, 130, rdh + 560, openDollhouse);
        [[40, 110], [620, 110]].forEach(([x, y], i) => place(el(`<div class="doll-shelf">
            <span style="left:6px;top:8px">${i ? '🪆' : '🧸'}</span><span style="left:56px;top:8px">${i ? '🎎' : '🐰'}</span><span style="left:104px;top:8px">${i ? '🦄' : '🪆'}</span>
            <span style="left:20px;top:70px">${i ? '🐻' : '🎀'}</span><span style="left:80px;top:70px">${i ? '👑' : '🧚'}</span>
        </div>`), rdh + x, y));
    }
});

/* ─────────── Poppenhuis ─────────── */
const DH_ROOMS = [
    { k: 'toys', icon: '🧸', bg: 'linear-gradient(180deg, #fef3c7, #fde68a)', fx: '⭐' },
    { k: 'sleep', icon: '🛏️', bg: 'linear-gradient(180deg, #e0e7ff, #c7d2fe)', fx: '💤' },
    { k: 'bath', icon: '🛁', bg: 'linear-gradient(180deg, #cffafe, #a5f3fc)', fx: '🫧' },
    { k: 'music', icon: '🎹', bg: 'linear-gradient(180deg, #fce7f3, #fbcfe8)', fx: '🎵' },
    { k: 'food', icon: '🍰', bg: 'linear-gradient(180deg, #fee2e2, #fecaca)', fx: '😋' },
    { k: 'garden', icon: '🌻', bg: 'linear-gradient(180deg, #dcfce7, #bbf7d0)', fx: '🦋' }
];
const DH_CHARS = ['🐻', '🐰', '🐼', '🦊', '🐸', '🐧', '🐨', '🦄', '🧚', '🐱', '🐶', '🐷', '🐵', '🐹'];
const DH_SOUNDS = {
    toys: () => playFreqSweep(300, 900, 0.25, 0.15),
    sleep: () => [784, 659, 523].forEach((f, i) => setTimeout(() => playTone(f, 0.4, 0.1), i * 300)),
    bath: () => { playFreqSweep(1200, 300, 0.2, 0.15); setTimeout(() => playFreqSweep(1400, 400, 0.15, 0.1), 200); },
    music: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.12, 'triangle'), i * 120)),
    food: () => [0, 200, 400].forEach(t => setTimeout(() => playTone(280, 0.08, 0.18, 'triangle'), t)),
    garden: () => [1319, 1568, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.08), i * 100))
};
const dollEl = document.getElementById('dollOv');
let dollOpen = false;
let dh = { chars: [], drag: null, selected: null, placed: 0 };

function sizeDollhouse() {
    const st = document.getElementById('dhStage').getBoundingClientRect();
    const h = Math.min(st.height, st.width * 0.95);
    const house = document.getElementById('dhHouse');
    house.style.height = h + 'px';
    house.style.width = (h * 1.05) + 'px';
    const roomH = (h * 0.82 - 24) / 3;
    house.querySelectorAll('.dh-furn').forEach(f => { f.style.fontSize = (roomH * 0.55) + 'px'; });
    house.querySelectorAll('.dh-occ').forEach(f => { f.style.fontSize = (roomH * 0.48) + 'px'; });
    document.querySelectorAll('.dh-fx').forEach(f => { f.style.fontSize = (roomH * 0.22) + 'px'; });
}

function newDollRound() {
    const chars = shuffle(DH_CHARS.slice()).slice(0, DH_ROOMS.length);
    const rooms = shuffle(DH_ROOMS.map(r => r.k));
    dh.chars = chars.map((e, i) => ({ e, wish: rooms[i], placed: false }));
    dh.placed = 0;
    dh.selected = null;
    document.getElementById('dhAgain').classList.remove('show');
    const house = document.getElementById('dhHouse');
    house.classList.remove('party');
    house.innerHTML = `<div class="dh-roof"></div><div class="dh-body">${DH_ROOMS.map(r =>
        `<div class="dh-room" data-k="${r.k}" style="background:${r.bg}"><span class="dh-furn">${r.icon}</span></div>`).join('')}</div>`;
    house.querySelectorAll('.dh-room').forEach(room => room.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (dh.selected !== null) placeChar(dh.selected, room.dataset.k);
    }));
    renderDollShelf();
    sizeDollhouse();
}

function renderDollShelf() {
    const shelf = document.getElementById('dhShelf');
    shelf.innerHTML = dh.chars.map((c, i) => {
        const room = DH_ROOMS.find(r => r.k === c.wish);
        return `<button class="dh-char${c.placed ? ' placed' : ''}${dh.selected === i ? ' sel' : ''}" data-i="${i}">${c.e}<span class="wish">${room.icon}</span></button>`;
    }).join('');
    shelf.querySelectorAll('.dh-char').forEach(b => b.addEventListener('pointerdown', (e) => startCharDrag(e, b)));
}

function dollPoint(e) {
    const o = dollEl.getBoundingClientRect();
    return { x: e.clientX - o.left, y: e.clientY - o.top };
}

function startCharDrag(e, btn) {
    e.stopPropagation();
    const i = +btn.dataset.i;
    if (dh.chars[i].placed) return;
    const ghost = document.createElement('div');
    ghost.className = 'dh-ghost';
    ghost.textContent = dh.chars[i].e;
    const pt = dollPoint(e);
    ghost.style.left = pt.x + 'px';
    ghost.style.top = pt.y + 'px';
    dollEl.appendChild(ghost);
    dh.drag = { i, ghost, sx: e.clientX, sy: e.clientY, moved: false };
    playPop();
}

function roomAt(x, y) {
    return [...document.querySelectorAll('.dh-room')].find(r => {
        const b = r.getBoundingClientRect();
        return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
    });
}

window.addEventListener('pointermove', (e) => {
    const d = dh.drag;
    if (!d) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 12) d.moved = true;
    const pt = dollPoint(e);
    d.ghost.style.left = pt.x + 'px';
    d.ghost.style.top = pt.y + 'px';
    document.querySelectorAll('.dh-room').forEach(r => r.classList.remove('glow'));
    const r = roomAt(e.clientX, e.clientY);
    if (r) r.classList.add('glow');
});

window.addEventListener('pointerup', (e) => {
    const d = dh.drag;
    if (!d) return;
    dh.drag = null;
    d.ghost.remove();
    document.querySelectorAll('.dh-room').forEach(r => r.classList.remove('glow'));
    const room = roomAt(e.clientX, e.clientY);
    if (room && d.moved) {
        placeChar(d.i, room.dataset.k);
    } else if (!d.moved) {
        dh.selected = dh.selected === d.i ? null : d.i;
        renderDollShelf();
    }
});

function placeChar(i, roomKey) {
    const c = dh.chars[i];
    dh.selected = null;
    if (c.placed) return;
    if (c.wish !== roomKey) {
        renderDollShelf();
        const b = document.querySelector(`.dh-char[data-i="${i}"]`);
        if (b) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); }
        playTone(220, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(180, 0.15, 0.1, 'triangle'), 140);
        return;
    }
    c.placed = true;
    dh.placed++;
    const room = document.querySelector(`.dh-room[data-k="${roomKey}"]`);
    const occ = document.createElement('span');
    occ.className = 'dh-occ act-' + roomKey;
    occ.textContent = c.e;
    room.appendChild(occ);
    const info = DH_ROOMS.find(r => r.k === roomKey);
    [0, 0.7, 1.4].forEach((delay, k) => {
        const fx = document.createElement('span');
        fx.className = 'dh-fx';
        fx.textContent = info.fx;
        fx.style.left = (20 + k * 18) + '%';
        fx.style.top = (25 + (k % 2) * 10) + '%';
        fx.style.animationDelay = delay + 's';
        room.appendChild(fx);
    });
    sizeDollhouse();
    DH_SOUNDS[roomKey]();
    renderDollShelf();
    const r = room.getBoundingClientRect();
    dinSparkIn(dollEl, r.left + r.width / 2, r.top + r.height / 2);
    if (dh.placed === dh.chars.length) {
        setTimeout(() => {
            playWin();
            document.getElementById('dhHouse').classList.add('party');
            document.querySelectorAll('.dh-room').forEach((rm, k) => setTimeout(() => {
                const b = rm.getBoundingClientRect();
                dinSparkIn(dollEl, b.left + b.width / 2, b.top + b.height / 2);
            }, k * 120));
            document.getElementById('dhAgain').classList.add('show');
        }, 600);
    }
}

function dinSparkIn(container, cx, cy) {
    const o = container.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '⭐', '💖', '🌟']);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 50;
        s.style.left = (cx - o.left) + 'px';
        s.style.top = (cy - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        container.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function openDollhouse() {
    dollOpen = true;
    dollEl.classList.add('open');
    newDollRound();
    playMusicBox();
}

function closeDollhouse() {
    dollOpen = false;
    dollEl.classList.remove('open');
    if (dh.drag) { dh.drag.ghost.remove(); dh.drag = null; }
    _playWhoosh();
}
document.getElementById('dhAgainBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    newDollRound();
    playPop();
});
document.getElementById('dhClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeDollhouse();
});
dollEl.addEventListener('pointerdown', (e) => e.stopPropagation());
window.addEventListener('resize', () => { if (dollOpen) sizeDollhouse(); });
