/* 🐾 Dierensalon */
defineRoom({
    key: 'dierensalon',
    name: 'Dierensalon',
    icon: '🐾',
    say: 'De dierensalon',
    build(rd) {
        place(el('<div class="shower-head">🚿</div>'), rd + 380, 90);
        place(el(`<div class="towels">
            <span style="left:6px;background:#f9a8d4"></span>
            <span style="left:50px;background:#c4b5fd"></span>
            <span style="left:94px;background:#86efac"></span>
        </div>`), rd + 620, 150);
        addObj('<div class="emoji-obj" style="font-size:44px">🧴</div>', rd + 60, 200, rd + 90, () => { playFreqSweep(600, 300, 0.2, 0.15); burst(rd + 85, 220, 20); });
        addObj(`<div class="bathtub">
            <div class="foam"></div>
            <div class="tub"></div>
            <div class="foot" style="left:40px"></div><div class="foot" style="left:250px"></div>
            <span class="duck">🦆</span>
            <div class="tap-hint" style="top:-44px">👇</div>
        </div>`, rd + 240, 222, rd + 400, () => openCare(0));
        CARE_PETS.slice(0, 3).forEach((pet, i) =>
            addObj(`<div class="emoji-obj">${pet.e}</div>`, rd + 70 + i * 60, 380 - (i % 2) * 8, rd + 150, () => openCare(i)));
    }
});

/* ─────────── Dierensalon ─────────── */
const careEl = document.getElementById('care');
const careStage = document.getElementById('careStage');
const petBox = document.getElementById('petBox');
const petEmoji = document.getElementById('petEmoji');
const petLayer = document.getElementById('petLayer');
const petAcc = document.getElementById('petAcc');
const toolCursor = document.getElementById('toolCursor');
let careOpen = false;

const DRYER_SVG = `<svg viewBox="0 0 40 40"><rect x="10" y="20" width="9" height="17" rx="3" fill="#db2777"/><rect x="4" y="8" width="26" height="15" rx="7.5" fill="#f472b6"/><rect x="0" y="11" width="8" height="9" rx="2" fill="#f9a8d4"/><circle cx="21" cy="15.5" r="3.5" fill="#fff"/></svg>`;
const BRUSH_SVG = `<svg viewBox="0 0 40 40"><rect x="17" y="2" width="7" height="20" rx="3.5" fill="#a855f7"/><rect x="7" y="20" width="27" height="10" rx="4" fill="#fcd34d"/><g stroke="#92400e" stroke-width="2" stroke-linecap="round">${[10, 14, 18, 22, 26, 30].map(x => `<line x1="${x}" y1="30" x2="${x}" y2="37"/>`).join('')}</g></svg>`;

const CARE_PETS = [
    { e: '🐶', sound: () => { playTone(320, 0.1, 0.22, 'square'); setTimeout(() => playTone(280, 0.12, 0.22, 'square'), 170); } },
    { e: '🐱', sound: () => { playFreqSweep(700, 1000, 0.15, 0.2); setTimeout(() => playFreqSweep(1000, 600, 0.3, 0.2), 150); } },
    { e: '🐰', sound: () => { playFreqSweep(1400, 1900, 0.08, 0.15); setTimeout(() => playFreqSweep(1500, 2000, 0.08, 0.15), 120); } },
    { e: '🐷', sound: () => { playTone(180, 0.1, 0.2, 'sawtooth'); setTimeout(() => playTone(160, 0.12, 0.2, 'sawtooth'), 150); } },
    { e: '🦄', sound: () => playSparkleSound() },
    { e: '🐹', sound: () => { playFreqSweep(1800, 2400, 0.06, 0.12); setTimeout(() => playFreqSweep(1800, 2500, 0.06, 0.12), 90); } }
];
const CARE_TOOLS = [
    { id: 'soap', icon: '🧽', label: 'Zeep' },
    { id: 'shower', icon: '🚿', label: 'Douche' },
    { id: 'dryer', icon: DRYER_SVG, label: 'Föhn' },
    { id: 'brush', icon: BRUSH_SVG, label: 'Borstel' }
];
const CARE_ACCS = [
    { id: 'bow', e: '🎀', x: 78, y: 14, s: 0.3 },
    { id: 'crown', e: '👑', x: 50, y: 2, s: 0.34 },
    { id: 'flower', e: '🌸', x: 22, y: 14, s: 0.26 },
    { id: 'glasses', e: '🕶️', x: 50, y: 44, s: 0.42 }
];

const care = {
    pet: 0,
    tool: 'soap',
    mud: [],
    foam: [],
    drops: [],
    wasWet: false,
    dry: false,
    brushed: 0,
    shiny: false,
    cleanShown: false,
    accs: new Set(),
    active: false,
    last: { soap: 0, spray: 0, drop: 0, air: 0, brush: 0, snd: 0 },
    done: new Set()
};

function careSizes() {
    const h = petBox.getBoundingClientRect().height;
    petEmoji.style.fontSize = (h * 0.86) + 'px';
    petAcc.querySelectorAll('.acc').forEach(a => {
        const acc = CARE_ACCS.find(c => c.id === a.dataset.id);
        a.style.fontSize = (h * acc.s) + 'px';
    });
}

function makeDirty() {
    petLayer.innerHTML = '';
    care.mud = [];
    care.foam = [];
    care.drops = [];
    care.wasWet = care.dry = care.shiny = care.cleanShown = false;
    care.brushed = 0;
    petEmoji.classList.remove('wet', 'shiny', 'fluffy');
    document.querySelectorAll('.care-tool.pulse').forEach(b => b.classList.remove('pulse'));
    for (let i = 0; i < 9; i++) {
        const x = 24 + Math.random() * 52;
        const y = 22 + Math.random() * 46;
        const size = 10 + Math.random() * 9;
        const m = document.createElement('div');
        m.className = 'mud';
        m.style.left = x + '%';
        m.style.top = y + '%';
        m.style.width = size + '%';
        m.style.height = (size * (0.7 + Math.random() * 0.5)) + '%';
        m.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        petLayer.appendChild(m);
        care.mud.push({ x, y, node: m, soapy: false });
    }
    ['🍂', '🌿'].forEach((e) => {
        const x = 25 + Math.random() * 50, y = 20 + Math.random() * 50;
        const l = document.createElement('div');
        l.className = 'leaf';
        l.textContent = e;
        l.style.left = x + '%';
        l.style.top = y + '%';
        l.style.fontSize = (petBox.getBoundingClientRect().height * 0.12) + 'px';
        petLayer.appendChild(l);
        care.mud.push({ x, y, node: l, soapy: true });
    });
}

function renderCarePets() {
    const box = document.getElementById('carePets');
    box.innerHTML = CARE_PETS.map((p, i) => `<button class="care-pet${care.pet === i ? ' sel' : ''}${care.done.has(i) ? ' is-done' : ''}" data-i="${i}">${p.e}<span class="done">✅</span></button>`).join('');
    box.querySelectorAll('.care-pet').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        choosePet(+b.dataset.i);
    }));
}

function renderCareTools() {
    const box = document.getElementById('careTools');
    box.innerHTML =
        CARE_TOOLS.map(t => `<button class="care-tool${care.tool === t.id ? ' sel' : ''}" data-t="${t.id}">${t.icon}<small>${t.label}</small></button>`).join('') +
        '<span class="care-sep"></span>' +
        CARE_ACCS.map(a => `<button class="care-tool" data-a="${a.id}">${a.e}</button>`).join('') +
        '<span class="care-sep"></span>' +
        '<button class="care-tool" id="careMud">🟤<small>Modder</small></button>' +
        '<button class="care-tool" id="careDone">✅<small>Klaar</small></button>';
    box.querySelectorAll('.care-tool[data-t]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        care.tool = b.dataset.t;
        box.querySelectorAll('.care-tool[data-t]').forEach(x => x.classList.toggle('sel', x === b));
        playPop();
    }));
    box.querySelectorAll('.care-tool[data-a]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        toggleAcc(b.dataset.a);
    }));
    document.getElementById('careMud').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        makeDirty();
        wigglePet();
        playFreqSweep(300, 120, 0.3, 0.2);
    });
    document.getElementById('careDone').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        careDone();
    });
}

function toolBtn(id) { return document.querySelector(`.care-tool[data-t="${id}"]`); }

function hintTool(id) {
    const b = toolBtn(id);
    if (!b || b.classList.contains('hint')) return;
    b.classList.add('hint');
    setTimeout(() => b.classList.remove('hint'), 1600);
}

function wigglePet(cls = 'wiggle') {
    petEmoji.classList.remove('wiggle', 'jump');
    void petEmoji.offsetWidth;
    petEmoji.classList.add(cls);
}

function toggleAcc(id) {
    const acc = CARE_ACCS.find(a => a.id === id);
    const existing = petAcc.querySelector(`[data-id="${id}"]`);
    if (existing) {
        existing.remove();
        care.accs.delete(id);
        playFreqSweep(900, 400, 0.15, 0.12);
        return;
    }
    const a = document.createElement('div');
    a.className = 'acc';
    a.dataset.id = id;
    a.textContent = acc.e;
    a.style.left = acc.x + '%';
    a.style.top = acc.y + '%';
    petAcc.appendChild(a);
    care.accs.add(id);
    careSizes();
    playTone(1200, 0.12, 0.15, 'triangle');
    twinkleAt(acc.x, acc.y, 5);
    wigglePet();
}

function choosePet(i) {
    care.pet = i;
    petEmoji.textContent = CARE_PETS[i].e;
    petAcc.innerHTML = '';
    care.accs.clear();
    makeDirty();
    renderCarePets();
    wigglePet('jump');
    CARE_PETS[i].sound();
}

// Pointer → percentages inside the pet box, and pixels inside the stage
function carePoint(e) {
    const b = petBox.getBoundingClientRect();
    const st = careStage.getBoundingClientRect();
    return {
        px: ((e.clientX - b.left) / b.width) * 100,
        py: ((e.clientY - b.top) / b.height) * 100,
        sx: e.clientX - st.left,
        sy: e.clientY - st.top
    };
}

function fxBit(cls, sx, sy, html, ms, vars) {
    const n = document.createElement('div');
    n.className = 'fx-bit ' + cls;
    n.style.left = sx + 'px';
    n.style.top = sy + 'px';
    if (html) n.innerHTML = html;
    if (vars) Object.entries(vars).forEach(([k, v]) => n.style.setProperty(k, v));
    careStage.appendChild(n);
    setTimeout(() => n.remove(), ms);
}

function twinkleAt(px, py, n) {
    const b = petBox.getBoundingClientRect();
    const st = careStage.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const sx = b.left - st.left + (px / 100) * b.width + (Math.random() - 0.5) * 60;
        const sy = b.top - st.top + (py / 100) * b.height + (Math.random() - 0.5) * 60;
        fxBit('twinkle', sx, sy, randomPick(['✨', '⭐', '💖', '🌟']), 700);
    }
}

function near(item, pt, r) {
    return Math.hypot(item.x - pt.px, item.y - pt.py) < r;
}

function removeItem(list, item) {
    item.node.classList.add('gone');
    setTimeout(() => item.node.remove(), 350);
    list.splice(list.indexOf(item), 1);
}

function onPet(pt) {
    return pt.px > 5 && pt.px < 95 && pt.py > 0 && pt.py < 100;
}

function applyCareTool(e) {
    const pt = carePoint(e);
    toolCursor.style.left = pt.sx + 'px';
    toolCursor.style.top = pt.sy + 'px';
    const now = performance.now();
    const L = care.last;

    if (care.tool === 'soap') {
        if (!onPet(pt)) return;
        if (now - L.soap > 40 && care.foam.length < 90) {
            L.soap = now;
            const size = 7 + Math.random() * 7;
            const x = pt.px + (Math.random() - 0.5) * 10, y = pt.py + (Math.random() - 0.5) * 10;
            const f = document.createElement('div');
            f.className = 'foam-b';
            f.style.left = x + '%';
            f.style.top = y + '%';
            f.style.width = f.style.height = size + '%';
            petLayer.appendChild(f);
            care.foam.push({ x, y, node: f });
        }
        care.mud.forEach(m => {
            if (!m.soapy && near(m, pt, 14)) {
                m.soapy = true;
                m.node.classList.add('soapy');
            }
        });
        if (now - L.snd > 140) { L.snd = now; playFreqSweep(500 + Math.random() * 300, 900, 0.06, 0.06); }
    } else if (care.tool === 'shower') {
        if (now - L.spray > 45) {
            L.spray = now;
            for (let k = 0; k < 3; k++) {
                fxBit('spray', pt.sx + (Math.random() - 0.5) * 40, pt.sy + 20, '', 500, { '--dx': ((Math.random() - 0.5) * 40) + 'px' });
            }
        }
        if (!onPet(pt)) return;
        const below = { px: pt.px, py: pt.py + 8 };
        care.foam.slice().forEach(f => { if (near(f, below, 17)) removeItem(care.foam, f); });
        care.mud.slice().forEach(m => {
            if (!near(m, below, 16)) return;
            if (m.soapy) removeItem(care.mud, m);
            else hintTool('soap');
        });
        if (now - L.drop > 90 && care.drops.length < 26) {
            L.drop = now;
            const x = Math.max(12, Math.min(88, below.px + (Math.random() - 0.5) * 24));
            const y = Math.max(12, Math.min(85, below.py + (Math.random() - 0.5) * 24));
            const d = document.createElement('div');
            d.className = 'wet-drop';
            d.style.left = x + '%';
            d.style.top = y + '%';
            petLayer.appendChild(d);
            care.drops.push({ x, y, node: d });
            care.wasWet = true;
            care.dry = false;
            petEmoji.classList.add('wet');
        }
    } else if (care.tool === 'dryer') {
        if (now - L.air > 50) {
            L.air = now;
            fxBit('air', pt.sx - 40, pt.sy + (Math.random() - 0.5) * 20, '', 450, { '--dy': ((Math.random() - 0.5) * 50) + 'px' });
        }
        if (!onPet({ px: pt.px + 12, py: pt.py })) return;
        const aim = { px: pt.px - 10, py: pt.py };
        care.drops.slice().forEach(d => { if (near(d, aim, 20)) removeItem(care.drops, d); });
        if (care.wasWet && !care.dry && care.drops.length === 0) {
            care.dry = true;
            petEmoji.classList.remove('wet');
            petEmoji.classList.remove('fluffy');
            void petEmoji.offsetWidth;
            petEmoji.classList.add('fluffy');
            twinkleAt(50, 45, 10);
            CARE_PETS[care.pet].sound();
        }
    } else if (care.tool === 'brush') {
        if (!onPet(pt)) return;
        if (now - L.brush > 70) {
            L.brush = now;
            care.brushed++;
            fxBit('twinkle', pt.sx + (Math.random() - 0.5) * 30, pt.sy, randomPick(['✨', '✨', '💫']), 700);
            playTone(1400 + Math.random() * 800, 0.06, 0.05, 'sine');
            if (care.brushed >= 30 && !care.shiny) {
                care.shiny = true;
                petEmoji.classList.add('shiny');
                twinkleAt(50, 40, 12);
                playSparkleSound();
                wigglePet();
            }
        }
    }
    checkClean();
}

function checkClean() {
    const clean = care.mud.length === 0 && care.foam.length === 0 && care.drops.length === 0;
    if (clean && !care.cleanShown) {
        care.cleanShown = true;
        document.getElementById('careDone').classList.add('pulse');
        wigglePet('jump');
        CARE_PETS[care.pet].sound();
        twinkleAt(50, 50, 12);
        playCorrect();
    }
}

function careDone() {
    if (care.mud.length) { hintTool('soap'); hintTool('shower'); wigglePet(); return; }
    if (care.foam.length) { hintTool('shower'); wigglePet(); return; }
    if (care.drops.length) { hintTool('dryer'); wigglePet(); return; }
    document.getElementById('careDone').classList.remove('pulse');
    care.done.add(care.pet);
    renderCarePets();
    wigglePet('jump');
    CARE_PETS[care.pet].sound();
    playWin();
    for (let k = 0; k < 3; k++) setTimeout(() => twinkleAt(50, 40, 12), k * 250);
    if (care.done.size === CARE_PETS.length) {
        setTimeout(() => {
            playWin();
            for (let k = 0; k < 5; k++) setTimeout(() => twinkleAt(Math.random() * 100, Math.random() * 100, 10), k * 200);
        }, 900);
    }
}

careStage.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    care.active = true;
    toolCursor.innerHTML = CARE_TOOLS.find(t => t.id === care.tool).icon;
    toolCursor.classList.add('show');
    if (care.tool === 'shower') startNoise('shower');
    if (care.tool === 'dryer') startNoise('dryer');
    applyCareTool(e);
});
careStage.addEventListener('pointermove', (e) => {
    if (care.active) applyCareTool(e);
});
const careUp = () => {
    if (!care.active) return;
    care.active = false;
    toolCursor.classList.remove('show');
    stopNoise();
};
window.addEventListener('pointerup', careUp);
window.addEventListener('pointercancel', careUp);
careEl.addEventListener('pointerdown', (e) => e.stopPropagation());

// Looping filtered noise for the shower and the hair dryer
let noise = null;
function startNoise(kind) {
    stopNoise();
    try {
        const ctx = getAudioContext();
        const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = kind === 'shower' ? 'highpass' : 'bandpass';
        filter.frequency.value = kind === 'shower' ? 2500 : 700;
        const gain = ctx.createGain();
        gain.gain.value = kind === 'shower' ? 0.05 : 0.07;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        noise = { src, gain, ctx };
    } catch (e) {}
}
function stopNoise() {
    if (!noise) return;
    try {
        noise.gain.gain.setTargetAtTime(0, noise.ctx.currentTime, 0.05);
        noise.src.stop(noise.ctx.currentTime + 0.2);
    } catch (e) {}
    noise = null;
}

function openCare(i) {
    careOpen = true;
    careEl.classList.add('open');
    renderCareTools();
    careSizes();
    choosePet(i || 0);
    playMusicBox();
}

function closeCare() {
    careOpen = false;
    careEl.classList.remove('open');
    careUp();
    _playWhoosh();
}
document.getElementById('careClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeCare();
});
window.addEventListener('resize', () => { if (careOpen) careSizes(); });
