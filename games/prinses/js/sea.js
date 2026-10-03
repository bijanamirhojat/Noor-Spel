/* ─────────── Zeemeerminnenrijk ─────────── */
function buildSea() {
    buildRooms('s-room');
    place(el('<div class="sea-rays"></div>'), 0, -20);

    /* Koraalrif */
    addObj('<div class="portal-bubble">⬆️</div>', 40, 120, 100, surfaceFromSea);
    const corals = [
        [200, '#fb7185'], [330, '#f97316'], [520, '#c084fc'], [690, '#f472b6']
    ];
    corals.forEach(([x, c]) => place(el(`<svg class="coral" width="110" height="130" viewBox="0 0 110 130">
        <path d="M55 130 L55 70 M55 90 Q30 80 28 50 M55 80 Q80 70 82 40 M28 50 Q22 36 30 24 M82 40 Q90 26 84 14 M55 70 Q50 40 58 20"
            stroke="${c}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="30" cy="24" r="7" fill="${c}"/><circle cx="84" cy="14" r="7" fill="${c}"/><circle cx="58" cy="20" r="7" fill="${c}"/>
    </svg>`), x, 300));
    [[140, 0], [420, -1.2], [600, -0.6], [760, -2]].forEach(([x, d]) => {
        const w = place(el(`<svg class="seaweed" height="170" viewBox="0 0 60 170"><path d="M30 170 C10 140 50 120 30 90 C10 60 50 40 30 0" stroke="#16a34a" stroke-width="12" fill="none" stroke-linecap="round"/></svg>`), x, 260);
        w.style.animationDelay = d + 's';
    });
    [[260, 360], [610, 360]].forEach(([x, y]) => addObj('<div class="clam"><div class="bottom"></div><div class="pearl"></div><div class="top"></div></div>', x, y, x + 45, openClam));
    [[470, 400], [740, 410]].forEach(([x, y]) => addObj('<div class="emoji-obj spin-star" style="font-size:44px">⭐</div>', x, y, x + 20, (node) => {
        node.classList.remove('spin'); void node.offsetWidth; node.classList.add('spin');
        playSparkleSound();
    }));
    place(el('<div class="fish-school">🐠 🐟 🐠 🐟 🐡</div>'), 900, 150);
    const school2 = place(el('<div class="fish-school">🐟 🐟 🐠</div>'), 1100, 230);
    school2.style.animationDelay = '-7s';

    /* Zeemeerminnengrot */
    const g = ROOM_W;
    place(el('<div class="cave-arch"></div>'), g + 20, 40);
    place(el('<div class="rock"></div>'), g + 300, 340);
    addObj('<div class="sea-friend">🧜‍♀️</div>', g + 345, 250, g + 300, mermaidSing);
    [['#a78bfa', 80, 300], ['#f472b6', 150, 320], ['#22d3ee', 600, 300], ['#fde047', 680, 320]].forEach(([c, x, y], i) =>
        addObj(`<div class="crystal" style="background:${c};color:${c}"></div>`, g + x, y, g + x + 20, (node) => ringCrystal(node, i)));
    [[220, 120], [520, 90]].forEach(([x, y], i) => {
        const j = addObj(`<div class="jelly"><div class="dome"></div>${[12, 26, 40, 54].map(tx => `<div class="tent" style="left:${tx}px;animation-delay:${-tx / 30}s"></div>`).join('')}</div>`, g + x, y, g + x + 35, (node) => {
            node.classList.toggle('glow');
            playFreqSweep(800, 1600, 0.4, 0.1);
        });
        j.style.animationDelay = (-i * 2) + 's';
    });
    addObj(`<div class="island" style="width:90px;height:60px"><div class="treasure" id="seaTreasure" style="left:10px;bottom:0"><div class="tbox"></div><div class="tlid"></div></div></div>`, g + 470, 350, g + 500, openSeaTreasure);

    /* Dolfijnenbaai */
    const d = ROOM_W * 2;
    addObj('<div class="dolphin">🐬</div>', d + 150, 150, d + 200, (node) => {
        node.classList.remove('flip'); void node.offsetWidth; node.classList.add('flip');
        [1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.12, 'square'), i * 90));
        burst(d + 200, 200, 40);
    });
    addObj('<div class="whale">🐳</div>', d + 460, 90, d + 540, whaleSpout);
    addObj('<div class="turtle">🐢</div>', d + 600, 330, d + 560, () => { playTone(200, 0.4, 0.12, 'sine'); burst(d + 560, 360, 20); });
    addObj('<div class="octopus">🐙</div>', d + 60, 330, d + 110, octopusInk);
}

function diveIntoSea() {
    state.busy = true;
    dismountUnicorn(true);
    leaveBoat(true);
    const fade = document.getElementById('doorFade');
    [600, 500, 420, 360].forEach((f, i) => setTimeout(() => playFreqSweep(f, f * 1.8, 0.15, 0.12), i * 120));
    for (let i = 0; i < 50; i++) spawnSparkle(state.x, 380, { vy: -200 - Math.random() * 150, vx: (Math.random() - 0.5) * 120, g: -40, hue: 190 });
    fade.classList.add('show');
    setTimeout(() => {
        setScene('sea');
        state.x = state.targetX = 300;
        state.alt = state.targetAlt = 160;
        state.facing = 1;
        state.camX = 0;
    }, 450);
    setTimeout(() => {
        fade.classList.remove('show');
        showToast('🧜‍♀️ Je bent een zeemeermin!');
        playWin();
        for (let i = 0; i < 40; i++) spawnSparkle(state.x, FEET_Y - 110 - state.alt, { speed: 160 });
        state.busy = false;
    }, 650);
}

function surfaceFromSea() {
    state.busy = true;
    const fade = document.getElementById('doorFade');
    playFreqSweep(300, 1200, 0.5, 0.12);
    fade.classList.add('show');
    setTimeout(() => {
        setScene('out');
        state.alt = state.targetAlt = 0;
        state.x = state.targetX = ROOM_W * 5 + 110;
        state.camX = Math.max(0, Math.min(WORLD_W - state.viewW, state.x - state.viewW / 2));
        if (state.pet.following) state.pet.x = state.x - 90;
    }, 450);
    setTimeout(() => {
        fade.classList.remove('show');
        splash(state.x, 430);
        state.busy = false;
    }, 650);
}

function openClam(node) {
    if (node.classList.contains('open')) return;
    node.classList.add('open');
    [1568, 2093, 2637].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.1), i * 70));
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    for (let i = 0; i < 24; i++) spawnSparkle(c.x, c.y, { speed: 150, g: 0 });
    setTimeout(() => node.classList.remove('open'), 3500);
}

const CRYSTAL_NOTES = [784, 988, 1175, 1568];
function ringCrystal(node, i) {
    node.classList.remove('ring'); void node.offsetWidth; node.classList.add('ring');
    playTone(CRYSTAL_NOTES[i], 0.8, 0.12, 'sine');
    playTone(CRYSTAL_NOTES[i] * 1.5, 0.6, 0.05, 'sine');
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top);
    for (let k = 0; k < 14; k++) spawnSparkle(c.x, c.y, { speed: 120 });
}

function mermaidSing(node) {
    const notes = [659, 784, 880, 1047, 880, 784, 659, 784];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.35, 0.12, 'sine'), i * 220));
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top);
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const n = tempEl(`<div class="magic-fly">${randomPick(['🎵', '🎶', '💖', '✨'])}</div>`, c.x - 18, c.y, 3300);
            n.style.setProperty('--dx', ((Math.random() - 0.5) * 200) + 'px');
            n.style.setProperty('--dy', (-120 - Math.random() * 120) + 'px');
        }, i * 200);
    }
}

function openSeaTreasure() {
    const tr = document.getElementById('seaTreasure');
    if (tr.classList.contains('open')) return;
    tr.classList.add('open');
    playWin();
    const r = tr.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top);
    ['💎', '👑', '🐚', '💍', '⭐'].forEach((e, i) => {
        const f = tempEl(`<div class="magic-fly">${e}</div>`, c.x - 18, c.y - 10, 3300);
        f.style.setProperty('--dx', ((i - 2) * 60) + 'px');
        f.style.setProperty('--dy', (-140 - Math.random() * 80) + 'px');
    });
    setTimeout(() => tr.classList.remove('open'), 4500);
}

function whaleSpout(node) {
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width * 0.3, r.top);
    playFreqSweep(200, 900, 0.6, 0.15);
    for (let i = 0; i < 60; i++) spawnSparkle(c.x, c.y, { vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 200, g: -40, size: 5 + Math.random() * 8, max: 1.8 });
}

function octopusInk(node) {
    node.classList.remove('wave'); void node.offsetWidth; node.classList.add('wave');
    playFreqSweep(500, 120, 0.4, 0.15);
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    for (let i = 0; i < 40; i++) spawnSparkle(c.x, c.y, { speed: 160, hue: 270, size: 8 + Math.random() * 8 });
}

