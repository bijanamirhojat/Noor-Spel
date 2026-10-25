/* 🥪 Broodjeskamer: kies een boterham, smeer er iets op met je vinger (boter, pindakaas, choco of jam),
   pak beleg uit de koelkast, hagelslag erop en eet hem hap voor hap op. Daarna gaat het vieze bord in de
   vaatwasser: deur open, bord erin, deur dicht, aan, programma kiezen, start. Na het piepen is het bord
   weer schoon. Aantal opgegeten broodjes in noor-prinses-broodjes. */
const BR_KEY = 'noor-prinses-broodjes';
const BR_BREADS = [
    { k: 'wit', name: 'wit brood', crust: '#d97706', crumb: '#fef3c7' },
    { k: 'bruin', name: 'bruin brood', crust: '#78350f', crumb: '#d6a46a' },
    { k: 'krenten', name: 'krentenbrood', crust: '#b45309', crumb: '#fde68a', dots: true }
];
const BR_SPREADS = [
    { k: 'boter', name: 'boter', icon: '🧈', c: '#fde68a' },
    { k: 'pindakaas', name: 'pindakaas', icon: '🥜', c: '#c2853d' },
    { k: 'choco', name: 'chocopasta', icon: '🍫', c: '#6b3a1e' },
    { k: 'jam', name: 'aardbeienjam', icon: '🍓', c: '#dc2626' }
];
const BR_TOPS = [
    { k: 'kaas', name: 'kaas', icon: '🧀' }, { k: 'ham', name: 'ham', icon: '🥓' }, { k: 'ei', name: 'een eitje', icon: '🥚' },
    { k: 'komkommer', name: 'komkommer', icon: '🥒' }, { k: 'tomaat', name: 'tomaat', icon: '🍅' }, { k: 'sla', name: 'sla', icon: '🥬' },
    { k: 'aardbei', name: 'aardbei', icon: '🍓' }, { k: 'banaan', name: 'banaan', icon: '🍌' }, { k: 'avocado', name: 'avocado', icon: '🥑' }
];
// Where toppings land on the bread (in % of the crumb), in this order
const BR_SLOTS = [[50, 48], [28, 28], [72, 30], [30, 72], [70, 72], [50, 20], [24, 50], [76, 52], [50, 78]];
// Bite marks (centre in % of the bread); after the last one the bread is gone
const BR_BITES = [[100, 22], [0, 34], [52, -6], [98, 76], [2, 84], [48, 106], [74, 46], [26, 46]];
const BR_GRID = 6;
const BR_PROGS = [
    { k: 'heet', icon: '🔥', say: 'Heet programma!', s: 8 },
    { k: 'normaal', icon: '💧', say: 'Normaal programma!', s: 7 },
    { k: 'snel', icon: '⚡', say: 'Snel programma!', s: 4 }
];

defineRoom({
    key: 'broodjeskamer',
    name: 'Broodjeskamer',
    icon: '🥪',
    say: 'De broodjeskamer! Zullen we een broodje maken?',
    build(x) {
        addObj('<div class="frame" style="font-size:56px">🥪</div>', x + 60, 90, x + 100, () => sayRandom(['Een lekker broodje!', 'Mmm, broodjes!']));
        addObj(`<div class="br-kitchen">
            <div class="fridge"><i></i><i></i><span>🦄</span></div>
            <div class="counter"><div class="plate"><b></b></div></div>
            <div class="dw"><div class="panel"><i></i><i></i><i></i></div><div class="door"></div></div>
            <div class="tap-hint" style="left:170px;top:-40px">👇</div>
        </div>`, x + 230, 150, x + 380, openSandwich);
        addObj('<div class="br-bin"><div class="lid"></div><div class="box">BROOD</div></div>', x + 640, 300, x + 680, (node) => {
            bounceEl(node, 'wobble');
            playFreqSweep(400, 700, 0.2, 0.08);
            sayRandom(['De broodtrommel! Vers brood!', 'Ruik eens, vers brood!']);
        });
    }
});

/* ─────────── Broodje maken (overlay) ─────────── */
const brEl = document.getElementById('brOv');
let brOpen = false;
registerOverlay(() => brOpen, closeSandwich);
const br = {
    bread: null, spread: null, cells: new Set(), spreadDone: false, tops: [], sprinkles: false,
    eating: false, bites: 0, plate: 'counter', dirty: false, fridge: false,
    dwOpen: false, power: false, prog: null, running: false, clean: false, timers: [], made: 0
};
try { br.made = Math.max(0, parseInt(localStorage.getItem(BR_KEY), 10) || 0); } catch (e) {}

const $br = (id) => document.getElementById(id);
function brLater(fn, ms) { br.timers.push(setTimeout(fn, ms)); }

// What to do next: [the data-n of the thing that pulses, the hint]
function brNext() {
    if (br.running) return [null, '🫧 De vaatwasser wast je bord...'];
    if (br.plate === 'dw') {
        if (br.clean) return br.dwOpen ? ['rack', '✨ Pak je schone bord'] : ['dwdoor', '🚪 Klaar! Doe de vaatwasser open'];
        if (br.dwOpen) return ['dwdoor', '🚪 Doe de vaatwasser dicht'];
        if (!br.power) return ['power', '⏻ Zet de vaatwasser aan'];
        if (!br.prog) return ['prog', '👆 Kies een programma'];
        return ['start', '▶️ Druk op start'];
    }
    if (br.dirty) return br.dwOpen ? ['plate', '🍽️ Zet je bord in de vaatwasser'] : ['dwdoor', '🍽️ Doe de vaatwasser open'];
    if (!br.bread) return ['bread', '🍞 Kies een boterham'];
    if (br.eating) return ['eat', '😋 Tik op je broodje: hap!'];
    if (br.spread && !br.spreadDone) return ['smear', '👆 Smeer met je vinger over je boterham'];
    if (!br.spreadDone && !br.tops.length) return ['jar', '🧈 Wat wil je erop smeren?'];
    if (!br.tops.length && !br.sprinkles) return br.fridge ? ['top', '🧀 Wat wil je erop?'] : ['fridge', '🧊 Pak beleg uit de koelkast'];
    return ['done', '😋 Klaar? Opeten maar!'];
}

function brRender() {
    const [n, hint] = brNext();
    $br('brHint').textContent = hint;
    brEl.querySelectorAll('[data-n]').forEach(b => b.classList.toggle('next', b.dataset.n === n));
    $br('brBreads').classList.toggle('show', !br.bread && !br.dirty && br.plate === 'counter');
    $br('brDone').classList.toggle('show', !!br.bread && !br.eating && (br.spreadDone || br.tops.length > 0 || br.sprinkles));
    $br('brFridge').classList.toggle('open', br.fridge);
    // The bread
    const bread = $br('brBread');
    const b = BR_BREADS.find(x => x.k === br.bread);
    bread.classList.toggle('show', !!b);
    if (b) {
        bread.style.setProperty('--crust', b.crust);
        bread.style.setProperty('--crumb', b.crumb);
        bread.classList.toggle('dots', !!b.dots);
    }
    bread.classList.toggle('smearing', !!br.spread && !br.spreadDone);
    bread.classList.toggle('sprinkles', br.sprinkles);
    const plate = $br('brPlate');
    plate.classList.toggle('dirty', br.dirty);
    plate.classList.toggle('away', br.plate !== 'counter');
    plate.style.setProperty('--sp', (BR_SPREADS.find(s => s.k === br.spread) || BR_SPREADS[0]).c);
    brEl.querySelectorAll('.br-jar').forEach(j => j.classList.toggle('sel', j.dataset.k === br.spread));
    // The dishwasher
    const dw = $br('brDw');
    dw.classList.toggle('open', br.dwOpen);
    dw.classList.toggle('on', br.power);
    dw.classList.toggle('run', br.running);
    const rp = $br('brRackPlate');
    rp.classList.toggle('show', br.plate === 'dw');
    rp.classList.toggle('clean', br.clean);
    brEl.querySelectorAll('.br-prog').forEach(p => p.classList.toggle('sel', p.dataset.k === br.prog));
    if (!br.running) $br('brDisplay').textContent = !br.power ? '' : br.clean ? '✨ Klaar' : br.prog ? '▶️ Start' : '👆 Kies';
    $br('brCount').textContent = `🥪 ${br.made}`;
}

function brNope(node, say) {
    bounceEl(node, 'nope');
    playTone(260, 0.12, 0.08, 'triangle');
    const [n] = brNext();
    const next = n && brEl.querySelector(`[data-n="${n}"]`);
    if (next) bounceEl(next, 'pulse');
    if (say) { if (window.speechSynthesis) speechSynthesis.cancel(); speak(say); }
}

function brBusy() { return br.eating || br.dirty || br.plate !== 'counter'; }

function brPickBread(b, btn) {
    if (br.bread || brBusy()) return;
    br.bread = b.k;
    br.spread = null;
    br.cells.clear();
    br.spreadDone = false;
    br.tops = [];
    br.sprinkles = false;
    br.bites = 0;
    $br('brTops').innerHTML = '';
    $br('brBites').innerHTML = '';
    brBuildCells();
    $br('brBread').classList.remove('gone');
    ovFly(brEl, btn, $br('brPlate'), '🍞', 400).then(() => {
        if (!brOpen) return;
        playFreqSweep(300, 500, 0.15, 0.1);
        brRender();
    });
    speak(`${b.name}! Wat wil je erop smeren?`);
}

/* ── Smeren ── */
function brBuildCells() {
    const sp = $br('brSpread');
    sp.innerHTML = '';
    for (let i = 0; i < BR_GRID * BR_GRID; i++) {
        const c = document.createElement('i');
        c.style.left = ((i % BR_GRID) + 0.5) / BR_GRID * 100 + '%';
        c.style.top = (Math.floor(i / BR_GRID) + 0.5) / BR_GRID * 100 + '%';
        c.style.setProperty('--r', (i * 67) % 90 + 'deg');
        sp.appendChild(c);
    }
}

function brPickSpread(s, btn) {
    if (!br.bread || brBusy()) { brNope(btn, br.dirty ? 'Eerst het bord in de vaatwasser!' : 'Pak eerst een boterham!'); return; }
    if (br.spreadDone) { brNope(btn, 'Er zit al ' + (BR_SPREADS.find(x => x.k === br.spread) || s).name + ' op!'); return; }
    br.spread = s.k;
    br.cells.clear();
    $br('brSpread').querySelectorAll('i').forEach(c => c.classList.remove('on'));
    playTone(700, 0.08, 0.08, 'sine');
    speak(`${s.name}! Smeer maar met je vinger.`);
    brRender();
    dragHint($br('brBread'), { dx: 120, delay: 2500 });
}

// Fast swipes give few move events, so smear along the whole line since the last point
function brSmearAt(e, first) {
    const crumb = $br('brCrumb');
    const r = crumb.getBoundingClientRect();
    const knife = $br('brKnife');
    const o = brEl.getBoundingClientRect();
    knife.style.left = (e.clientX - o.left) + 'px';
    knife.style.top = (e.clientY - o.top) + 'px';
    const gx = (e.clientX - r.left) / r.width * BR_GRID - 0.5;
    const gy = (e.clientY - r.top) / r.height * BR_GRID - 0.5;
    const [lx, ly] = first || !br.last ? [gx, gy] : br.last;
    br.last = [gx, gy];
    const steps = Math.max(1, Math.ceil(Math.hypot(gx - lx, gy - ly) / 0.4));
    const cells = $br('brSpread').children;
    let added = 0;
    for (let s = 1; s <= steps; s++) {
        const px = lx + (gx - lx) * s / steps, py = ly + (gy - ly) * s / steps;
        for (let y = 0; y < BR_GRID; y++) for (let x = 0; x < BR_GRID; x++) {
            const i = y * BR_GRID + x;
            if (br.cells.has(i) || Math.hypot(x - px, y - py) > 0.95) continue;
            br.cells.add(i);
            cells[i].classList.add('on');
            added++;
        }
    }
    if (added && Math.random() < 0.5) playTone(160 + Math.random() * 60, 0.05, 0.04, 'triangle');
    if (br.cells.size >= BR_GRID * BR_GRID * 0.8) brSpreadDone();
}

function brSpreadDone() {
    br.spreadDone = true;
    [...$br('brSpread').children].forEach(c => c.classList.add('on'));
    $br('brKnife').classList.remove('show');
    playCorrect();
    ovCheer(brEl, $br('brBread'), ['✨', '💖', (BR_SPREADS.find(s => s.k === br.spread) || {}).icon]);
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak('Mooi gesmeerd! Pak nu iets lekkers uit de koelkast.');
    brRender();
}

/* ── Beleg ── */
function brToggleFridge() {
    if (br.fridge) {
        br.fridge = false;
        playFreqSweep(300, 150, 0.15, 0.1);
    } else {
        br.fridge = true;
        playFreqSweep(150, 300, 0.2, 0.08);
        setTimeout(() => playTone(110, 0.5, 0.04, 'sine'), 200);
        if (br.bread && !brBusy()) speak('Wat wil je erop?');
    }
    brRender();
}

function brAddTop(t, btn) {
    if (!br.bread || brBusy()) { brNope(btn, br.dirty ? 'Eerst het bord in de vaatwasser!' : 'Pak eerst een boterham!'); return; }
    if (br.tops.length >= BR_SLOTS.length) { brNope(btn, 'Je broodje is vol!'); return; }
    // Done smearing halfway? Then that is fine too
    if (br.spread && !br.spreadDone) { if (br.cells.size) brSpreadDone(); else br.spread = null; }
    const [sx, sy] = BR_SLOTS[br.tops.length];
    br.tops.push(t.k);
    const n = el(`<span class="br-top" style="left:${sx}%;top:${sy}%;--r:${(br.tops.length * 53) % 70 - 35}deg">${t.icon}</span>`);
    ovFly(brEl, btn, $br('brBread'), t.icon, 450).then(() => {
        if (!brOpen || !br.bread) return;
        $br('brTops').appendChild(n);
        playTone(300 + Math.random() * 200, 0.08, 0.12, 'triangle');
        brRender();
    });
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak(t.name);
}

function brSprinkle(btn) {
    if (!br.bread || brBusy()) { brNope(btn, 'Pak eerst een boterham!'); return; }
    if (br.spread && !br.spreadDone && br.cells.size) brSpreadDone();
    if (!br.spreadDone) {
        brNope(btn, 'Oei, de hagelslag valt eraf! Eerst iets smeren, dan blijft het plakken.');
        ovCheer(brEl, $br('brPlate'), ['🟤', '⚫', '🟫']);
        return;
    }
    br.sprinkles = true;
    for (let i = 0; i < 12; i++) setTimeout(() => playTone(2000 + Math.random() * 1500, 0.02, 0.05, 'sine'), i * 35);
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak('Hagelslag! Lekker!');
    brRender();
}

/* ── Opeten ── */
function brStartEating() {
    if (!br.bread || br.eating) return;
    if (br.spread && !br.spreadDone && br.cells.size) brSpreadDone();
    br.eating = true;
    br.fridge = false;
    $br('brKnife').classList.remove('show');
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak('Eet smakelijk! Tik op je broodje om een hap te nemen.');
    brRender();
}

function brBite() {
    const bread = $br('brBread');
    const [bx, by] = BR_BITES[br.bites];
    $br('brBites').appendChild(el(`<b style="left:${bx}%;top:${by}%"></b>`));
    br.bites++;
    [0, 90, 180].forEach(d => setTimeout(() => playTone(120 + Math.random() * 80, 0.05, 0.18, 'square'), d));
    const o = brEl.getBoundingClientRect();
    const r = bread.getBoundingClientRect();
    const s = el(`<span class="br-nom">${randomPick(['Hap!', 'Mmm!', 'Nom!', 'Smak!'])}</span>`);
    s.style.left = (r.left + r.width / 2 - o.left) + 'px';
    s.style.top = (r.top - o.top) + 'px';
    brEl.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
    if (br.bites < BR_BITES.length) return;
    // All gone: a dirty plate is left
    bread.classList.add('gone');
    br.dirty = true;
    br.made++;
    try { localStorage.setItem(BR_KEY, String(br.made)); } catch (e) {}
    setTimeout(() => {
        if (!brOpen) return;
        Object.assign(br, { bread: null, eating: false });
        playCorrect();
        if (window.speechSynthesis) speechSynthesis.cancel();
        speak(br.tops.length ? 'Mmm! Helemaal op! Nu moet het vieze bord in de vaatwasser.' : 'Op! Nu moet het bord in de vaatwasser.');
        brRender();
    }, 500);
}

/* ── Vaatwasser ── */
function brToggleDw() {
    if (br.running) { brNope($br('brDwDoor'), 'Wacht even, hij is nog aan het wassen!'); return; }
    br.dwOpen = !br.dwOpen;
    playFreqSweep(br.dwOpen ? 250 : 400, br.dwOpen ? 120 : 200, 0.25, 0.1);
    if (!br.dwOpen) setTimeout(() => playTone(90, 0.08, 0.15, 'square'), 220);
    if (br.dwOpen && br.clean) {
        br.power = false;
        br.prog = null;
        ovCheer(brEl, $br('brRackPlate'), ['✨', '⭐', '💎']);
        playWin();
        speak('Kijk! Je bord is weer helemaal schoon!');
    } else if (br.dwOpen && br.dirty) speak('Zet je bord er maar in.');
    else if (!br.dwOpen && br.plate === 'dw' && !br.clean) speak('Deur dicht! Zet hem nu aan.');
    brRender();
}

function brPlateIn() {
    if (!br.dirty) return;
    if (!br.dwOpen) { brNope($br('brPlate'), 'Doe eerst de vaatwasser open!'); return; }
    br.dirty = false;
    br.plate = 'moving';
    brRender();
    ovFly(brEl, $br('brPlate'), $br('brRack'), '🍽️', 600).then(() => {
        if (!brOpen) return;
        br.plate = 'dw';
        [600, 500].forEach((f, i) => setTimeout(() => playTone(f, 0.06, 0.1, 'triangle'), i * 80));
        speak('Erin! Doe de deur maar dicht.');
        brRender();
    });
}

function brPlateOut() {
    if (br.plate !== 'dw' || !br.clean || !br.dwOpen) return;
    br.plate = 'moving';
    brRender();
    ovFly(brEl, $br('brRack'), $br('brPlate'), '🍽️', 600).then(() => {
        if (!brOpen) return;
        Object.assign(br, { plate: 'counter', clean: false, dwOpen: false });
        playTone(880, 0.1, 0.1, 'triangle');
        speak('Weer een schoon bord! Nog een broodje maken?');
        brRender();
    });
}

function brPower() {
    const btn = $br('brPower');
    if (br.running) { brNope(btn, 'Hij is nog bezig!'); return; }
    if (br.dwOpen) { brNope(btn, 'Doe eerst de deur dicht!'); return; }
    br.power = !br.power;
    if (!br.power) br.prog = null;
    playTone(br.power ? 1200 : 600, 0.1, 0.1, 'square');
    if (br.power) speak(br.plate === 'dw' ? 'Aan! Kies een programma.' : 'Aan!');
    brRender();
}

function brPickProg(p, btn) {
    if (br.running) { brNope(btn); return; }
    if (!br.power) { brNope(btn, 'Zet hem eerst aan!'); return; }
    br.prog = p.k;
    playTone(1000, 0.08, 0.1, 'square');
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak(p.say + ' Druk nu op start.');
    brRender();
}

function brStart() {
    const btn = $br('brStart');
    if (br.running) { brNope(btn); return; }
    if (br.dwOpen) { brNope(btn, 'Doe eerst de deur dicht!'); return; }
    if (!br.power) { brNope(btn, 'Zet hem eerst aan!'); return; }
    if (!br.prog) { brNope(btn, 'Kies eerst een programma!'); return; }
    if (br.plate !== 'dw') { brNope(btn, 'Er zit nog niks in!'); return; }
    if (br.clean) { brNope(btn, 'Het bord is al schoon!'); return; }
    const secs = BR_PROGS.find(p => p.k === br.prog).s;
    br.running = true;
    playTone(1400, 0.1, 0.1, 'square');
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak('Daar gaat ie! Het water stroomt erin.');
    startNoise('shower');
    brRender();
    for (let t = secs; t > 0; t--) brLater(() => { $br('brDisplay').textContent = '⏱️ ' + t; }, (secs - t) * 1000);
    for (let i = 0; i < secs * 2; i++) brLater(() => playTone(200 + Math.random() * 120, 0.12, 0.03, 'sine'), 300 + i * 500);
    brLater(() => {
        stopNoise();
        br.running = false;
        br.clean = true;
        [0, 350, 700].forEach(d => setTimeout(() => playTone(1800, 0.18, 0.1, 'square'), d));
        speak('Piep piep piep! De vaatwasser is klaar!');
        brRender();
    }, secs * 1000);
}

function brReset() {
    br.timers.forEach(clearTimeout);
    br.timers = [];
    stopNoise();
    // A plate that was washing is just clean now
    if (br.running) { br.running = false; br.clean = true; }
    if (br.plate === 'moving') Object.assign(br, br.clean ? { plate: 'counter', clean: false, dwOpen: false } : { plate: 'dw' });
    Object.assign(br, { bread: null, spread: null, spreadDone: false, tops: [], sprinkles: false, eating: false, bites: 0, fridge: false });
    br.cells.clear();
    $br('brTops').innerHTML = '';
    $br('brBites').innerHTML = '';
    $br('brKnife').classList.remove('show');
    brEl.querySelectorAll('.ov-fly, .br-nom, .scope-spark').forEach(n => n.remove());
}

function openSandwich() {
    brOpen = true;
    brEl.classList.add('open');
    brReset();
    brRender();
    playMusicBox();
    speak(br.dirty || br.plate === 'dw' ? 'Eerst het bord nog in de vaatwasser!' : 'Broodjes maken! Kies eerst een boterham.');
}

function closeSandwich() {
    brOpen = false;
    brReset();
    brEl.classList.remove('open');
    if (window.speechSynthesis) speechSynthesis.cancel();
    _playWhoosh();
}

const brTap = (node, fn) => node.addEventListener('pointerdown', (e) => { e.stopPropagation(); fn(e); });
BR_BREADS.forEach(b => {
    const n = el(`<button class="br-breadbtn" data-n="bread" aria-label="${b.name}" style="--crust:${b.crust};--crumb:${b.crumb}"><i class="${b.dots ? 'dots' : ''}"></i></button>`);
    brTap(n, () => brPickBread(b, n));
    $br('brBreads').appendChild(n);
});
BR_SPREADS.forEach(s => {
    const n = el(`<button class="br-jar" data-n="jar" data-k="${s.k}" aria-label="${s.name}" style="--c:${s.c}"><span>${s.icon}</span></button>`);
    brTap(n, () => brPickSpread(s, n));
    $br('brJars').appendChild(n);
});
const brSprinkleBtn = el('<button class="br-jar hagel" aria-label="hagelslag"><span>🌈</span></button>');
brTap(brSprinkleBtn, () => brSprinkle(brSprinkleBtn));
$br('brJars').appendChild(brSprinkleBtn);
BR_TOPS.forEach(t => {
    const n = el(`<button class="br-item" data-n="top" aria-label="${t.name}">${t.icon}</button>`);
    brTap(n, () => brAddTop(t, n));
    $br('brShelves').appendChild(n);
});
BR_PROGS.forEach(p => {
    const n = el(`<button class="br-prog" data-n="prog" data-k="${p.k}" aria-label="${p.k}">${p.icon}</button>`);
    brTap(n, () => brPickProg(p, n));
    $br('brProgs').appendChild(n);
});
brTap($br('brFdoor'), brToggleFridge);
brTap(brEl.querySelector('.br-freezer'), brToggleFridge);
brTap($br('brDone'), brStartEating);
brTap($br('brDwDoor'), brToggleDw);
brTap($br('brRack'), brPlateOut);
brTap($br('brPower'), brPower);
brTap($br('brStart'), brStart);
brTap($br('brClose'), closeSandwich);

// The plate: smear on it, bite it, or carry it to the dishwasher
const brPlateEl = $br('brPlate');
let brSmearing = false;
brPlateEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (br.dirty) { brPlateIn(); return; }
    if (br.eating) { if (e.target.closest('#brBread')) brBite(); return; }
    if (!br.bread) return;
    if (br.spread && !br.spreadDone) {
        brSmearing = true;
        brPlateEl.setPointerCapture(e.pointerId);
        $br('brKnife').classList.add('show');
        brSmearAt(e, true);
    } else if (!br.spreadDone) brNope($br('brBread'), 'Kies eerst wat je wilt smeren!');
});
brPlateEl.addEventListener('pointermove', (e) => { if (brSmearing && br.spread && !br.spreadDone) brSmearAt(e); });
const brStopSmear = () => { brSmearing = false; $br('brKnife').classList.remove('show'); };
brPlateEl.addEventListener('pointerup', brStopSmear);
brPlateEl.addEventListener('pointercancel', brStopSmear);
brPlateEl.addEventListener('lostpointercapture', brStopSmear);
brEl.addEventListener('pointerdown', (e) => e.stopPropagation());
