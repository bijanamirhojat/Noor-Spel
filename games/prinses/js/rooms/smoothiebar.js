/* 🥤 Smoothiebar: fruit in de blender, melk of yoghurt erbij, de mixknop ingedrukt houden tot alles
   één kleur is, inschenken, slagroom en hagelslag erop en opdrinken. */
const BL_FRUITS = [
    { key: 'aardbei', name: 'aardbei', icon: '🍓', c: [239, 68, 68] },
    { key: 'banaan', name: 'banaan', icon: '🍌', c: [253, 224, 71] },
    { key: 'mango', name: 'mango', icon: '🥭', c: [251, 146, 60] },
    { key: 'bosbes', name: 'bosbessen', icon: '🫐', c: [79, 70, 229] },
    { key: 'kiwi', name: 'kiwi', icon: '🥝', c: [132, 204, 22] },
    { key: 'kers', name: 'kersen', icon: '🍒', c: [190, 18, 60] },
    { key: 'perzik', name: 'perzik', icon: '🍑', c: [253, 164, 175] },
    { key: 'spinazie', name: 'spinazie', icon: '🥬', c: [22, 163, 74] }
];
const BL_LIQUIDS = [
    { key: 'melk', name: 'melk', icon: '🥛' },
    { key: 'yoghurt', name: 'yoghurt', icon: '🥣' },
    { key: 'ijs', name: 'ijsblokjes', icon: '🧊' }
];
const BL_MAX = 8;
const BL_WHITE = [255, 250, 240];

defineRoom({
    key: 'smoothiebar',
    name: 'Smoothiebar',
    icon: '🥤',
    say: 'De smoothiebar!',
    build(x) {
        place(el(`<div class="bl-menu"><b>Smoothies</b>
            <div><span>🍓🍌</span><i></i></div><div><span>🥭🍑</span><i></i></div><div><span>🫐🍌</span><i></i></div><div><span>🥝🥬</span><i></i></div>
        </div>`), x + 50, 70);
        addObj(`<div class="bl-counter">
            <div class="blender"><div class="lid"></div><div class="jar"><div class="mix"></div><span>🍓</span><span>🍌</span></div><div class="base"><i></i></div></div>
            <div class="cup c1"></div><div class="cup c2"></div>
            <div class="top"></div><div class="front"></div>
            <div class="tap-hint" style="left:116px;top:-44px">👇</div>
        </div>`, x + 260, 222, x + 380, (node) => openBlender());
        addObj('<div class="bl-crate"><span>🍓🍌🥭</span><span>🍓🥝🍑</span></div>', x + 560, 330, x + 600, (node) => {
            bounceEl(node, 'jump');
            [0, 100, 200].forEach(t => setTimeout(() => playTone(600 + Math.random() * 300, 0.06, 0.1, 'triangle'), t));
            sparkleShower(x + 620, 320, 14);
        });
        [x + 690, x + 160].forEach(sx => addObj('<div class="bl-stool"><div class="seat"></div><div class="leg"></div><div class="foot"></div></div>', sx, 330, sx + 30, (node) => {
            bounceEl(node, 'wobble');
            playFreqSweep(500, 800, 0.2, 0.08);
        }));
    }
});

/* ─────────── Smoothie maken (overlay) ─────────── */
const blEl = document.getElementById('blOv');
let blendOpen = false;
const bl = { items: [], progress: 0, blended: false, holding: false, holdT: null, glass: null, cream: false, sprinkles: false, made: 0, busy: false };

const blFruitCount = () => bl.items.filter(i => i.fruit).length;
const blLiquidCount = () => bl.items.filter(i => !i.fruit && i.key !== 'ijs').length;

function blHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const sat = d / (1 - Math.abs(2 * l - 1));
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, sat, l];
}

function blRgb([h, sat, l]) {
    const c = (1 - Math.abs(2 * l - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [r, g, b].map(v => (v + m) * 255);
}

// Hue on the paint wheel (red-yellow-blue) and back, so mixing works like paint:
// red + yellow = orange, yellow + blue = green, blue + red = purple
const BL_WHEEL = [[0, 0], [30, 60], [60, 120], [120, 180], [240, 240], [300, 300], [360, 360]];
function blWheel(h, back) {
    const a = back ? 1 : 0, b = back ? 0 : 1;
    for (let i = 1; i < BL_WHEEL.length; i++) {
        const p = BL_WHEEL[i - 1], q = BL_WHEEL[i];
        if (h <= q[a]) return p[b] + (h - p[a]) / (q[a] - p[a]) * (q[b] - p[b]);
    }
    return h;
}

// Mixing real fruit colours quickly turns brown, so mix around the paint wheel: it stays bright and yummy
function blColor(items) {
    const fr = items.filter(i => i.fruit);
    if (!fr.length) return BL_WHITE;
    let hx = 0, hy = 0, sat = 0, l = 0;
    fr.forEach(f => {
        const [h, s2, l2] = blHsl(f.c);
        const w = blWheel(h, false) * Math.PI / 180;
        hx += Math.cos(w);
        hy += Math.sin(w);
        sat += s2 / fr.length;
        l += l2 / fr.length;
    });
    const h = blWheel((Math.atan2(hy, hx) * 180 / Math.PI + 360) % 360, true);
    const c = blRgb([h, Math.max(0.6, sat), Math.min(0.6, Math.max(0.45, l))]);
    // Milk and yoghurt make it creamier (lighter)
    const t = Math.min(0.5, items.filter(i => !i.fruit && i.key !== 'ijs').length / items.length * 0.7);
    return c.map((v, i) => v + (BL_WHITE[i] - v) * t);
}

function blName(items) {
    const names = [...new Set(items.filter(i => i.fruit).map(i => i.name))];
    if (!names.length) return 'melkshake';
    if (names.length >= 4) return 'tuttifruttismoothie';
    return names.join('-') + 'smoothie';
}

function blRender() {
    const jar = document.getElementById('blJar');
    const chunks = document.getElementById('blChunks');
    chunks.innerHTML = '';
    let row = 0, col = 0;
    bl.items.forEach((it, i) => {
        if (!it.fruit && it.key !== 'ijs') return;
        const s = el(`<span class="bl-chunk" style="left:${12 + col * 26 + (row % 2) * 12}%;bottom:${6 + row * 17}%;--r:${(i * 47) % 60 - 30}deg">${it.icon}</span>`);
        chunks.appendChild(s);
        if (++col >= 3) { col = 0; row++; }
    });
    const liq = blLiquidCount();
    const milk = document.getElementById('blMilk');
    milk.style.height = (liq * 11) + '%';
    milk.style.opacity = 1 - bl.progress;
    const mix = document.getElementById('blMix');
    mix.style.background = `rgb(${blColor(bl.items).map(Math.round).join(',')})`;
    mix.style.height = bl.items.length ? (Math.min(BL_MAX, bl.items.length) / BL_MAX * 80) + '%' : '0%';
    mix.style.opacity = bl.items.length ? bl.progress : 0;
    chunks.style.opacity = 1 - bl.progress;
    chunks.style.transform = `scale(${1 - bl.progress * 0.5})`;
    jar.classList.toggle('done', bl.blended);
    // The glass
    const g = document.getElementById('blGlass');
    const fill = document.getElementById('blFill');
    fill.style.height = bl.glass ? '78%' : '0%';
    if (bl.glass) fill.style.background = `rgb(${blColor(bl.glass).map(Math.round).join(',')})`;
    g.classList.toggle('cream', bl.cream);
    g.classList.toggle('sprinkles', bl.sprinkles);
    // Hints
    const n = bl.items.length;
    const hint = bl.glass ? (bl.cream ? '🥤 Opdrinken!' : '🍦 Slagroom erop?') : !n ? '🍓 Doe fruit in de blender!' : !blLiquidCount() && !bl.blended ? '🥛 Een scheutje melk?' : !bl.blended ? '⚡ Houd de knop ingedrukt!' : '🥤 Inschenken!';
    document.getElementById('blHint').textContent = hint;
    const next = bl.glass ? (bl.cream ? 'drink' : 'cream') : n && blLiquidCount() && !bl.blended ? 'blend' : bl.blended ? 'pour' : null;
    document.querySelectorAll('.bl-tool').forEach(b => b.classList.toggle('next', !bl.busy && b.dataset.t === next));
}

function blAdd(item, btn) {
    if (bl.busy || bl.holding) return;
    if (bl.glass) { speak('Drink eerst je smoothie op!'); return; }
    if (bl.items.length >= BL_MAX) {
        bounceEl(document.getElementById('blJar'), 'nope');
        playTone(220, 0.15, 0.1, 'triangle');
        speak('De blender is vol!');
        return;
    }
    bl.items.push(item);
    if (bl.blended || bl.progress) { bl.blended = false; bl.progress = Math.min(bl.progress, 0.6); }
    ovFly(blEl, btn, document.getElementById('blJar'), item.icon, 450).then(() => {
        if (!blendOpen) return;
        if (item.fruit) playTone(260, 0.08, 0.15, 'triangle');
        else if (item.key === 'ijs') { playTone(2600, 0.05, 0.1, 'sine'); setTimeout(() => playTone(3000, 0.05, 0.08, 'sine'), 80); }
        else { startNoise('shower'); setTimeout(stopNoise, 350); }
        blRender();
    });
    if (bl.items.filter(i => i.key === item.key).length === 1) speak(item.name);
}

function blStartHold() {
    if (bl.busy || bl.glass || !bl.items.length || bl.blended || bl.holding) return;
    bl.holding = true;
    document.getElementById('blBlender').classList.add('on');
    startNoise('blend');
    bl.holdT = setInterval(() => {
        bl.progress = Math.min(1, bl.progress + 0.04);
        playTone(90 + bl.progress * 90, 0.09, 0.05, 'sawtooth');
        blRender();
        if (bl.progress >= 1) {
            bl.blended = true;
            blStopHold();
            playCorrect();
            ovCheer(blEl, document.getElementById('blJar'), ['✨', '💫', '⭐']);
            speak(blFruitCount() ? `Een ${blName(bl.items)}!` : 'Een melkshake!');
            blRender();
        }
    }, 100);
}

function blStopHold() {
    if (!bl.holding) return;
    bl.holding = false;
    clearInterval(bl.holdT);
    stopNoise();
    document.getElementById('blBlender').classList.remove('on');
    blRender();
}

function blTool(t, btn) {
    if (bl.busy) return;
    if (t === 'pour') {
        if (!bl.blended) { bounceEl(btn, 'nope'); speak(bl.items.length ? 'Eerst mixen!' : 'De blender is nog leeg!'); return; }
        bl.busy = true;
        const b = document.getElementById('blBlender');
        b.classList.add('pour');
        const st = document.getElementById('blStream');
        st.style.background = document.getElementById('blMix').style.background;
        st.classList.remove('go'); void st.offsetWidth; st.classList.add('go');
        for (let i = 0; i < 6; i++) setTimeout(() => playTone(420 - i * 30, 0.08, 0.07, 'sine'), 300 + i * 100);
        setTimeout(() => {
            bl.glass = bl.items;
            bl.items = [];
            bl.progress = 0;
            bl.blended = false;
            blRender();
        }, 500);
        setTimeout(() => { b.classList.remove('pour'); bl.busy = false; blRender(); }, 1100);
    } else if (t === 'cream') {
        if (!bl.glass) { bounceEl(btn, 'nope'); return; }
        bl.cream = true;
        startNoise('shower'); setTimeout(stopNoise, 300);
        playFreqSweep(900, 500, 0.3, 0.08);
        blRender();
    } else if (t === 'sprinkles') {
        if (!bl.glass) { bounceEl(btn, 'nope'); return; }
        bl.sprinkles = true;
        for (let i = 0; i < 8; i++) setTimeout(() => playTone(1800 + Math.random() * 1200, 0.03, 0.05, 'sine'), i * 40);
        blRender();
    } else if (t === 'drink') {
        blDrink();
    } else if (t === 'reset') {
        blStopHold();
        Object.assign(bl, { items: [], progress: 0, blended: false, glass: null, cream: false, sprinkles: false });
        _playWhoosh();
        blRender();
    }
}

function blDrink() {
    if (!bl.glass) { speak(bl.blended ? 'Eerst inschenken!' : 'Maak eerst een smoothie!'); return; }
    bl.busy = true;
    blRender();
    const g = document.getElementById('blGlass');
    g.classList.add('straw');
    const fill = document.getElementById('blFill');
    for (let i = 0; i < 6; i++) setTimeout(() => playFreqSweep(240 + Math.random() * 60, 150, 0.18, 0.1), 300 + i * 260);
    setTimeout(() => { fill.style.transition = 'height 1.6s linear'; fill.style.height = '0%'; g.classList.remove('cream', 'sprinkles'); }, 300);
    setTimeout(() => {
        fill.style.transition = '';
        const items = bl.glass;
        const fr = items.filter(i => i.fruit);
        const liq = items.filter(i => !i.fruit && i.key !== 'ijs').length;
        let mood, say;
        if (!fr.length) { mood = '😊'; say = 'Een lekkere melkshake!'; }
        else if (!liq) { mood = '😅'; say = 'Wel heel dik! Een beetje melk of yoghurt erbij maakt hem lekker romig.'; }
        else if (fr.some(f => f.key === 'spinazie')) { mood = '💪'; say = `Een groene ${blName(items)}! Super gezond!`; }
        else { mood = '😋'; say = `Mmm! Een lekkere ${blName(items)}!`; }
        const face = document.getElementById('blFace');
        face.textContent = mood;
        face.classList.remove('show'); void face.offsetWidth; face.classList.add('show');
        if (mood !== '😅') {
            playCorrect();
            ovCheer(blEl, g, ['💖', '✨', ...fr.slice(0, 2).map(f => f.icon)]);
            bl.made++;
            document.getElementById('blCount').textContent = `🥤 ${bl.made}`;
        } else {
            playTone(300, 0.2, 0.1, 'triangle');
        }
        speak(say);
        // A creamy moustache now and then
        if (bl.cream && Math.random() < 0.5) setTimeout(() => showToast('🥛 Slagroomsnor! 😂', 1600), 1200);
        Object.assign(bl, { glass: null, cream: false, sprinkles: false });
        setTimeout(() => { g.classList.remove('straw'); bl.busy = false; blRender(); }, 1500);
    }, 2000);
}

const blFruitsEl = document.getElementById('blFruits');
BL_FRUITS.map(f => ({ ...f, fruit: true })).concat(BL_LIQUIDS.map(l => ({ ...l, fruit: false }))).forEach(item => {
    const b = el(`<button class="bl-ing${item.fruit ? '' : ' liq'}" aria-label="${item.name}">${item.icon}</button>`);
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); blAdd(item, b); });
    blFruitsEl.appendChild(b);
});
document.querySelectorAll('.bl-tool').forEach(b => {
    if (b.dataset.t === 'blend') {
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); b.setPointerCapture(e.pointerId); blStartHold(); });
        b.addEventListener('pointerup', blStopHold);
        b.addEventListener('pointercancel', blStopHold);
        b.addEventListener('lostpointercapture', blStopHold);
        return;
    }
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); blTool(b.dataset.t, b); });
});
// The button on the blender itself works too
const blBase = document.getElementById('blBase');
blBase.addEventListener('pointerdown', (e) => { e.stopPropagation(); blBase.setPointerCapture(e.pointerId); blStartHold(); });
blBase.addEventListener('pointerup', blStopHold);
blBase.addEventListener('pointercancel', blStopHold);
blBase.addEventListener('lostpointercapture', blStopHold);

function openBlender() {
    blendOpen = true;
    blEl.classList.add('open');
    Object.assign(bl, { items: [], progress: 0, blended: false, glass: null, cream: false, sprinkles: false, busy: false });
    document.getElementById('blGlass').classList.remove('straw');
    blRender();
    speak('Smoothie maken! Doe fruit in de blender.');
}

function closeBlender() {
    blStopHold();
    blendOpen = false;
    stopNoise();
    if (window.speechSynthesis) speechSynthesis.cancel();
    blEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('blClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeBlender(); });
blEl.addEventListener('pointerdown', (e) => e.stopPropagation());
