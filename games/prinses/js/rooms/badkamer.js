/* 🛁 Badkamer */
defineRoom({
    key: 'badkamer',
    name: 'Badkamer',
    icon: '🛁',
    say: 'De badkamer',
    build(rbt) {
        place(el('<div class="bathrobe"><span></span></div>'), rbt + 30, 140);
        place(el('<div class="ptub-back"></div>'), rbt + 135, 262);
        const tubFront = place(el('<div class="ptub-front"></div>'), rbt + 125, 320);
        place(el('<div class="ptub-duck">🦆</div>'), rbt + 380, 278);
        addObj('<div class="ptub-hit"><div class="tap-hint" style="left:140px;top:-30px">👇</div></div>', rbt + 125, 250, rbt + 285, takeBath);
        addObj('<div class="sink"><div class="mirror2"></div><div class="tap"></div><div class="basin"></div><div class="ped"></div><span class="cup">🪥</span><div class="tap-hint" style="left:80px;top:-40px">👇</div></div>', rbt + 450, 160, rbt + 550, openTeeth);
        const cab = addObj('<div class="shower-cab"><div class="glass"></div><div class="pipe"></div><div class="head"></div><div class="tray"></div><div class="tap-hint" style="left:70px;top:-40px">👇</div></div>', rbt + 620, 90, rbt + 705, takeShower);
        state.showerCab = cab;
    }
});

/* ─────────── Badkamer ─────────── */
function takeShower() {
    if (state.busy) return;
    state.busy = true;
    const cab = state.showerCab;
    cab.classList.add('on');
    startNoise('shower');
    const x0 = state.x;
    const headY = 145;
    let t = 0;
    const iv = setInterval(() => {
        t++;
        for (let k = 0; k < 6; k++) {
            spawnSparkle(x0 + (Math.random() - 0.5) * 60, headY + Math.random() * 10, {
                vx: (Math.random() - 0.5) * 20, vy: 240 + Math.random() * 80, g: 200, hue: 195 + Math.random() * 15, size: 2.5 + Math.random() * 2.5, max: 1.1
            });
        }
        if (t % 6 === 0) state.anim.rot = t % 12 === 0 ? 4 : -4;
    }, 50);
    [523, 659, 784, 659, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.08, 'triangle'), 500 + i * 380));
    setTimeout(() => {
        clearInterval(iv);
        stopNoise();
        cab.classList.remove('on');
        resetAnim();
        for (let i = 0; i < 30; i++) spawnSparkle(x0 + (Math.random() - 0.5) * 90, 260 + Math.random() * 120, { vy: -40, vx: (Math.random() - 0.5) * 40, g: -20, hue: 0, size: 7 + Math.random() * 6, max: 1.6 });
        sparkleShower(x0, 150, 30);
        playCorrect();
        showToast('🚿 Fris en schoon!');
        state.busy = false;
    }, 4000);
}

function takeBath() {
    if (state.busy) return;
    state.busy = true;
    state.facing = 1;
    playFreqSweep(300, 900, 0.3, 0.15);
    // Hop up and sink into the foam behind the tub front
    tween(700, (t) => {
        state.anim.dy = -Math.sin(Math.PI * t) * 70 - t * 24;
    }, () => {
        splash(state.x, 330);
        const iv = setInterval(() => {
            spawnSparkle(state.x + (Math.random() - 0.5) * 200, 330, { vy: -60 - Math.random() * 40, vx: (Math.random() - 0.5) * 30, g: -20, hue: 190 + Math.random() * 120, size: 5 + Math.random() * 6, max: 1.8 });
        }, 70);
        [659, 784, 880, 784, 659, 523, 587, 659].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.1, 'sine'), 300 + i * 420));
        tween(4200, (t) => {
            state.anim.dy = -24 + Math.sin(t * Math.PI * 6) * 4;
            state.anim.rot = Math.sin(t * Math.PI * 4) * 4;
        }, () => {
            clearInterval(iv);
            tween(700, (t) => {
                state.anim.dy = -24 * (1 - t) - Math.sin(Math.PI * t) * 70;
                state.anim.rot = 0;
            }, () => {
                resetAnim();
                sparkleShower(state.x, 150, 40);
                playCorrect();
                showToast('🛁 Heerlijk gebadderd!');
                state.busy = false;
            });
        });
    });
}

/* Tandenpoetsen */
const TEETH_X = [80, 108, 136, 164, 192, 220];
const tb = { teeth: [], paste: false, drawing: false, last: 0, rinsed: false, done: false };
let teethOpen = false;

function upperTop(x) { return 70 - 20 * (1 - Math.pow((x - 150) / 100, 2)); }
function lowerBottom(x) { return 162 - 14 * Math.pow((x - 150) / 100, 2); }

function newTeeth() {
    tb.teeth = [];
    const germTeeth = shuffle([...Array(12).keys()]).slice(0, 4);
    TEETH_X.forEach((x, i) => tb.teeth.push({ x, row: 'up', hp: 4, germ: germTeeth.includes(i) }));
    TEETH_X.forEach((x, i) => tb.teeth.push({ x, row: 'down', hp: 4, germ: germTeeth.includes(i + 6) }));
    tb.paste = false;
    tb.rinsed = false;
    tb.done = false;
    document.querySelectorAll('.tb-foam').forEach(f => f.remove());
    renderTeeth();
    updateTbUi();
}

function toothBox(t) {
    if (t.row === 'up') {
        const y = upperTop(t.x) + 2;
        return { x: t.x - 13, y, w: 26, h: 36 };
    }
    const b = lowerBottom(t.x) - 2;
    return { x: t.x - 13, y: b - 30, w: 26, h: 30 };
}

function renderTeeth() {
    const svg = document.getElementById('tbSvg');
    let h = `<path d="M30 76 Q150 0 270 76 Q252 192 150 194 Q48 192 30 76 Z" fill="#f472b6"/>
        <path d="M50 74 Q150 26 250 74 Q238 170 150 174 Q62 170 50 74 Z" fill="#7f1d1d"/>
        <ellipse cx="150" cy="150" rx="66" ry="22" fill="#fb7185"/>
        <path d="M120 150 Q150 140 180 150" stroke="#e11d48" stroke-width="3" fill="none"/>`;
    tb.teeth.forEach((t, i) => {
        const b = toothBox(t);
        const r = t.row === 'up' ? `M${b.x} ${b.y} L${b.x + b.w} ${b.y} L${b.x + b.w} ${b.y + b.h - 8} Q${b.x + b.w} ${b.y + b.h} ${b.x + b.w / 2} ${b.y + b.h} Q${b.x} ${b.y + b.h} ${b.x} ${b.y + b.h - 8} Z`
            : `M${b.x} ${b.y + 8} Q${b.x} ${b.y} ${b.x + b.w / 2} ${b.y} Q${b.x + b.w} ${b.y} ${b.x + b.w} ${b.y + 8} L${b.x + b.w} ${b.y + b.h} L${b.x} ${b.y + b.h} Z`;
        h += `<g data-t="${i}">
            <path class="tooth" d="${r}" fill="#fffbeb" stroke="#e5e7eb" stroke-width="1.2"/>
            <g class="tb-dirt" opacity="${t.hp / 4}">
                <circle cx="${b.x + 8}" cy="${b.y + b.h * 0.4}" r="4.5" fill="#ca8a04" opacity=".55"/>
                <circle cx="${b.x + 17}" cy="${b.y + b.h * 0.65}" r="3.5" fill="#84cc16" opacity=".5"/>
                <circle cx="${b.x + 13}" cy="${b.y + b.h * 0.25}" r="2.5" fill="#a16207" opacity=".5"/>
            </g>
            ${t.germ && t.hp > 0 ? `<g class="tb-germ" style="--dx:${(Math.random() - 0.5) * 300}px">
                <circle cx="${b.x + 13}" cy="${b.y + b.h / 2}" r="8" fill="#4ade80" stroke="#16a34a" stroke-width="1.2"/>
                <circle cx="${b.x + 10}" cy="${b.y + b.h / 2 - 2}" r="1.6" fill="#1f2937"/><circle cx="${b.x + 16}" cy="${b.y + b.h / 2 - 2}" r="1.6" fill="#1f2937"/>
                <path d="M${b.x + 9} ${b.y + b.h / 2 + 3} Q${b.x + 13} ${b.y + b.h / 2 + 6} ${b.x + 17} ${b.y + b.h / 2 + 3}" stroke="#1f2937" stroke-width="1.2" fill="none"/>
                <path d="M${b.x + 7} ${b.y + b.h / 2 - 7} l-3 -4 M${b.x + 19} ${b.y + b.h / 2 - 7} l3 -4" stroke="#16a34a" stroke-width="1.5"/>
            </g>` : ''}
        </g>`;
    });
    svg.innerHTML = h;
    svg.classList.toggle('shine', tb.done);
}

function updateTbUi() {
    const hint = document.getElementById('tbHint');
    const allClean = tb.teeth.every(t => t.hp <= 0);
    const paste = document.getElementById('tbPaste');
    const rinse = document.getElementById('tbRinse');
    paste.classList.toggle('pulse', !tb.paste);
    rinse.classList.toggle('pulse', allClean && !tb.done);
    if (tb.done) hint.textContent = '✨ Stralend schoon! ✨';
    else if (!tb.paste) hint.textContent = 'Eerst tandpasta op je borstel!';
    else if (!allClean) hint.textContent = 'Poets alle tandjes schoon!';
    else hint.textContent = 'Nu spoelen met het bekertje!';
    renderBrush();
}

function renderBrush() {
    document.getElementById('tbBrush').innerHTML = `<svg viewBox="0 0 150 60" width="150" height="60">
        <rect x="40" y="26" width="110" height="14" rx="7" fill="#f472b6"/>
        <rect x="2" y="22" width="44" height="18" rx="5" fill="#fff" stroke="#e5e7eb"/>
        <g stroke="#93c5fd" stroke-width="3" stroke-linecap="round">${[8, 15, 22, 29, 36].map(x => `<line x1="${x}" y1="22" x2="${x}" y2="10"/>`).join('')}</g>
        ${tb.paste ? '<path d="M4 10 Q12 0 22 8 Q30 0 40 10 Q30 16 22 12 Q12 16 4 10 Z" fill="#fff" stroke="#38bdf8" stroke-width="2"/>' : ''}
    </svg>`;
}

function tbSvgPoint(e) {
    const svg = document.getElementById('tbSvg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function brushAt(e) {
    const stage = document.getElementById('tbStage');
    const sr = stage.getBoundingClientRect();
    const brush = document.getElementById('tbBrush');
    brush.style.left = (e.clientX - sr.left) + 'px';
    brush.style.top = (e.clientY - sr.top) + 'px';
    if (tb.done) return;
    if (!tb.paste) {
        const b = document.getElementById('tbPaste');
        b.classList.remove('hint'); void b.offsetWidth; b.classList.add('hint');
        return;
    }
    const now = performance.now();
    if (now - tb.last < 70) return;
    tb.last = now;
    const p = tbSvgPoint(e);
    const i = tb.teeth.findIndex(t => {
        const b = toothBox(t);
        return p.x >= b.x - 4 && p.x <= b.x + b.w + 4 && p.y >= b.y - 6 && p.y <= b.y + b.h + 6;
    });
    // Foam bubbles wherever you brush
    if (document.querySelectorAll('.tb-foam').length < 70) {
        const f = document.createElement('div');
        f.className = 'tb-foam';
        const size = 12 + Math.random() * 18;
        f.style.width = f.style.height = size + 'px';
        f.style.left = (e.clientX - sr.left - size / 2 + (Math.random() - 0.5) * 20) + 'px';
        f.style.top = (e.clientY - sr.top - size / 2 + (Math.random() - 0.5) * 16) + 'px';
        stage.appendChild(f);
    }
    playTone(180 + Math.random() * 80, 0.05, 0.05, 'sawtooth');
    if (i < 0) return;
    const t = tb.teeth[i];
    if (t.hp <= 0) return;
    t.hp--;
    const g = document.querySelector(`#tbSvg [data-t="${i}"]`);
    g.querySelector('.tb-dirt').setAttribute('opacity', t.hp / 4);
    if (t.hp <= 0) {
        const germ = g.querySelector('.tb-germ');
        if (germ) {
            germ.classList.add('flee');
            playFreqSweep(900, 1800, 0.3, 0.12);
        }
        playTone(1568, 0.12, 0.08, 'sine');
        if (tb.teeth.every(tt => tt.hp <= 0)) {
            playCorrect();
            updateTbUi();
        }
    }
}

const tbStageEl = document.getElementById('tbStage');
tbStageEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    tb.drawing = true;
    const brush = document.getElementById('tbBrush');
    brush.classList.add('show', 'scrub');
    brushAt(e);
});
tbStageEl.addEventListener('pointermove', (e) => {
    if (tb.drawing || e.pointerType === 'mouse') {
        document.getElementById('tbBrush').classList.add('show');
        if (tb.drawing) brushAt(e);
        else {
            const sr = tbStageEl.getBoundingClientRect();
            const brush = document.getElementById('tbBrush');
            brush.style.left = (e.clientX - sr.left) + 'px';
            brush.style.top = (e.clientY - sr.top) + 'px';
        }
    }
});
window.addEventListener('pointerup', () => {
    if (!tb.drawing) return;
    tb.drawing = false;
    const brush = document.getElementById('tbBrush');
    brush.classList.remove('scrub');
    if (!matchMedia('(hover: hover)').matches) brush.classList.remove('show');
});

document.getElementById('tbPaste').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    tb.paste = true;
    playFreqSweep(300, 700, 0.3, 0.12);
    updateTbUi();
    const b = document.getElementById('tbBrush');
    b.classList.add('show');
    const sr = tbStageEl.getBoundingClientRect();
    b.style.left = (sr.width / 2) + 'px';
    b.style.top = (sr.height * 0.85) + 'px';
});
document.getElementById('tbRinse').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!tb.teeth.every(t => t.hp <= 0)) {
        const b = document.getElementById('tbPaste');
        if (!tb.paste) { b.classList.remove('hint'); void b.offsetWidth; b.classList.add('hint'); }
        return;
    }
    if (tb.done) return;
    tb.done = true;
    document.querySelectorAll('.tb-foam').forEach(f => f.classList.add('rinse'));
    setTimeout(() => document.querySelectorAll('.tb-foam').forEach(f => f.remove()), 700);
    [400, 600, 500, 700].forEach((f, i) => setTimeout(() => playFreqSweep(f, f * 0.6, 0.2, 0.12), i * 150));
    setTimeout(() => {
        renderTeeth();
        updateTbUi();
        playWin();
        [2093, 2637, 3136].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.08, 'sine'), 600 + i * 90));
        const r = document.getElementById('tbSvg').getBoundingClientRect();
        const o = document.getElementById('teethOv').getBoundingClientRect();
        for (let k = 0; k < 4; k++) setTimeout(() => {
            for (let n = 0; n < 6; n++) {
                const sp = document.createElement('span');
                sp.className = 'scope-spark';
                sp.textContent = randomPick(['✨', '⭐', '💫']);
                const a = Math.random() * Math.PI * 2;
                const d = 40 + Math.random() * 80;
                sp.style.left = (r.left - o.left + r.width * (0.25 + Math.random() * 0.5)) + 'px';
                sp.style.top = (r.top - o.top + r.height * (0.35 + Math.random() * 0.4)) + 'px';
                sp.style.setProperty('--dx', Math.cos(a) * d + 'px');
                sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
                document.getElementById('teethOv').appendChild(sp);
                setTimeout(() => sp.remove(), 900);
            }
        }, k * 180);
    }, 500);
});
document.getElementById('tbAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    newTeeth();
    playPop();
});

function openTeeth() {
    teethOpen = true;
    document.getElementById('teethOv').classList.add('open');
    newTeeth();
    playMusicBox();
}

function closeTeeth() {
    teethOpen = false;
    document.getElementById('teethOv').classList.remove('open');
    tb.drawing = false;
    _playWhoosh();
}
document.getElementById('tbClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeTeeth();
});
document.getElementById('teethOv').addEventListener('pointerdown', (e) => e.stopPropagation());

