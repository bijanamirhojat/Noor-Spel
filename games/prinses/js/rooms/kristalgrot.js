/* 🔮 Kristallengrot: een geheime grot onder het kasteel. Glinsterende kristallen die muziek maken,
   kristallen met hartjes erin, en een graafplek: veeg met je vinger de aarde weg en graaf
   schatkisten, hartjes en kristallen uit. De gevonden schatten worden bewaard in KG_KEY. */
const KG_KEY = 'noor-prinses-grotschatten';
const KG_CLUSTERS = [
    { hue: 320, notes: [523, 659, 784] },
    { hue: 190, notes: [587, 740, 880] },
    { hue: 270, notes: [440, 554, 659] },
    { hue: 150, notes: [659, 831, 988] }
];
const KG_TREASURE = ['👑', '💍', '💎', '📿', '🪙', '🔮', '🏆', '💖'];
const KG_LOOSE = ['💖', '💗', '💎', '💜', '💎', '💖'];
let kgFound = 0;
try { kgFound = Math.max(0, parseInt(localStorage.getItem(KG_KEY), 10) || 0); } catch (e) {}

function kgCrystalHTML(c, sizes) {
    return `<div class="kg-cluster" style="--h:${c.hue}">${sizes.map(([w, h, r]) =>
        `<i style="width:${w}px;height:${h}px;transform:rotate(${r}deg)"><b></b></i>`).join('')}</div>`;
}

function kgChime(notes) {
    notes.forEach((f, i) => setTimeout(() => { playTone(f * 2, 0.6, 0.07, 'sine'); playTone(f * 4, 0.3, 0.02, 'sine'); }, i * 110));
}

function kgTwinkle(node, hue, n = 20) {
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 3);
    for (let i = 0; i < n; i++) spawnSparkle(p.x + (Math.random() - 0.5) * r.width * 0.8, p.y + (Math.random() - 0.5) * 60, { speed: 90, g: -20, hue: hue + (Math.random() - 0.5) * 40, size: 4 + Math.random() * 6 });
}

defineRoom({
    key: 'kristalgrot',
    name: 'Kristallengrot',
    icon: '🔮',
    say: 'De geheime kristallengrot!',
    lampX: 240,
    build(x) {
        place(el(`<div class="kg-drips">${Array.from({ length: 11 }, (_, i) => `<i style="left:${i * 72 + (i % 3) * 9}px;height:${30 + (i * 37) % 60}px"></i>`).join('')}</div>`), x, 0);
        // Little wall crystals that twinkle by themselves
        [[110, 70, 300], [380, 40, 190], [470, 150, 270], [740, 110, 150], [600, 30, 320]].forEach(([dx, y, h]) => {
            place(el(`<div class="kg-wallgem" style="--h:${h};animation-delay:${-dx % 7 * 0.4}s"></div>`), x + dx, y);
        });
        const sizes = [[[26, 90, -14], [34, 140, 0], [24, 80, 16]], [[30, 120, -10], [40, 190, 2], [28, 110, 14]], [[24, 80, -18], [30, 120, -2], [22, 70, 18]], [[22, 70, -12], [30, 110, 4], [20, 60, 20]]];
        const spots = [20, 480, 590, 700];
        KG_CLUSTERS.forEach((c, i) => {
            const h = Math.max(...sizes[i].map(s => s[1]));
            addObj(kgCrystalHTML(c, sizes[i]), x + spots[i], FEET_Y - h, x + spots[i] + 45, (node) => {
                node.classList.remove('ring'); void node.offsetWidth; node.classList.add('ring');
                kgChime(c.notes);
                kgTwinkle(node, c.hue, 26);
            });
        });
        // Crystals with hearts inside
        addObj('<div class="kg-geode"><div class="rim"></div><span>💖</span><span>💗</span><span>💕</span></div>', x + 170, 110, x + 230, (node) => {
            node.classList.remove('ring'); void node.offsetWidth; node.classList.add('ring');
            kgChime([784, 988, 1175, 1568]);
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
            for (let i = 0; i < 7; i++) {
                const hrt = el(`<div class="magic-fly">${randomPick(['💖', '💗', '💕', '💓'])}</div>`);
                hrt.style.setProperty('--dx', ((Math.random() - 0.5) * 260) + 'px');
                hrt.style.setProperty('--dy', (-60 - Math.random() * 120) + 'px');
                place(hrt, p.x - 18, p.y - 18);
                setTimeout(() => hrt.remove(), 3300);
            }
        });
        addObj('<div class="kg-geode small"><div class="rim"></div><span>💜</span></div>', x + 640, 60, x + 660, (node) => {
            node.classList.remove('ring'); void node.offsetWidth; node.classList.add('ring');
            kgChime([659, 880]);
            kgTwinkle(node, 280, 16);
        });
        addObj(`<div class="kg-dig">
            <div class="mound"></div><div class="chest-peek"></div><span class="pick">⛏️</span><span class="shovel">🪏</span>
            <div class="kg-pile" id="kgPile"></div>
            <div class="tap-hint" style="left:80px;top:-40px">👇</div>
        </div>`, x + 270, 330, x + 300, openCave);
        addObj('<div class="kg-bat">🦇</div>', x + 420, 34, x + 440, (node) => {
            bounceEl(node, 'wobble');
            playFreqSweep(2400, 3200, 0.08, 0.05);
            setTimeout(() => playFreqSweep(2600, 3400, 0.08, 0.05), 120);
            showToast('🦇 Piep! Ik sliep net…', 1600);
        });
        // Every now and then a crystal glints by itself
        setInterval(() => {
            if (!inRoom('kristalgrot') || overlayOpen() || document.hidden) return;
            const all = document.querySelectorAll('.kg-cluster i, .kg-wallgem');
            const g = all[Math.floor(Math.random() * all.length)];
            if (!g) return;
            g.classList.remove('glint'); void g.offsetWidth; g.classList.add('glint');
            const r = g.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top + r.height * 0.3);
            for (let i = 0; i < 5; i++) spawnSparkle(p.x, p.y, { speed: 50, g: 0, hue: 50 + Math.random() * 300, size: 3 + Math.random() * 5, max: 0.8 });
        }, 500);
        kgUpdatePile();
    }
});

// The treasures found so far lie in a little pile next to the digging spot
function kgUpdatePile() {
    const pile = document.getElementById('kgPile');
    if (!pile) return;
    const n = Math.min(kgFound, 12);
    pile.innerHTML = Array.from({ length: n }, (_, i) => `<span style="left:${(i * 17) % 90}px;bottom:${Math.floor(i / 5) * 12}px">${KG_TREASURE[i % KG_TREASURE.length]}</span>`).join('');
}

/* ─────────── Schatten zoeken (overlay) ─────────── */
const kgEl = document.getElementById('kgOv');
const kgStage = document.getElementById('kgStage');
const kgCanvas = document.getElementById('kgDirt');
const kgCtx = kgCanvas.getContext('2d', { willReadFrequently: true });
let caveOpen = false;
registerOverlay(() => caveOpen, closeCave);
const kg = { items: [], last: null, checkT: 0, scrapeT: 0, chests: 0, opened: 0 };

function kgDrawDirt() {
    const w = kgStage.clientWidth;
    const h = kgStage.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    kgCanvas.width = Math.round(w * dpr);
    kgCanvas.height = Math.round(h * dpr);
    kgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    kgCtx.globalCompositeOperation = 'source-over';
    const g = kgCtx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#a16207');
    g.addColorStop(1, '#713f12');
    kgCtx.fillStyle = g;
    kgCtx.fillRect(0, 0, w, h);
    // Clumps and little stones
    for (let i = 0; i < 260; i++) {
        kgCtx.fillStyle = randomPick(['rgba(120,53,15,0.5)', 'rgba(202,138,4,0.35)', 'rgba(68,64,60,0.35)', 'rgba(254,243,199,0.15)']);
        kgCtx.beginPath();
        kgCtx.ellipse(Math.random() * w, Math.random() * h, 3 + Math.random() * 14, 2 + Math.random() * 9, Math.random() * 3, 0, Math.PI * 2);
        kgCtx.fill();
    }
    for (let i = 0; i < 26; i++) {
        kgCtx.fillStyle = randomPick(['#78716c', '#a8a29e', '#57534e']);
        kgCtx.beginPath();
        kgCtx.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 10, 5 + Math.random() * 7, Math.random() * 3, 0, Math.PI * 2);
        kgCtx.fill();
    }
    kgCtx.globalCompositeOperation = 'destination-out';
}

// Spread chests and loose hearts/crystals over the stage without overlapping
function kgPlaceItems() {
    const box = document.getElementById('kgItems');
    box.innerHTML = '';
    kg.items = [];
    const spots = [];
    const kinds = ['chest', 'chest', 'chest'].concat(shuffle(KG_LOOSE.slice()).slice(0, 4));
    kinds.forEach(kind => {
        let px, py, tries = 0;
        do {
            px = 10 + Math.random() * 80;
            py = 14 + Math.random() * 72;
            tries++;
        } while (tries < 60 && spots.some(([a, b]) => Math.abs(a - px) < 17 && Math.abs(b - py) < 24));
        spots.push([px, py]);
        const node = kind === 'chest'
            ? el(`<div class="kg-item kg-chest" style="left:${px}%;top:${py}%"><div class="lid"></div><div class="box"><i></i></div><span class="loot"></span></div>`)
            : el(`<div class="kg-item kg-loose" style="left:${px}%;top:${py}%">${kind}</div>`);
        box.appendChild(node);
        const it = { kind, node, px, py, found: false, done: false };
        node.addEventListener('pointerdown', (e) => { e.stopPropagation(); kgTapItem(it); });
        kg.items.push(it);
    });
    kg.chests = 3;
    kg.opened = 0;
}

// How much dirt is gone around an item (0..1)
function kgCleared(it) {
    const w = kgStage.clientWidth;
    const h = kgStage.clientHeight;
    const dpr = kgCanvas.width / w;
    const cx = it.px / 100 * w;
    const cy = it.py / 100 * h;
    const R = (it.kind === 'chest' ? 30 : 18);
    const x0 = Math.max(0, Math.round((cx - R) * dpr));
    const y0 = Math.max(0, Math.round((cy - R) * dpr));
    const s = Math.round(R * 2 * dpr);
    const d = kgCtx.getImageData(x0, y0, Math.min(s, kgCanvas.width - x0), Math.min(s, kgCanvas.height - y0)).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 7) { n++; if (d[i] < 100) clear++; }
    return n ? clear / n : 0;
}

function kgCheck() {
    kg.items.forEach(it => {
        if (it.found) return;
        if (kgCleared(it) < (it.kind === 'chest' ? 0.5 : 0.45)) return;
        it.found = true;
        it.node.classList.add('found');
        ovCheer(kgEl, it.node, ['✨', '⭐', '💫']);
        if (it.kind === 'chest') {
            playFreqSweep(400, 1200, 0.3, 0.1);
            speak('Een schatkist! Tik erop!');
        } else {
            playSparkleSound();
        }
    });
}

function kgDig(e) {
    const r = kgStage.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    kgCtx.lineCap = 'round';
    kgCtx.lineWidth = Math.max(40, Math.min(70, r.width / 12));
    kgCtx.beginPath();
    kgCtx.moveTo((kg.last || p).x, (kg.last || p).y);
    kgCtx.lineTo(p.x + 0.1, p.y);
    kgCtx.stroke();
    kg.last = p;
    const now = performance.now();
    if (now - kg.scrapeT > 90) {
        kg.scrapeT = now;
        playTone(90 + Math.random() * 60, 0.05, 0.06, 'sawtooth');
        // A crumb of dirt flies away
        if (Math.random() < 0.6) {
            const c = el(`<span class="kg-crumb" style="left:${p.x}px;top:${p.y}px;--dx:${(Math.random() - 0.5) * 80}px"></span>`);
            kgStage.appendChild(c);
            setTimeout(() => c.remove(), 600);
        }
    }
    if (now - kg.checkT > 150) {
        kg.checkT = now;
        kgCheck();
    }
}

kgCanvas.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    kgCanvas.setPointerCapture(e.pointerId);
    kg.last = null;
    document.getElementById('kgHint').classList.add('hide');
    kgDig(e);
});
kgCanvas.addEventListener('pointermove', (e) => { if (kgCanvas.hasPointerCapture(e.pointerId)) kgDig(e); });
kgCanvas.addEventListener('pointerup', () => { kg.last = null; kgCheck(); });

function kgTapItem(it) {
    if (!it.found || it.done) return;
    it.done = true;
    if (it.kind === 'chest') {
        const loot = randomPick(KG_TREASURE);
        it.node.querySelector('.loot').textContent = loot;
        it.node.classList.add('open');
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.1, 'triangle'), i * 100));
        ovCheer(kgEl, it.node, [loot, '✨', '💖', '⭐']);
        kgFound++;
        try { localStorage.setItem(KG_KEY, kgFound); } catch (e) {}
        kgUpdateCount();
        kgUpdatePile();
        kg.opened++;
        const names = { '👑': 'een kroon', '💍': 'een ring', '💎': 'een diamant', '📿': 'een ketting', '🪙': 'een gouden munt', '🔮': 'een toverbol', '🏆': 'een beker', '💖': 'een hartje' };
        speak(`Wauw! ${names[loot]}!`);
        if (kg.opened >= kg.chests) setTimeout(kgAllFound, 1600);
    } else {
        ovFly(kgEl, it.node, document.getElementById('kgCount'), it.kind, 600);
        it.node.classList.add('gone');
        kgChime([988, 1319]);
    }
}

function kgAllFound() {
    if (!caveOpen) return;
    // Wipe away the rest of the dirt
    kgCanvas.classList.add('clear');
    kg.items.forEach(it => { if (!it.found) { it.found = true; it.node.classList.add('found'); } });
    document.getElementById('kgDone').classList.add('show');
    playCorrect();
    speak('Alle schatkisten gevonden! Goed gegraven!');
}

function kgUpdateCount() {
    document.getElementById('kgCount').textContent = `🧰 ${kgFound}`;
}

function kgNewRound() {
    document.getElementById('kgDone').classList.remove('show');
    document.getElementById('kgHint').classList.remove('hide');
    kgCanvas.classList.remove('clear');
    kgPlaceItems();
    kgDrawDirt();
}

document.getElementById('kgAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    playPop();
    kgNewRound();
});

function openCave() {
    caveOpen = true;
    kgEl.classList.add('open');
    kgUpdateCount();
    kgNewRound();
    speak('Graaf met je vinger de schatten uit!');
}

function closeCave() {
    caveOpen = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    kgEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('kgClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeCave(); });
kgEl.addEventListener('pointerdown', (e) => e.stopPropagation());
