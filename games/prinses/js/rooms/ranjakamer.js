/* 🧃 Ranjakamer: ranja maken. Kies siroopjes (de kleuren mengen!), doe er water bij, roeren,
   ijsblokjes en een schijfje fruit erop, en dan opdrinken. */
const RJ_FLAVORS = [
    { key: 'aardbei', name: 'aardbei', icon: '🍓', c: [239, 68, 68] },
    { key: 'meloen', name: 'watermeloen', icon: '🍉', c: [251, 113, 133] },
    { key: 'sinaas', name: 'sinaasappel', icon: '🍊', c: [249, 115, 22] },
    { key: 'citroen', name: 'citroen', icon: '🍋', c: [250, 204, 21] },
    { key: 'appel', name: 'appel', icon: '🍏', c: [132, 204, 22] },
    { key: 'bosbes', name: 'bosbes', icon: '🫐', c: [37, 99, 235] },
    { key: 'druif', name: 'druiven', icon: '🍇', c: [147, 51, 234] }
];
const RJ_MAX = 8;
const RJ_WATER = [224, 242, 254];
const RJ_SLICES = ['🍋', '🍊', '🍓', '🍉', '🍒'];

const rgb = (c) => `rgb(${c.map(Math.round).join(',')})`;

defineRoom({
    key: 'ranjakamer',
    name: 'Ranjakamer',
    icon: '🧃',
    say: 'De ranjakamer. Ranja maken!',
    build(x) {
        place(el(`<div class="rj-shelf">${RJ_FLAVORS.map(f => `<div class="rj-bottle" style="--c:${rgb(f.c)}"><i></i><span>${f.icon}</span></div>`).join('')}</div>`), x + 40, 120);
        addObj(`<div class="rj-counter">
            <div class="jug"><div class="juice"></div><div class="handle"></div></div>
            <div class="glass g1"></div><div class="glass g2"></div>
            <div class="top"></div><div class="front"><span>🧃</span></div>
            <div class="tap-hint" style="left:110px;top:-44px">👇</div>
        </div>`, x + 220, 252, x + 330, openRanja);
        addObj('<div class="rj-fridge"><div class="door"></div><div class="inside"><span>🧊</span><span>🧊</span><span>🍋</span><span>🍓</span></div><i></i></div>', x + 560, 212, x + 580, (node) => {
            node.classList.toggle('open');
            if (node.classList.contains('open')) {
                playFreqSweep(400, 700, 0.15, 0.08);
                [0, 120, 240].forEach(t => setTimeout(() => playTone(2200 + Math.random() * 800, 0.05, 0.08, 'sine'), t));
            } else {
                playTone(180, 0.1, 0.12, 'square');
            }
        });
        addObj('<div class="emoji-obj rj-fruit">🍓🍋🍊</div>', x + 680, 360, x + 700, (node) => {
            bounceEl(node, 'jump');
            sparkleShower(x + 720, 360, 16);
            speak(randomPick(['Lekker fruit!', 'Mmm, aardbeien!', 'Zuur, die citroen!']));
        });
    }
});

/* ─────────── Ranja maken (overlay) ─────────── */
const rjEl = document.getElementById('rjOv');
let ranjaOpen = false;
const rj = { syr: {}, water: 0, stirred: true, ice: 0, slice: null, drunk: 0, busy: false };

function rjSyrup() { return Object.values(rj.syr).reduce((a, b) => a + b, 0); }
function rjTotal() { return rjSyrup() + rj.water; }

// Weighted average of the chosen syrups
function rjSyrupColor() {
    const n = rjSyrup();
    const c = [0, 0, 0];
    RJ_FLAVORS.forEach(f => {
        const k = rj.syr[f.key] || 0;
        for (let i = 0; i < 3; i++) c[i] += f.c[i] * k / n;
    });
    return c;
}

// After stirring: the syrup gets lighter with more water (but stays nicely colourful)
function rjMixColor() {
    const n = rjTotal();
    if (!rjSyrup()) return RJ_WATER;
    const s = rjSyrupColor();
    const t = (rj.water / n) * 0.4;
    return s.map((v, i) => v + (RJ_WATER[i] - v) * t);
}

function rjRender() {
    const n = rjTotal();
    const liq = document.getElementById('rjLiquid');
    liq.style.height = (n / RJ_MAX * 88) + '%';
    const bottom = document.getElementById('rjSyrLayer');
    const top = document.getElementById('rjWaterLayer');
    if (rj.stirred || !n) {
        bottom.style.height = '100%';
        bottom.style.background = rgb(rjMixColor());
        top.style.height = '0%';
    } else {
        // Syrup sinks to the bottom until you stir
        const s = rjSyrup();
        bottom.style.height = (s / n * 100) + '%';
        bottom.style.background = s ? rgb(rjSyrupColor()) : 'transparent';
        top.style.height = (rj.water / n * 100) + '%';
    }
    document.getElementById('rjIce').innerHTML = Array.from({ length: rj.ice }, (_, i) => `<span style="left:${18 + i * 22}%;animation-delay:${-i * 0.4}s">🧊</span>`).join('');
    document.getElementById('rjSlice').textContent = rj.slice || '';
    const full = n >= RJ_MAX;
    document.getElementById('rjGlass').classList.toggle('full', full);
    document.querySelectorAll('.rj-tool').forEach(b => {
        const t = b.dataset.t;
        b.classList.toggle('next', !rj.busy && ((t === 'water' && rjSyrup() && !rj.water) || (t === 'stir' && !rj.stirred && rj.water && rjSyrup()) || (t === 'drink' && n >= 4 && rj.stirred)));
    });
    document.getElementById('rjHint').textContent = !n ? '🍓 Kies een siroopje!' : !rj.water && rjSyrup() ? '💧 Nu water erbij!' : !rj.stirred ? '🥄 Goed roeren!' : full ? '🥤 Vol! Opdrinken!' : '🧊 IJsje? 🍋 Schijfje?';
}

function rjPour(color, fromEl) {
    const stream = document.getElementById('rjStream');
    stream.style.background = color;
    stream.classList.remove('go'); void stream.offsetWidth; stream.classList.add('go');
    if (fromEl) { fromEl.classList.remove('pour'); void fromEl.offsetWidth; fromEl.classList.add('pour'); }
}

function rjAddSyrup(f, btn) {
    if (rj.busy) return;
    if (rjTotal() >= RJ_MAX) { rjFull(); return; }
    rj.syr[f.key] = (rj.syr[f.key] || 0) + 1;
    rj.stirred = false;
    rjPour(rgb(f.c), btn);
    for (let i = 0; i < 4; i++) setTimeout(() => playTone(500 - i * 60, 0.07, 0.08, 'sine'), i * 80);
    if (rj.syr[f.key] === 1) speak(f.name);
    setTimeout(rjRender, 250);
}

function rjFull() {
    bounceEl(document.getElementById('rjGlass'), 'nope');
    playTone(220, 0.15, 0.1, 'triangle');
    speak('Het glas is vol!');
}

function rjTool(t, btn) {
    if (rj.busy) return;
    if (t === 'water') {
        if (rjTotal() >= RJ_MAX) { rjFull(); return; }
        rj.water++;
        // Water on top of syrup: needs stirring again
        rj.stirred = !rjSyrup();
        rjPour('rgba(186, 230, 253, 0.9)', null);
        startNoise('shower');
        setTimeout(stopNoise, 450);
        setTimeout(rjRender, 250);
    } else if (t === 'stir') {
        if (!rjTotal()) return;
        rj.busy = true;
        const g = document.getElementById('rjGlass');
        g.classList.remove('stir'); void g.offsetWidth; g.classList.add('stir');
        for (let i = 0; i < 6; i++) setTimeout(() => playTone(2400 + (i % 2) * 400, 0.04, 0.07, 'sine'), i * 150);
        setTimeout(() => {
            rj.stirred = true;
            rj.busy = false;
            rjRender();
            if (rjSyrup() && rj.water) speak(rjName());
        }, 900);
    } else if (t === 'ice') {
        if (rj.ice >= 3 || !rjTotal()) { bounceEl(btn, 'nope'); return; }
        rj.ice++;
        playTone(2600, 0.05, 0.1, 'sine');
        setTimeout(() => playTone(3100, 0.05, 0.08, 'sine'), 90);
        rjRender();
    } else if (t === 'slice') {
        rj.slice = randomPick(RJ_SLICES.filter(s => s !== rj.slice));
        playPop();
        rjRender();
    } else if (t === 'drink') {
        rjDrink();
    } else if (t === 'reset') {
        rjEmpty();
        _playWhoosh();
        rjRender();
    }
}

function rjName() {
    const fl = RJ_FLAVORS.filter(f => rj.syr[f.key]).sort((a, b) => rj.syr[b.key] - rj.syr[a.key]);
    if (fl.length >= 3) return 'Regenboogranja!';
    return fl.map(f => f.name).join('-') + 'ranja';
}

function rjDrink() {
    const n = rjTotal();
    if (!n) { speak('Het glas is nog leeg!'); return; }
    rj.busy = true;
    rjRender();
    const g = document.getElementById('rjGlass');
    g.classList.add('straw');
    const liq = document.getElementById('rjLiquid');
    // Slurp slurp
    for (let i = 0; i < 6; i++) setTimeout(() => playFreqSweep(260 + Math.random() * 60, 160, 0.18, 0.1), 300 + i * 260);
    setTimeout(() => { liq.style.transition = 'height 1.6s linear'; liq.style.height = '0%'; }, 300);
    setTimeout(() => {
        liq.style.transition = '';
        const s = rjSyrup();
        const face = document.getElementById('rjFace');
        let mood, say;
        if (!s) { mood = '😐'; say = 'Gewoon water. Ook lekker!'; }
        else if (!rj.water) { mood = '🤪'; say = 'Bah! Alleen siroop, veel te zoet!'; }
        else if (s > rj.water) { mood = '😝'; say = 'Oei, wel heel zoet! Meer water erbij!'; }
        else if (!rj.stirred) { mood = '🤔'; say = 'Hmm, eerst water, en onderin zoet. Vergeten te roeren!'; }
        else { mood = '😋'; say = `Mmm! Lekkere ${rjName()}`; }
        face.textContent = mood;
        face.classList.remove('show'); void face.offsetWidth; face.classList.add('show');
        if (mood === '😋') {
            playCorrect();
            ovCheer(rjEl, g, Object.keys(rj.syr).length >= 3 ? ['🌈', '✨', '💖'] : ['💖', '✨', '⭐']);
            rj.drunk++;
            document.getElementById('rjCount').textContent = `🥤 ${rj.drunk}`;
        } else {
            playTone(300, 0.2, 0.1, 'triangle');
        }
        speak(say);
        // A little burp after a lovely drink
        if (mood === '😋' && Math.random() < 0.3) setTimeout(() => playFreqSweep(140, 90, 0.35, 0.18), 2200);
        rjEmpty();
        setTimeout(() => {
            g.classList.remove('straw');
            rj.busy = false;
            rjRender();
        }, 1500);
    }, 2000);
}

function rjEmpty() {
    rj.syr = {};
    rj.water = 0;
    rj.stirred = true;
    rj.ice = 0;
    rj.slice = null;
}

const rjBottles = document.getElementById('rjBottles');
RJ_FLAVORS.forEach(f => {
    const b = el(`<button class="rj-bot" style="--c:${rgb(f.c)}" aria-label="${f.name}"><i></i><span>${f.icon}</span></button>`);
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); rjAddSyrup(f, b); });
    rjBottles.appendChild(b);
});
document.querySelectorAll('.rj-tool').forEach(b => b.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    rjTool(b.dataset.t, b);
}));

function openRanja() {
    ranjaOpen = true;
    rjEl.classList.add('open');
    rjEmpty();
    rj.busy = false;
    document.getElementById('rjGlass').classList.remove('straw');
    rjRender();
    speak('Ranja maken! Kies een siroopje.');
}

function closeRanja() {
    ranjaOpen = false;
    stopNoise();
    if (window.speechSynthesis) speechSynthesis.cancel();
    rjEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('rjClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeRanja(); });
rjEl.addEventListener('pointerdown', (e) => e.stopPropagation());
