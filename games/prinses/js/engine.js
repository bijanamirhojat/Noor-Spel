/* ─────────── Gems ─────────── */
function spawnGems() {
    scene.gems.forEach(g => g.node.remove());
    scene.gems = [];
    scene.gemsGot = 0;
    const kinds = scene.key === 'sea' ? ['🐚', '🦪', '💎', '🌟', '🐚'] : scene.key === 'wolken' ? ['⭐', '🌟', '💫', '⭐', '💖'] : ['💎', '💎', '💎', '⭐', '💖', '🌟'];
    const n = scene.gemCount;
    for (let i = 0; i < n; i++) {
        const x = 120 + (i + Math.random() * 0.6) * ((WORLD_W - 240) / n);
        const y = scene.key === 'sea' ? 80 + Math.random() * 300 : 330 + Math.random() * 70;
        const node = el(`<div class="gem">${randomPick(kinds)}</div>`);
        node.style.animationDelay = (-Math.random() * 1.6) + 's';
        place(node, x, y);
        scene.gems.push({ x, y, node, got: false });
    }
    updateGemPill();
}

function updateGemPill() {
    gemPill.textContent = `💎 ${scene.gemsGot} / ${scene.gemCount}`;
    gemPill.classList.add('bump');
    setTimeout(() => gemPill.classList.remove('bump'), 200);
}

function checkGems() {
    if (scene.key === 'sea') {
        const py = FEET_Y - 100 - state.alt;
        for (const g of scene.gems) {
            if (!g.got && Math.abs(g.x - state.x) < 50 && Math.abs(g.y + 20 - py) < 75) collectGem(g);
        }
        return;
    }
    if (state.alt > 60) return;
    for (const g of scene.gems) {
        if (!g.got && Math.abs(g.x - state.x) < 40) collectGem(g);
    }
}

function collectGem(g) {
    g.got = true;
    g.node.classList.add('got');
    scene.gemsGot++;
    burst(g.x, g.y + 20, 24);
    playGemChime(scene.gemsGot);
    updateGemPill();
    if (scene.gemsGot === scene.gemCount) {
        setTimeout(allGemsFound, 500);
    }
}

function playGemChime(n) {
    const base = [784, 880, 988, 1047, 1175, 1319];
    playTone(base[n % base.length], 0.18, 0.18, 'triangle');
    setTimeout(() => playTone(base[n % base.length] * 1.5, 0.22, 0.12, 'sine'), 70);
}

function allGemsFound() {
    playWin();
    speak('Jij bent de glitterprinses!');
    showToast('✨ Glitterprinses! ✨<br>💎💎💎');
    const sr = document.getElementById('screenRainbow');
    sr.classList.add('show');
    state.partyUntil = performance.now() + 5000;
    for (let i = 0; i < 6; i++) {
        setTimeout(() => sparkleShower(state.camX + Math.random() * state.viewW, 40, 40), i * 300);
    }
    setTimeout(() => {
        sr.classList.remove('show');
        spawnGems();
    }, 5000);
}

/* ─────────── Interactions ─────────── */
// True while any full-screen overlay (map, lift or a room activity) is open
function overlayOpen() { return scopeOpen || nailsOpen || teaOpen || careOpen || embOpen || dressOpen || dinOpen || mapOpen || liftOpen || stickOpen || marketOpen || iceOpen || weatherOpen || cloudOpen || hpOpen || dollOpen || sgOpen || smOpen || bakeOpen || beadOpen || giftOpen || teethOpen || elfOpen || salonOpen || fdOpen || pfOpen || pianoOpen || eggOpen || bqOpen || bugOpen; }

function sayRandom(list) {
    speak(randomPick(list));
}

let toastTimer = null;
function showToast(html, ms = 2200) {
    toastEl.innerHTML = html;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

function princessEl() { return document.getElementById('princess'); }

function twirl() {
    const p = princessEl();
    p.classList.remove('twirl');
    void p.offsetWidth;
    p.classList.add('twirl');
    setTimeout(() => p.classList.remove('twirl'), 800);
}

function catMeow() {
    playFreqSweep(700, 1000, 0.15, 0.2);
    setTimeout(() => playFreqSweep(1000, 600, 0.3, 0.2), 150);
    speak('Miauw!', { rate: 0.8, pitch: 1.8 });
}

function balloonPop(node) {
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    burst(p.x, p.y, 50);
    playFreqSweep(1200, 200, 0.12, 0.3);
    node.style.visibility = 'hidden';
    node.style.pointerEvents = 'none';
    setTimeout(() => {
        node.style.visibility = '';
        node.style.pointerEvents = '';
    }, 3000);
}

function playSparkleSound() {
    [1319, 1568, 1760, 2093, 2637].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.2, 0.1, 'sine'), i * 60);
    });
}

function playMelody() {
    const notes = [523, 659, 784, 1047, 784, 880, 1047, 1319, 1175, 1047, 880, 1047];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.28, 0.16, 'triangle'), i * 180));
}

/* ─────────── Movement ─────────── */
function clampX(x) {
    x = Math.max(60, Math.min(WORLD_W - 60, x));
    if (scene.key === 'out') {
        if (state.boating) x = Math.max(BOAT_HOME, Math.min(WORLD_W - 110, x));
        else if (!state.flying && x > LAKE_X0) x = LAKE_X0;
    }
    return x;
}

function walkTo(x, action) {
    state.targetX = clampX(x);
    state.pending = action;
    if (Math.abs(state.targetX - state.x) < 2 && action) {
        state.pending = null;
        action();
    }
}

function screenToWorld(clientX, clientY) {
    const r = playfield.getBoundingClientRect();
    return {
        x: state.camX + (clientX - r.left) / state.scale,
        y: (clientY - r.top - state.offsetY) / state.scale
    };
}

let dragId = null;
playfield.addEventListener('pointerdown', (e) => {
    if (state.busy || overlayOpen()) return;
    const p = screenToWorld(e.clientX, e.clientY);
    burst(p.x, p.y, 10);
    walkTo(p.x, null);
    if (state.flying || scene.key === 'sea') state.targetAlt = Math.max(0, Math.min(maxAlt(), FEET_Y - 110 - p.y));
    dragId = e.pointerId;
});
playfield.addEventListener('pointermove', (e) => {
    if (e.pointerId !== dragId || state.busy || overlayOpen()) return;
    const p = screenToWorld(e.clientX, e.clientY);
    walkTo(p.x, null);
    if (state.flying || scene.key === 'sea') state.targetAlt = Math.max(0, Math.min(maxAlt(), FEET_Y - 110 - p.y));
    if (Math.random() < 0.4) spawnSparkle(p.x, p.y, { speed: 60 });
});
const endDrag = (e) => { if (e.pointerId === dragId) dragId = null; };
playfield.addEventListener('pointerup', endDrag);
playfield.addEventListener('pointercancel', endDrag);

function bindHold(btn, dir) {
    const start = (e) => {
        e.preventDefault();
        e.stopPropagation();
        state.hold = dir;
        state.pending = null;
    };
    const stop = () => {
        if (state.hold === dir) {
            state.hold = 0;
            state.targetX = state.x;
        }
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('pointercancel', stop);
}
bindHold(document.getElementById('btnLeft'), -1);
bindHold(document.getElementById('btnRight'), 1);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { state.hold = -1; state.pending = null; }
    if (e.key === 'ArrowRight') { state.hold = 1; state.pending = null; }
    if (e.key === 'Escape' && scopeOpen) closeScope();
    if (e.key === 'Escape' && nailsOpen) closeNails();
    if (e.key === 'Escape' && teaOpen) closeTea();
    if (e.key === 'Escape' && careOpen) closeCare();
    if (e.key === 'Escape' && embOpen) closeEmbroid(false);
    if (e.key === 'Escape' && dressOpen) closeDressup();
    if (e.key === 'Escape' && dinOpen) closeDinner();
    if (e.key === 'Escape' && mapOpen) closeMap();
    if (e.key === 'Escape' && hpOpen) closeHeartPost();
    if (e.key === 'Escape' && dollOpen) closeDollhouse();
    if (e.key === 'Escape' && sgOpen) closeStarGame();
    if (e.key === 'Escape' && smOpen) closeSnowman();
    if (e.key === 'Escape' && bakeOpen) closeBakery();
    if (e.key === 'Escape' && beadOpen) closeBeads(false);
    if (e.key === 'Escape' && giftOpen) closeGifts();
    if (e.key === 'Escape' && teethOpen) closeTeeth();
    if (e.key === 'Escape' && elfOpen) closeElfGame();
    if (e.key === 'Escape' && salonOpen) closeSalon();
    if (e.key === 'Escape' && fdOpen) closeFamDinner();
    if (e.key === 'Escape' && pfOpen) closePerfume();
    if (e.key === 'Escape' && pianoOpen) closePiano();
    if (e.key === 'Escape' && eggOpen) closeEggs();
    if (e.key === 'Escape' && bqOpen) closeBouquet();
    if (e.key === 'Escape' && bugOpen) closeBugGame();
    if (e.key === ' ' || e.key === 't') castSpell();
});
document.addEventListener('keyup', (e) => {
    if ((e.key === 'ArrowLeft' && state.hold === -1) || (e.key === 'ArrowRight' && state.hold === 1)) {
        state.hold = 0;
        state.targetX = state.x;
    }
});

/* ─────────── Glitter particles ─────────── */
const particles = [];
const MAX_PARTICLES = 500;

function spawnSparkle(x, y, opts = {}) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    const a = Math.random() * Math.PI * 2;
    const sp = (opts.speed || 120) * (0.3 + Math.random() * 0.7);
    particles.push({
        x, y,
        vx: opts.vx !== undefined ? opts.vx : Math.cos(a) * sp,
        vy: opts.vy !== undefined ? opts.vy : Math.sin(a) * sp,
        g: opts.g !== undefined ? opts.g : 60,
        life: 0,
        max: opts.max || (0.7 + Math.random() * 0.9),
        size: opts.size || (4 + Math.random() * 7),
        hue: opts.hue !== undefined ? opts.hue : Math.random() * 360,
        spin: Math.random() * Math.PI,
        tw: Math.random() * 10
    });
}

function burst(x, y, n) {
    for (let i = 0; i < n; i++) spawnSparkle(x, y, { speed: 180 });
}

function sparkleShower(x, y, n) {
    for (let i = 0; i < n; i++) {
        spawnSparkle(x + (Math.random() - 0.5) * 300, y + Math.random() * 40, {
            vx: (Math.random() - 0.5) * 40,
            vy: 30 + Math.random() * 80,
            g: 40,
            max: 1.6 + Math.random() * 1.2
        });
    }
}

function drawHeartShape(x, y, r) {
    ctx2d.beginPath();
    ctx2d.moveTo(x, y + r * 0.9);
    ctx2d.bezierCurveTo(x - r * 1.7, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.45);
    ctx2d.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.7, y - r * 0.2, x, y + r * 0.9);
    ctx2d.fill();
}

function drawStar(x, y, r, rot) {
    ctx2d.beginPath();
    for (let i = 0; i < 8; i++) {
        const rad = i % 2 === 0 ? r : r * 0.28;
        const a = rot + (i * Math.PI) / 4;
        ctx2d.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx2d.closePath();
    ctx2d.fill();
}

function updateParticles(dt, now) {
    const party = now < state.partyUntil;

    // Ambient twinkles everywhere in view (snowflakes falling in the ice room)
    const snowy = inRoom('ijskamer');
    if (snowy) {
        for (let i = 0; i < 2; i++) {
            if (Math.random() > 0.6) continue;
            spawnSparkle(state.camX + Math.random() * state.viewW, -state.offsetY / state.scale - 10, {
                vx: (Math.random() - 0.5) * 30, vy: 40 + Math.random() * 40, g: 0, speed: 0,
                max: 5 + Math.random() * 3, size: 3 + Math.random() * 4
            });
        }
    }
    const ambient = snowy ? 0 : party ? 6 : 1.2;
    for (let i = 0; i < ambient; i++) {
        if (Math.random() < ambient - i) {
            spawnSparkle(state.camX + Math.random() * state.viewW, -state.offsetY / state.scale + Math.random() * (WORLD_H + state.offsetY / state.scale), {
                vx: 0, vy: party ? 40 : -8, g: 0, speed: 0,
                max: 0.8 + Math.random() * 0.8,
                size: party ? 5 + Math.random() * 8 : 3 + Math.random() * 4
            });
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.max) { particles.splice(i, 1); continue; }
        p.vy += (scene.key === 'sea' ? -Math.abs(p.g) * 0.4 - 30 : p.g) * dt;
        p.vx *= 0.98;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.spin += dt * 2;
    }
}

function drawParticles(now) {
    const dpr = window.devicePixelRatio || 1;
    ctx2d.setTransform(1, 0, 0, 1, 0, 0);
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    ctx2d.setTransform(dpr * state.scale, 0, 0, dpr * state.scale, -state.camX * state.scale * dpr, state.offsetY * dpr);
    const hearts = inRoom('hartjeskamer');
    const goldStars = inRoom('sterrenkamer');
    const bubbles = scene.key === 'sea';
    const snowflakes = inRoom('ijskamer');
    if (snowflakes) ctx2d.globalCompositeOperation = 'source-over';
    ctx2d.globalCompositeOperation = hearts ? 'source-over' : 'lighter';
    for (const p of particles) {
        const t = p.life / p.max;
        const alpha = Math.sin(Math.PI * t) * (0.6 + 0.4 * Math.sin(now / 90 + p.tw));
        const s = p.size * (0.6 + 0.4 * Math.sin(now / 120 + p.tw));
        if (snowflakes) {
            const a = Math.min(1, alpha * 1.6 + 0.2);
            ctx2d.beginPath();
            for (let k = 0; k < 3; k++) {
                const ang = p.spin + (k * Math.PI) / 3;
                ctx2d.moveTo(p.x - Math.cos(ang) * s, p.y - Math.sin(ang) * s);
                ctx2d.lineTo(p.x + Math.cos(ang) * s, p.y + Math.sin(ang) * s);
            }
            // Soft blue outline so white flakes show up against the pale ice walls
            ctx2d.strokeStyle = `rgba(14,165,233,${a * 0.55})`;
            ctx2d.lineWidth = 3.2;
            ctx2d.stroke();
            ctx2d.strokeStyle = `rgba(255,255,255,${a})`;
            ctx2d.lineWidth = 1.4;
            ctx2d.stroke();
            ctx2d.fillStyle = `rgba(186,230,253,${a * 0.8})`;
            ctx2d.beginPath();
            ctx2d.arc(p.x, p.y, s * 0.3, 0, Math.PI * 2);
            ctx2d.fill();
            continue;
        }
        if (bubbles) {
            ctx2d.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
            ctx2d.lineWidth = 1.4;
            ctx2d.beginPath();
            ctx2d.arc(p.x, p.y, s * 0.9, 0, Math.PI * 2);
            ctx2d.stroke();
            ctx2d.fillStyle = `rgba(207,250,254,${alpha * 0.35})`;
            ctx2d.fill();
            ctx2d.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx2d.beginPath();
            ctx2d.arc(p.x - s * 0.3, p.y - s * 0.3, s * 0.22, 0, Math.PI * 2);
            ctx2d.fill();
            continue;
        }
        if (hearts) {
            ctx2d.fillStyle = `hsla(${330 + (p.hue % 50)}, 95%, 62%, ${alpha})`;
            drawHeartShape(p.x, p.y, s * 1.1);
            ctx2d.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
            ctx2d.beginPath();
            ctx2d.arc(p.x - s * 0.35, p.y - s * 0.25, s * 0.22, 0, Math.PI * 2);
            ctx2d.fill();
            continue;
        }
        ctx2d.fillStyle = `hsla(${goldStars ? 42 + (p.hue % 16) : p.hue}, 100%, 72%, ${alpha})`;
        drawStar(p.x, p.y, goldStars ? s * 1.3 : s, p.spin);
        ctx2d.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
        drawStar(p.x, p.y, s * 0.45, p.spin);
    }
    ctx2d.globalCompositeOperation = 'source-over';
}

/* ─────────── Layout ─────────── */
function resize() {
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    state.scale = Math.min(h / WORLD_H, w / MIN_VIEW_W);
    state.viewW = w / state.scale;
    state.offsetY = h - WORLD_H * state.scale;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    if (scopeOpen) layoutScope();
}
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(playfield);

/* ─────────── Main loop ─────────── */
function frame(now) {
    const dt = Math.min(0.05, (now - state.lastTime) / 1000);
    state.lastTime = now;

    if (!overlayOpen() && !state.busy) {
        if (state.hold) {
            state.targetX = clampX(state.x + state.hold * 200);
        }
        const dx = state.targetX - state.x;
        const p = princessEl();
        const onIce = inRoom('ijskamer') && state.x > ICE_X0 && state.x < ICE_X1;
        p.classList.toggle('skating', onIce);
        const speed = state.riding ? RIDE_SPEED : state.boating ? 220 : onIce ? SPEED * 1.6 : SPEED;
        if (Math.abs(dx) > 1.5) {
            const step = Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
            state.x += step;
            state.facing = Math.sign(dx);
            p.classList.add('walking');
            if (onIce && Math.random() < 0.9) {
                spawnSparkle(state.x - state.facing * 20, FEET_Y - 2, { vx: -state.facing * 60, vy: -10, g: 0, hue: 200, size: 4 + Math.random() * 3, max: 0.7 });
                state.swishT -= 1 / 60;
                if (state.swishT <= 0) { state.swishT = 0.35; playFreqSweep(1800, 1200, 0.15, 0.03); }
            }
            // Glitter trail from the skirt hem
            if (Math.random() < 0.8) {
                spawnSparkle(state.x - state.facing * 30 + (Math.random() - 0.5) * 40, FEET_Y - 10 - Math.random() * 30, {
                    vx: -state.facing * 30, vy: -20 - Math.random() * 30, g: 20, size: 3 + Math.random() * 5
                });
            }
            if (state.riding) {
                // Rainbow trail from the tail + clip-clop hooves
                for (let k = 0; k < 3; k++) {
                    spawnSparkle(state.x - state.facing * 80, FEET_Y - 110 - state.alt + Math.random() * 50, {
                        vx: -state.facing * 60, vy: (Math.random() - 0.5) * 30, g: 0,
                        hue: (now / 4 + k * 40) % 360, size: 6 + Math.random() * 6, max: 0.9
                    });
                }
                state.clopT -= dt;
                if (state.clopT <= 0 && state.alt < 2) {
                    state.clopT = 0.16;
                    playTone(Math.random() < 0.5 ? 900 : 700, 0.05, 0.06, 'triangle');
                }
            }
            checkGems();
        } else {
            state.x = state.targetX;
            p.classList.remove('walking');
            if (state.pending) {
                const act = state.pending;
                state.pending = null;
                act();
            }
        }
    } else {
        princessEl().classList.remove('walking');
    }

    // Altitude (flying unicorn)
    if (!state.busy) {
        state.alt += (state.targetAlt - state.alt) * Math.min(1, dt * 3);
        if (!state.flying && state.alt < 1) state.alt = 0;
        if (scene.key === 'sea' && Math.abs(state.targetAlt - state.alt) > 2) checkGems();
    }
    if (state.flying) {
        state.flapT -= dt;
        if (state.flapT <= 0) {
            state.flapT = 0.32;
            playFreqSweep(260, 180, 0.12, 0.05);
        }
        if (Math.random() < 0.7) {
            spawnSparkle(state.x - state.facing * 70, FEET_Y - 100 - state.alt + Math.random() * 40, {
                vx: -state.facing * 40, vy: 20, g: 10, hue: (now / 4) % 360, size: 5 + Math.random() * 5, max: 1
            });
        }
        checkSkyStars();
        checkCloudPortal();
    }

    // Wand sparkles
    if (Math.random() < 0.35) {
        const wandX = state.x + state.facing * (0.38 * PRINCESS_W);
        const wandY = FEET_Y - PRINCESS_H + 0.36 * PRINCESS_H - (state.riding ? RIDE_LIFT : 0) - state.alt;
        spawnSparkle(wandX, wandY, { speed: 50, g: 30, size: 3 + Math.random() * 4, hue: 40 + Math.random() * 30 });
    }

    // Princess transform
    const p = princessEl();
    runTweens(now);
    const an = state.anim;
    p.style.transformOrigin = an.origin || '';
    const boatBob = state.boating ? Math.sin(now / 450) * 3 - BOAT_LIFT : 0;
    p.style.transform = `translate(${state.x - PRINCESS_W / 2 + an.dx}px, ${FEET_Y - PRINCESS_H - (state.riding ? RIDE_LIFT : 0) - state.alt + an.dy + boatBob}px) rotate(${an.rot}deg)`;
    updatePet(dt);
    updateParents(dt, now);
    p.classList.toggle('left', state.facing < 0);

    if (scene.key === 'out') updateCloudPortal();
    if (scene.key === 'out') {
        // Unicorn: carries the princess, or waits and looks at her
        const u = unicornEl();
        const ux = state.riding ? state.x : state.uniX;
        const uFacing = state.riding ? state.facing : (state.x < state.uniX ? -1 : 1);
        u.style.transform = `translate(${ux - UNICORN_W / 2}px, ${FEET_Y - UNICORN_H + 6 - (state.riding ? state.alt : 0)}px)`;
        u.classList.toggle('left', uFacing < 0);
        u.classList.toggle('walking', state.riding && p.classList.contains('walking'));
        updateBoat(now, p.classList.contains('walking'));

        // Fountain keeps spraying glitter water
        const boost = now < state.fountainBoost;
        if (Math.random() < (boost ? 1 : 0.5)) {
            for (let k = 0; k < (boost ? 4 : 1); k++) {
                spawnSparkle(700, 205, {
                    vx: (Math.random() - 0.5) * (boost ? 200 : 110),
                    vy: -(boost ? 260 : 130) - Math.random() * 60,
                    g: 380, hue: 185 + Math.random() * 30, size: 3 + Math.random() * 4, max: 1.1
                });
            }
        }
    }

    // Mirror reflection follows princess a little
    const refl = document.getElementById('reflection');
    if (refl && scene === sceneOf('spiegelkamer')) {
        const off = Math.max(-45, Math.min(45, (state.x - (roomX('spiegelkamer') + 400)) * 0.25));
        refl.style.marginLeft = (-75 - off) + 'px';
    }

    // Camera
    let target = state.x - state.viewW / 2;
    if (state.viewW >= WORLD_W) target = (WORLD_W - state.viewW) / 2;
    else target = Math.max(0, Math.min(WORLD_W - state.viewW, target));
    state.camX += (target - state.camX) * Math.min(1, dt * 6);
    world.style.transform = `translate(${-state.camX * state.scale}px, ${state.offsetY}px) scale(${state.scale})`;

    // Room tracking
    const room = Math.max(0, Math.min(ROOMS.length - 1, Math.floor(state.x / ROOM_W)));
    if (room !== state.room) {
        state.room = room;
        roomPill.textContent = `${ROOMS[room].icon} ${ROOMS[room].name}`;
        roomPill.classList.add('bump');
        setTimeout(() => roomPill.classList.remove('bump'), 200);
        if (window.speechSynthesis) speechSynthesis.cancel();
        const say = ROOMS[room].say;
        setTimeout(() => speak(say), 60);
        playSparkleSound();
        updateBallroom();
    }
    updateTiles(now);

    updateParticles(dt, now);
    drawParticles(now);
    requestAnimationFrame(frame);
}

/* ─────────── Animations on the princess (swing, slide, bed) ─────────── */
const tweens = [];
function tween(dur, fn, done) {
    tweens.push({ t0: performance.now(), dur, fn, done });
}
function runTweens(now) {
    for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        const t = Math.min(1, (now - tw.t0) / tw.dur);
        tw.fn(t, now);
        if (t >= 1) {
            tweens.splice(i, 1);
            if (tw.done) tw.done();
        }
    }
}
function resetAnim() {
    state.anim = { dx: 0, dy: 0, rot: 0, origin: '' };
}
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function playMusicBox() {
    const notes = [784, 988, 1175, 988, 784, 988, 1175, 1568, 1175, 988, 784];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.1, 'triangle'), i * 160));
}

function teddyHug(node) {
    speak(randomPick(['Knuffel! Lieve beer!', 'Een dikke knuffel!']));
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top);
    for (let i = 0; i < 30; i++) spawnSparkle(p.x, p.y, { hue: 330 + Math.random() * 30, speed: 160 });
    playCorrect();
}

/* ─────────── Pet cat ─────────── */
function petEl() { return document.getElementById('pet'); }

function togglePet() {
    const pet = state.pet;
    pet.following = !pet.following;
    petEl().classList.toggle('following', pet.following);
    catMeow();
    if (pet.following) {
        speak('Poes gaat met je mee!');
        for (let i = 0; i < 20; i++) spawnSparkle(pet.x, FEET_Y - 50, { hue: 340, speed: 120 });
    } else {
        speak('Poes blijft hier. Dag poes!');
    }
}

function updatePet(dt) {
    const node = petEl();
    const pet = state.pet;
    if (pet.key !== scene.key) return;
    let moving = false;
    if (pet.following) {
        let target = state.x - state.facing * (state.riding ? 130 : 95);
        if (scene.key === 'out') target = Math.min(target, LAKE_X0 - 20);
        const d = target - pet.x;
        if (Math.abs(d) > 4) {
            const step = d * Math.min(1, dt * 4);
            pet.x += step;
            pet.facing = Math.sign(d);
            moving = Math.abs(step) > 0.6;
        }
        if (Math.random() < 0.01) spawnSparkle(pet.x, FEET_Y - 70, { hue: 340, speed: 40, g: -20 });
    }
    node.style.transform = `translate(${pet.x - 40}px, ${FEET_Y - 66}px)`;
    node.classList.toggle('right', pet.facing > 0);
    node.classList.toggle('walking', moving);
}

