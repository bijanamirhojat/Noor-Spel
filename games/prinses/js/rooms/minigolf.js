/* ⛳ Glow-golf: een donkere kamer met neon. Binnen: minigolf in het donker, 6 holes.
   Trek de bal naar achteren en laat los (of tik gewoon waar hij heen moet). Een gat trekt de bal een beetje
   naar zich toe, dus hij gaat er makkelijk in. Het baantje is getekend op een canvas (1000 x 600). */
const GOLF_W = 1000;
const GOLF_H = 600;
const GOLF_R = 16;          // ball radius
const GOLF_HOLE_R = 30;
const GOLF_MAX_V = 1500;
const GOLF_NEON = ['#f0abfc', '#22d3ee', '#a3e635', '#fde047', '#fb7185'];
// walls: [x, y, w, h]; bumpers: [x, y, r]; mover: a wall that slides up and down
const GOLF_LEVELS = [
    { ball: [150, 300], hole: [850, 300], walls: [], bumpers: [] },
    { ball: [150, 460], hole: [850, 140], walls: [[460, 200, 80, 200]], bumpers: [] },
    { ball: [150, 150], hole: [150, 460], walls: [[0, 285, 700, 30]], bumpers: [] },
    { ball: [150, 300], hole: [860, 300], walls: [], bumpers: [[420, 180, 46], [420, 420, 46], [640, 210, 50]] },
    { ball: [150, 300], hole: [860, 300], walls: [], bumpers: [], mover: { x: 470, w: 60, h: 220, y0: 40, y1: 340, t: 3.2 } },
    { ball: [120, 500], hole: [880, 100], walls: [[320, 0, 30, 400], [650, 200, 30, 400]], bumpers: [[500, 120, 36]] }
];

defineRoom({
    key: 'minigolf',
    name: 'Glow-golf',
    icon: '⛳',
    say: 'Glow in the dark minigolf',
    build(x) {
        [[60, 40], [250, 110], [520, 20], [700, 140], [360, 230], [140, 220]].forEach(([sx, sy], i) =>
            place(el(`<div class="gg-star" style="--c:${GOLF_NEON[i % GOLF_NEON.length]};animation-delay:${-i * 0.6}s">✦</div>`), x + sx, sy));
        addObj('<div class="gg-sign"><span>GLOW</span><span>GOLF</span></div>', x + 40, 70, x + 140, (node) => {
            node.classList.toggle('alt');
            [523, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.1, 0.08, 'square'), i * 70));
        });
        addObj(`<div class="gg-course"><div class="hole"></div><span class="flag">⛳</span><span class="ball"></span>
            <div class="tap-hint" style="left:150px;top:-70px">👇</div></div>`, x + 220, 290, x + 380, openGolf);
        addObj('<div class="gg-sticks"><i></i><i></i><i></i><i></i></div>', x + 620, 230, x + 650, (node) => {
            node.style.setProperty('--h', (Math.random() * 360) + 'deg');
            bounceEl(node, 'jump');
            playFreqSweep(600, 1400, 0.25, 0.08);
        });
        addObj('<div class="gg-ufo">🛸</div>', x + 480, 60, x + 520, (node) => {
            node.classList.remove('zoom'); void node.offsetWidth; node.classList.add('zoom');
            playFreqSweep(300, 1500, 0.6, 0.08);
        });
    }
});

/* ─────────── Glow-golf (overlay) ─────────── */
const ggEl = document.getElementById('golfOv');
const ggCanvas = document.getElementById('golfCanvas');
const ggCtx = ggCanvas.getContext('2d');
let golfOpen = false;
const gg = { lvl: 0, ball: null, vx: 0, vy: 0, strokes: 0, done: 0, aim: null, drag: false, sink: 0, raf: 0, last: 0, t: 0, trail: [], scale: 1, ox: 0, oy: 0 };

function golfLevel() { return GOLF_LEVELS[gg.lvl % GOLF_LEVELS.length]; }

function golfStart(lvl) {
    gg.lvl = lvl;
    const L = golfLevel();
    gg.ball = { x: L.ball[0], y: L.ball[1] };
    gg.vx = gg.vy = 0;
    gg.strokes = 0;
    gg.sink = 0;
    gg.trail = [];
    gg.aim = null;
    golfHud();
}

function golfHud() {
    document.getElementById('golfHole').textContent = `⛳ ${gg.lvl % GOLF_LEVELS.length + 1} / ${GOLF_LEVELS.length}`;
    document.getElementById('golfStrokes').textContent = gg.strokes ? '🏌️ ' + '•'.repeat(Math.min(gg.strokes, 10)) : '';
    document.getElementById('golfDone').textContent = `🏆 ${gg.done}`;
}

function golfFit() {
    const r = ggCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    ggCanvas.width = Math.round(r.width * dpr);
    ggCanvas.height = Math.round(r.height * dpr);
    gg.scale = Math.min(r.width / GOLF_W, r.height / GOLF_H) * dpr;
    gg.ox = (ggCanvas.width - GOLF_W * gg.scale) / 2;
    gg.oy = (ggCanvas.height - GOLF_H * gg.scale) / 2;
}

function golfPoint(e) {
    const r = ggCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return { x: ((e.clientX - r.left) * dpr - gg.ox) / gg.scale, y: ((e.clientY - r.top) * dpr - gg.oy) / gg.scale };
}

// All solid rectangles this frame: the border is open space, walls come from the level (+ the mover)
function golfWalls() {
    const L = golfLevel();
    const w = L.walls.slice();
    if (L.mover) {
        const m = L.mover;
        const k = (Math.sin(gg.t * Math.PI * 2 / m.t) + 1) / 2;
        w.push([m.x, m.y0 + (m.y1 - m.y0) * k, m.w, m.h]);
    }
    return w;
}

function golfBonk(speed) {
    if (speed > 120) playTone(500 + Math.random() * 300, 0.05, Math.min(0.12, speed / 8000), 'square');
}

function golfPhysics(dt) {
    const b = gg.ball;
    const L = golfLevel();
    const steps = 4;
    for (let s = 0; s < steps; s++) {
        const h = dt / steps;
        b.x += gg.vx * h;
        b.y += gg.vy * h;
        // Border
        if (b.x < GOLF_R) { b.x = GOLF_R; gg.vx = Math.abs(gg.vx) * 0.85; golfBonk(Math.abs(gg.vx)); }
        if (b.x > GOLF_W - GOLF_R) { b.x = GOLF_W - GOLF_R; gg.vx = -Math.abs(gg.vx) * 0.85; golfBonk(Math.abs(gg.vx)); }
        if (b.y < GOLF_R) { b.y = GOLF_R; gg.vy = Math.abs(gg.vy) * 0.85; golfBonk(Math.abs(gg.vy)); }
        if (b.y > GOLF_H - GOLF_R) { b.y = GOLF_H - GOLF_R; gg.vy = -Math.abs(gg.vy) * 0.85; golfBonk(Math.abs(gg.vy)); }
        // Rectangles: push out along the closest-point normal and reflect
        golfWalls().forEach(([wx, wy, ww, wh]) => {
            const cx = Math.max(wx, Math.min(b.x, wx + ww));
            const cy = Math.max(wy, Math.min(b.y, wy + wh));
            let dx = b.x - cx, dy = b.y - cy;
            const d = Math.hypot(dx, dy);
            if (d >= GOLF_R) return;
            if (d === 0) {
                // Centre inside the wall (fast ball or the mover): push out the shortest way
                const opts = [[b.x - wx, -1, 0], [wx + ww - b.x, 1, 0], [b.y - wy, 0, -1], [wy + wh - b.y, 0, 1]].sort((p, q) => p[0] - q[0]);
                dx = opts[0][1]; dy = opts[0][2];
                b.x += dx * (opts[0][0] + GOLF_R);
                b.y += dy * (opts[0][0] + GOLF_R);
            } else {
                dx /= d; dy /= d;
                b.x = cx + dx * GOLF_R;
                b.y = cy + dy * GOLF_R;
            }
            const vn = gg.vx * dx + gg.vy * dy;
            if (vn < 0) { gg.vx -= 1.85 * vn * dx; gg.vy -= 1.85 * vn * dy; golfBonk(-vn); }
        });
        // Bumpers: extra bouncy
        L.bumpers.forEach(bp => {
            const dx = b.x - bp[0], dy = b.y - bp[1];
            const d = Math.hypot(dx, dy);
            if (d >= bp[2] + GOLF_R || d === 0) return;
            const nx = dx / d, ny = dy / d;
            b.x = bp[0] + nx * (bp[2] + GOLF_R);
            b.y = bp[1] + ny * (bp[2] + GOLF_R);
            const vn = gg.vx * nx + gg.vy * ny;
            if (vn < 0) {
                gg.vx -= 2.1 * vn * nx; gg.vy -= 2.1 * vn * ny;
                bp.hit = 1;
                playFreqSweep(700, 1300, 0.12, 0.1);
            }
        });
    }
    // Rolling friction
    const sp = Math.hypot(gg.vx, gg.vy);
    const ns = Math.max(0, sp * Math.exp(-0.9 * dt) - 90 * dt);
    if (sp > 0) { gg.vx *= ns / sp; gg.vy *= ns / sp; }
    // The hole pulls the ball in a little (forgiving), and swallows it when close and not too fast
    const hx = L.hole[0] - b.x, hy = L.hole[1] - b.y;
    const hd = Math.hypot(hx, hy);
    if (hd < GOLF_HOLE_R * 2.4 && ns > 0) {
        const pull = 900 * dt * (1 - hd / (GOLF_HOLE_R * 2.4));
        gg.vx += hx / hd * pull * 3;
        gg.vy += hy / hd * pull * 3;
    }
    if (hd < GOLF_HOLE_R * 2.4 && ns < 30) {
        // Rolled to a stop near the hole: nudge it in
        gg.vx = hx * 2;
        gg.vy = hy * 2;
    }
    if (hd < GOLF_HOLE_R - 4 && Math.hypot(gg.vx, gg.vy) < 900) golfSink();
}

function golfSink() {
    gg.sink = 0.001;
    gg.vx = gg.vy = 0;
    gg.done++;
    [784, 659, 523, 392].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 0.1, 'sine'), i * 60));
    setTimeout(() => {
        playWin();
        const c = document.getElementById('golfDone');
        ovCheer(ggEl, c, ['✨', '⭐', '💫', '🎉']);
        const L = golfLevel();
        golfConfetti(L.hole[0], L.hole[1]);
        golfHud();
    }, 300);
    setTimeout(() => { if (golfOpen) golfStart(gg.lvl + 1); }, 2200);
}

const ggParts = [];
function golfConfetti(x, y) {
    for (let i = 0; i < 60; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 150 + Math.random() * 350;
        ggParts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: randomPick(GOLF_NEON) });
    }
}

function golfShoot(dx, dy) {
    let v = Math.hypot(dx, dy) * 5;
    if (v < 160) return;
    v = Math.min(GOLF_MAX_V, v);
    const d = Math.hypot(dx, dy);
    gg.vx = dx / d * v;
    gg.vy = dy / d * v;
    gg.strokes++;
    golfHud();
    playTone(180, 0.06, 0.2, 'triangle');
    setTimeout(() => playTone(900, 0.04, 0.1, 'square'), 10);
}

function golfMoving() { return Math.hypot(gg.vx, gg.vy) > 5 || gg.sink; }

ggCanvas.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (golfMoving()) return;
    const p = golfPoint(e);
    const near = Math.hypot(p.x - gg.ball.x, p.y - gg.ball.y) < 90;
    gg.drag = near;
    gg.aim = { x: p.x, y: p.y, tap: !near };
    try { ggCanvas.setPointerCapture(e.pointerId); } catch (err) {}
});
ggCanvas.addEventListener('pointermove', (e) => {
    if (!gg.aim) return;
    const p = golfPoint(e);
    gg.aim.x = p.x;
    gg.aim.y = p.y;
});
function golfRelease() {
    if (!gg.aim) return;
    const a = gg.aim;
    gg.aim = null;
    if (golfMoving()) return;
    if (gg.drag) {
        // Slingshot: pull back, it flies the other way
        golfShoot(gg.ball.x - a.x, gg.ball.y - a.y);
    } else {
        // Tap: roll towards where you tapped (a bit more power so it gets there)
        golfShoot((a.x - gg.ball.x) * 0.55, (a.y - gg.ball.y) * 0.55);
    }
    gg.drag = false;
}
ggCanvas.addEventListener('pointerup', golfRelease);
ggCanvas.addEventListener('pointercancel', () => { gg.aim = null; gg.drag = false; });

function golfNeonRect(c, x, y, w, h, col) {
    c.shadowColor = col;
    c.shadowBlur = 18;
    c.strokeStyle = col;
    c.lineWidth = 5;
    c.fillStyle = 'rgba(255,255,255,0.06)';
    c.beginPath();
    c.roundRect ? c.roundRect(x, y, w, h, 8) : c.rect(x, y, w, h);
    c.fill();
    c.stroke();
}

function golfDraw() {
    const c = ggCtx;
    const L = golfLevel();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, ggCanvas.width, ggCanvas.height);
    c.setTransform(gg.scale, 0, 0, gg.scale, gg.ox, gg.oy);
    // Course: dark felt with a faint glowing grid
    c.shadowBlur = 0;
    c.fillStyle = '#120a2e';
    c.fillRect(0, 0, GOLF_W, GOLF_H);
    c.strokeStyle = 'rgba(167,139,250,0.12)';
    c.lineWidth = 1;
    for (let gx = 50; gx < GOLF_W; gx += 50) { c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, GOLF_H); c.stroke(); }
    for (let gy = 50; gy < GOLF_H; gy += 50) { c.beginPath(); c.moveTo(0, gy); c.lineTo(GOLF_W, gy); c.stroke(); }
    const hue = (gg.t * 40) % 360;
    golfNeonRect(c, 3, 3, GOLF_W - 6, GOLF_H - 6, `hsl(${hue},100%,65%)`);
    // Hole with a pulsing ring and a flag
    const [hx, hy] = L.hole;
    c.shadowColor = '#a3e635';
    c.shadowBlur = 25 + Math.sin(gg.t * 4) * 10;
    c.fillStyle = '#000';
    c.strokeStyle = '#a3e635';
    c.lineWidth = 5;
    c.beginPath(); c.arc(hx, hy, GOLF_HOLE_R, 0, Math.PI * 2); c.fill(); c.stroke();
    c.strokeStyle = '#fff';
    c.lineWidth = 4;
    c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx, hy - 90); c.stroke();
    c.fillStyle = '#fb7185';
    c.shadowColor = '#fb7185';
    const wave = Math.sin(gg.t * 6) * 6;
    c.beginPath(); c.moveTo(hx, hy - 90); c.lineTo(hx + 50, hy - 76 + wave); c.lineTo(hx, hy - 60); c.closePath(); c.fill();
    // Walls, mover and bumpers
    golfWalls().forEach(([wx, wy, ww, wh], i) => golfNeonRect(c, wx, wy, ww, wh, GOLF_NEON[(i + 1) % GOLF_NEON.length]));
    L.bumpers.forEach((bp, i) => {
        bp.hit = Math.max(0, (bp.hit || 0) - 0.04);
        const col = GOLF_NEON[(i + 3) % GOLF_NEON.length];
        c.shadowColor = col;
        c.shadowBlur = 20 + bp.hit * 30;
        c.strokeStyle = col;
        c.lineWidth = 6;
        c.fillStyle = 'rgba(255,255,255,' + (0.08 + bp.hit * 0.4) + ')';
        c.beginPath(); c.arc(bp[0], bp[1], bp[2] * (1 + bp.hit * 0.15), 0, Math.PI * 2); c.fill(); c.stroke();
    });
    // Aim: a dotted glow line showing where the ball will go
    const b = gg.ball;
    if (gg.aim && !golfMoving()) {
        let dx = gg.drag ? b.x - gg.aim.x : (gg.aim.x - b.x) * 0.55;
        let dy = gg.drag ? b.y - gg.aim.y : (gg.aim.y - b.y) * 0.55;
        const len = Math.min(GOLF_MAX_V / 5, Math.hypot(dx, dy));
        const d = Math.hypot(dx, dy) || 1;
        c.shadowColor = '#fde047';
        c.shadowBlur = 12;
        c.fillStyle = '#fde047';
        for (let k = 1; k <= 8; k++) {
            const f = k / 8 * len * 1.4;
            c.beginPath(); c.arc(b.x + dx / d * f, b.y + dy / d * f, 6 - k * 0.4, 0, Math.PI * 2); c.fill();
        }
    }
    // Trail + ball
    gg.trail.forEach((p, i) => {
        c.shadowBlur = 0;
        c.fillStyle = `hsla(${(hue + 180) % 360},100%,70%,${i / gg.trail.length * 0.5})`;
        c.beginPath(); c.arc(p.x, p.y, GOLF_R * (i / gg.trail.length), 0, Math.PI * 2); c.fill();
    });
    const bs = gg.sink ? Math.max(0, 1 - gg.sink) : 1;
    c.shadowColor = '#22d3ee';
    c.shadowBlur = 28;
    c.fillStyle = '#ecfeff';
    c.beginPath(); c.arc(b.x, b.y, GOLF_R * bs, 0, Math.PI * 2); c.fill();
    // Confetti
    ggParts.forEach(p => {
        c.shadowColor = p.c;
        c.shadowBlur = 10;
        c.fillStyle = p.c;
        c.globalAlpha = Math.max(0, p.life);
        c.fillRect(p.x - 4, p.y - 4, 8, 8);
    });
    c.globalAlpha = 1;
    c.shadowBlur = 0;
}

function golfLoop(t) {
    if (!golfOpen) return;
    const dt = Math.min(0.033, (t - (gg.last || t)) / 1000);
    gg.last = t;
    gg.t += dt;
    if (gg.sink) {
        gg.sink = Math.min(1, gg.sink + dt * 2.5);
        const L = golfLevel();
        gg.ball.x += (L.hole[0] - gg.ball.x) * 0.3;
        gg.ball.y += (L.hole[1] - gg.ball.y) * 0.3;
    } else if (golfMoving() || golfLevel().mover) {
        golfPhysics(dt);
    }
    gg.trail.push({ x: gg.ball.x, y: gg.ball.y });
    if (gg.trail.length > 14 || !golfMoving()) gg.trail.shift();
    for (let i = ggParts.length - 1; i >= 0; i--) {
        const p = ggParts[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 400 * dt;
        p.life -= dt * 0.8;
        if (p.life <= 0) ggParts.splice(i, 1);
    }
    golfDraw();
    gg.raf = requestAnimationFrame(golfLoop);
}

function openGolf() {
    golfOpen = true;
    ggEl.classList.add('open');
    golfFit();
    golfStart(gg.done ? gg.lvl : 0);
    gg.last = 0;
    cancelAnimationFrame(gg.raf);
    gg.raf = requestAnimationFrame(golfLoop);
    [392, 523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 0.08, 'square'), i * 90));
}

function closeGolf() {
    golfOpen = false;
    cancelAnimationFrame(gg.raf);
    ggEl.classList.remove('open');
    _playWhoosh();
}
window.addEventListener('resize', () => { if (golfOpen) golfFit(); });
document.getElementById('golfClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeGolf(); });
ggEl.addEventListener('pointerdown', (e) => e.stopPropagation());
