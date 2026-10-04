/* 💐 Bloemenwinkel: maak een boeket voor Mama.
   Het laatste boeket staat daarna in de vensterbank van de familie-eetzaal (js/rooms/eetzaal.js). */
const BOUQUET_KEY = 'noor-prinses-boeket';
const BQ_FLOWERS = ['🌹', '🌷', '🌻', '🌼', '🌸', '🌺', '🪻', '🪷'];
const BQ_WRAPS = ['#f9a8d4', '#c4b5fd', '#93c5fd', '#fde68a', '#fcd34d', '#d6a77a', '#ffffff'];
const BQ_RIBBONS = ['#db2777', '#7c3aed', '#2563eb', '#16a34a', '#f59e0b', '#ef4444'];
// Flower slots: angle (deg) and stem length, filled in this order
const BQ_SLOTS = [[-4, 104], [16, 96], [-22, 92], [32, 82], [-38, 80], [6, 76], [-14, 72], [46, 66], [-50, 64]];
let bouquet = null;
try {
    const d = JSON.parse(localStorage.getItem(BOUQUET_KEY));
    if (d && Array.isArray(d.f)) bouquet = d;
} catch (e) {}

function bouquetSVG(b, cls = '') {
    const heads = b.f.map((f, i) => {
        const [a, len] = BQ_SLOTS[i];
        const r = a * Math.PI / 180;
        return { f, x: 100 + Math.sin(r) * len, y: 150 - Math.cos(r) * len };
    });
    return `<svg viewBox="0 0 200 220" class="${cls}">
        ${heads.map(h => `<path d="M100 160 Q${(100 + h.x) / 2} ${(150 + h.y) / 2 + 10} ${h.x.toFixed(1)} ${(h.y + 10).toFixed(1)}" stroke="#16a34a" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
        ${b.f.length ? '<ellipse cx="74" cy="118" rx="16" ry="7" transform="rotate(-35 74 118)" fill="#22c55e"/><ellipse cx="128" cy="116" rx="16" ry="7" transform="rotate(35 128 116)" fill="#22c55e"/>' : ''}
        <path d="M52 124 L148 124 L114 212 L86 212 Z" fill="${b.w}" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
        <path d="M76 124 L94 212 M124 124 L106 212" stroke="rgba(255,255,255,0.55)" stroke-width="3"/>
        <path d="M52 124 Q62 112 74 124 Q86 112 100 124 Q114 112 126 124 Q138 112 148 124" fill="${b.w}" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
        ${heads.map(h => `<text x="${h.x.toFixed(1)}" y="${h.y.toFixed(1)}" font-size="34" text-anchor="middle" dominant-baseline="central">${h.f}</text>`).join('')}
        <g fill="${b.r}">
            <ellipse cx="86" cy="168" rx="15" ry="9" transform="rotate(-20 86 168)"/>
            <ellipse cx="114" cy="168" rx="15" ry="9" transform="rotate(20 114 168)"/>
            <path d="M96 172 L84 200 L92 198 L98 176 Z M104 172 L116 200 L108 198 L102 176 Z"/>
            <circle cx="100" cy="170" r="6" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
        </g>
    </svg>`;
}

// The latest bouquet in the dining hall window
function renderFamBouquet() {
    const v = document.getElementById('famVase');
    if (v) v.innerHTML = bouquet ? bouquetSVG(bouquet) : '';
}

defineRoom({
    key: 'bloemenwinkel',
    name: 'Bloemenwinkel',
    icon: '💐',
    say: 'De bloemenwinkel',
    build(x) {
        villageHouse(x + 560, 200, 280, '#fbcfe8', '#be185d', { flowers: true });
        addObj(`<div class="flower-shop">
            <div class="fs-sign">💐 Bloemen</div>
            <div class="fs-front"><div class="fs-window"><span>🌹🌷🌻</span><span>🌸💐🌼</span></div><div class="fs-door"></div></div>
            <div class="fs-awning"></div>
            <div class="tap-hint" style="left:170px;top:-60px">👇</div>
        </div>`, x + 60, 110, x + 240, openBouquet);
        ['🌷', '🌻', '🌹'].forEach((f, i) => {
            addObj(`<div class="fs-bucket"><span>${f}${f}${f}</span><div class="pail"></div></div>`, x + 410 + i * 56, 330 + (i % 2) * 14, x + 450, (node) => {
                bounceEl(node, 'jump');
                const r = node.getBoundingClientRect();
                const p = screenToWorld(r.left + r.width / 2, r.top);
                for (let k = 0; k < 18; k++) spawnSparkle(p.x, p.y, { speed: 110, hue: [140, 50, 350][i] + Math.random() * 20, size: 6 + Math.random() * 4 });
                playFreqSweep(900, 1500, 0.2, 0.1);
            });
        });
        place(el('<div class="fs-bee">🐝</div>'), x + 440, 200);
    }
});

/* ─────────── Boeket maken (overlay) ─────────── */
const bqEl = document.getElementById('bqOv');
let bqOpen = false;
let bqTab = 'f';
let bq = null;
const BQ_TABS = [['f', '🌷'], ['w', '🎁'], ['r', '🎀']];

function renderBq() {
    document.getElementById('bqStage').innerHTML = bouquetSVG(bq);
}

function renderBqTabs() {
    const box = document.getElementById('bqTabs');
    box.innerHTML = BQ_TABS.map(([k, ic]) => `<button class="du-tab${bqTab === k ? ' active' : ''}" data-k="${k}">${ic}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bqTab = b.dataset.k;
        renderBqTabs();
        renderBqOpts();
        playPop();
    }));
}

function renderBqOpts() {
    const box = document.getElementById('bqOpts');
    if (bqTab === 'f') box.innerHTML = BQ_FLOWERS.map(f => `<button class="du-opt" data-v="${f}">${f}</button>`).join('');
    else {
        const list = bqTab === 'w' ? BQ_WRAPS : BQ_RIBBONS;
        box.innerHTML = list.map(c => `<button class="du-opt${bq[bqTab] === c ? ' sel' : ''}" data-v="${c}"><span class="sw" style="background:${c}"></span></button>`).join('');
    }
    box.querySelectorAll('.du-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickBq(b.dataset.v);
    }));
}

function bqPop() {
    const st = document.getElementById('bqStage');
    st.classList.remove('pop'); void st.offsetWidth; st.classList.add('pop');
}

function pickBq(v) {
    if (bqTab === 'f') {
        if (bq.f.length >= BQ_SLOTS.length) {
            bqPop();
            playTone(220, 0.12, 0.1, 'triangle');
            return;
        }
        bq.f.push(v);
        renderBq();
        const heads = document.querySelectorAll('#bqStage text');
        heads[heads.length - 1]?.classList.add('grow');
        playTone(600 + bq.f.length * 90, 0.15, 0.1, 'sine');
    } else {
        bq[bqTab] = v;
        renderBq();
        renderBqOpts();
        bqPop();
        playFreqSweep(700, 1300, 0.2, 0.1);
    }
}

function openBouquet() {
    bqOpen = true;
    bqEl.classList.add('open');
    bq = { f: [], w: BQ_WRAPS[0], r: BQ_RIBBONS[0] };
    bqTab = 'f';
    renderBq();
    renderBqTabs();
    renderBqOpts();
    playMusicBox();
}

function closeBouquet() {
    bqOpen = false;
    bqEl.classList.remove('open');
    _playWhoosh();
}

document.getElementById('bqEmpty').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    bq.f = [];
    renderBq();
    playFreqSweep(600, 150, 0.4, 0.12);
});
document.getElementById('bqGive').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!bq.f.length) {
        bqTab = 'f';
        renderBqTabs();
        renderBqOpts();
        bqPop();
        playTone(220, 0.12, 0.1, 'triangle');
        return;
    }
    bouquet = { f: bq.f.slice(), w: bq.w, r: bq.r };
    try { localStorage.setItem(BOUQUET_KEY, JSON.stringify(bouquet)); } catch (err) {}
    renderFamBouquet();
    closeBouquet();
    playWin();
    twirl();
    sparkleShower(state.x, 120, 50);
    showToast('💐 Voor Mama! Het staat in de familie-eetzaal 💖', 3000);
});
document.getElementById('bqClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeBouquet();
});
bqEl.addEventListener('pointerdown', (e) => e.stopPropagation());
