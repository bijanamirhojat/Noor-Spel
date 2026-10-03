/* 🏊 Zwembad: glijbaan, duikplank en zwemmen */
const POOL_X0 = 250;       // linkerrand van het water (t.o.v. de kamer)
const POOL_X1 = 650;
const POOL_SURF = 322;     // waterlijn
const POOL_SWIM_DY = -24;  // prinses staat tot haar middel in het water
const DIVE_BOARD_Y = 236;  // bovenkant van de duikplank
const DIVES = [
    { name: 'Salto', icon: '🤸', rot: -360 },
    { name: 'Bommetje', icon: '💣', rot: 0, bomb: true },
    { name: 'Sterrensprong', icon: '⭐', rot: -360, stars: true },
    { name: 'Pirouette', icon: '💃', rot: 0, spin: true },
    { name: 'Dubbele salto', icon: '🌀', rot: -720 }
];
let diveIdx = 0;

defineRoom({
    key: 'zwembad',
    name: 'Zwembad',
    icon: '🏊',
    say: 'Het zwembad',
    build(x) {
        place(el('<div class="pool-sun">☀️</div>'), x + 160, 40);
        place(el('<div class="dive-score" id="diveScore">🏊 Spring maar!</div>'), x + 330, 130);
        place(el(`<div class="pool-back">
            <div class="pool-water"></div>
            <div class="pool-rim"></div>
            ${[60, 150, 250, 340].map((l, i) => `<span class="pool-bubble" style="left:${l}px;animation-delay:${i * -0.9}s"></span>`).join('')}
        </div>`), x + POOL_X0 - 12, POOL_SURF - 22);
        place(el('<div class="pool-cover" id="poolCover"></div>'), x + POOL_X0, POOL_SURF + 2);
        place(el('<div class="pool-float">🦩</div>'), x + 520, POOL_SURF - 52);
        addObj('<div class="pool-hit"><div class="tap-hint" style="left:180px;top:-40px">👇</div></div>', x + POOL_X0 + 40, POOL_SURF - 30, x + 450, poolSwim);
        addObj(`<div class="pool-slide"><svg viewBox="0 0 280 272" width="280" height="272">
            <defs><linearGradient id="poolSlideGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f472b6"/><stop offset=".5" stop-color="#facc15"/><stop offset="1" stop-color="#38bdf8"/>
            </linearGradient></defs>
            <line x1="20" y1="14" x2="20" y2="272" stroke="#e2e8f0" stroke-width="8" stroke-linecap="round"/>
            <line x1="60" y1="14" x2="60" y2="272" stroke="#e2e8f0" stroke-width="8" stroke-linecap="round"/>
            ${[50, 90, 130, 170, 210, 250].map(y => `<line x1="20" y1="${y}" x2="60" y2="${y}" stroke="#cbd5e1" stroke-width="6"/>`).join('')}
            <line x1="185" y1="110" x2="185" y2="272" stroke="#e2e8f0" stroke-width="8"/>
            <rect x="8" y="14" width="88" height="14" rx="6" fill="#f472b6"/>
            <path class="sl" d="M80 30 C140 30 160 90 195 120 S 250 146 270 146" stroke="url(#poolSlideGrad)" stroke-width="24" fill="none" stroke-linecap="round"/>
            <path d="M80 20 C140 20 160 80 195 110 S 250 136 270 136" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>
        </svg><div class="tap-hint" style="left:20px;top:-30px">👇</div></div>`, x + 10, 180, x + 50, poolSlide);
        addObj(`<div class="dive-tower">
            <div class="dt-post" style="left:150px"></div><div class="dt-post" style="left:186px"></div>
            ${[40, 80, 120, 160, 200].map(t => `<div class="dt-rung" style="top:${t}px"></div>`).join('')}
            <div class="dt-board" id="diveBoard"></div>
            <div class="tap-hint" style="left:150px;top:-50px">👇</div>
        </div>`, x + 560, DIVE_BOARD_Y, x + 725, poolDive);
        addObj('<div class="emoji-obj pool-ring">🛟</div>', x + 670, 90, x + 680, (node) => {
            node.classList.remove('wiggle'); void node.offsetWidth; node.classList.add('wiggle');
            playFreqSweep(500, 900, 0.25, 0.12);
        });
    }
});

function poolCover(on) { document.getElementById('poolCover').classList.toggle('show', on); }

// Climb out of the water towards the front, dripping
function poolClimbOut(done) {
    tween(650, (t) => {
        state.anim.dy = POOL_SWIM_DY * (1 - t) - Math.sin(Math.PI * t) * 50;
        state.anim.rot = 0;
        if (t > 0.45) poolCover(false);
    }, () => {
        resetAnim();
        state.targetX = state.x;
        for (let i = 0; i < 24; i++) {
            spawnSparkle(state.x + (Math.random() - 0.5) * 70, FEET_Y - 40 - Math.random() * 120, { vx: 0, vy: 60 + Math.random() * 60, g: 300, hue: 195, size: 3 + Math.random() * 2, max: 0.8 });
        }
        if (done) done();
        state.busy = false;
    });
}

// Swim along to x1 with splashy strokes
function poolSwimTo(x1, dur, done) {
    const x0 = state.x;
    state.facing = x1 >= x0 ? 1 : -1;
    let strokeT = 0;
    tween(dur, (t, now) => {
        state.x = state.targetX = x0 + (x1 - x0) * ease(t);
        state.anim.dy = POOL_SWIM_DY + Math.sin(t * Math.PI * 8) * 4;
        state.anim.rot = Math.sin(t * Math.PI * 8) * 5;
        if (now - strokeT > 380) {
            strokeT = now;
            playFreqSweep(900, 400, 0.12, 0.06);
            for (let k = 0; k < 6; k++) {
                spawnSparkle(state.x + (Math.random() - 0.5) * 70, POOL_SURF, { vx: (Math.random() - 0.5) * 120, vy: -80 - Math.random() * 80, g: 400, hue: 190 + Math.random() * 20, max: 0.7 });
            }
        }
    }, done);
}

function poolSwim() {
    if (state.busy) return;
    state.busy = true;
    const rx = roomX('zwembad');
    playFreqSweep(300, 800, 0.3, 0.15);
    tween(600, (t) => {
        state.anim.dy = POOL_SWIM_DY * t - Math.sin(Math.PI * t) * 60;
        if (t > 0.5) poolCover(true);
    }, () => {
        splash(state.x, POOL_SURF);
        [523, 659, 784, 659, 880, 784, 659, 523].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.08, 'sine'), 200 + i * 330));
        poolSwimTo(rx + POOL_X0 + 70, 1400, () => poolSwimTo(rx + POOL_X1 - 70, 1500, () => poolSwimTo(rx + 450, 900, () => {
            poolClimbOut(() => {
                sparkleShower(state.x, 150, 30);
                playCorrect();
                showToast('🏊 Lekker gezwommen!');
            });
        })));
    });
}

function poolSlide(node) {
    if (state.busy) return;
    state.busy = true;
    state.facing = 1;
    const rx = roomX('zwembad');
    const path = node.querySelector('path.sl');
    const len = path.getTotalLength();
    // svg local -> world: the slide node sits at (rx + 10, 180)
    const at = (d) => { const p = path.getPointAtLength(d); return { x: rx + 10 + p.x, y: 180 + p.y - 10 }; };
    const top = at(0);
    const climbDy = top.y - FEET_Y;
    tween(1500, (t) => {
        state.anim.dy = climbDy * t + Math.sin(t * Math.PI * 10) * 4;
        if (Math.random() < 0.08) playTone(500 + t * 400, 0.05, 0.06, 'triangle');
    }, () => {
        playFreqSweep(1300, 250, 1.1, 0.15);
        const x0 = state.x;
        tween(1100, (t) => {
            const p = at(len * (t * t));
            state.x = state.targetX = x0 + (p.x - x0) * Math.min(1, t * 4);
            state.anim.dy = p.y - FEET_Y;
            state.anim.rot = 14 * Math.sin(Math.PI * t);
            spawnSparkle(state.x - 30, p.y - 20, { vx: -90, vy: -30, g: 30, size: 6, hue: Math.random() * 360 });
            if (t > 0.8) poolCover(true);
        }, () => {
            const sx = state.x;
            splash(sx, POOL_SURF);
            splash(sx + 40, POOL_SURF);
            const y0 = state.anim.dy;
            tween(500, (t) => {
                state.x = state.targetX = sx + 60 * ease(t);
                state.anim.dy = y0 + (POOL_SWIM_DY - y0) * ease(t);
                state.anim.rot = 14 * (1 - t);
            }, () => poolSwimTo(rx + 430, 1300, () => poolClimbOut(() => {
                sparkleShower(state.x, 150, 40);
                playWin();
                showToast('🛝 Wieee! De glijbaan!');
            })));
        });
    });
}

function poolDive() {
    if (state.busy) return;
    state.busy = true;
    const rx = roomX('zwembad');
    const pr = princessEl();
    const board = document.getElementById('diveBoard');
    const dive = DIVES[diveIdx++ % DIVES.length];
    const standDy = DIVE_BOARD_Y - FEET_Y;
    state.facing = -1;
    tween(1300, (t) => {
        state.anim.dy = standDy * t + Math.sin(t * Math.PI * 9) * 4;
        if (Math.random() < 0.08) playTone(500 + t * 400, 0.05, 0.06, 'triangle');
    }, () => {
        // Walk to the end of the board
        const x0 = state.x;
        const xEnd = rx + 600;
        pr.classList.add('walking');
        tween(800, (t) => {
            state.x = state.targetX = x0 + (xEnd - x0) * t;
        }, () => {
            pr.classList.remove('walking');
            board.classList.remove('boing'); void board.offsetWidth; board.classList.add('boing');
            [0, 330].forEach(d => setTimeout(() => playFreqSweep(300, 700, 0.18, 0.12), d));
            tween(700, (t) => {
                state.anim.dy = standDy + Math.sin(t * Math.PI * 4) * 16;
            }, () => {
                // Jump!
                playFreqSweep(400, 1400, 0.4, 0.15);
                const jx0 = state.x;
                const jx1 = rx + 470;
                const y0 = DIVE_BOARD_Y;
                const y1 = POOL_SURF + 40;
                let spinT = 0;
                tween(1100, (t, now) => {
                    state.x = state.targetX = jx0 + (jx1 - jx0) * t;
                    const fy = y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * 80;
                    state.anim.dy = fy - FEET_Y;
                    state.anim.rot = dive.rot * ease(t);
                    if (dive.spin && now - spinT > 400) {
                        spinT = now;
                        pr.classList.remove('twirl'); void pr.offsetWidth; pr.classList.add('twirl');
                    }
                    const n = dive.stars ? 3 : 1;
                    for (let k = 0; k < n; k++) {
                        spawnSparkle(state.x + (Math.random() - 0.5) * 50, fy - 90 + (Math.random() - 0.5) * 60, {
                            speed: 40, size: dive.stars ? 9 : 5, hue: dive.stars ? 45 + Math.random() * 15 : Math.random() * 360
                        });
                    }
                    if (t > 0.7) poolCover(true);
                }, () => {
                    pr.classList.remove('twirl');
                    // Under water for a moment
                    splash(state.x, POOL_SURF);
                    if (dive.bomb) {
                        splash(state.x - 50, POOL_SURF);
                        splash(state.x + 50, POOL_SURF);
                        for (let i = 0; i < 60; i++) {
                            spawnSparkle(state.x + (Math.random() - 0.5) * 120, POOL_SURF, { vx: (Math.random() - 0.5) * 360, vy: -200 - Math.random() * 300, g: 420, hue: 190 + Math.random() * 30, size: 4 + Math.random() * 4, max: 1.3 });
                        }
                        playTone(90, 0.4, 0.3, 'sine');
                    }
                    pr.style.transition = 'opacity 0.2s';
                    pr.style.opacity = '0.15';
                    state.anim.rot = 0;
                    const bub = setInterval(() => {
                        spawnSparkle(state.x + (Math.random() - 0.5) * 40, POOL_SURF + 70, { vx: 0, vy: -90, g: -20, hue: 195, size: 5 + Math.random() * 5, max: 1 });
                        playTone(700 + Math.random() * 500, 0.04, 0.04, 'sine');
                    }, 90);
                    tween(900, (t) => {
                        state.anim.dy = POOL_SURF + 60 - FEET_Y + (POOL_SWIM_DY - (POOL_SURF + 60 - FEET_Y)) * ease(t);
                    }, () => {
                        clearInterval(bub);
                        pr.style.opacity = '';
                        setTimeout(() => { pr.style.transition = ''; }, 250);
                        splash(state.x, POOL_SURF);
                        showDiveScore(dive);
                        poolSwimTo(rx + 430, 900, () => poolClimbOut());
                    });
                });
            });
        });
    });
}

function showDiveScore(dive) {
    const s = document.getElementById('diveScore');
    s.innerHTML = `${dive.icon} ${dive.name}!<br><b>10</b> <b>10</b> <b>10</b>`;
    s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop');
    playWin();
    const r = s.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    sparkleShower(p.x, p.y, 30);
}
