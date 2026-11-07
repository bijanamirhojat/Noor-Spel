/* 🚗 Autowasstraat: een diertje rijdt binnen met een vieze auto vol modder. Nat spuiten, zeep erop wrijven
   (de modder wordt schuim), de grote borstels laten draaien, het schuim eraf spoelen en droogblazen tot hij glimt.
   Dan rijdt hij blij weg en betaalt. Aantal gewassen auto's in noor-prinses-autowas. */
defineRoom({
    key: 'autowasstraat',
    name: 'Autowasstraat',
    icon: '🚗',
    say: 'De autowasstraat',
    build(s0) {
        villageHouse(s0 + 600, 200, 250, '#bfdbfe', '#1d4ed8');
        addObj(`<div class="aw-shop">
            <div class="aw-sign">🚗💦</div>
            <div class="aw-front">
                <div class="aw-gate"><div class="aw-strips"></div><span class="aw-mini-brush l"></span><span class="aw-mini-brush r"></span></div>
            </div>
            <div class="aw-roof"></div>
            <div class="tap-hint" style="left:170px;top:-60px">👇</div>
        </div>`, s0 + 100, 120, s0 + 300, openAutowas);
        addObj('<div class="emoji-obj aw-waiting">🚙</div>', s0 + 520, 320, s0 + 560, (node) => {
            bounceEl(node, 'jump');
            playTone(392, 0.15, 0.12, 'square');
            setTimeout(() => playTone(330, 0.2, 0.12, 'square'), 180);
        });
        addObj('<div class="emoji-obj" style="font-size:54px">🫧</div>', s0 + 440, 350, s0 + 470, (node) => {
            bounceEl(node, 'pulse');
            for (let i = 0; i < 4; i++) setTimeout(() => playTone(900 + Math.random() * 700, 0.06, 0.06, 'sine'), i * 80);
        });
    }
});

/* ─────────── Autowas-overlay ─────────── */
const AW_KEY = 'noor-prinses-autowas';
const AW_STEPS = [['nat', '💦'], ['zeep', '🧽'], ['borstels', '🌀'], ['spoelen', '🚿'], ['drogen', '💨'], ['klaar', '✨']];
const AW_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];
const AW_DRIVERS = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🐨', '🐷', '🐸', '🦁', '🐵', '🐯'];
const awOv = document.getElementById('awOv');
const aw = { step: 'nat', wet: 0, spots: [], brush: 0, washed: 0, coins: 0, busy: false, rub: false, last: null, dryT: 0, round: 0 };
let awOpen = false;
registerOverlay(() => awOpen, closeAutowas);
try { aw.washed = +localStorage.getItem(AW_KEY) || 0; } catch { /* geen opslag */ }

const awCar = () => document.getElementById('awCar');

function awCarSVG() {
    return `<svg viewBox="0 0 300 150">
        <path d="M24 104 Q18 74 44 70 L86 66 L116 30 Q124 22 140 22 L206 22 Q222 22 232 34 L258 68 Q284 72 284 96 L284 110 Q284 118 274 118 L30 118 Q22 118 24 104 Z" fill="var(--car)"/>
        <path d="M24 104 Q18 74 44 70 L86 66 L116 30 Q124 22 140 22 L206 22 Q222 22 232 34 L258 68 Q284 72 284 96" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4"/>
        <path d="M100 66 L126 36 Q130 32 138 32 L170 32 L170 66 Z" fill="#bae6fd" stroke="#fff" stroke-width="3"/>
        <path d="M180 66 L180 32 L204 32 Q214 32 220 40 L240 66 Z" fill="#bae6fd" stroke="#fff" stroke-width="3"/>
        <rect x="270" y="80" width="12" height="10" rx="3" fill="#fde68a"/>
        <rect x="22" y="84" width="10" height="10" rx="3" fill="#fca5a5"/>
        <path d="M150 76 L150 112" stroke="rgba(0,0,0,.15)" stroke-width="2"/>
        <rect x="156" y="84" width="14" height="4" rx="2" fill="rgba(0,0,0,.25)"/>
        <circle cx="80" cy="118" r="24" fill="#1f2937"/><circle cx="80" cy="118" r="11" fill="#d1d5db"/>
        <circle cx="226" cy="118" r="24" fill="#1f2937"/><circle cx="226" cy="118" r="11" fill="#d1d5db"/>
    </svg>`;
}

function awNewCar() {
    aw.round++;
    Object.assign(aw, { step: 'nat', wet: 0, brush: 0, busy: false, rub: false, last: null, trayStep: null });
    clearInterval(aw.dryT);
    // Start easy with a few big blobs of mud, later more
    const n = aw.washed < 2 ? 4 : 5 + Math.floor(Math.random() * 4);
    aw.spots = Array.from({ length: n }, () => ({ kind: 'mud', ...awSpot() }));
    const car = awCar();
    car.style.setProperty('--car', randomPick(AW_COLORS));
    car.className = 'aw-car';
    document.getElementById('awDriver').textContent = randomPick(AW_DRIVERS);
    void car.offsetWidth;
    car.classList.add('in');
    playFreqSweep(150, 260, 0.6, 0.08);
    renderAutowas();
}

// A spot on the body of the car (in %), not too close to the others
function awSpot() {
    for (let k = 0; k < 30; k++) {
        const s = { x: 12 + Math.random() * 76, y: 50 + Math.random() * 14 };
        if (aw.spots.every(t => Math.hypot(t.x - s.x, (t.y - s.y) * 2) > 10)) return s;
    }
    return { x: 12 + Math.random() * 76, y: 50 + Math.random() * 14 };
}

function renderAutowas() {
    const car = awCar();
    car.style.setProperty('--wet', aw.wet);
    car.classList.toggle('shine', aw.step === 'klaar');
    document.getElementById('awSpots').innerHTML = aw.spots.map((s, i) =>
        `<i class="aw-spot ${s.kind}" data-i="${i}" style="left:${s.x}%;top:${s.y}%"></i>`).join('');
    const at = AW_STEPS.findIndex(s => s[0] === aw.step);
    document.getElementById('awSteps').innerHTML = AW_STEPS.map(([k, e], i) =>
        `<span class="${i < at ? 'done' : i === at ? 'now' : ''}">${i < at ? '✅' : e}</span>`).join('');
    document.getElementById('awCoins').textContent = aw.coins;
    // Only rebuild the button when the step changes, so holding the blower keeps working
    if (aw.trayStep === aw.step) return;
    aw.trayStep = aw.step;
    const tool = { nat: '💦', zeep: '🧽', borstels: '🌀', spoelen: '🚿', drogen: '💨' }[aw.step];
    const tray = document.getElementById('awTray');
    tray.innerHTML = tool ? `<button class="bd-btn aw-btn" data-a="${aw.step}">${tool}</button>` : '';
    const btn = tray.querySelector('.aw-btn');
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (aw.step === 'drogen') { awDryStart(); return; }
        awAct(null);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => btn.addEventListener(t, awDryStop));
}

function awNext(step) {
    aw.step = step;
    playCorrect();
    ovCheer(awOv, awCar(), ['✨', '⭐', '🫧']);
    renderAutowas();
}

// One action on the car: at a point (x, y in %) when rubbing, or somewhere when the tray button is used
function awAct(pt) {
    if (aw.busy) return;
    if (aw.step === 'nat') {
        aw.wet = Math.min(1, aw.wet + (pt ? 0.08 : 0.34));
        awSpray(pt, '💧');
        playFreqSweep(2400, 1800, 0.15, 0.05);
        renderAutowas();
        if (aw.wet >= 1) { aw.busy = true; setTimeout(() => { aw.busy = false; awNext('zeep'); }, 400); }
    } else if (aw.step === 'zeep') {
        awTurn('mud', 'foam', pt, () => awNext('borstels'));
    } else if (aw.step === 'borstels') {
        awBrush();
    } else if (aw.step === 'spoelen') {
        awSpray(pt, '💦');
        awTurn('foam', 'drop', pt, () => awNext('drogen'));
    } else if (aw.step === 'drogen') {
        awTurn('drop', null, pt, awDone);
    }
}

// Spots of one kind near the finger (or one of them, with the button) turn into the next kind
function awTurn(from, to, pt, done) {
    const hit = aw.spots.filter(s => s.kind === from && (!pt || Math.hypot(s.x - pt.x, (s.y - pt.y) * 2) < 14));
    if (!hit.length) return;
    (pt ? hit : [randomPick(hit)]).forEach(s => {
        if (to) s.kind = to;
        else aw.spots.splice(aw.spots.indexOf(s), 1);
    });
    if (from === 'mud') for (let i = 0; i < 3; i++) setTimeout(() => playTone(1200 + Math.random() * 900, 0.05, 0.05, 'sine'), i * 60);
    else if (from === 'foam') playFreqSweep(900, 500, 0.12, 0.06);
    else playTone(1500 + Math.random() * 500, 0.05, 0.05, 'triangle');
    renderAutowas();
    if (!aw.spots.some(s => s.kind === from)) {
        aw.busy = true;
        setTimeout(() => { aw.busy = false; done(); }, 400);
    }
}

function awSpray(pt, drop) {
    const car = awCar();
    const r = car.getBoundingClientRect(), o = awOv.getBoundingClientRect();
    const p = pt || { x: 15 + Math.random() * 70, y: 40 + Math.random() * 30 };
    for (let i = 0; i < 3; i++) {
        const sp = document.createElement('span');
        sp.className = 'scope-spark';
        sp.textContent = drop;
        sp.style.left = (r.left - o.left + r.width * p.x / 100) + 'px';
        sp.style.top = (r.top - o.top + r.height * p.y / 100) + 'px';
        sp.style.setProperty('--dx', (Math.random() - 0.5) * 70 + 'px');
        sp.style.setProperty('--dy', 30 + Math.random() * 50 + 'px');
        awOv.appendChild(sp);
        setTimeout(() => sp.remove(), 900);
    }
}

// The big brushes roll over the car three times; the foam goes everywhere
function awBrush() {
    aw.busy = true;
    const round = aw.round;
    const bay = document.getElementById('awBay');
    bay.classList.remove('brushing');
    void bay.offsetWidth;
    bay.classList.add('brushing');
    startNoise('dryer');
    setTimeout(() => {
        stopNoise();
        if (round !== aw.round || !awOpen) return;
        bay.classList.remove('brushing');
        aw.brush++;
        aw.spots.push({ kind: 'foam', ...awSpot() }, { kind: 'foam', ...awSpot() });
        renderAutowas();
        aw.busy = false;
        if (aw.brush >= 3) awNext('spoelen');
    }, 1300);
}

// Hold the blower: the drops fly off one by one
function awDryStart() {
    if (aw.step !== 'drogen' || aw.dryT) return;
    startNoise('dryer');
    awAct(null);
    aw.dryT = setInterval(() => awAct(null), 260);
}

function awDryStop() {
    if (!aw.dryT) return;
    clearInterval(aw.dryT);
    aw.dryT = 0;
    stopNoise();
}

function awDone() {
    awDryStop();
    aw.rub = false;
    aw.step = 'klaar';
    aw.wet = 0;
    aw.busy = true;
    aw.washed++;
    try { localStorage.setItem(AW_KEY, aw.washed); } catch { /* geen opslag */ }
    renderAutowas();
    playWin();
    const car = awCar(), till = document.getElementById('awKassa');
    const round = aw.round;
    ovCheer(awOv, car, ['✨', '⭐', '💖']);
    playTone(523, 0.15, 0.12, 'square');
    setTimeout(() => playTone(659, 0.2, 0.12, 'square'), 180);
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            if (round !== aw.round || !awOpen) return;
            ovFly(awOv, car, till, '🪙', 450).then(() => {
                aw.coins++;
                document.getElementById('awCoins').textContent = aw.coins;
                bounceEl(till, 'jump');
                playTone(COUNT_NOTES[i % COUNT_NOTES.length], 0.2, 0.1, 'triangle');
            });
        }, 900 + i * 300);
    }
    setTimeout(() => {
        if (round !== aw.round || !awOpen) return;
        car.classList.add('out');
        playFreqSweep(200, 500, 0.7, 0.08);
    }, 2400);
    setTimeout(() => { if (round === aw.round && awOpen) awNewCar(); }, 3600);
}

// Rubbing (or holding, for the blower) with your finger on the car
function awPoint(e) {
    const r = awCar().getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
}
awCar().addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (aw.busy) return;
    if (aw.step === 'borstels') { awBrush(); return; }
    aw.rub = true;
    aw.last = { x: e.clientX, y: e.clientY };
    awCar().setPointerCapture(e.pointerId);
    if (aw.step === 'drogen') startNoise('dryer');
    awAct(awPoint(e));
});
awCar().addEventListener('pointermove', (e) => {
    if (!aw.rub || Math.hypot(e.clientX - aw.last.x, e.clientY - aw.last.y) < 14) return;
    aw.last = { x: e.clientX, y: e.clientY };
    awAct(awPoint(e));
});
['pointerup', 'pointercancel'].forEach(t => awCar().addEventListener(t, () => {
    aw.rub = false;
    if (!aw.dryT) stopNoise();
}));

function openAutowas() {
    awOpen = true;
    awOv.classList.add('open');
    awNewCar();
    playMusicBox();
}

function closeAutowas() {
    awOpen = false;
    aw.busy = false;
    aw.rub = false;
    awDryStop();
    stopNoise();
    aw.round++;
    awOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('awCar').innerHTML = awCarSVG() + '<span class="aw-driver" id="awDriver">🐻</span><div class="aw-spots" id="awSpots"></div>';
document.getElementById('awClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeAutowas(); });
awOv.addEventListener('pointerdown', (e) => e.stopPropagation());
