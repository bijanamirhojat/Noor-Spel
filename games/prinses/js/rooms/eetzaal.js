/* 👨‍👩‍👧 Familie-eetzaal: de prinses eet samen met Mama en Papa (zie js/parents.js) */
const FD_SEATS = { papa: 200, prinses: 400, mama: 600 };   // t.o.v. de kamer

defineRoom({
    key: 'eetzaal',
    name: 'Familie-eetzaal',
    icon: '👨‍👩‍👧',
    say: 'De familie-eetzaal',
    build(x) {
        place(el('<div class="fam-portrait"><span>🤴</span><span>👧</span><span>👸</span></div>'), x + 315, 50);
        [80, 650].forEach(wx => place(el('<div class="fam-window"></div>'), x + wx, 70));
        place(el('<div class="fam-chair king"><span>👑</span></div>'), x + FD_SEATS.papa - 55, 220);
        place(el('<div class="fam-chair kid"><span>💖</span></div>'), x + FD_SEATS.prinses - 45, 250);
        place(el('<div class="fam-chair queen"><span>👑</span></div>'), x + FD_SEATS.mama - 55, 220);
        state.famTable = addObj(`<div class="fam-table">
            <div class="top"></div>
            <div class="cloth">${[...Array(7)].map(() => '<span></span>').join('')}</div>
            ${[FD_SEATS.papa, FD_SEATS.prinses, FD_SEATS.mama].map(sx => `<div class="plate" style="left:${sx - 110 - 32}px"></div>`).join('')}
            <span class="cand" style="left:174px">🕯️</span><span class="cand" style="left:374px">🕯️</span>
            <div class="tleg" style="left:30px"></div><div class="tleg" style="left:530px"></div>
            <div class="tap-hint" style="left:270px;top:-60px">👇</div>
        </div>`, x + 110, 352, x + FD_SEATS.prinses, startFamilyDinner);
        addObj('<div class="dinner-bell">🔔</div>', x + 20, 250, x + 60, (node) => {
            node.classList.remove('ring'); void node.offsetWidth; node.classList.add('ring');
            [1568, 1319, 1568, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.1, 'sine'), i * 180));
        });
    }
});

function startFamilyDinner() {
    if (state.busy) return;
    if (parents.some(p => p.mode !== 'wander')) {
        showToast('Mama en Papa zijn even bezig…');
        return;
    }
    state.busy = true;
    state.facing = 1;
    const rx = roomX('eetzaal');
    const key = sceneOf('eetzaal').key;
    [1568, 1319, 1568, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.1, 'sine'), i * 180));
    showToast('🔔 Etenstijd! Mama en Papa komen eraan!', 2400);
    parents.forEach(p => {
        // They come walking in from the sides of the room
        const fromLeft = p.id === 'papa';
        if (p.wing !== key || Math.abs(p.x - (rx + 400)) > 450) p.x = rx + (fromLeft ? 10 : 790);
        parentPlace(p, key);
        p.mode = 'dinner';
        p.goal = null;
        p.goalX = rx + FD_SEATS[p.id];
        parentBubble(p, '😋');
    });
    const arrive = Math.max(...parents.map(p => Math.abs(p.goalX - p.x))) / 170 * 1000 + 300;
    setTimeout(() => {
        parents.forEach(p => { p.facing = p.id === 'papa' ? 1 : -1; });
        state.famTable.classList.add('dining');
        sparkleShower(rx + 400, 150, 30);
        setTimeout(openFamDinner, 700);
    }, arrive);
}

/* ─────────── Eten met Mama en Papa (overlay) ─────────── */
const fdEl = document.getElementById('famDin');
let fdOpen = false;
const FD_COURSES = [
    { icon: '🥣', name: 'Voorgerecht', foods: ['🍅', '🥗', '🥖', '🧀', '🍇', '🥕'] },
    { icon: '🍝', name: 'Hoofdgerecht', foods: ['🍝', '🍕', '🍗', '🥞', '🍟', '🍔'] },
    { icon: '🍰', name: 'Toetje', foods: ['🍰', '🍨', '🧁', '🍩', '🍓', '🍮'] },
    { icon: '🥂', name: 'Proosten!' }
];
const FD_DINERS = [
    { id: 'papa', svg: () => kingSVG(), snd: () => playTone(150, 0.25, 0.15, 'triangle') },
    { id: 'prinses', svg: () => princessSVG('fd'), snd: () => playFreqSweep(900, 1400, 0.15, 0.12) },
    { id: 'mama', svg: () => queenSVG(), snd: () => playFreqSweep(500, 800, 0.2, 0.12) }
];
const fd = { course: 0, diners: [], clinked: 0 };

function fdNewCourse() {
    const c = FD_COURSES[fd.course];
    const wishes = c.foods ? shuffle(c.foods.slice()) : [];
    fd.diners = FD_DINERS.map((d, i) => ({ d, wish: wishes[i], fed: false }));
    fd.clinked = 0;
    document.getElementById('fdCourse').innerHTML = FD_COURSES.map((cc, i) =>
        `<span class="${i === fd.course ? 'on' : i < fd.course ? 'done' : ''}">${cc.icon}</span>`).join('') + `<b>${c.name}</b>`;
    fdEl.querySelectorAll('.fd-seat').forEach((seat, i) => {
        const bubble = seat.querySelector('.din-bubble');
        bubble.textContent = c.foods ? fd.diners[i].wish : '🥂';
        bubble.classList.remove('new'); void bubble.offsetWidth; bubble.classList.add('new');
    });
    fdEl.querySelectorAll('.fd-plate').forEach((plate, i) => {
        plate.innerHTML = c.foods ? '' : `<button class="fd-glass" data-i="${i}">🥂</button>`;
    });
    fdEl.querySelectorAll('.fd-glass').forEach(g => g.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        clinkGlass(g);
    }));
    const box = document.getElementById('fdFoods');
    box.innerHTML = c.foods ? shuffle(c.foods.slice()).map(f => `<button class="din-food" data-f="${f}">${f}</button>`).join('') : '';
    box.querySelectorAll('.din-food').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        serveFood(b);
    }));
    playFreqSweep(500, 1000, 0.25, 0.1);
}

function serveFood(btn) {
    const food = btn.dataset.f;
    const i = fd.diners.findIndex(x => !x.fed && x.wish === food);
    const seats = fdEl.querySelectorAll('.fd-seat');
    if (i < 0) {
        seats.forEach((s, k) => {
            if (fd.diners[k].fed) return;
            const b = s.querySelector('.din-bubble');
            b.classList.remove('wobble'); void b.offsetWidth; b.classList.add('wobble');
        });
        playTone(220, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(180, 0.15, 0.1, 'triangle'), 140);
        return;
    }
    const diner = fd.diners[i];
    diner.fed = true;
    const seat = seats[i];
    const plate = fdEl.querySelectorAll('.fd-plate')[i];
    const o = fdEl.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const pr = plate.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'din-ghost';
    ghost.textContent = food;
    ghost.style.left = (br.left + br.width / 2 - o.left) + 'px';
    ghost.style.top = (br.top + br.height / 2 - o.top) + 'px';
    fdEl.appendChild(ghost);
    playPop();
    requestAnimationFrame(() => requestAnimationFrame(() => {
        ghost.classList.add('fly');
        ghost.style.left = (pr.left + pr.width / 2 - o.left) + 'px';
        ghost.style.top = (pr.top + pr.height / 2 - o.top - 6) + 'px';
    }));
    setTimeout(() => {
        ghost.remove();
        plate.innerHTML = `<span class="fd-food">${food}</span>`;
        const person = seat.querySelector('.fd-person');
        person.classList.remove('eat'); void person.offsetWidth; person.classList.add('eat');
        [0, 220, 440].forEach(t => setTimeout(() => playTone(260 + Math.random() * 60, 0.08, 0.18, 'triangle'), t));
    }, 400);
    setTimeout(() => {
        plate.innerHTML = '<span class="fd-crumbs">✨</span>';
        seat.querySelector('.din-bubble').textContent = randomPick(['😋', '💖', '🥰']);
        diner.d.snd();
        fdSpark(seat.querySelector('.fd-person'));
        if (fd.diners.every(x => x.fed)) {
            playCorrect();
            setTimeout(() => {
                fd.course++;
                fdNewCourse();
            }, 1100);
        }
    }, 1300);
}

function clinkGlass(g) {
    if (g.classList.contains('up')) return;
    g.classList.add('up');
    fd.clinked++;
    playTone(2093 + fd.clinked * 200, 0.4, 0.08, 'sine');
    fdSpark(g);
    if (fd.clinked < 3) return;
    setTimeout(() => {
        [2637, 3136, 2637, 3520].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.08, 'sine'), i * 90));
        fdEl.querySelectorAll('.fd-person').forEach((p, k) => setTimeout(() => {
            p.classList.remove('eat'); void p.offsetWidth; p.classList.add('eat');
            fdSpark(p);
        }, k * 150));
        fdEl.querySelectorAll('.fd-seat .din-bubble').forEach(b => { b.textContent = '💖'; });
        playWin();
        setTimeout(playMusicBox, 600);
        document.getElementById('fdAgain').classList.add('show');
    }, 300);
}

function fdSpark(node) {
    const r = node.getBoundingClientRect();
    const o = fdEl.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['💖', '✨', '😋', '⭐']);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 50;
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.top + r.height / 3 - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        fdEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function openFamDinner() {
    fdOpen = true;
    fdEl.classList.add('open');
    document.getElementById('fdSeats').innerHTML = FD_DINERS.map((d, i) => `<div class="fd-seat" data-i="${i}">
        <div class="din-bubble"></div>
        <div class="fd-person ${d.id}">${d.svg()}</div>
    </div>`).join('');
    document.getElementById('fdPlates').innerHTML = FD_DINERS.map(() => '<div class="fd-plate"></div>').join('');
    applyLook();
    fd.course = 0;
    document.getElementById('fdAgain').classList.remove('show');
    fdNewCourse();
    playMusicBox();
}

function closeFamDinner() {
    fdOpen = false;
    fdEl.classList.remove('open');
    fdEl.querySelectorAll('.din-ghost').forEach(g => g.remove());
    document.getElementById('fdSeats').innerHTML = '';
    state.famTable.classList.remove('dining');
    const now = performance.now();
    parents.forEach(p => {
        if (p.mode !== 'dinner') return;
        p.mode = 'wander';
        p.goalX = null;
        p.wait = now + 3000;
        parentBubble(p, randomPick(['😋', '💖', '🥰']));
    });
    state.busy = false;
    twirl();
    burst(state.x, 320, 40);
    _playWhoosh();
}

document.getElementById('fdAgainBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    fd.course = 0;
    document.getElementById('fdAgain').classList.remove('show');
    fdNewCourse();
    playPop();
});
document.getElementById('fdClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeFamDinner();
});
fdEl.addEventListener('pointerdown', (e) => e.stopPropagation());
