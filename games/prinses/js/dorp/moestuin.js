/* 🥕 Moestuin: zaai, geef water (3 keer) en oogst. Tik gewoon op een vakje:
   leeg = zaaien (met het gekozen zaadje), groeiend = water geven, rijp = oogsten.
   De tuin en het oogstmandje worden bewaard (localStorage). */
const GARDEN_KEY = 'noor-prinses-moestuin';
const GARDEN_PLOTS = 6;
const GARDEN_CROPS = ['🥕', '🍅', '🥬', '🌽', '🍓', '🎃', '🥒', '🌻'];
const GARDEN_STAGES = ['🟤', '🌱', '🌿'];    // seed mound, sprout, plant -> then the crop itself
let garden = { plots: new Array(GARDEN_PLOTS).fill(null), basket: {} };
try {
    const d = JSON.parse(localStorage.getItem(GARDEN_KEY));
    if (d && Array.isArray(d.plots)) {
        garden.plots = d.plots.slice(0, GARDEN_PLOTS).map(p => (p && GARDEN_CROPS.includes(p.c) && p.s >= 0 && p.s <= 3 ? { c: p.c, s: p.s } : null));
        while (garden.plots.length < GARDEN_PLOTS) garden.plots.push(null);
        if (d.basket && typeof d.basket === 'object') GARDEN_CROPS.forEach(c => { if (d.basket[c] > 0) garden.basket[c] = d.basket[c]; });
    }
} catch (e) {}

function saveGarden() {
    try { localStorage.setItem(GARDEN_KEY, JSON.stringify(garden)); } catch (e) {}
}
function plotEmoji(p) { return !p ? '' : p.s >= 3 ? p.c : GARDEN_STAGES[p.s]; }

defineRoom({
    key: 'moestuin',
    name: 'Moestuin',
    icon: '🥕',
    say: 'De moestuin',
    build(x) {
        place(el('<div class="farm-fence"></div>'), x, 318);
        addObj('<div class="scarecrow"><span class="hat">👒</span><span class="head">🙂</span><div class="arms"></div><div class="body"></div><div class="pole"></div></div>', x + 40, 150, x + 90, (node) => {
            node.classList.remove('wiggle'); void node.offsetWidth; node.classList.add('wiggle');
            playFreqSweep(400, 800, 0.2, 0.1);
            for (let i = 0; i < 3; i++) {
                const b = el('<div class="magic-fly">🐦</div>');
                b.style.setProperty('--dx', (120 + i * 60) + 'px');
                b.style.setProperty('--dy', (-140 - i * 30) + 'px');
                place(b, x + 100, 200);
                setTimeout(() => b.remove(), 3300);
            }
        });
        addObj(`<div class="garden-beds">${Array.from({ length: GARDEN_PLOTS }, (_, i) => `<div class="g-plot" data-i="${i}"><span></span></div>`).join('')}
            <div class="tap-hint" style="left:170px;top:-56px">👇</div></div>`, x + 220, 330, x + 400, openGarden);
        addObj('<div class="wheelbarrow"><div class="tub"><span id="gardenBarrow"></span></div><div class="wheel"></div><div class="handle"></div></div>', x + 620, 330, x + 680, (node) => {
            bounceEl(node, 'wobble');
            playTone(523, 0.15, 0.1, 'triangle');
            const total = Object.values(garden.basket).reduce((a, b) => a + b, 0);
            showToast(total ? `🧺 ${GARDEN_CROPS.filter(c => garden.basket[c]).map(c => `${c}${garden.basket[c]}`).join(' ')}` : '🧺 Nog leeg… ga oogsten!', 2200);
        });
        renderGardenRoom();
    }
});

function renderGardenRoom() {
    document.querySelectorAll('.garden-beds .g-plot').forEach(p => {
        p.querySelector('span').textContent = plotEmoji(garden.plots[+p.dataset.i]);
        p.classList.toggle('ripe', !!garden.plots[+p.dataset.i] && garden.plots[+p.dataset.i].s >= 3);
    });
    const b = document.getElementById('gardenBarrow');
    if (b) b.textContent = GARDEN_CROPS.filter(c => garden.basket[c]).slice(0, 4).join('');
}

/* ─────────── Moestuin (overlay) ─────────── */
const gdEl = document.getElementById('gardenOv');
let gardenOpen = false;
let gardenSeed = GARDEN_CROPS[0];

function renderGarden() {
    document.getElementById('gdPlots').innerHTML = garden.plots.map((p, i) =>
        `<button class="gd-plot${p && p.s >= 3 ? ' ripe' : ''}${p ? '' : ' empty'}" data-i="${i}"><span>${plotEmoji(p)}</span>${p && p.s < 3 ? `<i>${'💧'.repeat(p.s)}</i>` : ''}</button>`).join('');
    document.querySelectorAll('.gd-plot').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        tapPlot(+b.dataset.i, b);
    }));
    document.getElementById('gdSeeds').innerHTML = GARDEN_CROPS.map(c => `<button class="bd-btn${gardenSeed === c ? ' sel' : ''}" data-c="${c}">${c}<small>zaadje</small></button>`).join('');
    document.querySelectorAll('#gdSeeds .bd-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        gardenSeed = b.dataset.c;
        renderGarden();
        playPop();
    }));
    const total = Object.values(garden.basket).reduce((a, b) => a + b, 0);
    document.getElementById('gdBasket').innerHTML = `🧺 ${total ? GARDEN_CROPS.filter(c => garden.basket[c]).map(c => `${c}<b>${garden.basket[c]}</b>`).join(' ') : '<small>nog leeg</small>'}`;
    renderGardenRoom();
}

function gdFx(btn, set, n = 6) {
    const o = gdEl.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(set);
        const a = Math.random() * Math.PI * 2;
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.top + r.height / 3 - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * 50 + 'px');
        s.style.setProperty('--dy', (Math.sin(a) * 50 - 20) + 'px');
        gdEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function tapPlot(i, btn) {
    const p = garden.plots[i];
    if (!p) {
        // Sow
        garden.plots[i] = { c: gardenSeed, s: 0 };
        playFreqSweep(600, 300, 0.2, 0.12);
        gdFx(btn, ['🟤', '✨'], 4);
    } else if (p.s < 3) {
        // Water: a can tips over the plot and the plant grows a step
        p.s++;
        const can = el('<span class="gd-can">🚿</span>');
        const r = btn.getBoundingClientRect();
        const o = gdEl.getBoundingClientRect();
        can.style.left = (r.left + r.width / 2 - o.left) + 'px';
        can.style.top = (r.top - o.top) + 'px';
        gdEl.appendChild(can);
        setTimeout(() => can.remove(), 900);
        gdFx(btn, ['💧', '💦'], 6);
        playFreqSweep(2200, 1400, 0.4, 0.05);
        setTimeout(() => playTone(p.s >= 3 ? 1047 : 523 + p.s * 120, 0.2, 0.1, 'sine'), 300);
        if (p.s >= 3) setTimeout(() => gdFx(btn, ['✨', '⭐'], 8), 300);
    } else {
        // Harvest!
        garden.basket[p.c] = (garden.basket[p.c] || 0) + 1;
        garden.plots[i] = null;
        playCorrect();
        gdFx(btn, [p.c, '✨', '💚'], 8);
        const basket = document.getElementById('gdBasket');
        basket.classList.remove('bump'); void basket.offsetWidth; basket.classList.add('bump');
    }
    saveGarden();
    renderGarden();
    const nb = document.querySelector(`.gd-plot[data-i="${i}"]`);
    nb.classList.add('pop');
}

function openGarden() {
    gardenOpen = true;
    gdEl.classList.add('open');
    renderGarden();
    playMusicBox();
}

function closeGarden() {
    gardenOpen = false;
    gdEl.classList.remove('open');
    renderGardenRoom();
    _playWhoosh();
}
document.getElementById('gardenClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeGarden(); });
gdEl.addEventListener('pointerdown', (e) => e.stopPropagation());
