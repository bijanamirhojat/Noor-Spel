/* 👻 Spookhuis (lief, niet eng): pompoenen, vleermuisjes, een heksenketel en een vriendelijk spookje.
   Binnen: zoek met de zaklamp de 6 verstopte spookjes; daarna gaat het licht aan en is er spokenfeest. */
const SP_GHOSTS = 6;
const SP_LIGHT_R = 95;        // radius of the light (px)
const SP_FIND_MS = 450;       // how long the light must shine on a ghost
// Hiding spots (% of the room): behind the cupboard, under the bed, in the painting, ...
const SP_SPOTS = [[14, 40], [30, 76], [50, 22], [66, 62], [84, 36], [90, 80], [8, 82], [44, 52], [74, 18], [58, 86]];
const SP_DRESS = ['🎀', '👑', '🎩', '🌸', '⭐', '🍭', '', '🕶️'];

function ghostGiggle() {
    [880, 1047, 988, 1175, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 0.08, 'sine'), i * 70));
}
function ghostBoo() {
    playFreqSweep(300, 600, 0.35, 0.12);
    setTimeout(() => playFreqSweep(600, 250, 0.45, 0.12), 300);
}

defineRoom({
    key: 'spookhuis',
    name: 'Spookhuis',
    icon: '👻',
    say: 'Het spookhuis',
    build(x) {
        place(el('<div class="sp-moon">🌕</div>'), x + 620, 20);
        [[120, 60], [420, 30], [660, 120]].forEach(([bx, by], i) =>
            place(el(`<div class="sp-bat" style="animation-delay:${-i * 1.7}s">🦇</div>`), x + bx, by));
        addObj(`<div class="sp-house">
            <div class="roof"></div><div class="tower"><div class="win lit"><span>👻</span></div></div>
            <div class="body"><div class="win lit"></div><div class="win"></div><div class="door"><span></span></div></div>
            <div class="web">🕸️</div>
            <div class="tap-hint" style="left:150px;top:-40px">👇</div>
        </div>`, x + 220, 70, x + 380, openGhostHunt);
        [[60, 370], [600, 380], [680, 362]].forEach(([px, py]) => {
            addObj('<div class="sp-pumpkin"><span>🎃</span></div>', x + px, py, x + px + 30, (node) => {
                node.classList.toggle('glow');
                playTone(node.classList.contains('glow') ? 660 : 440, 0.2, 0.1, 'triangle');
            });
        });
        addObj('<div class="sp-cauldron"><div class="pot"></div><span class="b">🫧</span><span class="b" style="left:46px;animation-delay:-0.6s">🫧</span></div>', x + 80, 330, x + 130, (node) => {
            bounceEl(node, 'wobble');
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top);
            for (let i = 0; i < 30; i++) spawnSparkle(p.x + (Math.random() - 0.5) * 50, p.y, { vy: -80 - Math.random() * 60, vx: (Math.random() - 0.5) * 40, g: -10, hue: 100 + Math.random() * 200, size: 5 + Math.random() * 6, max: 1.6 });
            [200, 260, 180, 300].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 0.12, 'sine'), i * 120));
        });
        addObj('<div class="sp-friend"><span>👻</span><b>Boe!</b></div>', x + 640, 200, x + 640, (node) => {
            node.classList.remove('boo'); void node.offsetWidth; node.classList.add('boo');
            ghostBoo();
            setTimeout(ghostGiggle, 700);
        });
    }
});

/* ─────────── Spookjes zoeken (overlay) ─────────── */
const spEl = document.getElementById('ghostOv');
const spRoom = document.getElementById('ghostRoom');
let ghostOpen = false;
const sp = { lx: 0, ly: 0, found: 0, raf: 0, last: 0, done: false };

function renderGhostTray() {
    document.getElementById('ghostTray').innerHTML = Array.from({ length: SP_GHOSTS }, (_, i) =>
        `<span class="${i < sp.found ? 'got' : ''}">👻</span>`).join('');
}

function newGhostHunt() {
    spRoom.querySelectorAll('.sp-ghost').forEach(g => g.remove());
    sp.found = 0;
    sp.done = false;
    spEl.classList.remove('lights');
    document.getElementById('ghostAgain').style.display = 'none';
    document.getElementById('ghostHint').textContent = 'Schijn met je vinger in het donker 🔦';
    renderGhostTray();
    shuffle(SP_SPOTS.slice()).slice(0, SP_GHOSTS).forEach(([gx, gy], i) => {
        const g = el(`<div class="sp-ghost" style="left:${gx}%;top:${gy}%;--h:${i * 50}deg;animation-delay:${-i * 0.7}s">
            <span class="g">👻</span><span class="d">${SP_DRESS[i % SP_DRESS.length]}</span></div>`);
        g.dataset.lit = '0';
        spRoom.appendChild(g);
    });
    const r = spRoom.getBoundingClientRect();
    sp.lx = r.width / 2;
    sp.ly = r.height / 2;
    moveLight();
}

function moveLight() {
    spRoom.style.setProperty('--lx', sp.lx + 'px');
    spRoom.style.setProperty('--ly', sp.ly + 'px');
}

function ghostFrame(now) {
    if (!ghostOpen) return;
    const dt = Math.min(0.05, (now - (sp.last || now)) / 1000);
    sp.last = now;
    if (!sp.done) {
        const rr = spRoom.getBoundingClientRect();
        spRoom.querySelectorAll('.sp-ghost:not(.found)').forEach(g => {
            const r = g.getBoundingClientRect();
            const d = Math.hypot(r.left + r.width / 2 - rr.left - sp.lx, r.top + r.height / 2 - rr.top - sp.ly);
            let lit = +g.dataset.lit;
            lit = d < SP_LIGHT_R ? lit + dt * 1000 : Math.max(0, lit - dt * 2000);
            g.dataset.lit = lit;
            g.classList.toggle('seen', lit > 0);
            if (lit >= SP_FIND_MS) findGhost(g);
        });
    }
    sp.raf = requestAnimationFrame(ghostFrame);
}

function findGhost(g) {
    g.classList.add('found');
    sp.found++;
    ghostGiggle();
    const o = spEl.getBoundingClientRect();
    const r = g.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '💜', '⭐']);
        const a = Math.random() * Math.PI * 2;
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.top + r.height / 2 - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * 60 + 'px');
        s.style.setProperty('--dy', Math.sin(a) * 60 + 'px');
        spEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    renderGhostTray();
    document.getElementById('ghostHint').textContent = sp.found < SP_GHOSTS ? `Hihi, gevonden! Nog ${SP_GHOSTS - sp.found} 👻` : '';
    if (sp.found >= SP_GHOSTS) setTimeout(ghostParty, 700);
}

// All found: lights on and a ghost dance
function ghostParty() {
    sp.done = true;
    spEl.classList.add('lights');
    document.getElementById('ghostHint').textContent = '🎉 Alle spookjes gevonden! Spokenfeest! 👻';
    playWin();
    const ghosts = [...spRoom.querySelectorAll('.sp-ghost')];
    ghosts.forEach((g, i) => {
        g.style.setProperty('--a', (i * 360 / ghosts.length) + 'deg');
        g.classList.add('dance');
    });
    [523, 659, 784, 659, 523, 659, 784, 1047, 988, 784, 659, 523].forEach((f, i) => setTimeout(() => playTone(f, 0.22, 0.1, 'triangle'), 400 + i * 220));
    setTimeout(() => { document.getElementById('ghostAgain').style.display = ''; }, 1500);
}

function lightAt(e) {
    const r = spRoom.getBoundingClientRect();
    sp.lx = Math.max(0, Math.min(r.width, e.clientX - r.left));
    sp.ly = Math.max(0, Math.min(r.height, e.clientY - r.top));
    moveLight();
}
spRoom.addEventListener('pointerdown', (e) => { e.stopPropagation(); lightAt(e); });
spRoom.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType !== 'mouse') lightAt(e); });

function openGhostHunt() {
    ghostOpen = true;
    spEl.classList.add('open');
    newGhostHunt();
    ghostBoo();
    sp.last = 0;
    cancelAnimationFrame(sp.raf);
    sp.raf = requestAnimationFrame(ghostFrame);
}

function closeGhostHunt() {
    ghostOpen = false;
    cancelAnimationFrame(sp.raf);
    spEl.classList.remove('open');
    _playWhoosh();
}

document.getElementById('ghostAgain').addEventListener('pointerdown', (e) => { e.stopPropagation(); newGhostHunt(); playPop(); });
document.getElementById('ghostClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeGhostHunt(); });
spEl.addEventListener('pointerdown', (e) => e.stopPropagation());
