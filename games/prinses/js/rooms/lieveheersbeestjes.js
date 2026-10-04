/* 🐞 Lieveheersbeestjeskamer: een reuzentuin. De toverpaddenstoel maakt de prinses klein,
   een lieveheersbeestje neemt haar mee de lucht in, en dan zoek je samen zijn 7 stippen. */
const BUG_SPOTS = [[52, 30], [74, 26], [92, 36], [60, 46], [82, 50], [98, 52], [68, 18]];
const BUG_REST = { dx: 470, y: 292 };   // the ladybug's leaf (relative to the room)
const BUG_W = 110;
const BUG_H = 74;

// Side view ladybug; `spots` = how many spots it has (0..7)
function ladybugSVG(spots = 7) {
    return `<svg viewBox="0 0 120 80">
        <g class="lb-wing"><ellipse cx="62" cy="14" rx="30" ry="10" transform="rotate(-18 62 14)" fill="rgba(224,242,254,0.75)" stroke="#bae6fd"/>
            <ellipse cx="84" cy="12" rx="28" ry="9" transform="rotate(12 84 12)" fill="rgba(224,242,254,0.75)" stroke="#bae6fd"/></g>
        <g stroke="#111827" stroke-width="3" stroke-linecap="round"><line x1="44" y1="60" x2="38" y2="74"/><line x1="66" y1="62" x2="66" y2="76"/><line x1="88" y1="60" x2="96" y2="74"/></g>
        <path d="M34 62 Q34 12 76 12 Q114 14 114 62 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
        <path d="M76 12 Q70 38 74 62" stroke="#991b1b" stroke-width="2" fill="none"/>
        ${BUG_SPOTS.slice(0, spots).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#111827"/>`).join('')}
        <ellipse cx="58" cy="22" rx="9" ry="4" fill="rgba(255,255,255,0.5)" transform="rotate(-20 58 22)"/>
        <circle cx="28" cy="50" r="15" fill="#111827"/>
        <circle cx="22" cy="46" r="4.5" fill="#fff"/><circle cx="21" cy="46" r="2.2" fill="#111827"/>
        <path d="M18 56 Q22 60 27 56" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M26 36 Q20 20 10 18 M32 36 Q32 20 26 12" stroke="#111827" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="10" cy="18" r="3" fill="#111827"/><circle cx="26" cy="12" r="3" fill="#111827"/>
    </svg>`;
}

defineRoom({
    key: 'lieveheersbeestjes',
    name: 'Lieveheersbeestjes',
    icon: '🐞',
    say: 'De lieveheersbeestjeskamer',
    build(x) {
        place(el('<div class="giant-flower" style="--h:0deg">🌷</div>'), x + 10, 120);
        place(el('<div class="giant-flower" style="--h:0deg">🌻</div>'), x + 610, 90);
        place(el('<div class="giant-leaf"></div>'), x + BUG_REST.dx - 30, BUG_REST.y + 50);
        [[150, 80, 0], [380, 140, -3], [560, 60, -6]].forEach(([cx, cy, d]) =>
            place(el(`<div class="wall-bug" style="animation-delay:${d}s">🐞</div>`), x + cx, cy));
        state.rideBug = place(el(`<div class="ride-bug">${ladybugSVG(7)}</div>`), 0, 0);
        placeRideBug(x + BUG_REST.dx, BUG_REST.y, 1);
        addObj('<div class="magic-shroom">🍄<div class="tap-hint" style="left:20px;top:-50px">👇</div></div>', x + 300, 330, x + 330, shrinkAndFly);
        addObj('<div class="emoji-obj">🐛</div>', x + 180, 390, x + 200, (node) => {
            bounceEl(node, 'wobble');
            [0, 120, 240].forEach(t => setTimeout(() => playTone(900 + t, 0.08, 0.08, 'sine'), t));
        });
    }
});

// Ladybug position: (x, y) = middle of its belly in world units
function placeRideBug(x, y, facing) {
    const b = state.rideBug;
    b.style.transform = `translate(${x - BUG_W / 2}px, ${y - BUG_H + 8}px) scaleX(${facing < 0 ? 1 : -1})`;
}

function bugBuzz(ms) {
    for (let t = 0; t < ms; t += 120) setTimeout(() => playTone(180 + Math.random() * 30, 0.1, 0.04, 'sawtooth'), t);
}

function shrinkAndFly() {
    if (state.busy) return;
    state.busy = true;
    const pr = princessEl();
    const rx = roomX('lieveheersbeestjes');
    // 1. Hap! Small princess
    playFreqSweep(1400, 300, 0.7, 0.15);
    sparkleShower(state.x, 250, 40);
    pr.classList.add('tiny');
    setTimeout(() => {
        // 2. The ladybug flies over and lands next to her
        const bug = state.rideBug;
        bug.classList.add('flying');
        bugBuzz(900);
        const b0 = { x: rx + BUG_REST.dx, y: BUG_REST.y };
        const b1 = { x: state.x, y: FEET_Y - 6 };
        tween(900, (t) => {
            const e = ease(t);
            placeRideBug(b0.x + (b1.x - b0.x) * e, b0.y + (b1.y - b0.y) * e - Math.sin(Math.PI * t) * 80, b1.x < b0.x ? -1 : 1);
        }, () => {
            // 3. Hop on
            tween(400, (t) => { state.anim.dy = -BUG_H * 0.7 * t - Math.sin(Math.PI * t) * 30; }, () => {
                // 4. Fly a loop through the room together
                bugBuzz(2800);
                playFreqSweep(400, 1200, 0.5, 0.12);
                const x0 = state.x;
                tween(2800, (t) => {
                    const lift = Math.sin(Math.PI * t) * 190;
                    const prevX = state.x;
                    state.x = state.targetX = Math.max(rx + 80, Math.min(rx + 720, x0 + Math.sin(t * Math.PI * 2) * 260));
                    state.facing = state.x >= prevX ? 1 : -1;
                    state.anim.dy = -BUG_H * 0.7 - lift;
                    placeRideBug(state.x, FEET_Y - 6 - lift, state.facing);
                    if (Math.random() < 0.5) spawnSparkle(state.x - state.facing * 40, FEET_Y - 30 - lift, { vx: -state.facing * 40, vy: 10, g: 0, hue: 0, size: 4, max: 0.8 });
                }, () => {
                    openBugGame();
                });
            });
        });
    }, 800);
}

// After the game: fly home, hop off and grow big again
function landAndGrow() {
    const pr = princessEl();
    const bug = state.rideBug;
    const rx = roomX('lieveheersbeestjes');
    const sx = state.x;
    const sdy = state.anim.dy;
    tween(600, (t) => {
        state.anim.dy = sdy * (1 - t) - Math.sin(Math.PI * t) * 30;
        placeRideBug(sx, FEET_Y - 6 - Math.max(0, -sdy - BUG_H * 0.7) * (1 - t), state.facing);
    }, () => {
        resetAnim();
        bugBuzz(900);
        const b0 = { x: sx, y: FEET_Y - 6 };
        const b1 = { x: rx + BUG_REST.dx, y: BUG_REST.y };
        tween(900, (t) => {
            const e = ease(t);
            placeRideBug(b0.x + (b1.x - b0.x) * e, b0.y + (b1.y - b0.y) * e - Math.sin(Math.PI * t) * 80, b1.x < b0.x ? -1 : 1);
        }, () => {
            bug.classList.remove('flying');
            pr.classList.remove('tiny');
            playFreqSweep(300, 1400, 0.7, 0.15);
            sparkleShower(state.x, 150, 40);
            state.targetX = state.x;
            state.busy = false;
        });
    });
}

/* ─────────── Stippen zoeken (overlay) ─────────── */
const bugEl = document.getElementById('bugOv');
const bugStage = document.getElementById('bugStage');
let bugOpen = false;
const bg = { x: 0, y: 0, tx: 0, ty: 0, facing: 1, got: 0, raf: 0, last: 0, done: false };

function renderBugHud() {
    document.getElementById('bugHud').innerHTML = `${ladybugSVG(bg.got)}<span>${bg.got} / 7</span>`;
    // The ladybug you fly gets its spots back one by one too
    document.getElementById('bugPlayer').innerHTML = `<span class="bug-rider">👸</span>${ladybugSVG(bg.got)}`;
}

function newBugRound() {
    bugStage.querySelectorAll('.bug-spot, .bug-deco').forEach(n => n.remove());
    bg.got = 0;
    bg.done = false;
    document.getElementById('bugAgain').style.display = 'none';
    renderBugHud();
    const w = bugStage.clientWidth;
    const h = bugStage.clientHeight;
    bg.x = bg.tx = w / 2;
    bg.y = bg.ty = h / 2;
    for (let i = 0; i < 9; i++) {
        const d = el(`<span class="bug-deco">${randomPick(['🌸', '🌼', '🌷', '🌿', '🍀', '🌺'])}</span>`);
        d.style.left = (4 + i * 11 + Math.random() * 4) + '%';
        d.style.bottom = (Math.random() * 8) + '%';
        bugStage.appendChild(d);
    }
    for (let i = 0; i < 7; i++) {
        const s = el('<span class="bug-spot"></span>');
        // Spread over the stage, away from the middle where the ladybug starts
        let px, py;
        do {
            px = 8 + Math.random() * 84;
            py = 10 + Math.random() * 70;
        } while (Math.hypot(px - 50, py - 50) < 18);
        s.style.left = px + '%';
        s.style.top = py + '%';
        s.style.animationDelay = (-Math.random() * 4) + 's';
        bugStage.appendChild(s);
    }
}

function bugFrame(now) {
    if (!bugOpen) return;
    const dt = Math.min(0.05, (now - (bg.last || now)) / 1000);
    bg.last = now;
    const dx = bg.tx - bg.x;
    const dy = bg.ty - bg.y;
    bg.x += dx * Math.min(1, dt * 4);
    bg.y += dy * Math.min(1, dt * 4);
    if (Math.abs(dx) > 4) bg.facing = dx > 0 ? 1 : -1;
    const pl = document.getElementById('bugPlayer');
    pl.style.transform = `translate(${bg.x}px, ${bg.y}px) translate(-50%, -50%) rotate(${Math.max(-15, Math.min(15, dy * 0.1))}deg)`;
    pl.classList.toggle('right', bg.facing > 0);
    if (!bg.done) {
        const pr = pl.getBoundingClientRect();
        const cx = pr.left + pr.width / 2;
        const cy = pr.top + pr.height / 2;
        bugStage.querySelectorAll('.bug-spot:not(.got)').forEach(s => {
            const r = s.getBoundingClientRect();
            if (Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) < 60) collectSpot(s);
        });
    }
    bg.raf = requestAnimationFrame(bugFrame);
}

function collectSpot(s) {
    s.classList.add('got');
    bg.got++;
    playTone(500 + bg.got * 110, 0.2, 0.12, 'sine');
    setTimeout(() => playTone(800 + bg.got * 110, 0.15, 0.08, 'sine'), 90);
    // Fly up to the ladybug at the top
    const hud = document.getElementById('bugHud').getBoundingClientRect();
    const sr = bugStage.getBoundingClientRect();
    s.style.left = (hud.left + hud.width * 0.35 - sr.left) + 'px';
    s.style.top = (hud.top + hud.height / 2 - sr.top) + 'px';
    setTimeout(() => {
        s.remove();
        renderBugHud();
        const hb = document.querySelector('#bugHud svg');
        hb.classList.remove('bump'); void hb.offsetWidth; hb.classList.add('bump');
        if (bg.got >= 7) bugWin();
    }, 500);
}

function bugWin() {
    bg.done = true;
    playWin();
    const pl = document.getElementById('bugPlayer');
    pl.classList.add('happy');
    setTimeout(() => pl.classList.remove('happy'), 1600);
    const o = bugEl.getBoundingClientRect();
    const r = pl.getBoundingClientRect();
    for (let i = 0; i < 16; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['🐞', '✨', '💖', '⭐']);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 110;
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.top + r.height / 2 - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        bugEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    setTimeout(() => { document.getElementById('bugAgain').style.display = ''; }, 900);
}

function bugPointer(e) {
    const r = bugStage.getBoundingClientRect();
    bg.tx = Math.max(30, Math.min(r.width - 30, e.clientX - r.left));
    bg.ty = Math.max(30, Math.min(r.height - 30, e.clientY - r.top));
}
bugStage.addEventListener('pointerdown', (e) => { e.stopPropagation(); bugPointer(e); });
bugStage.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType !== 'mouse') bugPointer(e); });

function openBugGame() {
    bugOpen = true;
    bugEl.classList.add('open');
    newBugRound();
    playMusicBox();
    bg.last = 0;
    cancelAnimationFrame(bg.raf);
    bg.raf = requestAnimationFrame(bugFrame);
}

function closeBugGame() {
    bugOpen = false;
    cancelAnimationFrame(bg.raf);
    bugEl.classList.remove('open');
    _playWhoosh();
    landAndGrow();
}

document.getElementById('bugAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    newBugRound();
    playPop();
});
document.getElementById('bugClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeBugGame();
});
bugEl.addEventListener('pointerdown', (e) => e.stopPropagation());
