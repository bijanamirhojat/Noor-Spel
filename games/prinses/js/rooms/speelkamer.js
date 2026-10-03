/* 🧸 Speelkamer */
defineRoom({
    key: 'speelkamer',
    name: 'Speelkamer',
    icon: '🧸',
    say: 'De speelkamer',
    build(rp) {
        addObj(`<div class="chest">
            <span class="clothes">👗👒🎩👑</span>
            <div class="lid"></div>
            <div class="box"></div>
            <div class="tap-hint" style="top:-50px">👇</div>
        </div>`, rp + 290, 210, rp + 405, openDressup);
        addObj('<div class="toy-ball">⚽</div>', rp + 90, 380, rp + 120, (node) => {
            node.classList.remove('bounce'); void node.offsetWidth; node.classList.add('bounce');
            [0, 240, 480, 720].forEach((t, i) => setTimeout(() => playTone(500 - i * 60, 0.08, 0.2, 'triangle'), t));
        });
        addObj('<div class="toy-train">🚂</div>', rp + 640, 375, rp + 640, (node) => {
            node.classList.remove('drive'); void node.offsetWidth; node.classList.add('drive');
            playTone(660, 0.3, 0.15, 'square'); setTimeout(() => playTone(880, 0.4, 0.12, 'square'), 300);
        });
        addObj(`<div class="blocks">
            <span style="top:104px;background:#ef4444">A</span>
            <span style="top:56px;background:#3b82f6">B</span>
            <span style="top:8px;background:#22c55e">C</span>
        </div>`, rp + 560, 260, rp + 595, (node) => {
            const tumbled = node.classList.toggle('tumble');
            playFreqSweep(tumbled ? 600 : 300, tumbled ? 150 : 700, 0.4, 0.15);
        });
        addObj('<div class="emoji-obj">🧸</div>', rp + 30, 380, rp + 60, teddyHug);
    }
});

/* ─────────── Verkleedkist ─────────── */
const dressEl = document.getElementById('dressup');
let dressOpen = false;
let duTab = 'hat';
const DU_CATS = [
    { k: 'hat', icon: '👑', opts: [['crown', '👑'], ['tiara', '💎'], ['witch', '🧙'], ['pirate', '🏴‍☠️'], ['bunny', '🐰'], ['unicorn', '🦄'], ['flowers', '🌸'], ['cat', '🐱'], ['none', '🚫']] },
    { k: 'dress', icon: '👗' },
    { k: 'hair', icon: '💇' },
    { k: 'back', icon: '🧚', opts: [['none', '🚫'], ['wings', '🧚'], ['butterfly', '🦋'], ['cape', '🦸']] },
    { k: 'face', icon: '😎', opts: [['none', '🚫'], ['glasses', '😍'], ['whiskers', '😺'], ['mask', '🎭'], ['stars', '🤩']] }
];

function dressSwatch(c) {
    return c === 'rainbow' ? 'linear-gradient(180deg,#ef4444,#facc15,#4ade80,#60a5fa,#c084fc)' : c;
}

function renderDuTabs() {
    const box = document.getElementById('duTabs');
    box.innerHTML = DU_CATS.map(c => `<button class="du-tab${duTab === c.k ? ' active' : ''}" data-k="${c.k}">${c.icon}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        duTab = b.dataset.k;
        renderDuTabs();
        renderDuOpts();
        playPop();
    }));
}

function renderDuOpts() {
    const box = document.getElementById('duOpts');
    const cat = DU_CATS.find(c => c.k === duTab);
    if (duTab === 'dress') {
        box.innerHTML = DRESSES.map((c, i) => `<button class="du-opt${state.dressIdx === i ? ' sel' : ''}" data-v="${i}"><span class="sw" style="background:${dressSwatch(c)}"></span></button>`).join('');
    } else if (duTab === 'hair') {
        box.innerHTML = HAIRS.map((h, i) => `<button class="du-opt${state.look.hair === i ? ' sel' : ''}" data-v="${i}"><span class="sw" style="background:${h === 'rainbow' ? dressSwatch('rainbow') : `linear-gradient(180deg, ${h[0]}, ${h[1]})`}"></span></button>`).join('');
    } else {
        box.innerHTML = cat.opts.map(([v, ic]) => `<button class="du-opt${state.look[duTab] === v ? ' sel' : ''}" data-v="${v}">${ic}</button>`).join('');
    }
    box.querySelectorAll('.du-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const v = b.dataset.v;
        if (duTab === 'dress') state.dressIdx = +v;
        else if (duTab === 'hair') state.look.hair = +v;
        else state.look[duTab] = v;
        applyLook();
        renderDuOpts();
        duSparkle();
    }));
}

function duSparkle() {
    const pv = document.getElementById('duPreview');
    pv.classList.remove('pop');
    void pv.offsetWidth;
    pv.classList.add('pop');
    const r = pv.getBoundingClientRect();
    const o = dressEl.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '⭐', '💖', '🌟']);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 80;
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.top + r.height * 0.4 - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        dressEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    [1319, 1760].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.08, 'sine'), i * 60));
}

function openDressup() {
    dressOpen = true;
    dressEl.classList.add('open');
    const pv = document.getElementById('duPreview');
    if (!pv.firstElementChild) pv.innerHTML = princessSVG('dz');
    applyLook();
    renderDuTabs();
    renderDuOpts();
    playMusicBox();
}

function closeDressup() {
    dressOpen = false;
    dressEl.classList.remove('open');
    saveLook();
    twirl();
    burst(state.x, 320, 50);
    playSparkleSound();
}

document.getElementById('duRandom').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    DU_CATS.forEach(c => { if (c.opts) state.look[c.k] = randomPick(c.opts)[0]; });
    state.look.hair = Math.floor(Math.random() * HAIRS.length);
    state.dressIdx = Math.floor(Math.random() * DRESSES.length);
    applyLook();
    renderDuOpts();
    duSparkle();
    playFreqSweep(300, 1500, 0.4, 0.12);
});
document.getElementById('duDone').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    playWin();
    closeDressup();
});
document.getElementById('duClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeDressup();
});
dressEl.addEventListener('pointerdown', (e) => e.stopPropagation());
