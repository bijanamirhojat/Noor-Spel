/* 🎂 Feestzaal: versiering, een taart met het verjaardagsliedje, en het spel "Feestje!":
   eerst de piñata kapot tikken en het snoep rapen, dan ballonnen knallen. */
const BDAY_SONG = [
    [392, 1], [392, 1], [440, 2], [392, 2], [523, 2], [494, 4],
    [392, 1], [392, 1], [440, 2], [392, 2], [587, 2], [523, 4],
    [392, 1], [392, 1], [784, 2], [659, 2], [523, 2], [494, 2], [440, 4],
    [698, 1], [698, 1], [659, 2], [523, 2], [587, 2], [523, 4]
];
const PINATA_HITS = 8;
const PARTY_CANDY = ['🍬', '🍭', '🍫', '🧁', '🍩', '🍪', '🍓', '⭐'];
const PARTY_BALLOONS = 12;

function playBirthdaySong(beat = 260) {
    let t = 0;
    BDAY_SONG.forEach(([f, d]) => {
        setTimeout(() => { playTone(f, d * beat / 1000 + 0.15, 0.13, 'triangle'); playTone(f / 2, d * beat / 1000, 0.05, 'sine'); }, t);
        t += d * beat;
    });
    return t;
}

function partyName() {
    return (typeof hp !== 'undefined' && hp.name) ? hp.name : '';
}

defineRoom({
    key: 'feestzaal',
    name: 'Feestzaal',
    icon: '🎂',
    say: 'De feestzaal',
    build(x) {
        place(el(`<div class="bunting">${'<span></span>'.repeat(14)}</div>`), x, 40);
        place(el(`<div class="party-banner" id="partyBanner"></div>`), x + 250, 72);
        place(el('<div class="balloon-bunch l"><span>🎈</span><span>🎈</span><span>🎈</span></div>'), x + 20, 110);
        place(el('<div class="balloon-bunch r"><span>🎈</span><span>🎈</span><span>🎈</span></div>'), x + 690, 110);
        addObj(`<div class="party-table">
            <div class="cake"><div class="flames">${'<span></span>'.repeat(5)}</div><div class="tier t2"></div><div class="tier t1"></div></div>
            <div class="top"></div><div class="cloth"></div>
            <span class="cup" style="left:20px">🥤</span><span class="cup" style="left:210px">🧃</span>
        </div>`, x + 260, 250, x + 400, (node) => {
            const cake = node.querySelector('.cake');
            if (cake.classList.contains('lit')) return;
            cake.classList.add('lit');
            const ms = playBirthdaySong();
            const iv = setInterval(() => sparkleShower(x + 400, 160, 6), 400);
            setTimeout(() => {
                clearInterval(iv);
                cake.classList.remove('lit');
                playFreqSweep(900, 200, 0.3, 0.12);
                sparkleShower(x + 400, 120, 40);
                showToast('🎂 Hiep hiep hoera! 🎉', 2000);
            }, ms + 400);
        });
        addObj(`<div class="party-pinata-deco">🦄<div class="tap-hint" style="left:6px;top:-46px">👇</div></div>`, x + 590, 190, x + 620, openParty);
        addObj('<div class="confetti-cannon"><div class="barrel"></div><div class="base"></div></div>', x + 110, 352, x + 150, (node) => {
            bounceEl(node, 'jump');
            playFreqSweep(200, 900, 0.15, 0.2);
            for (let i = 0; i < 70; i++) {
                spawnSparkle(x + 190, 340, { vx: 80 + Math.random() * 260, vy: -260 - Math.random() * 260, g: 300, hue: Math.random() * 360, size: 4 + Math.random() * 5, max: 2 });
            }
        });
        addObj('<div class="gift-pile"><span>🎁</span><span>🎁</span><span>🎁</span></div>', x + 640, 360, x + 680, (node) => {
            bounceEl(node, 'wobble');
            playMusicBox();
        });
        renderPartyBanner();
    }
});

function renderPartyBanner() {
    const b = document.getElementById('partyBanner');
    if (!b) return;
    const n = partyName();
    b.innerHTML = [...`Hoera${n ? ' ' + n : ''}!`].map((c, i) => c === ' ' ? '<i></i>' : `<span style="--i:${i}">${c}</span>`).join('');
}

/* ─────────── Feestje! (overlay) ─────────── */
const partyEl = document.getElementById('partyOv');
const partyField = document.getElementById('partyField');
let partyOpen = false;
const pty = { stage: 'pinata', hits: 0, candy: 0, candyTotal: 0, popped: 0, spawnT: null };

function partyHint(t) { document.getElementById('partyHint').textContent = t; }

function partySpark(cx, cy, set = ['🎉', '✨', '⭐', '💖'], n = 10) {
    const o = partyEl.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(set);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 90;
        s.style.left = (cx - o.left) + 'px';
        s.style.top = (cy - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        partyEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function startPinata() {
    pty.stage = 'pinata';
    pty.hits = 0;
    pty.candy = 0;
    partyField.innerHTML = `<div class="pinata-rope"></div><button class="pinata" id="pinata">🦄</button><div class="party-bag" id="partyBag">🛍️<b>0</b></div>`;
    document.getElementById('partyAgain').style.display = 'none';
    partyHint('Tik op de piñata! 🦄');
    document.getElementById('pinata').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        hitPinata(e.currentTarget);
    });
}

function hitPinata(p) {
    if (pty.stage !== 'pinata') return;
    pty.hits++;
    p.classList.remove('hit'); void p.offsetWidth; p.classList.add('hit');
    p.style.setProperty('--crack', pty.hits / PINATA_HITS);
    playFreqSweep(300 + pty.hits * 40, 120, 0.15, 0.25);
    const r = p.getBoundingClientRect();
    partySpark(r.left + r.width / 2, r.top + r.height / 2, ['💥', '⭐', '✨'], 5);
    if (pty.hits < PINATA_HITS) {
        partyHint(`Nog ${PINATA_HITS - pty.hits} keer! 💪`);
        return;
    }
    // Kaboom: candy everywhere
    pty.stage = 'candy';
    p.classList.add('burst');
    playWin();
    partySpark(r.left + r.width / 2, r.top + r.height / 2, ['🎉', '🎊', '✨', '🍬'], 18);
    partyHint('Raap al het snoep op! 🍬');
    const n = 12;
    pty.candyTotal = n;
    for (let i = 0; i < n; i++) {
        const c = el(`<button class="party-candy">${randomPick(PARTY_CANDY)}</button>`);
        c.style.left = '50%';
        c.style.top = '30%';
        partyField.appendChild(c);
        void c.offsetWidth;
        c.classList.add('fall');
        c.style.left = (8 + Math.random() * 84) + '%';
        c.style.top = (58 + Math.random() * 28) + '%';
        c.style.transitionDelay = (i * 0.04) + 's';
        c.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            grabCandy(c);
        });
    }
    setTimeout(() => p.remove(), 600);
}

function grabCandy(c) {
    if (c.classList.contains('got')) return;
    c.classList.add('got');
    const bag = document.getElementById('partyBag');
    const fr = partyField.getBoundingClientRect();
    const br = bag.getBoundingClientRect();
    c.style.transitionDelay = '0s';
    c.style.left = ((br.left + br.width / 2 - fr.left) / fr.width * 100) + '%';
    c.style.top = ((br.top + br.height / 2 - fr.top) / fr.height * 100) + '%';
    playTone(700 + pty.candy * 60, 0.12, 0.1, 'sine');
    setTimeout(() => {
        c.remove();
        pty.candy++;
        bag.querySelector('b').textContent = pty.candy;
        bag.classList.remove('bump'); void bag.offsetWidth; bag.classList.add('bump');
        if (pty.candy >= pty.candyTotal) setTimeout(startBalloons, 700);
    }, 420);
}

function startBalloons() {
    pty.stage = 'balloons';
    pty.popped = 0;
    partyField.querySelectorAll('.pinata-rope').forEach(n => n.remove());
    partyHint(`Knal de ballonnen! 🎈 0 / ${PARTY_BALLOONS}`);
    playFreqSweep(500, 1200, 0.3, 0.12);
    clearInterval(pty.spawnT);
    spawnBalloon();
    pty.spawnT = setInterval(() => {
        if (partyField.querySelectorAll('.party-balloon:not(.pop)').length < 5) spawnBalloon();
    }, 650);
}

function spawnBalloon() {
    if (pty.stage !== 'balloons') return;
    const b = el(`<button class="party-balloon" style="--h:${Math.floor(Math.random() * 360)}deg"><span>🎈</span></button>`);
    b.style.left = (6 + Math.random() * 84) + '%';
    b.style.animationDuration = (5 + Math.random() * 3) + 's';
    b.addEventListener('animationend', () => b.remove());
    b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        popBalloon(b);
    });
    partyField.appendChild(b);
}

function popBalloon(b) {
    if (b.classList.contains('pop') || pty.stage !== 'balloons') return;
    b.classList.add('pop');
    pty.popped++;
    playFreqSweep(1600, 200, 0.08, 0.25);
    const r = b.getBoundingClientRect();
    partySpark(r.left + r.width / 2, r.top + r.height / 3, ['🎊', '✨', '💥', '⭐'], 8);
    setTimeout(() => b.remove(), 250);
    partyHint(`Knal de ballonnen! 🎈 ${pty.popped} / ${PARTY_BALLOONS}`);
    if (pty.popped >= PARTY_BALLOONS) partyFinale();
}

function partyFinale() {
    pty.stage = 'done';
    clearInterval(pty.spawnT);
    const n = partyName();
    partyHint(`🎉 Hiep hiep hoera${n ? ', ' + n : ''}! 🎂`);
    partyField.querySelectorAll('.party-balloon').forEach(b => b.classList.add('pop'));
    const fr = partyField.getBoundingClientRect();
    for (let k = 0; k < 6; k++) {
        setTimeout(() => partySpark(fr.left + fr.width * (0.15 + Math.random() * 0.7), fr.top + fr.height * (0.2 + Math.random() * 0.5), ['🎉', '🎊', '🎂', '🎈', '✨'], 12), k * 250);
    }
    const cake = el('<div class="party-cake-big">🎂</div>');
    partyField.appendChild(cake);
    const ms = playBirthdaySong(230);
    setTimeout(() => { document.getElementById('partyAgain').style.display = ''; }, Math.min(ms, 2500));
}

function openParty() {
    partyOpen = true;
    partyEl.classList.add('open');
    renderPartyBanner();
    startPinata();
    playMusicBox();
}

function closeParty() {
    partyOpen = false;
    clearInterval(pty.spawnT);
    pty.stage = 'closed';
    partyEl.classList.remove('open');
    partyField.innerHTML = '';
    _playWhoosh();
}

document.getElementById('partyAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    startPinata();
    playPop();
});
document.getElementById('partyClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeParty(); });
partyEl.addEventListener('pointerdown', (e) => e.stopPropagation());
