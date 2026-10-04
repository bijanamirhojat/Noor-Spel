/* 🌈 Regenboogmakerij: schilder een regenboog, streep voor streep in de goede kleur.
   Elke regenboog die je maakt komt erbij aan de hemel van deze kamer. */
const RB_KEY = 'noor-prinses-regenbogen';
const RB_COLORS = [
    { c: '#ef4444', name: 'Rood' }, { c: '#fb923c', name: 'Oranje' }, { c: '#facc15', name: 'Geel' },
    { c: '#4ade80', name: 'Groen' }, { c: '#60a5fa', name: 'Blauw' }, { c: '#a855f7', name: 'Paars' }
];
const RB_SKY_MAX = 10;
const RB_SKY_SPOTS = [[20, 10], [560, 0], [660, 70], [120, 60], [470, 30], [210, 10], [690, 0], [10, 90], [580, 110], [160, 0]];
let rainbowsMade = 0;
try {
    const n = parseInt(localStorage.getItem(RB_KEY), 10);
    if (n > 0) rainbowsMade = n;
} catch (e) {}

function rbRadius(i) { return 180 - i * 22; }
function rbPath(i) {
    const r = rbRadius(i);
    return `M${200 - r} 210 A${r} ${r} 0 0 1 ${200 + r} 210`;
}
function miniRainbow() {
    return `<svg viewBox="0 0 400 220">${RB_COLORS.map((col, i) => `<path d="${rbPath(i)}" stroke="${col.c}" stroke-width="22" fill="none"/>`).join('')}</svg>`;
}

defineRoom({
    key: 'regenboogmakerij',
    name: 'Regenboogmakerij',
    icon: '🌈',
    say: 'De regenboogmakerij',
    build(x) {
        place(el('<div class="rb-sky" id="rbSky"></div>'), x + 10, 60);
        addObj(`<div class="rb-easel">
            <div class="canvas">${miniRainbow()}</div>
            <div class="leg l"></div><div class="leg r"></div><div class="leg b"></div>
            <div class="tap-hint" style="left:90px;top:-40px">👇</div>
        </div>`, x + 280, 140, x + 400, openRainbow);
        RB_COLORS.forEach((col, i) => {
            addObj(`<div class="rb-pot" style="--c:${col.c}"><span></span></div>`, x + 40 + (i % 3) * 64, 330 + Math.floor(i / 3) * 40 - (i % 2) * 8, x + 120, (node) => {
                bounceEl(node, 'jump');
                const r = node.getBoundingClientRect();
                const p = screenToWorld(r.left + r.width / 2, r.top);
                for (let k = 0; k < 18; k++) spawnSparkle(p.x, p.y, { speed: 120, hue: [0, 28, 50, 140, 215, 275][i], size: 6 + Math.random() * 4 });
                playTone(523 * Math.pow(2, [0, 2, 4, 5, 7, 9][i] / 12), 0.25, 0.12, 'sine');
            });
        });
        addObj('<div class="emoji-obj rb-brush">🖌️</div>', x + 620, 330, x + 650, (node) => {
            bounceEl(node, 'wobble');
            sparkleShower(roomX('regenboogmakerij') + 650, 250, 30);
            playFreqSweep(500, 1500, 0.4, 0.1);
        });
        renderRainbowSky();
    }
});

function renderRainbowSky() {
    const sky = document.getElementById('rbSky');
    if (!sky) return;
    const n = Math.min(rainbowsMade, RB_SKY_MAX);
    sky.innerHTML = RB_SKY_SPOTS.slice(0, n).map(([l, t], i) =>
        `<div class="rb-mini" style="left:${l}px;top:${t}px;animation-delay:${-i * 0.7}s">${miniRainbow()}</div>`).join('') +
        (rainbowsMade ? `<div class="rb-count">🌈 ${rainbowsMade}</div>` : '');
}

/* ─────────── Regenboog schilderen (overlay) ─────────── */
const rbEl = document.getElementById('rbOv');
let rbOpen = false;
const rbg = { next: 0, busy: false };

function renderRbArc() {
    const svg = document.getElementById('rbArc');
    svg.innerHTML = `
        <ellipse cx="40" cy="206" rx="46" ry="22" fill="#fff"/><ellipse cx="20" cy="196" rx="24" ry="18" fill="#fff"/><ellipse cx="58" cy="192" rx="26" ry="20" fill="#fff"/>
        <ellipse cx="360" cy="206" rx="46" ry="22" fill="#fff"/><ellipse cx="380" cy="196" rx="24" ry="18" fill="#fff"/><ellipse cx="342" cy="192" rx="26" ry="20" fill="#fff"/>
        ${RB_COLORS.map((col, i) => {
            const len = (Math.PI * rbRadius(i)).toFixed(1);
            return `<path class="rb-base${i === rbg.next ? ' next' : ''}" d="${rbPath(i)}" stroke="${i === rbg.next ? col.c : '#fff'}" stroke-width="20" fill="none" stroke-linecap="round"/>
                <path class="rb-paint" data-i="${i}" d="${rbPath(i)}" stroke="${col.c}" stroke-width="20" fill="none" stroke-linecap="round"
                    style="stroke-dasharray:${len};stroke-dashoffset:${i < rbg.next ? 0 : len}"/>`;
        }).join('')}`;
}

function renderRbPots() {
    const box = document.getElementById('rbPots');
    box.innerHTML = shuffle(RB_COLORS.map((col, i) => ({ ...col, i }))).map(col =>
        `<button class="rb-pot-btn" data-i="${col.i}" style="--c:${col.c}"><span></span><small>${col.name}</small></button>`).join('');
    box.querySelectorAll('.rb-pot-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        paintBand(+b.dataset.i, b);
    }));
}

function paintBand(i, btn) {
    if (rbg.busy || rbg.next >= RB_COLORS.length) return;
    if (i !== rbg.next) {
        btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope');
        playTone(220, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(180, 0.15, 0.1, 'triangle'), 140);
        return;
    }
    rbg.busy = true;
    btn.classList.add('used');
    const paint = document.querySelector(`#rbArc .rb-paint[data-i="${i}"]`);
    paint.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
    void paint.getBoundingClientRect();
    paint.style.strokeDashoffset = '0';
    playFreqSweep(400 + i * 80, 900 + i * 120, 0.7, 0.08);
    setTimeout(() => {
        playTone(523 * Math.pow(2, [0, 2, 4, 5, 7, 9][i] / 12), 0.35, 0.12, 'sine');
        rbg.next++;
        rbg.busy = false;
        if (rbg.next >= RB_COLORS.length) rainbowDone();
        else {
            document.querySelectorAll('#rbArc .rb-base').forEach((b, k) => {
                b.classList.toggle('next', k === rbg.next);
                b.setAttribute('stroke', k === rbg.next ? RB_COLORS[k].c : '#fff');
            });
            document.getElementById('rbHint').textContent = `Nu ${RB_COLORS[rbg.next].name.toLowerCase()}!`;
        }
    }, 850);
}

// Full rainbow: a unicorn slides over it
function rainbowDone() {
    rbg.busy = true;
    rainbowsMade++;
    try { localStorage.setItem(RB_KEY, String(rainbowsMade)); } catch (e) {}
    renderRainbowSky();
    document.getElementById('rbHint').textContent = '🌈 Een echte regenboog! 🌈';
    document.getElementById('rbArc').classList.add('shine');
    playWin();
    const svg = document.getElementById('rbArc');
    const uni = el('<span class="rb-uni">🦄</span>');
    rbEl.appendChild(uni);
    const o = rbEl.getBoundingClientRect();
    const t0 = performance.now();
    const step = () => {
        const t = Math.min(1, (performance.now() - t0) / 2600);
        const a = Math.PI * (1 - t);
        const pt = svg.createSVGPoint();
        pt.x = 200 + Math.cos(a) * (rbRadius(0) + 18);
        pt.y = 210 - Math.sin(a) * (rbRadius(0) + 18);
        const p = pt.matrixTransform(svg.getScreenCTM());
        uni.style.left = (p.x - o.left) + 'px';
        uni.style.top = (p.y - o.top) + 'px';
        uni.style.transform = `translate(-50%, -80%) rotate(${(t - 0.5) * 140}deg) scaleX(-1)`;
        if (Math.random() < 0.5) {
            const s = el(`<span class="scope-spark">${randomPick(['✨', '⭐', '💖'])}</span>`);
            s.style.left = uni.style.left;
            s.style.top = uni.style.top;
            s.style.setProperty('--dx', ((Math.random() - 0.5) * 40) + 'px');
            s.style.setProperty('--dy', (20 + Math.random() * 40) + 'px');
            rbEl.appendChild(s);
            setTimeout(() => s.remove(), 900);
        }
        if (t < 1 && rbOpen) requestAnimationFrame(step);
        else {
            uni.remove();
            document.getElementById('rbAgain').style.display = '';
        }
    };
    requestAnimationFrame(step);
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, k) => setTimeout(() => playTone(f, 0.3, 0.1, 'triangle'), 300 + k * 260));
}

function newRainbow() {
    rbg.next = 0;
    rbg.busy = false;
    document.getElementById('rbArc').classList.remove('shine');
    document.getElementById('rbAgain').style.display = 'none';
    document.getElementById('rbHint').textContent = `Welke kleur? Begin met ${RB_COLORS[0].name.toLowerCase()}!`;
    renderRbArc();
    renderRbPots();
}

function openRainbow() {
    rbOpen = true;
    rbEl.classList.add('open');
    newRainbow();
    playMusicBox();
}

function closeRainbow() {
    rbOpen = false;
    rbEl.classList.remove('open');
    rbEl.querySelectorAll('.rb-uni').forEach(u => u.remove());
    _playWhoosh();
}

document.getElementById('rbAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    newRainbow();
    playPop();
});
document.getElementById('rbClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeRainbow();
});
rbEl.addEventListener('pointerdown', (e) => e.stopPropagation());
