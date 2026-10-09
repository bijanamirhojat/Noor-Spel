/* ✨ Glitterkamer: een discobal, glitterpotjes, een glitterbol om te schudden en een knutseltafel.
   Binnen: een glitterplaatje maken zoals echt: teken met lijm (of stempel een vorm), strooi glitter en schud
   de losse glitter eraf. Alleen wat op de lijm ligt blijft plakken. Het laatste plaatje hangt aan de muur
   (localStorage). Het blad is 1000 x 700; de lijm wordt ook bijgehouden in een grof raster (GL_CELL). */
const GLITTER_KEY = 'noor-prinses-glitter';
const GL_W = 1000;
const GL_H = 700;
const GL_CELL = 5;
const GL_GLUE_W = 30;
const GL_PAPERS = ['#4c1d95', '#1e3a8a', '#831843', '#0f172a', '#065f46'];
const GL_COLORS = [
    { k: 'roze', hue: 320 }, { k: 'goud', hue: 45 }, { k: 'zilver', hue: -1 }, { k: 'blauw', hue: 200 },
    { k: 'groen', hue: 140 }, { k: 'paars', hue: 275 }, { k: 'regenboog', hue: 'rb' }
];
const GL_SHAPES = ['❤️', '⭐', '👑', '🟣'];

defineRoom({
    key: 'glitterkamer',
    name: 'Glitterkamer',
    icon: '✨',
    say: 'De glitterkamer',
    build(x) {
        place(el('<div class="gl-cord"></div>'), x + 498, -500);
        addObj('<div class="gl-disco">🪩</div>', x + 460, 20, x + 500, (node) => {
            node.classList.remove('spin'); void node.offsetWidth; node.classList.add('spin');
            [523, 659, 784, 1047, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.1, 0.07, 'square'), i * 90));
            for (let i = 0; i < 70; i++) {
                spawnSparkle(x + 40 + Math.random() * 720, -40 + Math.random() * 60, { vx: (Math.random() - 0.5) * 40, vy: 40 + Math.random() * 80, g: 30, max: 2.4, size: 4 + Math.random() * 6 });
            }
        });
        place(el('<div class="gl-frame"><img id="glitterThumb" alt=""><span>✨</span></div>'), x + 60, 40);
        place(el('<div class="gl-shelf"></div>'), x + 560, 150);
        [[320, '#f472b6'], [45, '#facc15'], [200, '#38bdf8'], [140, '#4ade80']].forEach(([hue, c], i) => {
            addObj(`<div class="gl-jar" style="--c:${c}"><div class="lid"></div><div class="glass"></div></div>`, x + 570 + i * 50, 92, x + 600 + i * 40, (node) => {
                bounceEl(node, 'jump');
                playFreqSweep(1500 + i * 200, 2600, 0.2, 0.06);
                const r = node.getBoundingClientRect();
                const p = screenToWorld(r.left + r.width / 2, r.top);
                for (let k = 0; k < 30; k++) spawnSparkle(p.x, p.y, { vy: -100 - Math.random() * 120, vx: (Math.random() - 0.5) * 140, g: 120, hue: hue + (Math.random() - 0.5) * 20, size: 3 + Math.random() * 5, max: 1.6 });
            });
        });
        addObj('<div class="gl-globe"><div class="ball"><span>🦄</span><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="foot"></div></div>', x + 620, 250, x + 640, (node) => {
            node.classList.remove('shake'); void node.offsetWidth; node.classList.add('shake');
            startNoise('shower');
            setTimeout(stopNoise, 600);
            [1319, 1568, 1760, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.05, 'sine'), 500 + i * 180));
        });
        addObj(`<div class="gl-table"><div class="top"><div class="paper"></div><span class="glue">🧴</span><span class="spark">✨</span></div><div class="leg l"></div><div class="leg r"></div>
            <div class="tap-hint" style="left:120px;top:-60px">👇</div></div>`, x + 120, 280, x + 250, openGlitter);
        renderGlitterThumb();
    }
});

function renderGlitterThumb() {
    const img = document.getElementById('glitterThumb');
    if (!img) return;
    let src = null;
    try { src = localStorage.getItem(GLITTER_KEY); } catch (e) {}
    if (src) img.src = src;
    img.parentElement.classList.toggle('has', !!src);
}

/* ─────────── Glitterplaatje (overlay) ─────────── */
const glEl = document.getElementById('glitterOv');
const glPaper = document.getElementById('glitterPaper');
const glGlueC = document.getElementById('glitterGlue');
const glStuckC = document.getElementById('glitterStuck');
const glFxC = document.getElementById('glitterFx');
const glGlue = glGlueC.getContext('2d');
const glStuck = glStuckC.getContext('2d');
const glFx = glFxC.getContext('2d');
let glitterOpen = false;
const gl = {
    tool: 'glue', color: GL_COLORS[0], paper: 0, mask: new Uint8Array((GL_W / GL_CELL) * (GL_H / GL_CELL)),
    falling: [], loose: [], stuckPts: [], stuckN: 0, twinkles: [], last: null, down: false, shaking: 0, raf: 0, t: 0, tick: 0, dirty: false
};
[glGlueC, glStuckC, glFxC].forEach(c => { c.width = GL_W; c.height = GL_H; });

function glHint() {
    const h = { glue: '🧴 Teken met lijm, of kies een vorm', glitter: '✨ Strooi glitter op de lijm!' };
    document.getElementById('glitterHint').textContent = gl.shaking ? '👋 Schudden…' : h[gl.tool];
}

function glRenderTools() {
    document.querySelectorAll('.gl-tool').forEach(b => b.classList.toggle('sel', b.dataset.t === gl.tool));
    document.getElementById('glitterColors').innerHTML = GL_COLORS.map(c =>
        `<button class="gl-color${gl.color === c ? ' sel' : ''}" data-k="${c.k}" style="--g:${glSwatch(c)}" aria-label="${c.k}"></button>`).join('');
    document.querySelectorAll('.gl-color').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        gl.color = GL_COLORS.find(c => c.k === b.dataset.k);
        gl.tool = 'glitter';
        glRenderTools();
        playFreqSweep(1800, 2600, 0.12, 0.06);
    }));
    glHint();
}

function glSwatch(c) {
    if (c.hue === 'rb') return 'conic-gradient(#f472b6, #facc15, #4ade80, #38bdf8, #a78bfa, #f472b6)';
    if (c.hue < 0) return 'radial-gradient(circle at 35% 35%, #fff, #cbd5e1 50%, #64748b)';
    return `radial-gradient(circle at 35% 35%, hsl(${c.hue},100%,85%), hsl(${c.hue},90%,55%) 50%, hsl(${c.hue},80%,35%))`;
}

// A glitter speck colour: the chosen colour with a random lightness, sometimes a white flash
function glSpeck() {
    if (Math.random() < 0.12) return '#fff';
    const h = gl.color.hue;
    const l = 45 + Math.random() * 40;
    if (h === 'rb') return `hsl(${Math.random() * 360},95%,${l}%)`;
    if (h < 0) return `hsl(220,10%,${55 + Math.random() * 40}%)`;
    return `hsl(${h + (Math.random() - 0.5) * 16},95%,${l}%)`;
}

function glPoint(e) {
    const r = glPaper.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * GL_W, y: (e.clientY - r.top) / r.height * GL_H };
}

/* ── Lijm ── */
function glMark(cx, cy, rad) {
    const gw = GL_W / GL_CELL;
    const x0 = Math.max(0, Math.floor((cx - rad) / GL_CELL)), x1 = Math.min(gw - 1, Math.floor((cx + rad) / GL_CELL));
    const y0 = Math.max(0, Math.floor((cy - rad) / GL_CELL)), y1 = Math.min(GL_H / GL_CELL - 1, Math.floor((cy + rad) / GL_CELL));
    for (let gy = y0; gy <= y1; gy++) {
        for (let gx = x0; gx <= x1; gx++) {
            if (Math.hypot(gx * GL_CELL + GL_CELL / 2 - cx, gy * GL_CELL + GL_CELL / 2 - cy) <= rad) gl.mask[gy * gw + gx] = 1;
        }
    }
}
function glGlueStyle() {
    glGlue.strokeStyle = glGlue.fillStyle = 'rgba(255,255,255,0.3)';
    glGlue.lineWidth = GL_GLUE_W;
    glGlue.lineCap = glGlue.lineJoin = 'round';
}
function glGlueLine(a, b) {
    glGlueStyle();
    glGlue.beginPath();
    glGlue.moveTo(a.x, a.y);
    glGlue.lineTo(b.x + 0.01, b.y);
    glGlue.stroke();
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.ceil(d / 4));
    for (let i = 0; i <= n; i++) glMark(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n, GL_GLUE_W / 2);
    gl.dirty = true;
}

// Glue shapes are stamped in the middle (or a bit beside earlier ones)
function glShapePath(kind, cx, cy, s) {
    const p = new Path2D();
    if (kind === '❤️') {
        p.moveTo(cx, cy + s * 0.9);
        p.bezierCurveTo(cx - s * 1.5, cy - s * 0.1, cx - s * 0.7, cy - s * 1.1, cx, cy - s * 0.45);
        p.bezierCurveTo(cx + s * 0.7, cy - s * 1.1, cx + s * 1.5, cy - s * 0.1, cx, cy + s * 0.9);
    } else if (kind === '⭐') {
        for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5;
            const rr = i % 2 ? s * 0.42 : s;
            i ? p.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : p.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
    } else if (kind === '👑') {
        p.moveTo(cx - s, cy + s * 0.6);
        p.lineTo(cx - s, cy - s * 0.6);
        p.lineTo(cx - s * 0.5, cy);
        p.lineTo(cx, cy - s * 0.85);
        p.lineTo(cx + s * 0.5, cy);
        p.lineTo(cx + s, cy - s * 0.6);
        p.lineTo(cx + s, cy + s * 0.6);
    } else {
        p.arc(cx, cy, s * 0.8, 0, Math.PI * 2);
    }
    p.closePath();
    return p;
}
let glStampN = 0;
function glStamp(kind) {
    const spots = [[500, 350], [260, 220], [740, 480], [740, 220], [260, 480]];
    const [cx, cy] = spots[glStampN++ % spots.length];
    const s = 170;
    const path = glShapePath(kind, cx, cy, s);
    glGlueStyle();
    glGlue.fill(path);
    const gw = GL_W / GL_CELL;
    for (let gy = Math.max(0, Math.floor((cy - s * 1.2) / GL_CELL)); gy < Math.min(GL_H / GL_CELL, (cy + s * 1.2) / GL_CELL); gy++) {
        for (let gx = Math.max(0, Math.floor((cx - s * 1.6) / GL_CELL)); gx < Math.min(gw, (cx + s * 1.6) / GL_CELL); gx++) {
            if (glGlue.isPointInPath(path, gx * GL_CELL + GL_CELL / 2, gy * GL_CELL + GL_CELL / 2)) gl.mask[gy * gw + gx] = 1;
        }
    }
    gl.tool = 'glue';
    glRenderTools();
    gl.dirty = true;
    playFreqSweep(300, 150, 0.25, 0.15);
    const b = document.querySelector(`.gl-shape[data-s="${kind}"]`);
    if (b) bounceEl(b, 'jump');
}
function glOnGlue(x, y) {
    const gx = Math.floor(x / GL_CELL), gy = Math.floor(y / GL_CELL);
    if (gx < 0 || gy < 0 || gx >= GL_W / GL_CELL || gy >= GL_H / GL_CELL) return false;
    return gl.mask[gy * (GL_W / GL_CELL) + gx] === 1;
}

/* ── Glitter ── */
function glSprinkle(x, y, n = 22) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * 46;
        const tx = x + Math.cos(a) * d, ty = y + Math.sin(a) * d;
        gl.falling.push({ x: tx + (Math.random() - 0.5) * 20, y: ty - 50 - Math.random() * 30, tx, ty, c: glSpeck(), s: 4 + Math.random() * 5, r: Math.random() * Math.PI });
    }
    if (++gl.tick % 3 === 0) playTone(2000 + Math.random() * 1600, 0.04, 0.03, 'sine');
}
function glLand(p) {
    if (p.tx < 0 || p.ty < 0 || p.tx > GL_W || p.ty > GL_H) return;
    if (glOnGlue(p.tx, p.ty)) {
        glStuck.save();
        glStuck.translate(p.tx, p.ty);
        glStuck.rotate(p.r);
        glStuck.fillStyle = p.c;
        // Stuck glitter lies flat and a bit spread out, so the glue gets covered nicely
        glStuck.fillRect(-p.s * 0.75, -p.s * 0.6, p.s * 1.5, p.s * 1.2);
        glStuck.restore();
        gl.stuckN++;
        if (gl.stuckPts.length < 600) gl.stuckPts.push([p.tx, p.ty]);
        else gl.stuckPts[Math.floor(Math.random() * 600)] = [p.tx, p.ty];
        gl.dirty = true;
    } else {
        gl.loose.push({ x: p.tx, y: p.ty, c: p.c, s: p.s, r: p.r, vx: 0, vy: 0 });
        if (gl.loose.length > 4000) gl.loose.shift();
    }
}

function glShake() {
    if (gl.shaking || !gl.loose.length && !gl.stuckN) return;
    gl.shaking = 1;
    glHint();
    glPaper.classList.remove('shake'); void glPaper.offsetWidth; glPaper.classList.add('shake');
    gl.loose.forEach(p => { p.vx = (Math.random() - 0.5) * 300; p.vy = 100 + Math.random() * 300; });
    startNoise('shower');
    for (let i = 0; i < 10; i++) setTimeout(() => playTone(1500 + Math.random() * 2000, 0.04, 0.04, 'sine'), i * 90);
    setTimeout(() => {
        stopNoise();
        gl.shaking = 0;
        gl.loose = [];
        glHint();
        if (glitterOpen && gl.stuckN > 40) {
            playWin();
            ovCheer(glEl, glPaper, ['✨', '💖', '⭐', '💫']);
            for (let i = 0; i < 40; i++) glTwinkle();
        }
    }, 1300);
}

function glTwinkle() {
    if (!gl.stuckPts.length) return;
    const [x, y] = randomPick(gl.stuckPts);
    gl.twinkles.push({ x, y, life: 0, s: 8 + Math.random() * 14 });
}

function glDrawStar(c, x, y, s, a) {
    c.globalAlpha = a;
    c.fillStyle = '#fff';
    c.beginPath();
    c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y);
    c.quadraticCurveTo(x, y, x, y + s); c.quadraticCurveTo(x, y, x - s, y);
    c.quadraticCurveTo(x, y, x, y - s);
    c.fill();
    c.globalAlpha = 1;
}

function glLoop(t) {
    if (!glitterOpen) return;
    const dt = Math.min(0.05, (t - (gl.t || t)) / 1000);
    gl.t = t;
    for (let i = gl.falling.length - 1; i >= 0; i--) {
        const p = gl.falling[i];
        p.x += (p.tx - p.x) * Math.min(1, dt * 14);
        p.y += 500 * dt;
        if (p.y >= p.ty) { gl.falling.splice(i, 1); glLand(p); }
    }
    if (gl.shaking) {
        gl.loose.forEach(p => { p.vy += 1600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 8; });
    }
    if (gl.stuckPts.length && Math.random() < dt * 6) glTwinkle();
    const c = glFx;
    c.clearRect(0, 0, GL_W, GL_H);
    gl.loose.forEach(p => {
        c.save(); c.translate(p.x, p.y); c.rotate(p.r);
        c.fillStyle = p.c; c.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.8);
        c.restore();
    });
    gl.falling.forEach(p => { c.fillStyle = p.c; c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); });
    for (let i = gl.twinkles.length - 1; i >= 0; i--) {
        const tw = gl.twinkles[i];
        tw.life += dt * 1.8;
        if (tw.life >= 1) { gl.twinkles.splice(i, 1); continue; }
        glDrawStar(c, tw.x, tw.y, tw.s * Math.sin(tw.life * Math.PI), Math.sin(tw.life * Math.PI));
    }
    gl.raf = requestAnimationFrame(glLoop);
}

glPaper.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (gl.shaking) return;
    gl.down = true;
    try { glPaper.setPointerCapture(e.pointerId); } catch (err) {}
    const p = glPoint(e);
    gl.last = p;
    if (gl.tool === 'glue') { glGlueLine(p, p); playFreqSweep(200, 260, 0.1, 0.08); } else glSprinkle(p.x, p.y, 24);
});
glPaper.addEventListener('pointermove', (e) => {
    if (!gl.down || gl.shaking) return;
    const p = glPoint(e);
    if (gl.tool === 'glue') glGlueLine(gl.last, p);
    else {
        // Sprinkle all along the way, also when the finger moves fast
        const d = Math.hypot(p.x - gl.last.x, p.y - gl.last.y);
        if (d <= 12) return;
        const n = Math.min(40, Math.ceil(d / 20));
        for (let i = 1; i <= n; i++) glSprinkle(gl.last.x + (p.x - gl.last.x) * i / n, gl.last.y + (p.y - gl.last.y) * i / n, i === n ? 22 : 14);
    }
    gl.last = p;
});
const glUp = () => { gl.down = false; };
glPaper.addEventListener('pointerup', glUp);
glPaper.addEventListener('pointercancel', glUp);

document.querySelectorAll('.gl-tool').forEach(b => b.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const t = b.dataset.t;
    if (t === 'shake') { bounceEl(b, 'jump'); glShake(); return; }
    if (t === 'new') { glClear(true); return; }
    gl.tool = t;
    glRenderTools();
    playPop();
}));
document.querySelectorAll('.gl-shape').forEach(b => b.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!gl.shaking) glStamp(b.dataset.s);
}));

function glClear(nextPaper) {
    if (nextPaper) {
        glSave();
        gl.paper = (gl.paper + 1) % GL_PAPERS.length;
        _playWhoosh();
    }
    glPaper.style.background = GL_PAPERS[gl.paper];
    glGlue.clearRect(0, 0, GL_W, GL_H);
    glStuck.clearRect(0, 0, GL_W, GL_H);
    gl.mask.fill(0);
    gl.falling = [];
    gl.loose = [];
    gl.stuckPts = [];
    gl.twinkles = [];
    gl.stuckN = 0;
    gl.dirty = false;
    glStampN = 0;
    gl.tool = 'glue';
    glRenderTools();
}

// Keep the last picture with glitter on it for the frame on the wall
function glSave() {
    if (!gl.dirty || !gl.stuckN) return;
    const c = document.createElement('canvas');
    c.width = 300;
    c.height = 210;
    const x = c.getContext('2d');
    x.fillStyle = GL_PAPERS[gl.paper];
    x.fillRect(0, 0, 300, 210);
    x.drawImage(glGlueC, 0, 0, 300, 210);
    x.drawImage(glStuckC, 0, 0, 300, 210);
    try { localStorage.setItem(GLITTER_KEY, c.toDataURL('image/jpeg', 0.85)); } catch (e) {}
    renderGlitterThumb();
}

function openGlitter() {
    glitterOpen = true;
    glEl.classList.add('open');
    if (!gl.dirty) glClear(false);
    glRenderTools();
    gl.t = 0;
    cancelAnimationFrame(gl.raf);
    gl.raf = requestAnimationFrame(glLoop);
    playMusicBox();
}

function closeGlitter() {
    glitterOpen = false;
    cancelAnimationFrame(gl.raf);
    stopNoise();
    gl.down = false;
    gl.shaking = 0;
    gl.falling.forEach(glLand);
    gl.falling = [];
    glSave();
    glEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('glitterClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeGlitter(); });
glEl.addEventListener('pointerdown', (e) => e.stopPropagation());
