/* 🫧 Wasruimte: de vieze was in de wasmachine stoppen, zeep erin, wassen (trommel draait, schuim), alles ophangen
   aan de waslijn tot de zon het droog heeft, en dan de sokken bij elkaar zoeken (tik er twee die hetzelfde zijn).
   Aantal wasjes in noor-prinses-was. */
const WS_KEY = 'noor-prinses-was';
const WS_CLOTHES = ['👕', '👗', '👖', '🩳', '👚', '🩱', '🧣', '🧸'];
const WS_SOCKS = [
    { c: '#f472b6', p: 'stripes' }, { c: '#60a5fa', p: 'dots' }, { c: '#facc15', p: 'plain' }, { c: '#4ade80', p: 'stripes' },
    { c: '#a78bfa', p: 'hearts' }, { c: '#fb923c', p: 'dots' }, { c: '#f472b6', p: 'hearts' }, { c: '#60a5fa', p: 'plain' }
];
const WS_STEPS = [['vullen', '🧺'], ['zeep', '🧴'], ['wassen', '🫧'], ['ophangen', '☀️'], ['sokken', '🧦']];
const wsOv = document.getElementById('wsOv');
const ws = { step: 'vullen', items: [], socks: [], sel: null, washes: 0, busy: false, round: 0 };
let wsOpen = false;
registerOverlay(() => wsOpen, closeWasruimte);
try { ws.washes = +localStorage.getItem(WS_KEY) || 0; } catch { /* geen opslag */ }

defineRoom({
    key: 'wasruimte',
    name: 'Wasruimte',
    icon: '🫧',
    say: 'De wasruimte',
    build(x) {
        place(el(`<div class="ws-line"><div class="rope"></div>${['👕', '🧦', '👗', '🧦', '👚'].map((e, i) =>
            `<span class="hang" style="left:${30 + i * 64}px;animation-delay:${-i * 0.4}s">${e}</span>`).join('')}</div>`), x + 360, 70);
        addObj(`<div class="ws-machine"><div class="top"><i></i><i></i><b></b></div><div class="door"><div class="drum">🫧</div></div>
            <div class="tap-hint" style="left:60px;top:-50px">👇</div></div>`, x + 120, 190, x + 230, openWasruimte);
        addObj('<div class="ws-basket">🧺</div>', x + 290, 330, x + 320, (node) => {
            bounceEl(node, 'wobble');
            playFreqSweep(300, 200, 0.2, 0.1);
        });
        addObj('<div class="ws-soap">🧴</div>', x + 470, 300, x + 500, (node) => {
            bounceEl(node, 'jump');
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top);
            for (let i = 0; i < 16; i++) setTimeout(() => spawnSparkle(p.x, p.y, { vy: -80 - Math.random() * 40, vx: (Math.random() - 0.5) * 60, g: -10, hue: 190 + Math.random() * 40, size: 6 + Math.random() * 6, max: 1.6 }), i * 40);
            playFreqSweep(900, 1400, 0.15, 0.06);
        });
        addObj('<div class="ws-wind">🌬️</div>', x + 640, 160, x + 660, () => {
            document.querySelectorAll('.ws-line .hang').forEach(h => zooAnim(h, 'flap'));
            startNoise('dryer');
            setTimeout(stopNoise, 900);
        });
    }
});

/* ─────────── Wassen (overlay) ─────────── */
function wsSockSVG(s) {
    const pat = s.p === 'stripes' ? '<path d="M14 24 H40 M14 34 H40 M14 44 H40" stroke="#fff" stroke-width="4"/>'
        : s.p === 'dots' ? '<circle cx="21" cy="24" r="3" fill="#fff"/><circle cx="33" cy="32" r="3" fill="#fff"/><circle cx="22" cy="42" r="3" fill="#fff"/><circle cx="34" cy="50" r="2.5" fill="#fff"/>'
            : s.p === 'hearts' ? '<path d="M27 30 C22 24 15 30 27 40 C39 30 32 24 27 30 Z" fill="#fff"/>' : '';
    return `<svg viewBox="0 0 60 80"><path d="M14 4 H40 V48 Q40 54 46 56 L52 60 Q58 66 52 72 Q48 76 40 74 L18 66 Q10 62 12 54 L14 48 Z" fill="${s.c}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
        ${pat}<rect x="12" y="2" width="30" height="8" rx="3" fill="#fff" opacity=".7"/></svg>`;
}

function wsNewRound() {
    ws.round++;
    ws.busy = false;
    ws.step = 'vullen';
    ws.sel = null;
    // Some clothes and three pairs of socks, all dirty
    const pairs = WS_SOCKS.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    ws.socks = [...pairs, ...pairs].map((s, i) => ({ ...s, pair: i % 3, done: false })).sort(() => Math.random() - 0.5);
    ws.items = WS_CLOTHES.slice().sort(() => Math.random() - 0.5).slice(0, 4).map(e => ({ e, where: 'pile' }))
        .concat(pairs.map(s => ({ sock: s, where: 'pile' })));
    const m = document.getElementById('wsMachine');
    m.className = 'ws-big';
    document.getElementById('wsSun').classList.remove('on');
    wsRender();
}

function wsItemHTML(it) {
    return it.sock ? `<span class="ws-sock">${wsSockSVG(it.sock)}</span>` : it.e;
}

function wsRender() {
    const at = WS_STEPS.findIndex(s => s[0] === ws.step);
    document.getElementById('wsSteps').innerHTML = WS_STEPS.map(([k, e], i) =>
        `<span class="${i < at ? 'done' : i === at ? 'now' : ''}">${i < at ? '✅' : e}</span>`).join('');
    const pile = document.getElementById('wsPile');
    pile.className = 'ws-pile' + (ws.step === 'ophangen' ? ' clean' : '');
    pile.innerHTML = ws.items.map((it, i) => (it.where === 'pile' || it.where === 'clean')
        ? `<button class="ws-item${it.where === 'pile' ? ' dirty' : ''}" data-i="${i}">${wsItemHTML(it)}</button>` : '').join('');
    document.getElementById('wsDrum').innerHTML = ws.items.filter(it => it.where === 'drum')
        .map((it, i) => `<span style="--a:${i * 52}deg">${wsItemHTML(it)}</span>`).join('');
    document.getElementById('wsHung').innerHTML = ws.items.filter(it => it.where === 'line')
        .map((it, i) => `<span class="ws-peg" style="animation-delay:${-i * 0.3}s">${wsItemHTML(it)}</span>`).join('');
    const table = document.getElementById('wsTable');
    table.style.display = ws.step === 'sokken' ? '' : 'none';
    table.innerHTML = ws.socks.map((s, i) => `<button class="ws-loose${s.done ? ' done' : ''}${ws.sel === i ? ' sel' : ''}" data-s="${i}">${wsSockSVG(s)}</button>`).join('');
    let tray = '';
    if (ws.step === 'zeep') tray = '<button class="bd-btn ws-btn" data-a="soap">🧴</button>';
    else if (ws.step === 'wassen') tray = '<button class="bd-btn ws-btn ws-go" data-a="wash">▶️</button>';
    document.getElementById('wsTray').innerHTML = tray;
    wsOv.querySelectorAll('.ws-item').forEach(b => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); wsTapItem(+b.dataset.i, b); }));
    wsOv.querySelectorAll('.ws-loose').forEach(b => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); wsTapSock(+b.dataset.s, b); }));
    wsOv.querySelectorAll('.ws-btn').forEach(b => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); wsAction(b.dataset.a); }));
}

function wsNext(step) {
    ws.step = step;
    playCorrect();
    wsRender();
}

function wsTapItem(i, node) {
    if (ws.busy) return;
    const it = ws.items[i];
    if (ws.step === 'vullen' && it.where === 'pile') {
        it.where = 'flying';
        node.style.visibility = 'hidden';
        playFreqSweep(500, 900, 0.12, 0.1);
        ovFly(wsOv, node, document.getElementById('wsDrum'), wsItemHTML(it), 450).then(() => {
            it.where = 'drum';
            wsRender();
            if (ws.items.every(x => x.where === 'drum')) setTimeout(() => wsNext('zeep'), 300);
        });
    } else if (ws.step === 'ophangen' && it.where === 'clean') {
        it.where = 'flying';
        node.style.visibility = 'hidden';
        playFreqSweep(700, 1100, 0.12, 0.1);
        ovFly(wsOv, node, document.getElementById('wsHung'), wsItemHTML(it), 450).then(() => {
            it.where = 'line';
            playTone(1200, 0.05, 0.08, 'square');
            wsRender();
            if (ws.items.every(x => x.where === 'line')) wsDry();
        });
    }
}

function wsAction(a) {
    if (ws.busy) return;
    const m = document.getElementById('wsMachine');
    if (a === 'soap' && ws.step === 'zeep') {
        ws.busy = true;
        ovFly(wsOv, document.querySelector('.ws-btn'), m, '💧', 500).then(() => {
            ws.busy = false;
            zooAnim(m, 'v-jump');
            playFreqSweep(900, 400, 0.3, 0.1);
            wsNext('wassen');
        });
    } else if (a === 'wash' && ws.step === 'wassen') {
        ws.busy = true;
        const round = ws.round;
        m.classList.add('closed');
        playTone(400, 0.08, 0.1, 'square');
        setTimeout(() => {
            if (round !== ws.round) return;
            m.classList.add('spin');
            startNoise('shower');
        }, 400);
        setTimeout(() => { if (round === ws.round) m.classList.add('fast'); }, 2600);
        setTimeout(() => {
            stopNoise();
            if (round !== ws.round) return;
            m.classList.remove('spin', 'fast', 'closed');
            [1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.1, 'sine'), i * 160));
            ws.items.forEach(it => { it.where = 'clean'; });
            ws.busy = false;
            ovCheer(wsOv, m, ['🫧', '✨']);
            wsNext('ophangen');
        }, 4600);
    }
}

// The sun dries everything, then the socks are all mixed up on the table
function wsDry() {
    ws.busy = true;
    const round = ws.round;
    document.getElementById('wsSun').classList.add('on');
    playSparkleSound();
    setTimeout(() => {
        if (round !== ws.round) return;
        ws.busy = false;
        ws.items = ws.items.filter(it => !it.sock);
        wsNext('sokken');
    }, 2000);
}

function wsTapSock(i, node) {
    if (ws.busy || ws.socks[i].done) return;
    if (ws.sel === null || ws.sel === i) {
        ws.sel = ws.sel === i ? null : i;
        playPop();
        wsRender();
        return;
    }
    const a = ws.socks[ws.sel], b = ws.socks[i];
    if (a.pair !== b.pair) {
        bounceEl(node, 'nope');
        playTone(262, 0.15, 0.1, 'triangle');
        return;
    }
    a.done = b.done = true;
    ws.sel = null;
    playFreqSweep(500, 1200, 0.2, 0.1);
    ovCheer(wsOv, node, ['🧦', '💖']);
    wsRender();
    if (ws.socks.every(s => s.done)) {
        ws.busy = true;
        ws.washes++;
        try { localStorage.setItem(WS_KEY, ws.washes); } catch { /* geen opslag */ }
        const round = ws.round;
        setTimeout(() => {
            if (round !== ws.round) return;
            playWin();
            showToast(`🫧 Alles schoon! (${ws.washes}x gewassen)`, 1800);
        }, 400);
        setTimeout(() => { if (round === ws.round && wsOpen) wsNewRound(); }, 3000);
    }
}

document.getElementById('wsMachine').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (ws.step === 'zeep') wsAction('soap');
    else if (ws.step === 'wassen') wsAction('wash');
});

function openWasruimte() {
    wsOpen = true;
    wsOv.classList.add('open');
    wsNewRound();
    playMusicBox();
}

function closeWasruimte() {
    wsOpen = false;
    ws.round++;
    stopNoise();
    wsOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('wsClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeWasruimte(); });
wsOv.addEventListener('pointerdown', (e) => e.stopPropagation());
