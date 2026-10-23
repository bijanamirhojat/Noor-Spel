/* 🚨 Knopjeskamer: een groot paneel vol knopjes, schakelaars en lampjes. Na een paar keer drukken (of met de
   grote rode knop) gaat ergens het alarm af en zijn we de brandweer: brand blussen met de brandslang
   (spuit op de vlammen) of een poesje uit de boom redden met de ladder.
   Hoe vaak je hebt geholpen staat in noor-prinses-brandweer. */
const KN_KEY = 'noor-prinses-brandweer';
const KN_BTNS = [
    { c: '#ef4444', f: 523 }, { c: '#f97316', f: 587 }, { c: '#facc15', f: 659 }, { c: '#22c55e', f: 698 },
    { c: '#3b82f6', f: 784 }, { c: '#a855f7', f: 880 }, { c: '#ec4899', f: 988 }, { c: '#14b8a6', f: 1047 },
    { c: '#facc15', f: 392, sq: 1 }, { c: '#3b82f6', f: 440, sq: 1 }, { c: '#22c55e', f: 494, sq: 1 }, { c: '#ef4444', f: 349, sq: 1 }
];
// Flames on the house: % of the stage
const BW_FLAMES = [[61, 44], [75, 44], [61, 66], [75, 66], [68, 18]];
const BW_REACH = 70;          // px around the water where flames go out
const BW_LADDER_STEPS = 5;

let knRescues = { fire: 0, cat: 0 };
try {
    const s = JSON.parse(localStorage.getItem(KN_KEY));
    if (s && typeof s === 'object') knRescues = { fire: +s.fire || 0, cat: +s.cat || 0 };
} catch (e) {}

const kn = { presses: 0, until: 6, alarm: null, siren: 0, next: Math.random() < 0.5 ? 'fire' : 'cat' };

function knSiren() {
    playFreqSweep(660, 880, 0.35, 0.08);
    setTimeout(() => playFreqSweep(880, 660, 0.35, 0.08), 380);
}

function knStartAlarm() {
    if (kn.alarm) return;
    kn.alarm = kn.next;
    kn.next = kn.alarm === 'fire' ? 'cat' : 'fire';
    document.getElementById('knSiren').classList.add('on');
    document.getElementById('knRed').classList.add('alarm');
    knSiren();
    kn.siren = setInterval(knSiren, 1100);
    speak(kn.alarm === 'fire' ? 'Alarm! Alarm! Er is brand! Druk op de rode knop!' : 'Alarm! Een poesje zit vast in de boom! Druk op de rode knop!');
}

function knStopAlarm() {
    clearInterval(kn.siren);
    kn.siren = 0;
    kn.alarm = null;
    const s = document.getElementById('knSiren');
    if (s) s.classList.remove('on');
    const r = document.getElementById('knRed');
    if (r) r.classList.remove('alarm');
}

function knPress(b, i) {
    if (state.busy || overlayOpen()) return;
    const d = KN_BTNS[i];
    b.classList.toggle('lit');
    playTone(d.f, 0.15, 0.1, d.sq ? 'square' : 'triangle');
    kn.presses++;
    if (kn.presses >= kn.until && !kn.alarm) {
        kn.presses = 0;
        kn.until = 5 + Math.floor(Math.random() * 4);
        setTimeout(knStartAlarm, 400);
    }
}

defineRoom({
    key: 'knopjeskamer',
    name: 'Knopjeskamer',
    icon: '🚨',
    say: 'De knopjeskamer! Zoveel knopjes!',
    lampX: 470,
    build(x) {
        const panel = place(el(`<div class="kn-panel">
            <div class="kn-screen"><span>🚒</span><i></i></div>
            <div class="kn-grid">${KN_BTNS.map((b, i) => `<div class="kn-b${b.sq ? ' sq' : ''}" style="--c:${b.c}" data-i="${i}"></div>`).join('')}</div>
            <div class="kn-switches">${[0, 1, 2].map(i => `<div class="kn-sw" data-i="${i}"><i></i></div>`).join('')}</div>
            <div class="kn-dial"><i></i></div>
        </div>`), x + 40, 70);
        panel.querySelectorAll('.kn-b').forEach(b => b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            knPress(b, +b.dataset.i);
        }));
        panel.querySelectorAll('.kn-sw').forEach(s => s.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (state.busy || overlayOpen()) return;
            s.classList.toggle('up');
            playTone(s.classList.contains('up') ? 1200 : 800, 0.05, 0.12, 'square');
            panel.querySelector('.kn-screen').classList.toggle('s' + s.dataset.i);
        }));
        panel.querySelector('.kn-dial').addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (state.busy || overlayOpen()) return;
            const d = panel.querySelector('.kn-dial');
            d.style.setProperty('--a', ((parseFloat(d.style.getPropertyValue('--a')) || 0) + 45) + 'deg');
            playTone(300 + Math.random() * 300, 0.06, 0.1, 'sine');
        });
        place(el('<div class="kn-siren" id="knSiren"><div class="glass"></div><div class="base"></div></div>'), x + 590, 30);
        addObj(`<div class="kn-red" id="knRed"><div class="cap"></div><div class="stand"></div><b>ALARM</b>
            <div class="tap-hint" style="left:50%;top:-40px">👇</div></div>`, x + 540, 196, x + 570, () => {
            if (!kn.alarm) knStartAlarm();
            setTimeout(openBrandweer, 900);
        });
        addObj('<div class="kn-helmets"><div class="hook"></div><span>⛑️</span><span>⛑️</span></div>', x + 520, 120, x + 560, (node) => {
            bounceEl(node, 'wobble');
            speak('Helm op! Wij zijn de brandweer!');
        });
        addObj('<div class="kn-pole"></div>', x + 720, 0, x + 720, (node) => {
            node.classList.remove('slide'); void node.offsetWidth; node.classList.add('slide');
            playFreqSweep(1200, 300, 0.7, 0.08);
        });
    },
    onLeave() { knStopAlarm(); }
});

/* ─────────── Brandweer (overlay) ─────────── */
const bwEl = document.getElementById('bwOv');
const bwStage = document.getElementById('bwStage');
let brandweerOpen = false;
registerOverlay(() => brandweerOpen, closeBrandweer);
const bw = { mission: 'fire', flames: [], spray: null, raf: 0, last: 0, ladder: 0, done: false, busy: false };

function bwPt(px, py) {
    const r = bwStage.getBoundingClientRect();
    return { x: r.width * px / 100, y: r.height * py / 100 };
}
// The nozzle / ladder foot on top of the truck (measured: the emoji's size differs per device)
function bwNozzle() {
    const s = bwStage.getBoundingClientRect();
    const t = document.querySelector('#bwTruck span').getBoundingClientRect();
    return { x: t.left - s.left + t.width * 0.6, y: t.top - s.top + t.height * 0.25 };
}

function bwCountText() {
    document.getElementById('bwCount').textContent = `🔥 ${knRescues.fire}  🐱 ${knRescues.cat}`;
}

function bwStart(mission) {
    bw.mission = mission;
    bw.done = false;
    bw.busy = true;
    bw.ladder = 0;
    bwEl.dataset.m = mission;
    document.getElementById('bwTitle').textContent = mission === 'fire' ? '🚒 Brand blussen!' : '🚒 Poesje redden!';
    document.getElementById('bwAgain').classList.remove('show');
    document.getElementById('bwLadderBtn').classList.toggle('show', mission === 'cat');
    bwRenderFlames(true);
    bwRenderLadder();
    const cat = document.getElementById('bwCat');
    cat.className = 'bw-cat';
    cat.style.transition = 'none';
    const cp = bwPt(70, 26);
    cat.style.left = cp.x + 'px';
    cat.style.top = cp.y + 'px';
    document.getElementById('bwSaved').classList.remove('show');
    // Drive up with the siren on
    const truck = document.getElementById('bwTruck');
    truck.classList.remove('drive'); void truck.offsetWidth; truck.classList.add('drive');
    knSiren();
    setTimeout(knSiren, 800);
    bwHint(mission === 'fire' ? '🚒 Tatuu tatuu! Op weg!' : '🚒 Tatuu tatuu! Op weg!');
    setTimeout(() => {
        if (!brandweerOpen || bw.mission !== mission) return;
        bw.busy = false;
        if (mission === 'fire') {
            bwHint('💦 Spuit water op de vlammen!');
            speak('Spuit water op de vlammen!');
        } else {
            bwHint('🪜 Zet de ladder omhoog!');
            speak('Miauw! Help! Zet de ladder omhoog!');
            playTone(700, 0.2, 0.08, 'sine');
        }
    }, 1700);
}

function bwHint(t) { document.getElementById('bwHint').textContent = t; }

/* Fire */
function bwRenderFlames(reset) {
    const box = document.getElementById('bwFlames');
    if (reset) {
        bw.flames = bw.mission === 'fire' ? BW_FLAMES.map(([px, py]) => ({ px, py, hp: 1 })) : [];
        box.innerHTML = bw.flames.map((f, i) => `<span class="bw-flame" data-i="${i}" style="left:${f.px}%;top:${f.py}%;animation-delay:${-i * 0.23}s">🔥</span>`).join('');
    }
    bw.flames.forEach((f, i) => {
        const n = box.children[i];
        n.style.setProperty('--s', 0.35 + 0.65 * Math.max(0, f.hp));
        if (f.hp <= 0 && !n.classList.contains('out')) {
            n.classList.add('out');
            n.textContent = '💨';
            playFreqSweep(900, 200, 0.3, 0.06);
        }
    });
}

function bwDouse(p, amount) {
    let hit = false;
    bw.flames.forEach(f => {
        if (f.hp <= 0) return;
        const q = bwPt(f.px, f.py);
        if (Math.hypot(q.x + 20 - p.x, q.y + 20 - p.y) < BW_REACH) { f.hp -= amount; hit = true; }
    });
    if (hit) bwRenderFlames(false);
    if (!bw.done && bw.flames.length && bw.flames.every(f => f.hp <= 0)) bwWin();
}

function bwWater(p) {
    const w = document.getElementById('bwWater');
    if (!p) { w.classList.remove('on'); return; }
    const n = bwNozzle();
    w.style.left = n.x + 'px';
    w.style.top = n.y + 'px';
    w.style.width = Math.hypot(p.x - n.x, p.y - n.y) + 'px';
    w.style.transform = `rotate(${Math.atan2(p.y - n.y, p.x - n.x)}rad)`;
    w.classList.add('on');
}

function bwLocal(e) {
    const r = bwStage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function bwSprayFrame(now) {
    if (!bw.spray) { bw.raf = 0; return; }
    const dt = Math.min(0.05, (now - bw.last) / 1000);
    bw.last = now;
    bwDouse(bw.spray, dt * 1.3);
    bw.raf = requestAnimationFrame(bwSprayFrame);
}

bwStage.addEventListener('pointerdown', (e) => {
    if (bw.mission !== 'fire' || bw.busy || bw.done) return;
    bw.spray = bwLocal(e);
    try { bwStage.setPointerCapture(e.pointerId); } catch (err) {}
    bwWater(bw.spray);
    startNoise('shower');
    // A tap alone also helps, for small fingers
    bwDouse(bw.spray, 0.35);
    bw.last = performance.now();
    if (!bw.raf) bw.raf = requestAnimationFrame(bwSprayFrame);
});
bwStage.addEventListener('pointermove', (e) => {
    if (!bw.spray) return;
    bw.spray = bwLocal(e);
    bwWater(bw.spray);
});
function bwStopSpray() {
    if (!bw.spray) return;
    bw.spray = null;
    bwWater(null);
    stopNoise();
}
bwStage.addEventListener('pointerup', bwStopSpray);
bwStage.addEventListener('pointercancel', bwStopSpray);

/* Cat in the tree */
function bwRenderLadder() {
    const l = document.getElementById('bwLadder');
    const n = bwNozzle(), c = bwPt(70, 26);
    const full = Math.hypot(c.x + 10 - n.x, c.y + 50 - n.y);
    l.style.left = n.x + 'px';
    l.style.top = n.y + 'px';
    l.style.width = full * bw.ladder / BW_LADDER_STEPS + 'px';
    l.style.transform = `rotate(${Math.atan2(c.y + 50 - n.y, c.x + 10 - n.x)}rad)`;
    document.getElementById('bwLadderBtn').classList.toggle('next', bw.mission === 'cat' && !bw.busy && bw.ladder < BW_LADDER_STEPS);
    document.getElementById('bwCat').classList.toggle('reach', bw.ladder >= BW_LADDER_STEPS && !bw.done);
}

function bwLadderUp() {
    if (bw.mission !== 'cat' || bw.busy || bw.done || bw.ladder >= BW_LADDER_STEPS) return;
    bw.ladder++;
    playTone(400 + bw.ladder * 80, 0.1, 0.1, 'square');
    bwRenderLadder();
    if (bw.ladder >= BW_LADDER_STEPS) {
        bwHint('🐱 Tik op het poesje!');
        speak('De ladder is er! Tik op het poesje!');
    }
}

function bwRescueCat() {
    if (bw.mission !== 'cat' || bw.busy || bw.done) return;
    if (bw.ladder < BW_LADDER_STEPS) {
        bounceEl(document.getElementById('bwLadderBtn'), 'pulse');
        playTone(700, 0.2, 0.08, 'sine');
        speak('Miauw! Eerst de ladder omhoog!');
        return;
    }
    bw.busy = true;
    const cat = document.getElementById('bwCat');
    const n = bwNozzle();
    cat.classList.remove('reach');
    cat.classList.add('ride');
    cat.style.transition = 'left 1.4s ease-in-out, top 1.4s ease-in-out';
    cat.style.left = n.x - 10 + 'px';
    cat.style.top = n.y - 40 + 'px';
    playFreqSweep(900, 400, 1.2, 0.06);
    setTimeout(() => {
        cat.classList.add('gone');
        bw.ladder = 0;
        bwRenderLadder();
        document.getElementById('bwSaved').classList.add('show');
        bw.busy = false;
        bwWin();
    }, 1500);
}
document.getElementById('bwCat').addEventListener('pointerdown', (e) => { e.stopPropagation(); bwRescueCat(); });
document.getElementById('bwLadderBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); bwLadderUp(); });

function bwWin() {
    bw.done = true;
    bwStopSpray();
    knRescues[bw.mission]++;
    try { localStorage.setItem(KN_KEY, JSON.stringify(knRescues)); } catch (e) {}
    bwCountText();
    playWin();
    ovCheer(bwEl, bwStage, bw.mission === 'fire' ? ['💦', '⭐', '💖', '🎉'] : ['🐱', '💖', '⭐', '🎉']);
    const say = bw.mission === 'fire' ? 'Het vuur is uit! Goed geblust, brandweer!' : 'Miauw! Dankjewel brandweer! Het poesje is gered!';
    bwHint(bw.mission === 'fire' ? '🎉 Het vuur is uit!' : '🎉 Het poesje is gered!');
    speak(say);
    document.getElementById('bwLadderBtn').classList.remove('show');
    document.getElementById('bwAgain').classList.add('show');
}
document.getElementById('bwAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (bw.busy) return;
    bwStart(bw.mission === 'fire' ? 'cat' : 'fire');
});

function openBrandweer() {
    if (brandweerOpen) return;
    const mission = kn.alarm || kn.next;
    knStopAlarm();
    brandweerOpen = true;
    bwEl.classList.add('open');
    bwCountText();
    bwStart(mission);
}

function closeBrandweer() {
    brandweerOpen = false;
    bwStopSpray();
    if (window.speechSynthesis) speechSynthesis.cancel();
    bwEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('bwClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeBrandweer(); });
bwEl.addEventListener('pointerdown', (e) => e.stopPropagation());
