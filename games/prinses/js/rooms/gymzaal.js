/* 🤸 Gymzaal: de prinses gymt zelf op de toestellen: trampoline (met een salto), klimtouw (bel luiden),
   evenwichtsbalk, ringen (zwaaien en eraf springen) en radslagen op de mat.
   Na elke oefening houdt de jury drie tienen omhoog; het aantal oefeningen staat op het scorebord
   en in noor-prinses-gym. */
const GY_KEY = 'noor-prinses-gym';
let gyCount = 0;
try { gyCount = +localStorage.getItem(GY_KEY) || 0; } catch { /* geen opslag */ }

const GY_CENTER = `${PRINCESS_W / 2}px ${PRINCESS_H / 2}px`;
const GY_ON_TRAMP = -44;     // feet on the trampoline bed
// x 0-200 is for the lift (first room of its floor)
const GY_ROPE = 225, GY_TRAMP = 350, GY_BEAM = [480, 600], GY_RINGS = 705, GY_MAT = [650, 760];

defineRoom({
    key: 'gymzaal',
    name: 'Gymzaal',
    icon: '🤸',
    say: 'De gymzaal. Lekker bewegen!',
    lampX: 530,
    build(x) {
        place(el('<div class="gy-bars">' + '<i></i>'.repeat(8) + '</div>'), x + 270, 120);
        place(el(`<div class="gy-board"><span>🏅</span><b id="gyScore">${gyCount}</b></div>`), x + 490, 140);
        addObj('<div class="gy-rope"><span class="bell">🔔</span><div class="cord"></div><div class="knot"></div></div>',
            x + GY_ROPE - 30, 0, x + GY_ROPE, gyRope);
        addObj(`<div class="gy-tramp"><div class="bed"></div><div class="frame"></div><i style="left:14px"></i><i style="right:14px"></i>
            <div class="tap-hint" style="left:70px;top:-60px">👇</div></div>`, x + GY_TRAMP - 90, 404, x + GY_TRAMP, gyTramp);
        addObj('<div class="gy-beam"><div class="top"></div><i style="left:20px"></i><i style="right:20px"></i></div>',
            x + GY_BEAM[0] - 10, 392, x + GY_BEAM[0], gyBeam);
        addObj('<div class="gy-mat"></div>', x + GY_MAT[0] - 20, 444, x + GY_MAT[0], gyCartwheel);
        addObj('<div class="gy-rings"><div class="ln l"></div><div class="ln r"></div><span class="ring l"></span><span class="ring r"></span></div>',
            x + GY_RINGS - 40, 0, x + GY_RINGS, gyRings);
    }
});

// The jury holds up three tens, everyone claps
function gyDone() {
    resetAnim();
    state.targetX = state.x;
    gyCount++;
    try { localStorage.setItem(GY_KEY, gyCount); } catch { /* geen opslag */ }
    const sc = document.getElementById('gyScore');
    sc.textContent = gyCount;
    bounceEl(sc.parentNode, 'pulse');
    const cards = place(el('<div class="gy-cards"><span>10</span><span>10</span><span>10</span></div>'), state.x - 75, FEET_Y - PRINCESS_H - 80);
    setTimeout(() => cards.remove(), 2200);
    startNoise('applause');
    setTimeout(stopNoise, 1600);
    playCorrect();
    burst(state.x, FEET_Y - PRINCESS_H, 40);
    if (gyCount % 5 === 0) setTimeout(() => showToast(`🥇 ${gyCount}x gegymd!`), 600);
    state.busy = false;
}

function gyBoing(f = 300) {
    playFreqSweep(f, f * 2.6, 0.25, 0.12);
}

function gyTramp() {
    state.busy = true;
    state.facing = 1;
    state.x = roomX('gymzaal') + GY_TRAMP;
    const bed = document.querySelector('.gy-tramp .bed');
    const heights = [40, 70, 110, 150, 190, 80];
    const hop = (i) => {
        if (i >= heights.length) {
            const xs = state.x;
            return tween(500, (t) => {
                state.x = xs + 120 * t;
                state.anim.dy = GY_ON_TRAMP * (1 - t) - 60 * Math.sin(Math.PI * t);
            }, gyDone);
        }
        const h = heights[i], salto = i === 4;
        zooAnim(bed, 'squish');
        gyBoing(260 + i * 60);
        state.anim.origin = GY_CENTER;
        tween(420 + h * 2, (t) => {
            state.anim.dy = GY_ON_TRAMP * (i ? 1 : t) - h * Math.sin(Math.PI * t) + 14 * Math.max(0, 1 - t * 8);
            state.anim.rot = salto ? 360 * ease(Math.min(1, Math.max(0, (t - 0.15) / 0.7))) : 0;
            if (salto && Math.random() < 0.6) spawnSparkle(state.x, FEET_Y - PRINCESS_H / 2 + state.anim.dy, { speed: 60 });
        }, () => {
            state.anim.rot = 0;
            hop(i + 1);
        });
    };
    hop(0);
}

function gyRope() {
    state.busy = true;
    state.x = roomX('gymzaal') + GY_ROPE;
    const top = -(FEET_Y - PRINCESS_H - 30);
    tween(2400, (t) => {
        state.anim.dy = top * t;
        state.anim.rot = Math.sin(t * Math.PI * 10) * 4;
        if (Math.random() < 0.08) playTone(300 + t * 500, 0.05, 0.06, 'triangle');
    }, () => {
        const bell = document.querySelector('.gy-rope .bell');
        zooAnim(bell, 'ring');
        [1568, 1318, 1568, 1318].forEach((f, i) => setTimeout(() => playTone(f, 0.4, 0.12, 'sine'), i * 160));
        sparkleShower(state.x, 30, 20);
        setTimeout(() => {
            playFreqSweep(900, 250, 0.8, 0.1);
            tween(800, (t) => { state.anim.dy = top * (1 - t * t); state.anim.rot = 0; }, gyDone);
        }, 900);
    });
}

function gyBeam() {
    state.busy = true;
    state.facing = 1;
    const x0 = roomX('gymzaal') + GY_BEAM[0], x1 = roomX('gymzaal') + GY_BEAM[1];
    state.x = x0;
    const up = -60;
    gyBoing();
    tween(450, (t) => { state.anim.dy = up * t - 50 * Math.sin(Math.PI * t); }, () => {
        let step = 0;
        tween(3200, (t) => {
            state.x = x0 + (x1 - x0) * t;
            state.anim.dy = up;
            state.anim.rot = Math.sin(t * Math.PI * 7) * 7;
            const s = Math.floor(t * 12);
            if (s !== step) { step = s; playTone(500 + (s % 2) * 120, 0.06, 0.07, 'triangle'); }
        }, () => {
            twirl();
            gyBoing(400);
            const xs = state.x;
            tween(600, (t) => {
                state.x = xs + 60 * t;
                state.anim.rot = 0;
                state.anim.dy = up * (1 - t) - 90 * Math.sin(Math.PI * t);
            }, gyDone);
        });
    });
}

function gyCartwheel() {
    state.busy = true;
    state.facing = 1;
    const x0 = roomX('gymzaal') + GY_MAT[0], x1 = roomX('gymzaal') + GY_MAT[1];
    state.x = x0;
    state.anim.origin = GY_CENTER;
    const go = (from, to, dir, done) => {
        playFreqSweep(500, 1000, 0.5, 0.08);
        state.facing = dir;
        tween(900, (t) => {
            state.x = from + (to - from) * ease(t);
            state.anim.rot = dir * 360 * ease(t);
            state.anim.dy = -30 * Math.sin(Math.PI * t);
            if (Math.random() < 0.4) spawnSparkle(state.x, FEET_Y - 20, { speed: 50 });
        }, done);
    };
    go(x0, x1, 1, () => setTimeout(() => go(x1, x0, -1, gyDone), 200));
}

function gyRings() {
    state.busy = true;
    state.facing = 1;
    state.x = roomX('gymzaal') + GY_RINGS;
    const rings = document.querySelector('.gy-rings');
    const lift = -80;
    const pivot = `${PRINCESS_W / 2}px ${-(FEET_Y - PRINCESS_H + lift)}px`;
    gyBoing();
    tween(400, (t) => { state.anim.dy = lift * t; }, () => {
        state.anim.origin = pivot;
        tween(3600, (t) => {
            const rot = 26 * Math.sin(Math.PI * Math.min(1, t * 1.4)) * Math.sin(t * Math.PI * 2 * 3);
            state.anim.dy = lift;
            state.anim.rot = rot;
            rings.style.transform = `rotate(${rot}deg)`;
            if (Math.random() < 0.3) spawnSparkle(state.x, 200, { speed: 40, g: 20 });
        }, () => {
            rings.style.transform = '';
            state.anim.origin = GY_CENTER;
            playFreqSweep(400, 1400, 0.6, 0.1);
            tween(800, (t) => {
                state.anim.rot = 360 * ease(t);
                state.anim.dy = lift * (1 - t) - 110 * Math.sin(Math.PI * t);
            }, gyDone);
        });
    });
}
