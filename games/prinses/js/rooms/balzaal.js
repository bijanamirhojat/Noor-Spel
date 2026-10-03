/* 💃 Balzaal */
defineRoom({
    key: 'balzaal',
    name: 'Balzaal',
    icon: '💃',
    say: 'De balzaal',
    build(rb) {
        place(el('<div class="garland-balloons">🎈🎀🎈🎀🎈🎀🎈🎀🎈🎀🎈🎀🎈🎀🎈</div>'), rb + 30, 60);
        [100, 330, 590].forEach(x => place(el('<div class="ball-window"></div>'), rb + x, 110));
        place(el('<div class="chandelier"><div class="chain"></div><div class="candles">🕯️🕯️🕯️</div><div class="body"></div><div class="drops">💎💎💎💎</div></div>'), rb + 200, 10);
        place(el('<div class="chandelier"><div class="chain"></div><div class="candles">🕯️🕯️🕯️</div><div class="body"></div><div class="drops">💎💎💎💎</div></div>'), rb + 460, 10);
        state.tiles = [];
        const tileColors = ['#f472b6', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#fb923c'];
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 10; col++) {
                const t = place(el('<div class="tile"></div>'), rb + BALL_TILE_X0 + col * 50, 400 + row * 50);
                t.style.setProperty('--c', tileColors[(col + row * 3) % tileColors.length]);
                state.tiles.push({ node: t, col, row, until: 0, on: false });
            }
        }
        addObj(`<div class="orchestra">
            <div class="stage"></div>
            <span class="inst" style="left:4px">🎻</span>
            <span class="inst" style="left:60px">🎹</span>
            <span class="inst" style="left:116px">🎺</span>
            <span class="notes">🎶</span>
        </div>`, rb + 10, 262, rb + 110, toggleBallMusic);
        [['🐰', 690, 360], ['🦊', 740, 372], ['🐻', 30, 372]].forEach(([e, x, y]) =>
            addObj(`<div class="ball-guest">${e}</div>`, rb + x, y, rb + x, (node) => guestCheer(node)));
        addObj('<div class="cannon">🎉</div>', rb + 720, 250, rb + 700, confettiCannon);
        const prince = el(`<div class="prince" id="prince"><div class="dancer"><div class="pface">${princeSVG()}</div></div></div>`);
        world.appendChild(prince);
        prince.style.transform = `translate(${rb + 520 - PRINCESS_W / 2}px, ${FEET_Y - PRINCESS_H}px)`;
        prince.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (state.busy) return;
            walkTo(rb + 430, () => danceMove('bow'));
        });
    }
});

/* ─────────── Balzaal ─────────── */
function princeSVG() {
    return `
    <svg viewBox="0 0 100 160">
        <ellipse cx="50" cy="156" rx="28" ry="4" fill="rgba(0,0,0,0.18)"/>
        <g class="pbody">
            <path d="M30 64 Q20 110 26 140 L74 140 Q80 110 70 64 Z" fill="#dc2626"/>
            <rect x="38" y="108" width="10" height="42" rx="4" fill="#1e3a8a"/>
            <rect x="52" y="108" width="10" height="42" rx="4" fill="#1e3a8a"/>
            <ellipse cx="42" cy="152" rx="8" ry="4" fill="#111827"/>
            <ellipse cx="58" cy="152" rx="8" ry="4" fill="#111827"/>
            <path d="M34 64 L66 64 L70 114 L30 114 Z" fill="#3b82f6"/>
            <path d="M36 64 L64 108" stroke="#fcd34d" stroke-width="6"/>
            <circle cx="50" cy="80" r="2.2" fill="#fcd34d"/><circle cx="50" cy="92" r="2.2" fill="#fcd34d"/><circle cx="50" cy="104" r="2.2" fill="#fcd34d"/>
            <rect x="28" y="62" width="12" height="6" rx="3" fill="#fcd34d"/>
            <rect x="60" y="62" width="12" height="6" rx="3" fill="#fcd34d"/>
            <path d="M34 68 Q26 84 26 98" stroke="#3b82f6" stroke-width="8" stroke-linecap="round" fill="none"/>
            <path d="M66 68 Q74 84 74 98" stroke="#3b82f6" stroke-width="8" stroke-linecap="round" fill="none"/>
            <circle cx="26" cy="100" r="4.5" fill="#fff"/>
            <circle cx="74" cy="100" r="4.5" fill="#fff"/>
            <rect x="46" y="54" width="8" height="10" fill="#ffd7c2"/>
            <circle cx="50" cy="40" r="17" fill="#ffe4d6"/>
            <path d="M33 38 Q33 20 50 21 Q67 20 67 38 Q62 30 50 31 Q40 30 33 38 Z" fill="#92400e"/>
            <ellipse cx="44" cy="42" rx="2.4" ry="3.2" fill="#1e1b4b"/>
            <ellipse cx="56" cy="42" rx="2.4" ry="3.2" fill="#1e1b4b"/>
            <circle cx="45" cy="40.8" r="0.9" fill="#fff"/><circle cx="57" cy="40.8" r="0.9" fill="#fff"/>
            <circle cx="40" cy="48" r="3" fill="#fda4af" opacity=".6"/>
            <circle cx="60" cy="48" r="3" fill="#fda4af" opacity=".6"/>
            <path d="M45 50 Q50 54 55 50" fill="none" stroke="#9f1239" stroke-width="2" stroke-linecap="round"/>
            <path d="M39 24 L41 14 L46 20 L50 12 L54 20 L59 14 L61 24 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="50" cy="19" r="2" fill="#3b82f6"/>
        </g>
    </svg>`;
}

let ballMusicOn = false;
let ballBeatTimer = null;
let ballBeat = 0;
const WALTZ = [
    [523, 131], [659, 0], [784, 0], [784, 98], [0, 0], [659, 0],
    [659, 131], [784, 0], [1047, 0], [1047, 98], [0, 0], [988, 0],
    [587, 147], [698, 0], [880, 0], [880, 110], [0, 0], [698, 0],
    [698, 98], [880, 0], [1175, 0], [1047, 131], [988, 0], [784, 0]
];

function ballBeatStep() {
    const [mel, bass] = WALTZ[ballBeat % WALTZ.length];
    if (mel) playTone(mel, 0.32, 0.09, 'triangle');
    if (bass) playTone(bass, 0.5, 0.14, 'sine');
    if (ballBeat % 3 !== 0) playTone(bass ? bass * 2 : 262, 0.1, 0.04, 'sine');
    ballBeat++;
    // Light a few random tiles on every beat
    const now = performance.now();
    for (let k = 0; k < 3; k++) {
        const t = randomPick(state.tiles);
        t.until = now + 380;
    }
}

function startBallMusic() {
    if (ballMusicOn) return;
    ballMusicOn = true;
    ballBeat = 0;
    sceneOf('balzaal').el.classList.add('music');
    ballBeatStep();
    ballBeatTimer = setInterval(ballBeatStep, 400);
}

function stopBallMusic() {
    if (!ballMusicOn) return;
    ballMusicOn = false;
    sceneOf('balzaal').el.classList.remove('music');
    clearInterval(ballBeatTimer);
}

function toggleBallMusic() {
    if (ballMusicOn) {
        stopBallMusic();
    } else {
        startBallMusic();
        sparkleShower(roomX('balzaal') + 100, 200, 30);
    }
}

function inBallroom() {
    return inRoom('balzaal');
}

function updateBallroom() {
    const inBall = inBallroom();
    document.getElementById('danceBar').classList.toggle('show', inBall);
    if (inBall) startBallMusic();
    else stopBallMusic();
}

function updateTiles(now) {
    if (!inBallroom()) return;
    const col = Math.floor((state.x - roomX('balzaal') - BALL_TILE_X0) / 50);
    state.tiles.forEach(t => {
        if (t.col === col && t.row === 1 && state.alt === 0) t.until = Math.max(t.until, now + 300);
        const on = now < t.until;
        if (on !== t.on) {
            t.on = on;
            t.node.classList.toggle('lit', on);
        }
    });
}

const DANCE_MOVES = ['spin', 'jump', 'sway', 'cartwheel', 'bow'];

function danceMove(kind) {
    if (state.busy) return;
    const dancers = [princessEl().querySelector('.dancer'), document.querySelector('#prince .dancer')];
    dancers.forEach(d => {
        if (!d) return;
        DANCE_MOVES.forEach(m => d.classList.remove('move-' + m));
        void d.offsetWidth;
        d.classList.add('move-' + kind);
        clearTimeout(d._t);
        d._t = setTimeout(() => d.classList.remove('move-' + kind), 1250);
    });
    // Prince turns to face the princess
    const prince = document.getElementById('prince');
    if (prince) prince.classList.toggle('left', state.x < roomX('balzaal') + 520);

    const sounds = {
        spin: () => playFreqSweep(400, 1600, 0.8, 0.12),
        jump: () => { playFreqSweep(300, 900, 0.25, 0.15); setTimeout(() => playFreqSweep(300, 800, 0.25, 0.12), 500); },
        sway: () => [659, 784, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.1), i * 240)),
        cartwheel: () => playFreqSweep(1400, 300, 0.9, 0.12),
        bow: () => playCorrect()
    };
    sounds[kind]();
    burst(state.x, 320, 30);
    if (kind === 'spin') {
        for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2;
            spawnSparkle(state.x + Math.cos(a) * 70, 360 + Math.sin(a) * 30, { vx: Math.cos(a) * 120, vy: -60, g: 60 });
        }
    }
    const now = performance.now();
    state.tiles.forEach((t, i) => { t.until = now + 150 + ((i * 37) % 400); });
    document.querySelectorAll('.ball-guest').forEach((g, i) => setTimeout(() => guestCheer(g), i * 120));
    state.danceCount = (state.danceCount || 0) + 1;
    if (state.danceCount % 8 === 0) {
        showToast('💃 Wat kun jij mooi dansen! 🤴');
        playWin();
        confettiCannon();
    }
}

document.querySelectorAll('.dance-btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        danceMove(btn.dataset.m);
    });
});

function guestCheer(node) {
    node.classList.remove('cheer');
    void node.offsetWidth;
    node.classList.add('cheer');
    setTimeout(() => node.classList.remove('cheer'), 600);
}

function confettiCannon() {
    const x = roomX('balzaal') + 730;
    playFreqSweep(200, 60, 0.25, 0.3);
    setTimeout(playSparkleSound, 150);
    for (let i = 0; i < 90; i++) {
        spawnSparkle(x, 270, {
            vx: -120 - Math.random() * 420,
            vy: -250 - Math.random() * 300,
            g: 420,
            size: 5 + Math.random() * 6,
            max: 1.6 + Math.random() * 0.8
        });
    }
}
