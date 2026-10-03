/* 💇‍♀️ Kapsalon: kapsels, haarkleur, speldjes en glitter (de kapsels staan in js/core.js) */
defineRoom({
    key: 'kapsalon',
    name: 'Kapsalon',
    icon: '💇‍♀️',
    say: 'De kapsalon',
    build(x) {
        addObj('<div class="barber-pole"><div class="cap"></div><div class="stripes"></div><div class="cap"></div></div>', x + 40, 150, x + 70, (node) => {
            node.classList.toggle('fast');
            playFreqSweep(400, 1200, 0.3, 0.12);
        });
        addObj(`<div class="salon-station">
            <div class="ss-mirror">${[...Array(10)].map((_, i) => `<span class="bulb" style="--i:${i}"></span>`).join('')}<div class="glass"></div></div>
            <div class="ss-table"><span>✂️</span><span>🪮</span><span>🧴</span></div>
            <div class="ss-chair"><div class="back"></div><div class="seat"></div><div class="pole"></div><div class="foot"></div></div>
            <div class="tap-hint" style="left:90px;top:-44px">👇</div>
        </div>`, x + 140, 90, x + 240, openSalon);
        place(el('<div class="hood-chair"><div class="back"></div><div class="seat"></div><div class="leg"></div></div>'), x + 440, 300);
        const hood = place(el('<div class="dryer-hood" id="dryerHood"><div class="dome"></div><div class="arm"></div></div>'), x + 445, 250);
        addObj('<div class="hood-hit"><div class="tap-hint" style="left:40px;top:-40px">👇</div></div>', x + 440, 240, x + 500, () => hoodDry(hood));
        addObj(`<div class="salon-shelf">
            <div class="board" style="top:60px"></div><div class="board" style="top:130px"></div>
            <span style="left:6px;top:14px">🧴</span><span style="left:52px;top:18px">🫧</span><span style="left:96px;top:12px">💐</span>
            <span style="left:10px;top:86px">🎀</span><span style="left:56px;top:84px">👑</span><span style="left:100px;top:86px">💅</span>
        </div>`, x + 610, 120, x + 680, (node) => {
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
            for (let i = 0; i < 26; i++) spawnSparkle(p.x + (Math.random() - 0.5) * 120, p.y + 40, { vy: -50 - Math.random() * 40, vx: (Math.random() - 0.5) * 40, g: -20, hue: 190 + Math.random() * 140, size: 5 + Math.random() * 6, max: 1.6 });
            [1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 0.08, 'sine'), i * 80));
        });
    }
});

// Droogkap: brrr... en dan een verrassingskapsel!
function hoodDry(hood) {
    if (state.busy) return;
    state.busy = true;
    state.facing = 1;
    const pr = princessEl();
    hood.classList.add('on');
    pr.classList.add('blowdry');
    startNoise('dryer');
    const iv = setInterval(() => spawnSparkle(state.x + (Math.random() - 0.5) * 90, 290 + Math.random() * 40, { vx: (Math.random() - 0.5) * 120, vy: 30, g: 0, hue: 330 + Math.random() * 60, size: 3 + Math.random() * 3, max: 0.6 }), 60);
    setTimeout(() => {
        clearInterval(iv);
        stopNoise();
        hood.classList.remove('on');
        pr.classList.remove('blowdry');
        const others = HAIRDOS.filter(([k]) => k !== state.look.hairdo);
        state.look.hairdo = randomPick(others)[0];
        applyLook();
        saveLook();
        twirl();
        sparkleShower(state.x, 150, 50);
        playWin();
        showToast(`✨ Verrassing: ${HAIRDOS.find(([k]) => k === state.look.hairdo)[1]}!`);
        state.busy = false;
    }, 3000);
}

/* ─────────── Kapsalon (overlay) ─────────── */
const salonEl = document.getElementById('salonOv');
let salonOpen = false;
let salonTab = 'hairdo';
let salonBusy = false;
const SALON_TABS = [['hairdo', '✂️'], ['hair', '🎨'], ['clip', '🎀']];

function hairColors(i) {
    const h = HAIRS[i];
    return h === 'rainbow' ? ['#f472b6', '#60a5fa'] : h;
}

// Little head with one hairdo, for the buttons
function hairThumb(v) {
    const pre = 'ht' + v;
    const [c0, c1] = hairColors(state.look.hair);
    return `<svg viewBox="16 6 68 92" width="66" height="66" data-thumb="${v}">
        <defs><linearGradient id="${pre}hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>
        ${HAIRDO_BACK(pre)}
        <path d="M38 64 Q50 60 62 64 L63 82 Q50 86 37 82 Z" fill="#f472b6"/>
        <rect x="46" y="54" width="8" height="10" fill="#ffd7c2"/>
        <circle cx="50" cy="40" r="18" fill="#ffe4d6"/>
        <path d="M32 40 Q32 20 50 20 Q68 20 68 40 Q62 28 54 30 Q48 26 42 31 Q36 30 32 40 Z" fill="url(#${pre}hair)"/>
        <ellipse cx="43" cy="42" rx="2.6" ry="3.4" fill="#3b0764"/><ellipse cx="57" cy="42" rx="2.6" ry="3.4" fill="#3b0764"/>
        <path d="M45 50 Q50 55 55 50" fill="none" stroke="#be123c" stroke-width="2" stroke-linecap="round"/>
        ${HAIRDO_FRONT(pre)}
    </svg>`;
}

function renderSalonTabs() {
    const box = document.getElementById('salonTabs');
    box.innerHTML = SALON_TABS.map(([k, ic]) => `<button class="du-tab${salonTab === k ? ' active' : ''}" data-k="${k}">${ic}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        salonTab = b.dataset.k;
        renderSalonTabs();
        renderSalonOpts();
        playPop();
    }));
}

function renderSalonOpts() {
    const box = document.getElementById('salonOpts');
    const look = state.look;
    if (salonTab === 'hairdo') {
        box.innerHTML = HAIRDOS.map(([v]) => `<button class="du-opt salon-opt${look.hairdo === v ? ' sel' : ''}" data-v="${v}">${hairThumb(v)}</button>`).join('');
        box.querySelectorAll('svg[data-thumb]').forEach(svg => svg.querySelectorAll('.lk').forEach(g => {
            g.style.display = g.dataset.v === svg.dataset.thumb ? '' : 'none';
        }));
    } else if (salonTab === 'hair') {
        box.innerHTML = HAIRS.map((h, i) => `<button class="du-opt${look.hair === i ? ' sel' : ''}" data-v="${i}"><span class="sw" style="background:${h === 'rainbow' ? dressSwatch('rainbow') : `linear-gradient(180deg, ${h[0]}, ${h[1]})`}"></span></button>`).join('');
    } else {
        box.innerHTML = HAIR_CLIPS.map(([v, ic]) => `<button class="du-opt${look.clip === v ? ' sel' : ''}" data-v="${v}">${ic}</button>`).join('');
    }
    box.querySelectorAll('.du-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickSalon(salonTab, b.dataset.v);
    }));
}

// Point in the preview princess (svg units) -> overlay pixels
function salonPt(x, y) {
    const svg = document.querySelector('#salonPreview svg');
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const p = pt.matrixTransform(svg.getScreenCTM());
    const o = salonEl.getBoundingClientRect();
    return { x: p.x - o.left, y: p.y - o.top };
}

function salonSpan(cls, text, p) {
    const s = document.createElement('span');
    s.className = cls;
    if (text) s.textContent = text;
    s.style.left = p.x + 'px';
    s.style.top = p.y + 'px';
    salonEl.appendChild(s);
    return s;
}

function salonSparkle() {
    const pv = document.getElementById('salonPreview');
    pv.classList.remove('pop');
    void pv.offsetWidth;
    pv.classList.add('pop');
    const c = salonPt(50, 45);
    for (let i = 0; i < 12; i++) {
        const s = salonSpan('scope-spark', randomPick(['✨', '⭐', '💖', '🌟']), c);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 90;
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        setTimeout(() => s.remove(), 900);
    }
    [1319, 1760].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.08, 'sine'), i * 60));
}

function salonApply(fn) {
    fn();
    applyLook();
    renderSalonOpts();
    salonSparkle();
}

function pickSalon(tab, v) {
    if (salonBusy) return;
    if (tab === 'hairdo') {
        if (state.look.hairdo === v) return;
        // Knip knip knip!
        salonBusy = true;
        const a = salonPt(20, 40);
        const b = salonPt(84, 70);
        const sc = salonSpan('salon-tool', '✂️', a);
        sc.style.setProperty('--tx', (b.x - a.x) + 'px');
        sc.style.setProperty('--ty', (b.y - a.y) + 'px');
        sc.classList.add('snip');
        [0, 220, 440].forEach(d => setTimeout(() => {
            playFreqSweep(2400, 1600, 0.06, 0.12);
            const h = hairColors(state.look.hair);
            const bit = salonSpan('hair-bit', '', salonPt(30 + Math.random() * 40, 50 + Math.random() * 30));
            bit.style.background = h[0];
            setTimeout(() => bit.remove(), 1000);
        }, d));
        setTimeout(() => {
            sc.remove();
            salonApply(() => { state.look.hairdo = v; });
            salonBusy = false;
        }, 700);
    } else if (tab === 'hair') {
        // Kleurspray
        salonBusy = true;
        const [c0, c1] = hairColors(+v);
        const can = salonSpan('salon-tool', '🧴', salonPt(86, 20));
        can.classList.add('spray');
        playFreqSweep(3000, 2000, 0.6, 0.05);
        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                const m = salonSpan('hair-mist', '', salonPt(26 + Math.random() * 48, 22 + Math.random() * 60));
                m.style.background = i % 2 ? c0 : c1;
                setTimeout(() => m.remove(), 900);
            }, i * 30);
        }
        setTimeout(() => {
            can.remove();
            salonApply(() => { state.look.hair = +v; });
            salonBusy = false;
        }, 650);
    } else {
        salonApply(() => { state.look.clip = v; });
        playFreqSweep(600, 1400, 0.2, 0.1);
    }
}

function salonWash() {
    if (salonBusy) return;
    salonBusy = true;
    const foam = [];
    for (let i = 0; i < 26; i++) {
        setTimeout(() => {
            const a = Math.random() * Math.PI;
            const r = 14 + Math.random() * 12;
            const f = salonSpan('salon-foam', '', salonPt(50 + Math.cos(a) * r * 1.2, 36 - Math.sin(a) * r));
            const size = 18 + Math.random() * 22;
            f.style.width = f.style.height = size + 'px';
            foam.push(f);
            playTone(600 + Math.random() * 600, 0.05, 0.05, 'sine');
        }, i * 50);
    }
    setTimeout(() => {
        foam.forEach(f => f.classList.add('rinse'));
        [400, 600, 500, 700].forEach((f, i) => setTimeout(() => playFreqSweep(f, f * 0.6, 0.2, 0.1), i * 140));
    }, 1900);
    setTimeout(() => {
        foam.forEach(f => f.remove());
        salonSparkle();
        playCorrect();
        salonBusy = false;
    }, 2600);
}

function salonDry() {
    if (salonBusy) return;
    salonBusy = true;
    const pv = document.getElementById('salonPreview');
    pv.classList.add('blow');
    startNoise('dryer');
    const dryer = salonSpan('salon-tool', '💨', salonPt(92, 34));
    dryer.classList.add('dryer');
    const iv = setInterval(() => {
        const w = salonSpan('salon-wind', '〰️', salonPt(86, 20 + Math.random() * 50));
        setTimeout(() => w.remove(), 700);
    }, 120);
    setTimeout(() => {
        clearInterval(iv);
        stopNoise();
        dryer.remove();
        pv.classList.remove('blow');
        salonSparkle();
        salonBusy = false;
    }, 2000);
}

function openSalon() {
    salonOpen = true;
    salonEl.classList.add('open');
    const pv = document.getElementById('salonPreview');
    if (!pv.firstElementChild) {
        pv.innerHTML = princessSVG('hs');
        pv.firstElementChild.setAttribute('viewBox', '4 -14 92 132'); // close-up of the hair
    }
    applyLook();
    renderSalonTabs();
    renderSalonOpts();
    playMusicBox();
}

function closeSalon() {
    salonOpen = false;
    salonBusy = false;
    stopNoise();
    salonEl.classList.remove('open');
    salonEl.querySelectorAll('.salon-tool, .salon-foam, .hair-mist, .hair-bit, .salon-wind').forEach(n => n.remove());
    document.getElementById('salonPreview').classList.remove('blow');
    saveLook();
    twirl();
    burst(state.x, 320, 50);
    playSparkleSound();
}

[['salonWash', salonWash], ['salonDry', salonDry]].forEach(([id, fn]) => {
    document.getElementById(id).addEventListener('pointerdown', (e) => { e.stopPropagation(); fn(); });
});
document.getElementById('salonGlit').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (salonBusy) return;
    salonApply(() => { state.look.sparkle = state.look.sparkle === 'on' ? 'none' : 'on'; });
    playFreqSweep(800, 2400, 0.4, 0.1);
});
document.getElementById('salonDone').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    playWin();
    closeSalon();
});
document.getElementById('salonClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeSalon();
});
salonEl.addEventListener('pointerdown', (e) => e.stopPropagation());
