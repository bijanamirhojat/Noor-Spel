/* 🔭 Torenkamer */
defineRoom({
    key: 'torenkamer',
    name: 'Torenkamer',
    icon: '🔭',
    say: 'De torenkamer',
    build(r4) {
        place(el('<div class="tower-window"></div>'), r4 + 440, 70);
        addObj('<div class="telescope"><div class="tube"></div><div class="legs"></div><div class="tap-hint">👇</div></div>', r4 + 300, 225, r4 + 250, openScope);
        addObj('<div class="emoji-obj">🦉</div>', r4 + 90, 160, r4 + 120, owlHoot);
        addObj('<div class="emoji-obj" style="font-size:50px">📚</div>', r4 + 680, 380, r4 + 690, () => sayRandom(['Sprookjesboeken!', 'Er was eens een prinses...']));
    }
});

function owlHoot() {
    playTone(420, 0.3, 0.2);
    setTimeout(() => playTone(360, 0.45, 0.2), 380);
    speak('Oehoe!', { rate: 0.6, pitch: 0.9 });
}

/* ─────────── Verrekijker ─────────── */
const scope = document.getElementById('scope');
const panoBase = document.getElementById('panoBase');
const panoZoom = document.getElementById('panoZoom');
const lensWrap = document.getElementById('lensWrap');
const ringL = document.getElementById('ringL');
const ringR = document.getElementById('ringR');
const findList = document.getElementById('findList');
const ZOOM = 2.4;
let scopeOpen = false;
let lens = { x: 0, y: 0, r: 60 };

const FINDS = [
    { e: '🦄', name: 'Een eenhoorn!', x: 16, y: 66, s: 22 },
    { e: '🐉', name: 'Een lieve draak!', x: 84, y: 24, s: 22 },
    { e: '🦋', name: 'Een vlinder!', x: 42, y: 58, s: 14 },
    { e: '🎈', name: 'Een ballon!', x: 62, y: 12, s: 16 },
    { e: '🐸', name: 'Een kikker!', x: 30, y: 88, s: 14 },
    { e: '🦢', name: 'Een zwaan!', x: 60, y: 80, s: 16 },
    { e: '🐰', name: 'Een konijntje!', x: 90, y: 72, s: 16 }
];

function panoHTML() {
    let h = `<div class="sun"></div><div class="rb"></div>
        <div class="hill" style="left:-10%;top:55%;width:70%;height:70%;background:#86efac"></div>
        <div class="hill" style="left:40%;top:60%;width:80%;height:70%;background:#4ade80"></div>
        <div class="lake"></div>
        <span class="p" style="left:22%;top:18%;font-size:34px">☁️</span>
        <span class="p" style="left:74%;top:10%;font-size:28px">☁️</span>
        <span class="p" style="left:48%;top:30%;font-size:22px">☁️</span>
        <span class="p" style="left:50%;top:48%;font-size:36px">🏰</span>
        <span class="p" style="left:8%;top:78%;font-size:30px">🌳</span>
        <span class="p" style="left:74%;top:60%;font-size:26px">🌳</span>
        <span class="p" style="left:38%;top:72%;font-size:16px">🌼</span>
        <span class="p" style="left:24%;top:76%;font-size:14px">🌷</span>
        <span class="p" style="left:80%;top:88%;font-size:16px">🌸</span>
        <span class="p" style="left:95%;top:55%;font-size:26px">🌲</span>`;
    FINDS.forEach((f, i) => {
        h += `<span class="p find" data-i="${i}" style="left:${f.x}%;top:${f.y}%;font-size:${f.s}px">${f.e}</span>`;
    });
    return h;
}

function buildScope() {
    panoBase.innerHTML = panoHTML();
    panoZoom.innerHTML = panoHTML();
    findList.innerHTML = FINDS.map((f, i) => `<span data-i="${i}">${f.e}</span>`).join('');
}

function layoutScope() {
    const w = scope.clientWidth;
    const h = scope.clientHeight;
    lens.r = Math.max(50, Math.min(w, h) * 0.2);
    if (!lens.x) { lens.x = w / 2; lens.y = h / 2; }
    renderLens();
}

function renderLens() {
    const { x, y, r } = lens;
    const off = r * 0.92;
    const m = `radial-gradient(circle ${r}px at ${x - off}px ${y}px, #000 98%, transparent 100%), radial-gradient(circle ${r}px at ${x + off}px ${y}px, #000 98%, transparent 100%)`;
    lensWrap.style.webkitMaskImage = m;
    lensWrap.style.maskImage = m;
    panoZoom.style.transformOrigin = `${x}px ${y}px`;
    panoZoom.style.transform = `scale(${ZOOM})`;
    [[ringL, x - off], [ringR, x + off]].forEach(([ring, cx]) => {
        ring.style.left = cx + 'px';
        ring.style.top = y + 'px';
        ring.style.width = ring.style.height = (r * 2 + 16) + 'px';
    });
}

function openScope() {
    scopeOpen = true;
    scope.classList.add('open');
    lens.x = 0;
    layoutScope();
    speak('Kijk door de verrekijker! Wat zie je?');
    playFreqSweep(400, 1200, 0.3, 0.15);
}

function closeScope() {
    scopeOpen = false;
    scope.classList.remove('open');
    _playWhoosh();
}

function scopeSpark(x, y) {
    const icons = ['✨', '⭐', '💖', '🌟', '💫'];
    for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(icons);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 60;
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        scope.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function checkFinds() {
    const w = scope.clientWidth;
    const h = scope.clientHeight;
    if (!scopeOpen || !w || !h) return;
    // Points in the un-zoomed scene that sit under the finger and under each lens centre
    const off = (lens.r * 0.92) / ZOOM;
    const spots = [[lens.x, lens.y], [lens.x - off, lens.y], [lens.x + off, lens.y]];
    const reach = Math.max(22, (lens.r * 0.75) / ZOOM);
    FINDS.forEach((f, i) => {
        if (f.found) return;
        const bx = (f.x / 100) * w;
        const by = (f.y / 100) * h;
        // Where the item appears on screen inside the magnified lens
        const fx = lens.x + (bx - lens.x) * ZOOM;
        const fy = lens.y + (by - lens.y) * ZOOM;
        if (spots.some(([sx, sy]) => Math.hypot(bx - sx, by - sy) < reach)) {
            f.found = true;
            panoZoom.querySelector(`.find[data-i="${i}"]`).classList.add('found');
            panoBase.querySelector(`.find[data-i="${i}"]`).classList.add('found');
            findList.querySelector(`[data-i="${i}"]`).classList.add('found');
            scopeSpark(fx, fy);
            playCorrect();
            speak(f.name);
            if (FINDS.every(ff => ff.found)) {
                setTimeout(() => {
                    playWin();
                    speak('Alles gevonden! Knap hoor!');
                    for (let k = 0; k < 4; k++) {
                        setTimeout(() => scopeSpark(Math.random() * w, Math.random() * h), k * 200);
                    }
                }, 900);
                setTimeout(() => {
                    FINDS.forEach((ff, j) => {
                        ff.found = false;
                        scope.querySelectorAll(`[data-i="${j}"]`).forEach(n => n.classList.remove('found'));
                    });
                    closeScope();
                    showToast('🔭 Alles gevonden! 🌟');
                    sparkleShower(state.x, 60, 60);
                }, 3600);
            }
        }
    });
}

function moveLens(e) {
    const r = scope.getBoundingClientRect();
    lens.x = e.clientX - r.left;
    lens.y = e.clientY - r.top;
    renderLens();
    checkFinds();
}

let scopeDown = false;
scope.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (e.target.closest('.scope-close')) return;
    scopeDown = true;
    moveLens(e);
});
scope.addEventListener('pointermove', (e) => {
    if (scopeDown || e.pointerType === 'mouse') moveLens(e);
});
window.addEventListener('pointerup', () => { scopeDown = false; });
document.getElementById('scopeClose').addEventListener('click', (e) => {
    e.stopPropagation();
    closeScope();
});
document.getElementById('scopeClose').addEventListener('pointerdown', (e) => e.stopPropagation());
