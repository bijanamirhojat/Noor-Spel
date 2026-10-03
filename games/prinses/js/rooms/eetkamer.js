/* 🍽️ Eetkamer */
defineRoom({
    key: 'eetkamer',
    name: 'Eetkamer',
    icon: '🍽️',
    say: 'De eetkamer',
    build(rf) {
        place(el('<div class="chandelier"><div class="chain"></div><div class="candles">🕯️🕯️🕯️</div><div class="body"></div><div class="drops">💎💎💎💎</div></div>'), rf + 325, 10);
        addObj('<div class="frame" style="font-size:56px">🎂</div>', rf + 40, 90, rf + 100, () => { playCorrect(); sparkleShower(rf + 100, 130, 30); });
        addObj('<div class="frame" style="font-size:56px">🍓</div>', rf + 640, 90, rf + 700, () => { playCorrect(); sparkleShower(rf + 700, 130, 30); });
        addObj(`<div class="dining">
            ${[30, 160, 290, 420].map((x, i) => `<div class="chairback" style="left:${x}px"></div><span class="guest-e" style="left:${x + 8}px;animation-delay:${-i * 0.5}s">${['🐶', '🐰', '🐻', '🐱'][i]}</span>`).join('')}
            <div class="tabletop"></div>
            ${[38, 168, 298, 428].map(x => `<div class="plate" style="left:${x}px"></div>`).join('')}
            <span class="candle" style="left:120px">🕯️</span><span class="candle" style="left:375px">🕯️</span>
            <div class="cloth"></div>
            <div class="tleg" style="left:40px"></div><div class="tleg" style="left:464px"></div>
            <div class="tap-hint" style="top:-44px">👇</div>
        </div>`, rf + 140, 222, rf + 400, openDinner);
    }
});

/* ─────────── Dinertje ─────────── */
const dinEl = document.getElementById('dinner');
let dinOpen = false;
const DIN_ANIMALS = [
    { e: '🐶', likes: ['🦴', '🍖'], snd: () => { playTone(320, 0.1, 0.2, 'square'); setTimeout(() => playTone(280, 0.12, 0.2, 'square'), 160); } },
    { e: '🐱', likes: ['🐟', '🥛'], snd: () => { playFreqSweep(700, 1000, 0.15, 0.18); setTimeout(() => playFreqSweep(1000, 600, 0.3, 0.18), 150); } },
    { e: '🐰', likes: ['🥕', '🥬'], snd: () => playFreqSweep(1400, 1900, 0.1, 0.14) },
    { e: '🐻', likes: ['🍯', '🍓'], snd: () => playTone(150, 0.3, 0.2, 'sawtooth') },
    { e: '🐷', likes: ['🌽', '🍎'], snd: () => { playTone(180, 0.1, 0.18, 'sawtooth'); setTimeout(() => playTone(160, 0.12, 0.18, 'sawtooth'), 150); } },
    { e: '🐵', likes: ['🍌', '🍉'], snd: () => [900, 1200, 900].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 0.12, 'square'), i * 90)) },
    { e: '🐭', likes: ['🧀', '🍪'], snd: () => playFreqSweep(2000, 2600, 0.08, 0.12) }
];
const DIN_MEALS = 3;
let din = { seats: [], selected: null, drag: null, candlesOut: 0 };

function newDinner() {
    const picks = shuffle(DIN_ANIMALS.slice()).slice(0, 4);
    din.seats = picks.map(a => ({ a, wish: randomPick(a.likes), fed: 0 }));
    din.selected = null;
    din.candlesOut = 0;
    document.getElementById('dinCake').classList.remove('show');
    document.getElementById('dinAgain').classList.remove('show');
    renderDinner();
}

function renderDinner() {
    const seats = document.getElementById('dinSeats');
    seats.innerHTML = din.seats.map((st, i) => `<div class="din-seat" data-i="${i}">
            <div class="din-bubble new">${st.fed >= DIN_MEALS ? '😋' : st.wish}</div>
            <div class="din-animal">${st.a.e}</div>
            <div class="din-plate"></div>
            <div class="din-stars">${'⭐'.repeat(st.fed)}</div>
        </div>`).join('');
    seats.querySelectorAll('.din-seat').forEach(seat => seat.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (din.selected) feedSeat(+seat.dataset.i, din.selected);
    }));
    const foods = [...new Set(din.seats.flatMap(st => st.a.likes))];
    const box = document.getElementById('dinFoods');
    box.innerHTML = shuffle(foods).map(f => `<button class="din-food" data-f="${f}">${f}</button>`).join('');
    box.querySelectorAll('.din-food').forEach(b => b.addEventListener('pointerdown', (e) => startFoodDrag(e, b)));
}

function dinPoint(e) {
    const o = dinEl.getBoundingClientRect();
    return { x: e.clientX - o.left, y: e.clientY - o.top };
}

function startFoodDrag(e, btn) {
    e.stopPropagation();
    const ghost = document.createElement('div');
    ghost.className = 'din-ghost';
    ghost.textContent = btn.dataset.f;
    const pt = dinPoint(e);
    ghost.style.left = pt.x + 'px';
    ghost.style.top = pt.y + 'px';
    dinEl.appendChild(ghost);
    din.drag = { food: btn.dataset.f, ghost, btn, sx: e.clientX, sy: e.clientY, moved: false };
    playPop();
}

window.addEventListener('pointermove', (e) => {
    const d = din.drag;
    if (!d) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 12) d.moved = true;
    const pt = dinPoint(e);
    d.ghost.style.left = pt.x + 'px';
    d.ghost.style.top = pt.y + 'px';
});

window.addEventListener('pointerup', (e) => {
    const d = din.drag;
    if (!d) return;
    din.drag = null;
    const seatEl = [...document.querySelectorAll('.din-seat')].find(s => {
        const r = s.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (seatEl && d.moved) {
        feedSeat(+seatEl.dataset.i, d.food, d.ghost);
        return;
    }
    d.ghost.remove();
    if (!d.moved) {
        // Plain tap: select this food, then tap an animal
        din.selected = din.selected === d.food ? null : d.food;
        document.querySelectorAll('.din-food').forEach(b => b.classList.toggle('sel', b.dataset.f === din.selected));
    }
});

function feedSeat(i, food, ghost) {
    const st = din.seats[i];
    const seat = document.querySelector(`.din-seat[data-i="${i}"]`);
    const animal = seat.querySelector('.din-animal');
    const bubble = seat.querySelector('.din-bubble');
    const plate = seat.querySelector('.din-plate');
    if (!ghost) {
        ghost = document.createElement('div');
        ghost.className = 'din-ghost';
        ghost.textContent = food;
        const fb = document.querySelector(`.din-food[data-f="${food}"]`).getBoundingClientRect();
        const o = dinEl.getBoundingClientRect();
        ghost.style.left = (fb.left + fb.width / 2 - o.left) + 'px';
        ghost.style.top = (fb.top + fb.height / 2 - o.top) + 'px';
        dinEl.appendChild(ghost);
    }
    din.selected = null;
    document.querySelectorAll('.din-food').forEach(b => b.classList.remove('sel'));
    if (st.fed >= DIN_MEALS || food !== st.wish) {
        ghost.remove();
        animal.classList.remove('nope'); void animal.offsetWidth; animal.classList.add('nope');
        bubble.classList.remove('wobble'); void bubble.offsetWidth; bubble.classList.add('wobble');
        playTone(220, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(180, 0.15, 0.1, 'triangle'), 140);
        return;
    }
    // Correct: food flies onto the plate, the animal munches it
    const pr = plate.getBoundingClientRect();
    const o = dinEl.getBoundingClientRect();
    requestAnimationFrame(() => {
        ghost.classList.add('fly');
        ghost.style.left = (pr.left + pr.width / 2 - o.left) + 'px';
        ghost.style.top = (pr.top + pr.height / 2 - o.top - 10) + 'px';
        ghost.style.transform = 'translate(-50%, -50%) scale(0.75)';
    });
    setTimeout(() => {
        animal.classList.remove('eat'); void animal.offsetWidth; animal.classList.add('eat');
        [0, 220, 440].forEach(t => setTimeout(() => playTone(260 + Math.random() * 60, 0.08, 0.18, 'triangle'), t));
        ghost.style.opacity = '0';
        ghost.style.transform = 'translate(-50%, -80%) scale(0.2)';
    }, 380);
    setTimeout(() => {
        ghost.remove();
        st.fed++;
        st.a.snd();
        const r = animal.getBoundingClientRect();
        dinSpark(r.left + r.width / 2, r.top + r.height / 2);
        if (st.fed < DIN_MEALS) {
            let next = randomPick(st.a.likes);
            if (st.a.likes.length > 1 && next === st.wish && Math.random() < 0.6) next = st.a.likes.find(f => f !== st.wish);
            st.wish = next;
        }
        bubble.textContent = st.fed >= DIN_MEALS ? '😋' : st.wish;
        bubble.classList.remove('new'); void bubble.offsetWidth; bubble.classList.add('new');
        seat.querySelector('.din-stars').textContent = '⭐'.repeat(st.fed);
        if (din.seats.every(x => x.fed >= DIN_MEALS)) setTimeout(showCake, 700);
    }, 1250);
}

function dinSpark(cx, cy) {
    const o = dinEl.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['💖', '✨', '😋', '⭐']);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 50;
        s.style.left = (cx - o.left) + 'px';
        s.style.top = (cy - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        dinEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function showCake() {
    const box = document.getElementById('candles');
    box.innerHTML = Array.from({ length: 5 }, (_, i) => `<button class="candle-btn" data-i="${i}"><span class="wax"></span><span class="flame"></span></button>`).join('');
    box.querySelectorAll('.candle-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.classList.contains('out')) return;
        b.classList.add('out');
        din.candlesOut++;
        playFreqSweep(900, 200, 0.25, 0.12);
        const r = b.getBoundingClientRect();
        dinSpark(r.left + r.width / 2, r.top);
        if (din.candlesOut === 5) {
            playWin();
            setTimeout(playMusicBox, 500);
            document.querySelectorAll('.din-animal').forEach((a, k) => setTimeout(() => {
                a.classList.remove('eat'); void a.offsetWidth; a.classList.add('eat');
                const ar = a.getBoundingClientRect();
                dinSpark(ar.left + ar.width / 2, ar.top);
            }, k * 150));
            setTimeout(() => document.getElementById('dinAgain').classList.add('show'), 900);
        }
    }));
    document.getElementById('dinCake').classList.add('show');
    playSparkleSound();
}

document.getElementById('dinAgainBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    newDinner();
    playPop();
});

function openDinner() {
    dinOpen = true;
    dinEl.classList.add('open');
    newDinner();
    playMusicBox();
}

function closeDinner() {
    dinOpen = false;
    dinEl.classList.remove('open');
    if (din.drag) { din.drag.ghost.remove(); din.drag = null; }
    _playWhoosh();
}
document.getElementById('dinClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeDinner();
});
dinEl.addEventListener('pointerdown', (e) => e.stopPropagation());
