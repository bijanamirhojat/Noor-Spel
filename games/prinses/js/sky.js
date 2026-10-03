/* ─────────── Wolkenrijk ───────────
   Een eigen wereld (scene 'wolken') hoog in de lucht, met de kamers uit js/wolken/*.js.
   Erheen: met de vliegende eenhoorn naar de gouden wolk boven de eenhoornweide.
   Terug: met de regenboogglijbaan op de wolkenpoort. */
const PORTAL_X = ROOM_W * 3 + 640;   // above the eenhoornweide (outside), right of its room sign

function buildSky() {
    buildRooms('w-room');
    for (let i = 0; i < 10; i++) {
        const c = place(el('<div class="cloud sky-cloud"></div>'), 40 + i * 240 + Math.random() * 80, -420 + Math.random() * 380);
        c.style.animationDelay = (-Math.random() * 9) + 's';
        c.style.transform = `scale(${0.6 + Math.random() * 0.6})`;
    }
    ROOMS.forEach((room, i) => room.build(i * ROOM_W));
}

// The golden cloud in the sky of the outside world (built from buildOutside)
function buildCloudPortal() {
    const node = el(`<div class="sky-portal">
        <div class="sp-castle"><span></span><span></span><span></span></div>
        <div class="sp-cloud"></div>
        <div class="sp-hint">🦄</div>
    </div>`);
    world.appendChild(node);
    node.style.left = (PORTAL_X - 110) + 'px';
    node.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (state.busy) return;
        playPop();
        if (!state.riding) {
            // Point the way: you need the unicorn to fly up there
            showToast('🦄 Vlieg erheen met de eenhoorn!', 2000);
            const u = unicornEl();
            u.classList.remove('nudge'); void u.offsetWidth; u.classList.add('nudge');
            sparkleShower(state.uniX, 250, 30);
            return;
        }
        if (!state.flying) setFlying(true, true);
        state.targetX = clampX(PORTAL_X);
        state.targetAlt = maxAlt();
    });
    state.skyPortal = node;
}

// Keep the portal at the top of whatever part of the sky is visible
function updateCloudPortal() {
    const p = state.skyPortal;
    if (!p) return;
    const top = Math.round(-state.offsetY / state.scale + 6);
    if (p._top !== top) { p._top = top; p.style.top = top + 'px'; }
    p.classList.toggle('near', state.flying);
}

function checkCloudPortal() {
    if (state.busy || !state.flying) return;
    if (Math.abs(state.x - PORTAL_X) < 120 && state.alt > maxAlt() - 60) enterClouds();
}

function enterClouds() {
    state.busy = true;
    state.hold = 0;
    state.pending = null;
    const fade = document.getElementById('doorFade');
    [784, 988, 1175, 1568, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.09, 'sine'), i * 90));
    sparkleShower(state.x, 60, 60);
    fade.classList.add('show');
    setTimeout(() => {
        dismountUnicorn(true);
        state.uniX = PORTAL_X;
        setScene('wolken');
        state.x = state.targetX = scene.arriveX;
        state.facing = 1;
        if (state.pet.following) state.pet.x = state.x - 90;
        state.camX = Math.max(0, Math.min(Math.max(0, WORLD_W - state.viewW), state.x - state.viewW / 2));
        // Float down onto the cloud
        state.anim.dy = -260;
    }, 450);
    setTimeout(() => {
        fade.classList.remove('show');
        tween(900, (t) => { state.anim.dy = -260 * (1 - ease(t)); }, () => {
            resetAnim();
            burst(state.x, 400, 40);
            playWin();
            showToast('☁️ Het wolkenkasteel!', 1800);
            state.busy = false;
        });
    }, 600);
}

// Down the rainbow slide, back to the unicorn on the eenhoornweide
function slideToEarth() {
    if (state.busy) return;
    state.busy = true;
    state.facing = 1;
    const fade = document.getElementById('doorFade');
    playFreqSweep(1400, 300, 1.2, 0.14);
    tween(1100, (t) => {
        state.anim.dx = 160 * t;
        state.anim.dy = -40 * Math.sin(Math.PI * t * 0.6) + 260 * t * t;
        state.anim.rot = 18 * t;
        spawnSparkle(state.x + state.anim.dx - 20, FEET_Y - 40 + state.anim.dy, { hue: (t * 360) % 360, g: 30, speed: 40 });
    }, () => {
        fade.classList.add('show');
        setTimeout(() => {
            resetAnim();
            setScene('out');
            state.alt = state.targetAlt = 0;
            state.x = state.targetX = PORTAL_X - 140;
            state.facing = 1;
            if (state.pet.following) state.pet.x = state.x - 90;
            state.camX = Math.max(0, Math.min(Math.max(0, WORLD_W - state.viewW), state.x - state.viewW / 2));
            state.anim.dy = -300;
        }, 400);
        setTimeout(() => {
            fade.classList.remove('show');
            tween(700, (t) => { state.anim.dy = -300 * (1 - t * t); state.anim.rot = 360 * t; }, () => {
                resetAnim();
                burst(state.x, 420, 50);
                playCorrect();
                state.busy = false;
            });
        }, 550);
    });
}
