/* 🏴‍☠️ Piratenbaai: de laatste plek buiten, achter het meer; alleen met het bootje te bereiken.
   Een piratenschip met een papegaai en een (confetti-)kanon, meeuwen en een schateilandje.
   Avontuur op het schip (overlay, vier stappen):
   1. verrekijker: sleep heen en weer tot het schateiland in de lens staat;
   2. varen naar het eiland;
   3. schatkaart: tik de voetstapjes één voor één tot aan de X;
   4. graven: tik op de X tot de kist tevoorschijn komt en maak hem open.
   De schat (munten) wordt bewaard in PIRATE_KEY. */
const PIRATE_KEY = 'noor-prinses-piratenschat';
const PIRATE_DIG = 5;
const PIRATE_STEPS = [[14, 78], [26, 64], [40, 70], [52, 54], [64, 62], [76, 46]];   // footprints on the map (%)
let pirateCoins = 0;
try { pirateCoins = Math.max(0, parseInt(localStorage.getItem(PIRATE_KEY), 10) || 0); } catch (e) {}

function ahoy() {
    [392, 523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.18, 0.09, 'square'), i * 110));
}
function squawk() {
    playFreqSweep(1400, 2200, 0.12, 0.1);
    setTimeout(() => playFreqSweep(2200, 1200, 0.18, 0.1), 130);
}

// Built from buildOutside, at o6 (the last room, all water)
function buildPirateBay(o6) {
    place(el('<div class="pb-gull">🕊️</div>'), o6 + 120, 30);
    place(el('<div class="pb-gull" style="animation-delay:-3s">🕊️</div>'), o6 + 520, -20);
    addObj(`<div class="pb-ship">
        <div class="mast m1"></div><div class="mast m2"></div>
        <div class="sail s1"><span>🏴‍☠️</span></div><div class="sail s2"></div>
        <span class="flag">🏴‍☠️</span>
        <div class="hull"><i></i><i></i><i></i></div>
        <div class="tap-hint" style="left:170px;top:-10px">👇</div>
    </div>`, o6 + 210, 60, o6 + 200, (node) => {
        if (!state.boating) { pirateNeedBoat(); return; }
        openPirate();
    });
    addObj('<div class="pb-parrot">🦜</div>', o6 + 330, 0, o6 + 200, () => {
        squawk();
        showToast('🦜 Ahoy, prinses! Kom aan boord!', 1800);
    });
    addObj('<div class="pb-cannon"><div class="barrel"></div><div class="wheel"></div></div>', o6 + 560, 300, o6 + 560, (node) => {
        if (!state.boating) { pirateNeedBoat(); return; }
        zooAnim(node, 'boom');
        playTone(90, 0.3, 0.2, 'triangle');
        const r = node.getBoundingClientRect();
        const p = screenToWorld(r.left + r.width, r.top);
        for (let i = 0; i < 50; i++) spawnSparkle(p.x, p.y, { vx: 120 + Math.random() * 260, vy: -220 - Math.random() * 180, g: 300, size: 5 + Math.random() * 6, max: 1.6 });
    });
    addObj('<div class="pb-isle"><div class="sand"></div><span class="palm">🌴</span><b>❌</b></div>', o6 + 640, 260, o6 + 640, () => {
        showToast('🔭 Kijk met de verrekijker op het piratenschip!', 2000);
    });
}

// You can only get here by boat: point at the boat
function pirateNeedBoat() {
    const hit = document.querySelector('.boat-hit');
    if (hit) { hit.classList.remove('tap'); void hit.offsetWidth; hit.classList.add('tap'); }
    splash(BOAT_HOME, 440);
    showToast('⛵ Vaar erheen met je bootje!', 1800);
}

/* ─────────── Piratenavontuur (overlay) ─────────── */
const pvEl = document.getElementById('pirateOv');
const pvPano = document.getElementById('pvPano');
let pirateOpen = false;
const pv = { phase: 'kijk', pan: 0, drag: null, isle: 0, found: false, step: 0, dig: 0 };

function pvPhase(ph, title, hint) {
    pv.phase = ph;
    pvEl.dataset.phase = ph;
    document.getElementById('pvTitle').textContent = title;
    document.getElementById('pvHint').textContent = hint;
}
function pvCoins() { document.getElementById('pvCoins').textContent = `🪙 ${pirateCoins}`; }

/* 1. Verrekijker */
function pvLook() {
    pv.found = false;
    pv.pan = 0;
    // The island hides somewhere to the left or right; other things to see on the way
    pv.isle = randomPick([20, 26, 74, 80]);
    const deco = [['🐳', 35, 62], ['🧜‍♀️', 62, 70], ['🐬', 48, 58], ['⛵', 26, 52], ['🐙', 70, 74], ['🦈', 8, 66]];
    pvPano.innerHTML = `<div class="pv-sea"></div>${deco.filter(d => Math.abs(d[1] - pv.isle) > 8).map(([e, x, y]) => `<span class="pv-deco" style="left:${x}%;top:${y}%">${e}</span>`).join('')}
        <div class="pv-isle" style="left:${pv.isle}%"><div class="sand"></div><span class="palm">🌴</span><b>❌</b></div>`;
    pvSetPan(0);
    pvPhase('kijk', '🔭 Zoek het schateiland!', '👆 Sleep heen en weer met de verrekijker');
}

function pvSetPan(x) {
    // Panorama is 300% wide; pan from -1 (left edge) to 1 (right edge)
    pv.pan = Math.max(-1, Math.min(1, x));
    pvPano.style.transform = `translateX(${-33.333 - pv.pan * 33.333}%)`;
    // Which part of the panorama (in %) is in the middle of the lens?
    const mid = 50 + pv.pan * 33.333;
    if (!pv.found && Math.abs(mid - pv.isle) < 5) {
        pv.found = true;
        playWin();
        document.getElementById('pvHint').textContent = '🏝️ Land in zicht! Daar is het schateiland!';
        ovCheer(pvEl, document.getElementById('pvLens'), ['🏝️', '⭐', '✨']);
        setTimeout(() => { if (pirateOpen) pvSail(); }, 1600);
    }
}

const pvView = document.getElementById('pvView');
pvView.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (pv.phase !== 'kijk' || pv.found) return;
    pv.drag = { x: e.clientX, pan: pv.pan, w: pvView.clientWidth };
    try { pvView.setPointerCapture(e.pointerId); } catch (err) {}
});
pvView.addEventListener('pointermove', (e) => {
    if (!pv.drag || pv.found) return;
    // Drag left to look right (like moving a scene under the glass)
    pvSetPan(pv.drag.pan - (e.clientX - pv.drag.x) / pv.drag.w * 1.4);
});
const pvUp = () => { pv.drag = null; };
pvView.addEventListener('pointerup', pvUp);
pvView.addEventListener('pointercancel', pvUp);

/* 2. Varen */
function pvSail() {
    pvPhase('vaar', '⛵ Op naar het schateiland!', 'Hijs de zeilen… 🌊');
    const ship = document.getElementById('pvSailShip');
    zooAnim(ship, 'go');
    startNoise('shower');
    ahoy();
    setTimeout(stopNoise, 2200);
    setTimeout(() => { if (pirateOpen) pvMap(); }, 2600);
}

/* 3. Schatkaart */
function pvMap() {
    pv.step = 0;
    const map = document.getElementById('pvMap');
    map.innerHTML = `<svg class="path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${PIRATE_STEPS.map(([x, y]) => `${x},${y}`).join(' ')} 88,30" /></svg>
        <span class="pv-start">⛵</span>
        ${PIRATE_STEPS.map(([x, y], i) => `<button class="pv-step${i === 0 ? ' next' : ''}" data-i="${i}" style="left:${x}%;top:${y}%"></button>`).join('')}
        <button class="pv-x" style="left:88%;top:30%">❌</button>
        <span class="pv-palm" style="left:30%;top:28%">🌴</span><span class="pv-palm" style="left:62%;top:22%">🌴</span><span class="pv-palm" style="left:44%;top:86%">🪨</span>`;
    map.querySelectorAll('.pv-step').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const i = +b.dataset.i;
        if (i !== pv.step) { zooAnim(map.querySelector('.pv-step.next'), 'v-pulse'); return; }
        b.classList.remove('next');
        b.classList.add('done');
        b.textContent = '👣';
        playTone(523 + i * 80, 0.12, 0.08, 'triangle');
        pv.step++;
        const nx = map.querySelector(`.pv-step[data-i="${pv.step}"]`);
        if (nx) nx.classList.add('next');
        else map.querySelector('.pv-x').classList.add('next');
    }));
    map.querySelector('.pv-x').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (pv.step < PIRATE_STEPS.length) { zooAnim(map.querySelector('.pv-step.next'), 'v-pulse'); return; }
        playCorrect();
        pvDig();
    });
    pvPhase('kaart', '🗺️ De schatkaart', '👣 Volg de voetstapjes naar de ❌');
}

/* 4. Graven */
function pvDig() {
    pv.dig = 0;
    const d = document.getElementById('pvDig');
    d.className = 'pv-box pv-dig';
    d.innerHTML = `<div class="sand"></div><div class="hole"></div><button class="pv-spot">❌</button><span class="pv-shovel">🪏</span>
        <button class="pv-chest"><div class="lid"></div><div class="box"></div><div class="gold"></div></button>`;
    d.querySelector('.pv-spot').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (pv.dig >= PIRATE_DIG) return;
        pv.dig++;
        d.style.setProperty('--dig', pv.dig / PIRATE_DIG);
        zooAnim(d.querySelector('.pv-shovel'), 'dig');
        playFreqSweep(300, 120, 0.15, 0.12);
        ovCheer(pvEl, d.querySelector('.pv-spot'), ['🟫', '🟨', '💨']);
        if (pv.dig >= PIRATE_DIG) {
            d.classList.add('found');
            playWin();
            document.getElementById('pvHint').textContent = '🎉 Een schatkist! Maak hem open!';
        }
    });
    d.querySelector('.pv-chest').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (!d.classList.contains('found') || d.classList.contains('open')) return;
        d.classList.add('open');
        ahoy();
        const chest = d.querySelector('.pv-chest');
        const target = document.getElementById('pvCoins');
        ['🪙', '💎', '🪙', '👑', '🪙', '💍', '🪙', '⭐'].forEach((t, i) => setTimeout(() => {
            ovFly(pvEl, chest, target, t, 650).then(() => {
                pirateCoins++;
                try { localStorage.setItem(PIRATE_KEY, String(pirateCoins)); } catch (err) {}
                pvCoins();
                bounceEl(target, 'jump');
                playTone(1200 + (i % 4) * 150, 0.08, 0.06, 'sine');
            });
        }, i * 140));
        ovCheer(pvEl, chest, ['🪙', '💎', '✨', '🏴‍☠️']);
        setTimeout(() => {
            document.getElementById('pvHint').textContent = 'Je hebt de schat gevonden! 🏴‍☠️';
            document.getElementById('pvAgain').classList.add('show');
        }, 1600);
    });
    pvPhase('graaf', '🪏 Graaf de schat op!', 'Tik op de ❌ om te graven');
}

document.getElementById('pvAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.currentTarget.classList.remove('show');
    playPop();
    pvLook();
});

function openPirate() {
    pirateOpen = true;
    pvEl.classList.add('open');
    document.getElementById('pvAgain').classList.remove('show');
    pvCoins();
    pvLook();
    ahoy();
}

function closePirate() {
    pirateOpen = false;
    pv.drag = null;
    stopNoise();
    pvEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('pirateClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closePirate(); });
pvEl.addEventListener('pointerdown', (e) => e.stopPropagation());
