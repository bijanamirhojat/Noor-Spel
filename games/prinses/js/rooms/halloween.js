/* 🎃 Halloweenkamer (lief, niet eng): pompoenen uitsnijden aan de snijtafel (ogen, neus en mond kiezen,
   dan het kaarsje aan), een snoepschaal ("Snoep of je leven!"), een heksenbezem die door de kamer vliegt
   en een spinnetje aan een draadje. De laatste 3 uitgesneden pompoenen staan op het trapje in de kamer
   en in noor-prinses-pompoenen. */
const HW_KEY = 'noor-prinses-pompoenen';
const HW_KEEP = 3;
const HW_CANDY = ['🍬', '🍭', '🍫', '🍪', '🧁', '🍩'];

function hwHeart(cx, cy, s) {
    return `M${cx} ${cy + s * 0.9} C${cx - s * 1.5} ${cy + s * 0.1} ${cx - s * 0.8} ${cy - s * 1.1} ${cx} ${cy - s * 0.35}
        C${cx + s * 0.8} ${cy - s * 1.1} ${cx + s * 1.5} ${cy + s * 0.1} ${cx} ${cy + s * 0.9}Z`;
}
function hwStar(cx, cy, s) {
    const p = [];
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.45 : s;
        p.push(`${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
    }
    return 'M' + p.join(' L') + 'Z';
}
function hwTri(cx, cy, s) { return `M${cx - s} ${cy + s * 0.75} L${cx} ${cy - s * 0.85} L${cx + s} ${cy + s * 0.75}Z`; }
function hwCircle(cx, cy, s) { return `M${cx - s} ${cy} a${s} ${s} 0 1 0 ${s * 2} 0 a${s} ${s} 0 1 0 ${-s * 2} 0Z`; }

// The parts you can carve: each a list of shapes (path in a 200x180 pumpkin)
const HW_EYES = [
    { name: 'driehoekjes', d: () => hwTri(68, 80, 15) + hwTri(132, 80, 15) },
    { name: 'rondjes', d: () => hwCircle(68, 80, 13) + hwCircle(132, 80, 13) },
    { name: 'hartjes', d: () => hwHeart(68, 80, 15) + hwHeart(132, 80, 15) },
    { name: 'sterretjes', d: () => hwStar(68, 80, 17) + hwStar(132, 80, 17) }
];
const HW_NOSES = [
    { name: 'driehoekje', d: () => hwTri(100, 108, 9) },
    { name: 'rondje', d: () => hwCircle(100, 108, 8) },
    { name: 'hartje', d: () => hwHeart(100, 108, 10) }
];
const HW_MOUTHS = [
    { name: 'lach', d: () => 'M58 124 Q100 172 142 124 Q100 146 58 124Z' },
    { name: 'tandjes', d: () => 'M56 122 Q100 176 144 122 L130 128 L124 140 L112 132 L100 144 L88 132 L76 140 L70 128Z' },
    { name: 'oh', d: () => 'M86 140 a14 17 0 1 0 28 0 a14 17 0 1 0 -28 0Z' },
    { name: 'glimlach', d: () => 'M74 128 Q100 152 126 128 Q100 140 74 128Z' }
];
const HW_PARTS = { eyes: HW_EYES, nose: HW_NOSES, mouth: HW_MOUTHS };

let hwSaved = [];
try {
    const s = JSON.parse(localStorage.getItem(HW_KEY));
    if (Array.isArray(s)) hwSaved = s.filter(f => f && typeof f === 'object').slice(-HW_KEEP);
} catch (e) {}

// face: { eyes, nose, mouth } = index into the lists above, or undefined when not carved yet
function pumpkinSVG(face, cls = '') {
    const cut = (k) => {
        const p = HW_PARTS[k][face[k]];
        return p ? `<path class="cut c-${k}" d="${p.d()}"/>` : '';
    };
    return `<svg viewBox="0 0 200 180" class="hw-pk ${cls}">
        <path d="M96 22 Q94 8 104 2 Q110 6 106 10 Q102 14 106 24Z" fill="#65a30d"/>
        <ellipse cx="54" cy="100" rx="46" ry="70" fill="#ea580c"/>
        <ellipse cx="146" cy="100" rx="46" ry="70" fill="#ea580c"/>
        <ellipse cx="78" cy="100" rx="40" ry="76" fill="#f97316"/>
        <ellipse cx="122" cy="100" rx="40" ry="76" fill="#f97316"/>
        <ellipse cx="100" cy="100" rx="34" ry="78" fill="#fb923c"/>
        <ellipse cx="88" cy="56" rx="8" ry="20" fill="#fff" opacity="0.18"/>
        ${cut('eyes')}${cut('nose')}${cut('mouth')}
    </svg>`;
}

defineRoom({
    key: 'halloween',
    name: 'Halloweenkamer',
    icon: '🎃',
    say: 'De halloweenkamer! Pompoenen snijden!',
    lampX: 740,
    build(x) {
        place(el('<div class="hw-moon"></div>'), x + 560, 40);
        [[90, 70], [330, 40], [470, 110]].forEach(([bx, by], i) =>
            place(el(`<div class="hw-bat" style="animation-delay:${-i * 1.3}s">🦇</div>`), x + bx, by));
        place(el('<div class="hw-web">🕸️</div>'), x + 2, 0);
        place(el('<div class="hw-garland">' + '🎃👻🦇🍬'.repeat(4) + '</div>'), x + 120, 4);
        addObj(`<div class="hw-table">
            <div class="pk">${pumpkinSVG({})}</div><span class="knife">🔪</span><span class="spoon">🥄</span>
            <div class="top"></div><div class="leg l"></div><div class="leg r"></div>
            <div class="tap-hint" style="left:120px;top:-40px">👇</div>
        </div>`, x + 180, 200, x + 300, openCarve);
        addObj('<div class="hw-steps" id="hwSteps"><div class="s s1"></div><div class="s s2"></div><div class="s s3"></div><div class="pks"></div></div>',
            x + 20, 230, x + 120, (node) => {
                node.classList.toggle('lit');
                const lit = node.classList.contains('lit');
                [392, 494, 587].forEach((f, k) => setTimeout(() => playTone(lit ? f * 2 : f, 0.18, 0.08, 'triangle'), k * 90));
                if (!hwSaved.length) speak('Nog geen pompoenen. Snij er een aan de tafel!');
            });
        addObj('<div class="hw-bowl"><div class="candy">🍬🍭🍫</div><div class="bowl"></div></div>', x + 470, 316, x + 520, (node) => {
            bounceEl(node, 'jump');
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top);
            for (let i = 0; i < 5; i++) {
                const c = place(el(`<div class="hw-fly">${randomPick(HW_CANDY)}</div>`), p.x - 16, p.y);
                c.style.setProperty('--dx', (Math.random() - 0.5) * 260 + 'px');
                c.style.animationDelay = i * 0.08 + 's';
                setTimeout(() => c.remove(), 1400);
            }
            [784, 988, 1175].forEach((f, k) => setTimeout(() => playTone(f, 0.12, 0.08, 'sine'), k * 80));
            speak(randomPick(['Snoep of je leven!', 'Mmm, snoepjes!', 'Een lolly voor mij!']));
        });
        addObj('<div class="hw-broom"><span class="cat">🐈‍⬛</span><div class="stick"></div><div class="brush"></div></div>', x + 630, 300, x + 660, (node) => {
            if (node.classList.contains('fly')) return;
            node.classList.add('fly');
            playFreqSweep(300, 900, 0.6, 0.1);
            setTimeout(() => playFreqSweep(900, 300, 0.6, 0.1), 1200);
            setTimeout(() => { playTone(660, 0.15, 0.08, 'sine'); playTone(880, 0.2, 0.06, 'sine'); }, 600);
            setTimeout(() => node.classList.remove('fly'), 2600);
        });
        addObj('<div class="hw-spider"><div class="thread"></div><span>🕷️</span></div>', x + 380, 0, x + 400, (node) => {
            node.classList.remove('drop'); void node.offsetWidth; node.classList.add('drop');
            playFreqSweep(800, 300, 0.5, 0.08);
            setTimeout(() => playFreqSweep(300, 800, 0.5, 0.08), 900);
        });
        renderPumpkinSteps();
    }
});

function renderPumpkinSteps() {
    const n = document.querySelector('#hwSteps .pks');
    if (!n) return;
    // Biggest step first: the newest pumpkin stands on top
    n.innerHTML = hwSaved.slice().reverse().map((f, i) => `<div class="p p${i + 1}">${pumpkinSVG(f)}</div>`).join('');
}

/* ─────────── Pompoen uitsnijden (overlay) ─────────── */
const hwEl = document.getElementById('hwOv');
let carveOpen = false;
registerOverlay(() => carveOpen, closeCarve);
const hw = { face: {}, lit: false, saved: false, done: 0 };

function hwComplete() { return Object.keys(HW_PARTS).every(k => hw.face[k] !== undefined); }

function hwRender(changed) {
    const stage = document.getElementById('hwPumpkin');
    stage.innerHTML = pumpkinSVG(hw.face, hw.lit ? 'lit' : '');
    if (changed) {
        const c = stage.querySelector('.c-' + changed);
        if (c) c.classList.add('new');
    }
    hwEl.classList.toggle('dark', hw.lit);
    document.querySelectorAll('.hw-opt').forEach(b => b.classList.toggle('sel', hw.face[b.dataset.k] === +b.dataset.i));
    const next = ['eyes', 'nose', 'mouth'].find(k => hw.face[k] === undefined);
    document.querySelectorAll('.hw-row').forEach(r => r.classList.toggle('next', r.dataset.k === next));
    document.getElementById('hwLight').classList.toggle('next', !next && !hw.lit);
    document.getElementById('hwLight').textContent = hw.lit ? '💡 Licht aan' : '🕯️ Kaarsje aan';
    document.getElementById('hwHint').textContent = next === 'eyes' ? '👀 Kies de ogen!' : next === 'nose' ? '👃 Nu een neus!'
        : next === 'mouth' ? '😁 En een mond!' : hw.lit ? '🎃 Wat een mooie pompoen!' : '🕯️ Doe het kaarsje aan!';
}

function hwCarve(k, i) {
    if (hw.face[k] === i) return;
    hw.face[k] = i;
    hw.saved = false;
    // Scritch scratch
    for (let n = 0; n < 4; n++) setTimeout(() => playFreqSweep(900 + Math.random() * 300, 500, 0.06, 0.06), n * 90);
    const knife = document.getElementById('hwKnife');
    knife.classList.remove('cut'); void knife.offsetWidth; knife.classList.add('cut');
    hwRender(k);
    speak(HW_PARTS[k][i].name);
}

function hwToggleLight() {
    if (!hwComplete() && !hw.lit) {
        bounceEl(document.getElementById('hwPumpkin'), 'nope');
        speak('Eerst ogen, een neus en een mond!');
        return;
    }
    hw.lit = !hw.lit;
    hwRender();
    if (!hw.lit) { playTone(300, 0.15, 0.08, 'sine'); return; }
    playFreqSweep(200, 700, 0.3, 0.1);
    // Light off and on again: this pumpkin is already on the steps
    if (hw.saved) return;
    hw.saved = true;
    playCorrect();
    ovCheer(hwEl, document.getElementById('hwPumpkin'), ['🎃', '✨', '🦇', '🍬']);
    hw.done++;
    document.getElementById('hwCount').textContent = `🎃 ${hw.done}`;
    hwSaved.push({ ...hw.face });
    hwSaved = hwSaved.slice(-HW_KEEP);
    try { localStorage.setItem(HW_KEY, JSON.stringify(hwSaved)); } catch (e) {}
    renderPumpkinSteps();
    speak('Wat een mooie pompoen! Hij staat nu op het trapje.');
}

function hwNew() {
    hw.face = {};
    hw.lit = false;
    hw.saved = false;
    _playWhoosh();
    hwRender();
}

Object.entries(HW_PARTS).forEach(([k, list]) => {
    const row = document.querySelector(`.hw-row[data-k="${k}"] .bd-tray`);
    list.forEach((p, i) => {
        const b = el(`<button class="bd-btn hw-opt" data-k="${k}" data-i="${i}" aria-label="${p.name}">
            <svg viewBox="${k === 'eyes' ? '44 56 112 48' : k === 'nose' ? '84 92 32 32' : '50 110 100 66'}"><path d="${p.d()}"/></svg></button>`);
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); hwCarve(k, i); });
        row.appendChild(b);
    });
});
document.getElementById('hwLight').addEventListener('pointerdown', (e) => { e.stopPropagation(); hwToggleLight(); });
document.getElementById('hwNew').addEventListener('pointerdown', (e) => { e.stopPropagation(); hwNew(); });

function openCarve() {
    carveOpen = true;
    hwEl.classList.add('open');
    hw.face = {};
    hw.lit = false;
    hw.saved = false;
    hwRender();
    speak('Pompoen uitsnijden! Kies de ogen.');
}

function closeCarve() {
    carveOpen = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    hwEl.classList.remove('open', 'dark');
    _playWhoosh();
}
document.getElementById('hwClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeCarve(); });
hwEl.addEventListener('pointerdown', (e) => e.stopPropagation());
