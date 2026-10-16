/* 🏀 Basketbalzaal: gooi de bal in de basket. Veeg omhoog (of tik gewoon): de bal vliegt in een boog
   naar de basket en gaat bijna altijd raak; hoe harder je veegt, hoe hoger de boog. Elke 5 keer raak
   verhuist de basket. Het aantal ballen in de basket blijft bewaard (noor-prinses-basket) en staat op het
   scorebord in de kamer. Het veld is getekend op een canvas (1000 x 600). */
const HOOP_W = 1000;
const HOOP_H = 600;
const HOOP_FLOOR = 560;
const HOOP_R = 30;          // ball radius
const HOOP_RIM = 62;        // half the width of the ring
const HOOP_G = 1500;        // gravity
const HOOP_KEY = 'noor-prinses-basket';
const HOOP_SPOTS = [{ x: 760, y: 250 }, { x: 640, y: 200 }, { x: 840, y: 290 }, { x: 700, y: 170 }, { x: 800, y: 220 }];
const HOOP_BALLS = [
    { k: 'oranje bal', a: '#fb923c', b: '#ea580c', line: '#7c2d12' },
    { k: 'roze bal', a: '#f9a8d4', b: '#ec4899', line: '#9d174d' },
    { k: 'regenboogbal', rainbow: true, line: '#fff' },
    { k: 'sterrenbal', a: '#fde047', b: '#eab308', line: '#a16207', star: true }
];
const HOOP_NUMS = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien',
    'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'];

defineRoom({
    key: 'basketbal',
    name: 'Basketbalzaal',
    icon: '🏀',
    say: 'De basketbalzaal!',
    build(x) {
        place(el('<div class="bsk-lines"></div>'), x, 452);
        hoopBoardNode = addObj('<div class="bsk-board"><div class="lbl">🏀 RAAK</div><div class="num">0</div></div>', x + 40, 70, x + 120, (node) => {
            playTone(180, 0.5, 0.12, 'square');
            bounceEl(node, 'jump');
            const n = hoopTotal();
            speak(n ? `${n} keer raak!` : 'Nog nul keer raak');
        });
        hoopRoomBoard();
        addObj(`<div class="bsk-hoop">
            <div class="board"><i></i></div><div class="rim"></div><div class="net"></div><div class="pole"></div>
            <div class="tap-hint" style="left:70px;top:-58px">👇</div>
        </div>`, x + 300, 80, x + 380, () => openHoop());
        addObj(`<div class="bsk-rack">${HOOP_BALLS.concat(HOOP_BALLS[0]).map((b, i) =>
            `<i style="--i:${i};${hoopBallCss(b)}"></i>`).join('')}<div class="shelf"></div><div class="shelf low"></div></div>`, x + 580, 300, x + 620, (node) => {
            bounceEl(node, 'wobble');
            for (let i = 0; i < 5; i++) setTimeout(() => playTone(160 + i * 25, 0.08, 0.15, 'sine'), i * 90);
        });
        addObj('<div class="bsk-loose"><i></i></div>', x + 220, 380, x + 240, (node) => {
            node.classList.remove('dribble'); void node.offsetWidth; node.classList.add('dribble');
            [0, 350, 700].forEach(t => setTimeout(() => hoopBounceSound(0.15), t + 170));
        });
    }
});

function hoopBallCss(b) {
    return b.rainbow ? 'background:conic-gradient(#ef4444,#facc15,#22c55e,#3b82f6,#a855f7,#ef4444)' : `background:radial-gradient(circle at 35% 30%,${b.a},${b.b})`;
}

/* ─────────── Bewaren ─────────── */
let hoopBoardNode = null;
let hoopSaved = 0;
try { hoopSaved = Math.max(0, parseInt(localStorage.getItem(HOOP_KEY), 10) || 0); } catch (e) {}

function hoopTotal() { return hoopSaved; }
function hoopSave() { try { localStorage.setItem(HOOP_KEY, String(hoopSaved)); } catch (e) {} }
function hoopRoomBoard() {
    if (hoopBoardNode) hoopBoardNode.querySelector('.num').textContent = Math.min(999, hoopSaved);
}

function hoopBounceSound(vol = 0.12) {
    playTone(110, 0.12, vol, 'sine');
    playTone(70, 0.08, vol * 0.8, 'triangle');
}

/* ─────────── Gooien (overlay) ─────────── */
const hoopEl = document.getElementById('hoopOv');
const hoopCanvas = document.getElementById('hoopCanvas');
const hoopCtx = hoopCanvas.getContext('2d');
let hoopOpen = false;
registerOverlay(() => hoopOpen, closeHoop);
const hoop = { kind: 0, balls: [], spot: 0, hx: 760, hy: 250, moveFrom: null, moveT: 1, score: 0, net: 0, gest: null,
    raf: 0, last: 0, t: 0, scale: 1, ox: 0, oy: 0, parts: [], spawnAt: 0 };

function hoopFit() {
    const r = hoopCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    hoopCanvas.width = Math.round(r.width * dpr);
    hoopCanvas.height = Math.round(r.height * dpr);
    hoop.scale = Math.min(r.width / HOOP_W, r.height / HOOP_H) * dpr;
    hoop.ox = (hoopCanvas.width - HOOP_W * hoop.scale) / 2;
    hoop.oy = (hoopCanvas.height - HOOP_H * hoop.scale) / 2;
}

function hoopPoint(e) {
    const r = hoopCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return { x: ((e.clientX - r.left) * dpr - hoop.ox) / hoop.scale, y: ((e.clientY - r.top) * dpr - hoop.oy) / hoop.scale };
}

function hoopHud() {
    document.getElementById('hoopScore').textContent = `🏀 ${hoop.score}`;
}

function hoopReady() { return hoop.balls.find(b => b.state === 'ready'); }

// A new ball rolls in from the left and stops somewhere on the left half
function hoopSpawn() {
    if (hoopReady()) return;
    const tx = 150 + Math.random() * 200;
    hoop.balls.push({ x: -HOOP_R, y: HOOP_FLOOR - HOOP_R, vx: 0, vy: 0, tx, rot: 0, state: 'ready', kind: hoop.kind, age: 0, scored: false, floorHits: 0, rest: 0, fade: 1 });
}

function hoopRingEnds() { return [[hoop.hx - HOOP_RIM, hoop.hy], [hoop.hx + HOOP_RIM, hoop.hy]]; }
// Backboard: just right of the ring
function hoopBoardRect() { return [hoop.hx + HOOP_RIM + 6, hoop.hy - 150, 16, 190]; }

// The perfect throw from (x0, y0): goes up `arc` above the ring and drops in from above
function hoopIdeal(x0, y0, arc) {
    const top = Math.max(40, hoop.hy - arc);   // stays in view
    const up = Math.max(40, y0 - top);
    const tUp = Math.sqrt(2 * up / HOOP_G);
    const tDown = Math.sqrt(2 * (hoop.hy - top) / HOOP_G);
    return { vx: (hoop.hx - 8 - x0) / (tUp + tDown), vy: -Math.sqrt(2 * HOOP_G * up) };
}

// A tiny random miss now and then, so the ring sometimes bonks and the ball rolls round
function hoopShoot(b, arc) {
    const ideal = hoopIdeal(b.x, b.y, arc);
    b.vx = ideal.vx * (1 + (Math.random() - 0.5) * 0.08);
    b.vy = ideal.vy;
    b.state = 'fly';
    b.age = 0;
    hoop.spawnAt = hoop.t + 0.7;
    playFreqSweep(300, 700, 0.15, 0.08);
}

hoopCanvas.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const b = hoopReady();
    if (!b || hoop.gest || hoop.moveT < 1) return;
    const p = hoopPoint(e);
    hoop.gest = { pid: e.pointerId, pts: [{ ...p, t: performance.now() }], b };
    try { hoopCanvas.setPointerCapture(e.pointerId); } catch (err) {}
});
hoopCanvas.addEventListener('pointermove', (e) => {
    const g = hoop.gest;
    if (!g || e.pointerId !== g.pid) return;
    g.pts.push({ ...hoopPoint(e), t: performance.now() });
    if (g.pts.length > 30) g.pts.shift();
});
hoopCanvas.addEventListener('pointerup', (e) => {
    const g = hoop.gest;
    if (!g || e.pointerId !== g.pid) return;
    hoop.gest = null;
    if (g.b.state !== 'ready') return;
    const now = performance.now();
    const last = g.pts[g.pts.length - 1];
    const old = g.pts.find(p => now - p.t < 110) || last;
    const dt = Math.max(0.016, (last.t - old.t) / 1000);
    const vx = (last.x - old.x) / dt;
    const vy = (last.y - old.y) / dt;
    // A swipe upwards: the harder, the higher the arc. A tap (or another swipe): a normal throw
    const sp = vy < -300 ? Math.hypot(vx, vy) : 0;
    hoopShoot(g.b, sp ? Math.max(100, Math.min(300, sp / 9)) : 150);
});
hoopCanvas.addEventListener('pointercancel', () => { hoop.gest = null; });

function hoopScored(b) {
    b.scored = true;
    b.vx *= 0.25;
    hoop.net = 1;
    hoop.score++;
    hoopSaved++;
    hoopSave();
    hoopHud();
    playTone(1400, 0.08, 0.06, 'triangle');
    setTimeout(() => { playCorrect(); hoopConfetti(hoop.hx, hoop.hy + 40); }, 120);
    ovCheer(hoopEl, document.getElementById('hoopScore'), ['🏀', '⭐', '✨', '🎉']);
    setTimeout(() => speak(hoop.score <= 20 ? HOOP_NUMS[hoop.score] + '!' : randomPick(['Raak!', 'Mooi!', 'Goed zo!'])), 200);
    if (hoop.score === 3) earnSticker('basketbal', document.getElementById('hoopScore'));
    if (hoop.score % 5 === 0) setTimeout(() => {
        if (!hoopOpen) return;
        playWin();
        speak('Hoera! De basket gaat verhuizen!');
        hoopMoveTo((hoop.spot + 1) % HOOP_SPOTS.length);
    }, 1100);
}

function hoopMoveTo(i) {
    hoop.spot = i;
    hoop.moveFrom = { x: hoop.hx, y: hoop.hy };
    hoop.moveT = 0;
    playFreqSweep(400, 900, 0.5, 0.06);
}

function hoopConfetti(x, y) {
    const cols = ['#f97316', '#facc15', '#ec4899', '#22c55e', '#3b82f6', '#a855f7'];
    for (let i = 0; i < 40; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
        const v = 200 + Math.random() * 300;
        hoop.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: randomPick(cols) });
    }
}

// Ball against a fixed point (the ends of the ring): bounce off it
function hoopHitPoint(b, px, py, pr, bounce) {
    const dx = b.x - px, dy = b.y - py;
    const d = Math.hypot(dx, dy);
    if (d >= HOOP_R + pr || d === 0) return;
    const nx = dx / d, ny = dy / d;
    b.x = px + nx * (HOOP_R + pr);
    b.y = py + ny * (HOOP_R + pr);
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) {
        b.vx -= (1 + bounce) * vn * nx;
        b.vy -= (1 + bounce) * vn * ny;
        if (-vn > 120) playTone(600 + Math.random() * 200, 0.06, Math.min(0.12, -vn / 6000), 'square');
    }
}

function hoopPhysics(b, dt) {
    const steps = 4;
    for (let s = 0; s < steps; s++) {
        const h = dt / steps;
        const py = b.y;
        b.vy += HOOP_G * h;
        b.x += b.vx * h;
        b.y += b.vy * h;
        // Through the ring from above: raak!
        if (!b.scored && py < hoop.hy && b.y >= hoop.hy && b.vy > 0 && Math.abs(b.x - hoop.hx) < HOOP_RIM - 8) hoopScored(b);
        hoopRingEnds().forEach(([rx, ry]) => hoopHitPoint(b, rx, ry, 7, 0.55));
        // Backboard
        const [wx, wy, ww, wh] = hoopBoardRect();
        const cx = Math.max(wx, Math.min(b.x, wx + ww)), cy = Math.max(wy, Math.min(b.y, wy + wh));
        if (Math.hypot(b.x - cx, b.y - cy) < HOOP_R) hoopHitPoint(b, cx, cy, 0, 0.6);
        // Floor and walls
        if (b.y > HOOP_FLOOR - HOOP_R) {
            b.y = HOOP_FLOOR - HOOP_R;
            if (b.vy > 60) {
                if (b.vy > 150) hoopBounceSound(Math.min(0.18, b.vy / 6000));
                b.floorHits++;
                if (b.floorHits === 1 && !b.scored && Math.random() < 0.4) speak(randomPick(['Bijna!', 'Nog een keer!', 'Oei, mis!']));
            }
            b.vy = -Math.abs(b.vy) * 0.62;
            b.vx *= 0.92;
            if (Math.abs(b.vy) < 40) b.vy = 0;
        }
        if (b.x < HOOP_R) { b.x = HOOP_R; b.vx = Math.abs(b.vx) * 0.6; }
        if (b.x > HOOP_W - HOOP_R) { b.x = HOOP_W - HOOP_R; b.vx = -Math.abs(b.vx) * 0.6; }
    }
    b.rot += b.vx * dt / HOOP_R;
}

function hoopStep(dt) {
    hoop.t += dt;
    hoop.net = Math.max(0, hoop.net - dt * 1.6);
    if (hoop.moveT < 1) {
        hoop.moveT = Math.min(1, hoop.moveT + dt * 1.2);
        const k = 0.5 - Math.cos(hoop.moveT * Math.PI) / 2;
        const to = HOOP_SPOTS[hoop.spot];
        hoop.hx = hoop.moveFrom.x + (to.x - hoop.moveFrom.x) * k;
        hoop.hy = hoop.moveFrom.y + (to.y - hoop.moveFrom.y) * k;
    }
    if (!hoopReady() && hoop.t >= hoop.spawnAt) hoopSpawn();
    hoop.balls.forEach(b => {
        b.age += dt;
        if (b.state === 'ready') {
            // Rolling in to its spot
            const d = b.tx - b.x;
            const v = Math.sign(d) * Math.min(Math.abs(d) * 6, 700);
            b.x += v * dt;
            b.rot += v * dt / HOOP_R;
            b.y = HOOP_FLOOR - HOOP_R;
        } else if (b.state === 'fly') {
            hoopPhysics(b, dt);
            const still = b.vy === 0 && Math.abs(b.vx) < 30 && b.y >= HOOP_FLOOR - HOOP_R - 1;
            b.rest = still ? b.rest + dt : 0;
            if (b.rest > 0.6 || b.age > 6) b.state = 'gone';
        } else {
            b.fade -= dt * 2.5;
        }
    });
    hoop.balls = hoop.balls.filter(b => b.fade > 0);
    while (hoop.balls.length > 6) hoop.balls.shift();
    for (let i = hoop.parts.length - 1; i >= 0; i--) {
        const p = hoop.parts[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 600 * dt;
        p.life -= dt * 0.9;
        if (p.life <= 0) hoop.parts.splice(i, 1);
    }
}

/* ── Tekenen ── */
function hoopDrawBall(c, b) {
    const k = HOOP_BALLS[b.kind];
    c.save();
    c.globalAlpha = Math.max(0, b.fade);
    // Shadow on the floor
    const lift = Math.min(1, (HOOP_FLOOR - HOOP_R - b.y) / 400);
    c.fillStyle = `rgba(0,0,0,${0.18 * (1 - lift)})`;
    c.beginPath(); c.ellipse(b.x, HOOP_FLOOR + 4, HOOP_R * (1 - lift * 0.5), 7, 0, 0, Math.PI * 2); c.fill();
    c.translate(b.x, b.y);
    c.rotate(b.rot);
    if (k.rainbow) {
        const g = c.createConicGradient ? c.createConicGradient(0, 0, 0) : null;
        if (g) ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'].forEach((col, i) => g.addColorStop(i / 5, col));
        c.fillStyle = g || '#a855f7';
    } else {
        const g = c.createRadialGradient(-10, -10, 4, 0, 0, HOOP_R);
        g.addColorStop(0, k.a);
        g.addColorStop(1, k.b);
        c.fillStyle = g;
    }
    c.beginPath(); c.arc(0, 0, HOOP_R, 0, Math.PI * 2); c.fill();
    c.strokeStyle = k.line;
    c.lineWidth = 2.5;
    c.beginPath(); c.arc(0, 0, HOOP_R, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(-HOOP_R, 0); c.lineTo(HOOP_R, 0); c.moveTo(0, -HOOP_R); c.lineTo(0, HOOP_R); c.stroke();
    c.beginPath(); c.arc(-HOOP_R * 1.25, 0, HOOP_R * 0.85, -0.85, 0.85); c.stroke();
    c.beginPath(); c.arc(HOOP_R * 1.25, 0, HOOP_R * 0.85, Math.PI - 0.85, Math.PI + 0.85); c.stroke();
    if (k.star) {
        c.font = '22px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('⭐', 0, 1);
    }
    c.restore();
}

function hoopDraw() {
    const c = hoopCtx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, hoopCanvas.width, hoopCanvas.height);
    c.setTransform(hoop.scale, 0, 0, hoop.scale, hoop.ox, hoop.oy);
    // Gym wall and wooden floor
    const wall = c.createLinearGradient(0, 0, 0, HOOP_FLOOR);
    wall.addColorStop(0, '#e0f2fe');
    wall.addColorStop(1, '#bae6fd');
    c.fillStyle = wall;
    c.fillRect(0, 0, HOOP_W, HOOP_FLOOR);
    c.fillStyle = '#f9a8d4';
    c.fillRect(0, HOOP_FLOOR - 70, HOOP_W, 10);
    c.fillStyle = '#f59e0b';
    c.fillRect(0, HOOP_FLOOR, HOOP_W, HOOP_H - HOOP_FLOOR);
    c.fillStyle = 'rgba(146,64,14,0.25)';
    for (let x = 0; x < HOOP_W; x += 80) c.fillRect(x, HOOP_FLOOR, 2, HOOP_H - HOOP_FLOOR);
    c.fillStyle = '#fff';
    c.fillRect(0, HOOP_FLOOR + 12, HOOP_W, 4);
    const { hx, hy } = hoop;
    const [bx, by, bw, bh] = hoopBoardRect();
    // Pole from the board to the floor
    c.fillStyle = '#64748b';
    c.fillRect(bx + bw, by + 60, 14, HOOP_FLOOR - by - 60);
    c.fillRect(bx + bw - 4, HOOP_FLOOR - 16, 40, 16);
    // Backboard (seen from the side, with a hint of the front)
    c.fillStyle = '#fff';
    c.strokeStyle = '#ef4444';
    c.lineWidth = 4;
    c.beginPath(); c.roundRect ? c.roundRect(bx - 4, by, bw + 8, bh, 4) : c.rect(bx - 4, by, bw + 8, bh); c.fill(); c.stroke();
    // Back half of the ring
    c.strokeStyle = '#c2410c';
    c.lineWidth = 6;
    c.beginPath(); c.ellipse(hx, hy, HOOP_RIM, 12, 0, Math.PI, Math.PI * 2); c.stroke();
    hoop.balls.forEach(b => hoopDrawBall(c, b));
    // Net: swings after a basket
    const sw = Math.sin(hoop.t * 18) * 10 * hoop.net;
    c.strokeStyle = 'rgba(255,255,255,0.95)';
    c.lineWidth = 3;
    const netH = 70 + hoop.net * 14;
    for (let i = 0; i <= 6; i++) {
        const tx = hx - HOOP_RIM + i * HOOP_RIM / 3;
        const bx2 = hx - HOOP_RIM * 0.55 + i * HOOP_RIM * 0.55 / 3 + sw;
        c.beginPath(); c.moveTo(tx, hy); c.lineTo(bx2, hy + netH); c.stroke();
    }
    for (let j = 1; j <= 3; j++) {
        const f = j / 3;
        const w = HOOP_RIM * (1 - 0.45 * f);
        c.beginPath(); c.moveTo(hx - w + sw * f, hy + netH * f); c.lineTo(hx + w + sw * f, hy + netH * f); c.stroke();
    }
    // Front half of the ring
    c.strokeStyle = '#f97316';
    c.lineWidth = 7;
    c.beginPath(); c.ellipse(hx, hy, HOOP_RIM, 12, 0, 0, Math.PI); c.stroke();
    c.strokeStyle = '#f97316';
    c.lineWidth = 6;
    c.beginPath(); c.moveTo(hx + HOOP_RIM, hy); c.lineTo(bx, hy); c.stroke();
    // A bouncing arrow above the waiting ball until the first throw
    const rb = hoopReady();
    if (rb && !hoop.score && Math.abs(rb.x - rb.tx) < 4) {
        c.font = '44px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('👆', rb.x, rb.y - 80 - Math.abs(Math.sin(hoop.t * 4)) * 20);
    }
    hoop.parts.forEach(p => {
        c.globalAlpha = Math.max(0, p.life);
        c.fillStyle = p.c;
        c.fillRect(p.x - 5, p.y - 5, 10, 10);
    });
    c.globalAlpha = 1;
}

function hoopLoop(t) {
    if (!hoopOpen) return;
    const dt = Math.min(0.033, (t - (hoop.last || t)) / 1000);
    hoop.last = t;
    hoopStep(dt);
    hoopDraw();
    hoop.raf = requestAnimationFrame(hoopLoop);
}

function hoopRenderBalls() {
    const box = document.getElementById('hoopBalls');
    box.innerHTML = '';
    HOOP_BALLS.forEach((k, i) => {
        const b = el(`<button class="bsk-pick${i === hoop.kind ? ' sel' : ''}" aria-label="${k.k}" style="${hoopBallCss(k)}">${k.star ? '⭐' : ''}</button>`);
        b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            hoop.kind = i;
            box.querySelectorAll('.bsk-pick').forEach((s, j) => s.classList.toggle('sel', j === i));
            const r = hoopReady();
            if (r) r.kind = i;
            hoopBounceSound(0.15);
            if (window.speechSynthesis) speechSynthesis.cancel();
            speak(k.k);
        });
        box.appendChild(b);
    });
}

function openHoop() {
    hoopOpen = true;
    hoopEl.classList.add('open');
    hoopFit();
    hoop.balls = [];
    hoop.parts = [];
    hoop.score = 0;
    hoop.gest = null;
    hoop.t = 0;
    hoop.spawnAt = 0;
    hoop.moveT = 1;
    hoop.spot = Math.floor(Math.random() * HOOP_SPOTS.length);
    hoop.hx = HOOP_SPOTS[hoop.spot].x;
    hoop.hy = HOOP_SPOTS[hoop.spot].y;
    hoopHud();
    hoopRenderBalls();
    hoop.last = 0;
    cancelAnimationFrame(hoop.raf);
    hoop.raf = requestAnimationFrame(hoopLoop);
    speak('Basketbal! Veeg de bal omhoog, of tik erop.');
}

function closeHoop() {
    hoopOpen = false;
    hoop.gest = null;
    cancelAnimationFrame(hoop.raf);
    if (window.speechSynthesis) speechSynthesis.cancel();
    hoopEl.classList.remove('open');
    hoopRoomBoard();
    _playWhoosh();
}
window.addEventListener('resize', () => { if (hoopOpen) hoopFit(); });
document.getElementById('hoopClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeHoop(); });
hoopEl.addEventListener('pointerdown', (e) => e.stopPropagation());
