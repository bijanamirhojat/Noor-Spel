/* 🏐 Strand: zee met golfjes, een parasol, een zandkasteel, een krabbetje, schelpen en de bus naar de dierentuin.
   Binnen: hooghouden! Tik de strandbal omhoog; vliegt hij over het net, dan kopt de zeehond hem terug.
   Het record wordt bewaard (localStorage). */
const BEACH_KEY = 'noor-prinses-strand';
let beachBest = 0;
try { beachBest = Math.max(0, parseInt(localStorage.getItem(BEACH_KEY), 10) || 0); } catch (e) {}

function beachBoing(n = 0) { playFreqSweep(260 + n * 12, 520 + n * 20, 0.12, 0.14); }
function beachWaves(ms = 900) {
    startNoise('shower');
    setTimeout(stopNoise, ms);
}

defineRoom({
    key: 'strand',
    name: 'Strand',
    icon: '🏐',
    say: 'Het strand',
    build(x) {
        place(el('<div class="bc-sea"><div class="wave"></div><div class="wave w2"></div></div>'), x, 300);
        place(el('<div class="bc-sun">☀️</div>'), x + 640, -40);
        place(el('<div class="bc-gull">🕊️</div>'), x + 120, 40);
        place(el('<div class="bc-boat">⛵</div>'), x + 470, 258);
        addObj(`<div class="bc-parasol"><div class="top"></div><div class="pole"></div><div class="towel"></div></div>`, x + 20, 180, x + 110, (node) => {
            node.classList.remove('spin'); void node.offsetWidth; node.classList.add('spin');
            playFreqSweep(400, 900, 0.4, 0.1);
        });
        addObj(`<div class="bc-net"><div class="post"></div><div class="mesh"></div><div class="post r"></div><span class="ball">🏐</span>
            <div class="tap-hint" style="left:96px;top:-70px">👇</div></div>`, x + 215, 210, x + 330, openBeach);
        addObj('<div class="bc-castle"><span class="flag">🚩</span><div class="t l"></div><div class="t r"></div><div class="keep"></div><span class="shell">🐚</span></div>', x + 440, 300, x + 500, (node) => {
            bounceEl(node, 'jump');
            node.classList.toggle('flag-on');
            playTone(node.classList.contains('flag-on') ? 784 : 523, 0.18, 0.1, 'triangle');
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top);
            for (let i = 0; i < 18; i++) spawnSparkle(p.x + (Math.random() - 0.5) * 80, p.y + 20, { vy: -60 - Math.random() * 50, vx: (Math.random() - 0.5) * 60, hue: 40 + Math.random() * 20, size: 4 + Math.random() * 4, max: 1.2 });
        });
        addObj('<div class="bc-crab"><span>🦀</span></div>', x + 380, 385, x + 380, (node) => {
            node.classList.remove('run'); void node.offsetWidth; node.classList.add('run');
            [700, 900, 700, 900].forEach((f, i) => setTimeout(() => playTone(f, 0.05, 0.08, 'square'), i * 90));
        });
        scene.rides = { dierentuin: addBus(x + 560, x + 610, 'dierentuin', -56) };
        addObj('<div class="emoji-obj bc-shell">🐚</div>', x + 190, 400, x + 210, (node) => {
            bounceEl(node, 'wobble');
            beachWaves(1400);
            playFreqSweep(300, 180, 1.2, 0.06);
        });
    }
});

/* ─────────── Hooghouden (overlay) ─────────── */
const bcEl = document.getElementById('beachOv');
const bcStage = document.getElementById('beachStage');
const bcBall = document.getElementById('beachBall');
const bcSeal = document.getElementById('beachSeal');
let beachOpen = false;
// Positions in px inside the stage; ground/net come from the stage size
const bc = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, sealX: 0, hits: 0, raf: 0, last: 0, down: false, W: 0, H: 0, R: 40 };

function bcSize() {
    const r = bcStage.getBoundingClientRect();
    bc.W = r.width;
    bc.H = r.height;
    bc.R = Math.max(30, Math.min(55, r.height * 0.08));
    bcBall.style.fontSize = (bc.R * 2) + 'px';
}
// Gravity is low on purpose: a slow floaty ball that little hands can keep up
function bcG() { return bc.H * 0.75; }
function bcGround() { return bc.H * 0.86; }
function bcNetX() { return bc.W * 0.62; }
function bcNetTop() { return bc.H * 0.5; }

function bcScore() {
    document.getElementById('beachCount').textContent = `🏐 ${bc.hits}`;
    document.getElementById('beachBest').textContent = `🏆 ${beachBest}`;
}

function bcServe() {
    bcSize();
    bc.x = bc.W * 0.3;
    bc.y = bc.H * 0.12;
    bc.vx = 0;
    bc.vy = 0;
    bc.down = false;
    bcBall.classList.remove('flat');
    bc.sealX = bc.W * 0.82;
}

function bcFx(px, py, set, n = 6) {
    const o = bcEl.getBoundingClientRect();
    const s = bcStage.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const sp = document.createElement('span');
        sp.className = 'scope-spark';
        sp.textContent = randomPick(set);
        const a = Math.random() * Math.PI * 2;
        sp.style.left = (s.left - o.left + px) + 'px';
        sp.style.top = (s.top - o.top + py) + 'px';
        sp.style.setProperty('--dx', Math.cos(a) * 60 + 'px');
        sp.style.setProperty('--dy', (Math.sin(a) * 40 - 30) + 'px');
        bcEl.appendChild(sp);
        setTimeout(() => sp.remove(), 900);
    }
}

function bcHit(px) {
    // Bounce up to near the top of the stage; tapping beside the ball pushes it the other way
    bc.vy = -Math.sqrt(2 * bcG() * Math.max(bc.H * 0.3, bc.y - bc.H * 0.1));
    bc.vx = (bc.x - px) * 2.2 + (Math.random() * 0.35 - 0.08) * bc.W;
    bc.hits++;
    beachBoing(bc.hits % 8);
    bcFx(bc.x, bc.y + bc.R, ['✨', '💦'], 4);
    if (bc.hits > beachBest) {
        beachBest = bc.hits;
        try { localStorage.setItem(BEACH_KEY, String(beachBest)); } catch (e) {}
    }
    if (bc.hits % 5 === 0) {
        playCorrect();
        ovCheer(bcEl, document.getElementById('beachCount'), ['⭐', '🎉', '🐚', '✨']);
        const c = document.getElementById('beachCount');
        c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    }
    bcScore();
}

function bcSealHit() {
    // The seal always heads it back over the net
    bc.vy = -Math.sqrt(2 * bcG() * bc.H * (0.5 + Math.random() * 0.12));
    bc.vx = -(0.32 + Math.random() * 0.12) * bc.W;
    bcSeal.classList.remove('head'); void bcSeal.offsetWidth; bcSeal.classList.add('head');
    playTone(330, 0.1, 0.12, 'square');
    setTimeout(() => playTone(440, 0.1, 0.12, 'square'), 100);
}

function bcStep(t) {
    if (!beachOpen) return;
    const dt = Math.min(0.033, (t - (bc.last || t)) / 1000);
    bc.last = t;
    const R = bc.R;
    const ground = bcGround();
    const netX = bcNetX();
    const netTop = bcNetTop();
    if (!bc.down) {
        bc.vy = Math.min(bc.vy + bcG() * dt, bc.H * 1.2);
        const px = bc.x;
        bc.x += bc.vx * dt;
        bc.y += bc.vy * dt;
        bc.rot += bc.vx * dt * 0.6;
        // Side walls
        if (bc.x < R) { bc.x = R; bc.vx = Math.abs(bc.vx) * 0.8; }
        if (bc.x > bc.W - R) { bc.x = bc.W - R; bc.vx = -Math.abs(bc.vx) * 0.8; }
        // The net: bounce off it when coming in below its top
        if (bc.y + R * 0.5 > netTop && ((px < netX && bc.x + R * 0.6 > netX) || (px > netX && bc.x - R * 0.6 < netX))) {
            bc.x = px < netX ? netX - R * 0.6 : netX + R * 0.6;
            bc.vx = -bc.vx * 0.5;
            playTone(200, 0.08, 0.08, 'triangle');
        }
        // Seal on the right side: follows the ball and heads it back
        const sealHead = ground - bc.H * 0.2;
        if (bc.x > netX) {
            bc.sealX += (Math.max(netX + R * 1.5, bc.x) - bc.sealX) * Math.min(1, dt * 8);
            if (bc.vy > 0 && bc.y + R > sealHead) { bc.y = sealHead - R; bcSealHit(); }
        } else {
            bc.sealX += (bc.W * 0.82 - bc.sealX) * Math.min(1, dt * 2);
        }
        // Plof in the sand
        if (bc.y + R >= ground) {
            bc.y = ground - R;
            bc.down = true;
            bcBall.classList.add('flat');
            playFreqSweep(300, 90, 0.3, 0.15);
            bcFx(bc.x, ground, ['💨', '🟡'], 6);
            const b = document.getElementById('beachBubble');
            b.textContent = bc.hits >= 3 ? `Wauw, ${bc.hits} keer! 🎉` : 'Oeps! Nog een keer!';
            b.classList.add('show');
            setTimeout(() => {
                b.classList.remove('show');
                if (!beachOpen) return;
                bc.hits = 0;
                bcScore();
                bcServe();
            }, 1400);
        }
    }
    bcBall.style.transform = `translate(${bc.x - R}px, ${bc.y - R}px) rotate(${bc.rot}deg)`;
    bcSeal.style.left = bc.sealX + 'px';
    bc.raf = requestAnimationFrame(bcStep);
}

bcStage.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (bc.down) return;
    const r = bcStage.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    // Very forgiving: anywhere near the ball counts
    if (Math.hypot(px - bc.x, py - bc.y) < bc.R * 2.6 && bc.x < bcNetX()) bcHit(px);
});

function openBeach() {
    beachOpen = true;
    bcEl.classList.add('open');
    bc.hits = 0;
    bcScore();
    bcServe();
    bc.last = 0;
    cancelAnimationFrame(bc.raf);
    bc.raf = requestAnimationFrame(bcStep);
    beachWaves(900);
}

function closeBeach() {
    beachOpen = false;
    cancelAnimationFrame(bc.raf);
    stopNoise();
    bcEl.classList.remove('open');
    _playWhoosh();
}
window.addEventListener('resize', () => { if (beachOpen) bcSize(); });
document.getElementById('beachClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeBeach(); });
bcEl.addEventListener('pointerdown', (e) => e.stopPropagation());
