/* 🌀 Spiraal: een grote draaiende ruimtespiraal. Tik erop: de prinses wordt erin gezogen en komt er op een
   andere plek in de ruimte weer uit. Verder een ufo die een koe opstraalt en een vallende ster. */
// Three spiral arms (r grows with the angle), as an SVG of 340 x 340
function spiralSVG() {
    const cols = ['#f472b6', '#67e8f9', '#c084fc'];
    const arms = cols.map((c, k) => {
        const pts = [];
        for (let t = 0; t <= Math.PI * 4.2; t += 0.12) {
            const a = t + k * Math.PI * 2 / 3;
            const r = 10 + t * 11.5;
            pts.push(`${(170 + Math.cos(a) * r).toFixed(1)},${(170 + Math.sin(a) * r).toFixed(1)}`);
        }
        return `<polyline points="${pts.join(' ')}" fill="none" stroke="${c}" stroke-width="${16 - k * 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    return `<svg class="arms" viewBox="0 0 340 340">${arms}</svg>`;
}

defineRoom({
    key: 'spiraal',
    name: 'Spiraal',
    icon: '🌀',
    say: 'De ruimtespiraal',
    build(x) {
        addObj(`<div class="sv-spiral">${spiralSVG()}<div class="core"></div>
            <div class="tap-hint" style="left:150px;top:-30px">👇</div></div>`, x + 230, 20, x + 400, (node) => spiralWarp(node, x + 400));
        addObj('<div class="sv-ufo"><span class="u">🛸</span><div class="beam"></div><span class="cow">🐄</span></div>', x + 30, 30, x + 100, (node) => {
            if (node.classList.contains('beam-on')) return;
            node.classList.add('beam-on');
            playFreqSweep(300, 1400, 1.6, 0.07);
            setTimeout(() => { playTone(180, 0.4, 0.12, 'sawtooth'); }, 900);   // moo!
            setTimeout(() => node.classList.remove('beam-on'), 3200);
        });
        addObj('<div class="sv-comet">☄️</div>', x + 640, 40, x + 660, (node) => {
            zooAnim(node, 'shoot');
            playFreqSweep(2000, 400, 0.8, 0.08);
            setTimeout(() => sparkleShower(x + 500, 200, 30), 500);
        });
    }
});

// Into the spiral and out somewhere else in space
function spiralWarp(node, cx) {
    if (state.busy) return;
    state.busy = true;
    state.hold = 0;
    state.pending = null;
    const pr = princessEl();
    node.classList.add('fast');
    // Fly to the middle of the spiral first
    state.targetX = cx;
    state.targetAlt = Math.min(maxAlt(), 220);
    for (let i = 0; i < 8; i++) setTimeout(() => playTone(1200 - i * 110, 0.12, 0.08, 'sine'), i * 110);
    setTimeout(() => pr.classList.add('warp-in'), 300);
    setTimeout(() => {
        // Somewhere else: another room in space, at a random height
        const here = ROOM_AT.spiraal.idx;
        const to = randomPick(ROOMS.map((r, i) => i).filter(i => i !== here));
        state.x = state.targetX = clampX(to * ROOM_W + 200 + Math.random() * 400);
        state.alt = state.targetAlt = 60 + Math.random() * 160;
        state.camX = Math.max(0, Math.min(Math.max(0, WORLD_W - state.viewW), state.x - state.viewW / 2));
        pr.classList.remove('warp-in');
        pr.classList.add('warp-out');
        node.classList.remove('fast');
        for (let i = 0; i < 8; i++) setTimeout(() => playTone(400 + i * 140, 0.1, 0.08, 'sine'), i * 80);
        burst(state.x, FEET_Y - 100 - state.alt, 50);
    }, 1500);
    setTimeout(() => {
        pr.classList.remove('warp-out');
        showToast('🌀 Wieee!', 1200);
        state.busy = false;
    }, 2500);
}
