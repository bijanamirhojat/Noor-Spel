/* ⭐ Sterrenkamer */
defineRoom({
    key: 'sterrenkamer',
    name: 'Sterrenkamer',
    icon: '⭐',
    say: 'De sterrenkamer',
    build(rst) {
        place(el('<div class="big-moon"></div>'), rst + 620, 60);
        [[60, 40, 0], [300, 20, -2.5], [480, 60, -4]].forEach(([x, y, d]) => {
            const sh = place(el('<div class="shooting"></div>'), rst + x, y);
            sh.style.animationDelay = d + 's';
        });
        place(el('<div class="star-mobile-bar" style="width:250px"></div>'), rst + 40, 60);
        [[60, 40], [110, 80], [160, 30], [210, 70]].forEach(([x, len], i) => {
            const st = addObj(`<div class="hang-star" style="--len:${len}px;height:${len + 54}px">${starSVG(['#fde047', '#fbbf24', '#fde68a', '#facc15'][i])}</div>`, rst + x - 27, 66, rst + x, (node) => ringHangStar(node, i));
        });
        addObj(`<div class="star-board">
            <div class="leg" style="left:40px;transform:rotate(8deg)"></div>
            <div class="leg" style="left:188px;transform:rotate(-8deg)"></div>
            <div class="board"></div>
            <svg viewBox="0 0 100 75">
                <polyline points="20,60 30,25 50,40 70,15 82,55" stroke="#fde047" stroke-width="1.5" fill="none"/>
                ${[[20, 60], [30, 25], [50, 40], [70, 15], [82, 55]].map(([x, y], i) => `<g transform="translate(${x},${y})"><path d="${starPath(4)}" fill="#fef3c7"/><text y="-6" font-size="6" text-anchor="middle" class="sg-num">${i + 1}</text></g>`).join('')}
            </svg>
            <div class="tap-hint" style="left:108px;top:-44px">👇</div>
        </div>`, rst + 320, 150, rst + 600, openStarGame);
        place(el('<div class="star-rug"></div>'), rst + 290, 425);
        addObj(`<div class="mailbox starbox"><div class="post"></div><div class="box"></div><div class="slot"></div><span class="letter">✉️</span><div class="tap-hint" style="top:-44px">👇</div></div>`, rst + 660, 220, rst + 640, () => openHeartPost('star'));
    }
});

/* ─────────── Sterrenkamer ─────────── */
function starPath(r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? r : r * 0.45;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        d += (i ? 'L' : 'M') + (Math.cos(a) * rad).toFixed(2) + ' ' + (Math.sin(a) * rad).toFixed(2) + ' ';
    }
    return d + 'Z';
}

function starSVG(fill) {
    return `<svg viewBox="-12 -12 24 24"><path d="${starPath(11)}" fill="${fill}" stroke="#fff" stroke-width="0.8" stroke-linejoin="round"/></svg>`;
}

const STAR_NOTES = [659, 784, 880, 1047];
function ringHangStar(node, i) {
    node.classList.remove('ring');
    void node.offsetWidth;
    node.classList.add('ring');
    playTone(STAR_NOTES[i], 0.7, 0.15, 'sine');
    playTone(STAR_NOTES[i] * 2, 0.5, 0.05, 'sine');
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.bottom - 20);
    for (let k = 0; k < 14; k++) spawnSparkle(c.x, c.y, { speed: 140, g: 60 });
}

// Connect-the-stars pictures (0-100 coordinates, drawn in order and closed at the end)
const STAR_PICS = [
    { e: '⭐', c: '#facc15', pts: Array.from({ length: 10 }, (_, i) => {
        const rad = i % 2 === 0 ? 46 : 19;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        return [50 + Math.cos(a) * rad, 54 + Math.sin(a) * rad];
    }) },
    { e: '❤️', c: '#f43f5e', pts: [[50, 30], [62, 14], [80, 12], [93, 28], [88, 52], [50, 90], [12, 52], [7, 28], [20, 12], [38, 14]] },
    { e: '🏠', c: '#fb923c', pts: [[18, 92], [18, 50], [50, 18], [64, 32], [64, 20], [76, 20], [76, 44], [82, 50], [82, 92]] },
    { e: '🐟', c: '#38bdf8', pts: [[8, 50], [30, 30], [58, 26], [76, 42], [94, 26], [94, 74], [76, 58], [58, 74], [30, 70]] },
    { e: '👑', c: '#fbbf24', pts: [[12, 84], [12, 34], [31, 58], [50, 20], [69, 58], [88, 34], [88, 84]] },
    { e: '🌙', c: '#fde68a', pts: [[62, 8], [34, 16], [16, 42], [22, 72], [46, 90], [76, 86], [56, 72], [44, 50], [48, 26]] },
    { e: '🍦', c: '#f9a8d4', pts: [[50, 94], [68, 44], [74, 28], [63, 12], [50, 8], [37, 12], [26, 28], [32, 44]] },
    { e: '🐱', c: '#c084fc', pts: [[24, 88], [16, 46], [24, 10], [40, 30], [60, 30], [76, 10], [84, 46], [76, 88]] },
    { e: '🍄', c: '#ef4444', pts: [[40, 92], [40, 64], [10, 60], [18, 34], [50, 14], [82, 34], [90, 60], [60, 64], [60, 92]] }
];
const sgEl = document.getElementById('starGame');
const sgSvg = document.getElementById('sgSvg');
let sgOpen = false;
const sg = { pic: 0, next: 0, done: new Set(), finished: false, dragging: false };

function sizeStarGame() {
    const st = document.getElementById('sgStage').getBoundingClientRect();
    const size = Math.max(200, Math.min(st.width, st.height) * 0.98);
    sgSvg.style.width = sgSvg.style.height = size + 'px';
}

function renderStarPicks() {
    const box = document.getElementById('sgPicks');
    box.innerHTML = STAR_PICS.map((p, i) => `<button class="sg-pick${sg.pic === i ? ' sel' : ''}${sg.done.has(i) ? ' is-done' : ''}" data-i="${i}">${p.e}<span class="done">✅</span></button>`).join('');
    box.querySelectorAll('.sg-pick').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        startStarPic(+b.dataset.i);
        playPop();
    }));
}

function startStarPic(i) {
    sg.pic = i;
    sg.next = 0;
    sg.finished = false;
    const pic = STAR_PICS[i];
    const pts = pic.pts;
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    sgSvg.innerHTML = `
        <polygon class="sg-fill" points="${pts.map(p => p.join(',')).join(' ')}" fill="${pic.c}"/>
        <g id="sgLines"></g>
        <text class="sg-emoji" x="${cx}" y="${cy}" font-size="26" text-anchor="middle" dominant-baseline="central">${pic.e}</text>
        <g id="sgStars">${pts.map(([x, y], k) => `
            <g class="sg-star${k === 0 ? ' next' : ''}" data-i="${k}" transform="translate(${x},${y})">
                <circle r="8" fill="transparent"/>
                <path class="shape" d="${starPath(3.6)}" fill="#fef3c7" stroke="#fbbf24" stroke-width="0.5"/>
                <text class="sg-num" y="-5.5" font-size="5.5" text-anchor="middle">${k + 1}</text>
            </g>`).join('')}</g>`;
    renderStarPicks();
    sizeStarGame();
}

function sgLine(a, b) {
    const pts = STAR_PICS[sg.pic].pts;
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    document.getElementById('sgLines').insertAdjacentHTML('beforeend',
        `<line class="sg-line" pathLength="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
}

function tapStar(k) {
    if (sg.finished) return;
    const stars = sgSvg.querySelectorAll('.sg-star');
    if (k !== sg.next) {
        if (k < sg.next) return;
        const st = stars[k];
        st.classList.remove('nope'); void st.getBBox(); st.classList.add('nope');
        playTone(200, 0.12, 0.08, 'triangle');
        return;
    }
    stars[k].classList.remove('next');
    stars[k].classList.add('lit');
    if (k > 0) sgLine(k - 1, k);
    playTone(523 * Math.pow(2, k / 7), 0.3, 0.14, 'triangle');
    const r = stars[k].getBoundingClientRect();
    sgSpark(r.left + r.width / 2, r.top + r.height / 2, 4);
    sg.next++;
    const total = STAR_PICS[sg.pic].pts.length;
    if (sg.next < total) {
        stars[sg.next].classList.add('next');
        return;
    }
    // Last star: close the shape and reveal the picture
    sg.finished = true;
    sgLine(total - 1, 0);
    setTimeout(() => {
        sgSvg.querySelector('.sg-fill').classList.add('show');
        sgSvg.querySelector('.sg-emoji').classList.add('show');
        playWin();
        sg.done.add(sg.pic);
        const box = sgSvg.getBoundingClientRect();
        for (let n = 0; n < 4; n++) setTimeout(() => sgSpark(box.left + Math.random() * box.width, box.top + Math.random() * box.height, 8), n * 180);
        renderStarPicks();
        const nextPick = STAR_PICS.findIndex((_, i) => !sg.done.has(i));
        if (nextPick >= 0) {
            const b = document.querySelector(`.sg-pick[data-i="${nextPick}"]`);
            if (b) b.classList.add('hint');
        }
    }, 400);
}

function sgSpark(cx, cy, n) {
    const o = sgEl.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const sp = document.createElement('span');
        sp.className = 'scope-spark';
        sp.textContent = randomPick(['✨', '⭐', '🌟', '💫']);
        const a = Math.random() * Math.PI * 2;
        const d = 30 + Math.random() * 50;
        sp.style.left = (cx - o.left) + 'px';
        sp.style.top = (cy - o.top) + 'px';
        sp.style.setProperty('--dx', Math.cos(a) * d + 'px');
        sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
        sgEl.appendChild(sp);
        setTimeout(() => sp.remove(), 900);
    }
}

function starAt(e) {
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const g = hit && hit.closest && hit.closest('.sg-star');
    return g ? +g.dataset.i : -1;
}

sgSvg.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    sg.dragging = true;
    const k = starAt(e);
    if (k >= 0) tapStar(k);
});
sgSvg.addEventListener('pointermove', (e) => {
    if (!sg.dragging) return;
    const k = starAt(e);
    // Swiping only ever connects the next star, so a finger trail can't trigger "wrong"
    if (k >= 0 && k === sg.next) tapStar(k);
});
window.addEventListener('pointerup', () => { sg.dragging = false; });
sgEl.addEventListener('pointerdown', (e) => e.stopPropagation());

function openStarGame() {
    sgOpen = true;
    sgEl.classList.add('open');
    const first = STAR_PICS.findIndex((_, i) => !sg.done.has(i));
    startStarPic(first >= 0 ? first : 0);
    playMusicBox();
}

function closeStarGame() {
    sgOpen = false;
    sgEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('sgClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeStarGame();
});
window.addEventListener('resize', () => { if (sgOpen) sizeStarGame(); });
