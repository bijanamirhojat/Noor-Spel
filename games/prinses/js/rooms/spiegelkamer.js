/* 🪞 Spiegelkamer */
defineRoom({
    key: 'spiegelkamer',
    name: 'Spiegelkamer',
    icon: '🪞',
    say: 'De spiegelkamer',
    // The reflection follows the princess a little
    tick() {
        const refl = document.getElementById('reflection');
        const off = Math.max(-45, Math.min(45, (state.x - (roomX('spiegelkamer') + 400)) * 0.25));
        refl.style.marginLeft = (-75 - off) + 'px';
    },
    build(r1) {
        const garland = '🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸';
        place(el(`<div class="garland">${garland}</div>`), r1 + 20, 64);
        buildMirror(r1 + 280, 70);
        addObj('<div class="emoji-obj gleam">🌷</div>', r1 + 195, 370, r1 + 230, flowerPop);
        addObj('<div class="emoji-obj gleam">💐</div>', r1 + 520, 370, r1 + 550, flowerPop);
        addObj(`<div class="beauty-table">
            <div class="bt-mirror">${[...Array(8)].map((_, i) => { const a = Math.PI * (1 + i / 7); return `<span class="bulb" style="left:${(48 + Math.cos(a) * 57).toFixed(0)}px;top:${(48 + Math.sin(a) * 57).toFixed(0)}px"></span>`; }).join('')}<div class="glass">💄</div></div>
            <div class="bt-top"><span>🧴</span><span>🥒</span><span>💄</span><span>🖌️</span></div>
            <div class="bt-body"><i></i><i></i></div>
            <div class="tap-hint" style="left:70px;top:-44px">👇</div>
        </div>`, r1 + 575, 150, r1 + 640, openBeauty);
        addObj('<div class="emoji-obj" style="font-size:52px">🎀</div>', r1 + 200, 150, r1 + 230, () => sayRandom(['Een mooie strik!', 'Roze strik!']));
    }
});

function buildMirror(x, y) {
    const flowers = ['🌸', '🌷', '🌼', '🌺', '🌸', '🌷', '🌼', '🌺', '🌸', '🌷', '🌼', '🌺', '🌸', '🌷'];
    let flowerHtml = '';
    flowers.forEach((f, i) => {
        const a = (i / flowers.length) * Math.PI * 2;
        const fx = 120 + Math.cos(a) * 110;
        const fy = 150 + Math.sin(a) * 140;
        flowerHtml += `<span class="flower" style="left:${fx}px;top:${fy}px">${f}</span>`;
    });
    const html = `<div class="mirror">
        <div class="glass"><div class="reflection" id="reflection">${princessSVG('mr')}</div></div>
        ${flowerHtml}
        <div class="tap-hint" style="top:-6px">👇</div>
    </div>`;
    addObj(html, x, y, x + 120, mirrorMagic);
}

function mirrorMagic(node) {
    state.dressIdx = (state.dressIdx + 1) % DRESSES.length;
    applyDress();
    node.classList.remove('flash');
    void node.offsetWidth;
    node.classList.add('flash');
    twirl();
    playSparkleSound();
    const mx = roomX('spiegelkamer') + 400;
    sparkleShower(mx, 70, 50);
    burst(state.x, 330, 40);
    const color = DRESSES[state.dressIdx];
    const names = { '#f472b6': 'roze', '#a855f7': 'paarse', '#38bdf8': 'blauwe', '#34d399': 'groene', '#fbbf24': 'gouden', 'rainbow': 'regenboog', '#fb7185': 'rode' };
    sayRandom([
        `Een ${names[color]} jurk! Wat mooi!`,
        'Spiegeltje, spiegeltje! Wat ben je mooi!',
        `Glitter glitter! Een ${names[color]} jurk!`
    ]);
}

function flowerPop(node) {
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    for (let i = 0; i < 30; i++) {
        spawnSparkle(p.x, p.y, { hue: 300 + Math.random() * 80, speed: 220 });
    }
    playCorrect();
    sayRandom(['Mooie bloemetjes!', 'Wat ruikt dat lekker!', 'Bloemetjes!']);
}

/* ─────────── Make-up en beauty (overlay) ───────────
   Spa: crème of een groen maskertje op het gezicht smeren, komkommers op de ogen, afvegen met het sponsje.
   Make-up: lippenstift, oogschaduw, wimpers en blush; die blijven op de prinses (state.look, MAKEUP in js/core.js). */
const beautyEl = document.getElementById('beautyOv');
let beautyOpen = false;
registerOverlay(() => beautyOpen, closeBeauty);
const BEAUTY_TABS = [['spa', '🧖‍♀️'], ['lips', '💄'], ['shadow', '👁️'], ['blush', '🌸']];
const SPA_TOOLS = [
    { t: 'cream', icon: '🧴', say: 'Crème! Smeer het op het gezicht!' },
    { t: 'mask', icon: '🟢', say: 'Een groen maskertje! Smeer maar!' },
    { t: 'cucumber', icon: '🥒', say: 'Komkommers op je ogen!' },
    { t: 'sponge', icon: '🧽', say: 'Het sponsje! Veeg alles eraf!' }
];
const BEAUTY_SAY = {
    lips: ['Lippenstift!', 'Mooie lippen!', 'Kusje!'],
    shadow: ['Oogschaduw!', 'Wat een mooie ogen!'],
    blush: ['Rode wangetjes!', 'Blosjes op je wangen!']
};
const beauty = { tab: 'spa', tool: 'cream', rubbing: false, cucumbers: false, creamSaid: false, cleanSaid: false, busy: false };

function beautySvg() { return document.querySelector('#beautyPreview svg'); }

// Point in the preview princess (svg units) -> overlay pixels, and back
function beautyPt(x, y) {
    const svg = beautySvg();
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const p = pt.matrixTransform(svg.getScreenCTM());
    const o = beautyEl.getBoundingClientRect();
    return { x: p.x - o.left, y: p.y - o.top };
}

function beautySvgPt(e) {
    const svg = beautySvg();
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function beautySpan(cls, text, p) {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    s.style.left = p.x + 'px';
    s.style.top = p.y + 'px';
    beautyEl.appendChild(s);
    return s;
}

function beautySpark(x, y, n = 8) {
    const c = beautyPt(x, y);
    for (let i = 0; i < n; i++) {
        const s = beautySpan('scope-spark', randomPick(['✨', '💖', '⭐', '🌸']), c);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 70;
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        setTimeout(() => s.remove(), 900);
    }
}

// The spa layer sits on top of the face (clipped to it), under the fringe
function beautyLayers() {
    const svg = beautySvg();
    let cream = svg.querySelector('.bt-cream');
    if (!cream) {
        const ns = 'http://www.w3.org/2000/svg';
        const clip = document.createElementNS(ns, 'clipPath');
        clip.id = 'btFace';
        clip.innerHTML = '<circle cx="50" cy="40" r="18"/>';
        svg.querySelector('defs').appendChild(clip);
        cream = document.createElementNS(ns, 'g');
        cream.setAttribute('class', 'bt-cream');
        cream.setAttribute('clip-path', 'url(#btFace)');
        const cuc = document.createElementNS(ns, 'g');
        cuc.setAttribute('class', 'bt-cuc');
        cuc.innerHTML = [43, 57].map(x => `<g transform="translate(${x},42)">
            <circle r="6" fill="#4d7c0f"/><circle r="5" fill="#d9f99d"/><circle r="3.6" fill="#ecfccb"/>
            ${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${(Math.cos(i * 1.05) * 2.4).toFixed(1)}" cy="${(Math.sin(i * 1.05) * 2.4).toFixed(1)}" r=".5" fill="#a3a33a"/>`).join('')}
        </g>`).join('');
        const lips = svg.querySelector('.mk-lips');
        lips.after(cream);
        cream.after(cuc);
    }
    return { cream, cuc: svg.querySelector('.bt-cuc') };
}

function renderBeautyTabs() {
    const box = document.getElementById('beautyTabs');
    box.innerHTML = BEAUTY_TABS.map(([k, ic]) => `<button class="du-tab${beauty.tab === k ? ' active' : ''}" data-k="${k}">${ic}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        beauty.tab = b.dataset.k;
        setBeautyHint(beauty.tab !== 'spa' ? '👆 Kies een kleur' : beauty.tool === 'sponge' ? '🧽 Veeg over het gezicht' : '👆 Wrijf over het gezicht');
        renderBeautyTabs();
        renderBeautyOpts();
        playPop();
    }));
}

function renderBeautyOpts() {
    const box = document.getElementById('beautyOpts');
    const look = state.look;
    if (beauty.tab === 'spa') {
        box.innerHTML = SPA_TOOLS.map(t => {
            const sel = t.t === 'cucumber' ? beauty.cucumbers : beauty.tool === t.t;
            return `<button class="du-opt${sel ? ' sel' : ''}" data-v="${t.t}">${t.icon}</button>`;
        }).join('');
    } else {
        const k = beauty.tab;
        const sw = (c) => `<span class="sw" style="background:${c === 'rainbow' ? dressSwatch('rainbow') : c}"></span>`;
        box.innerHTML = `<button class="du-opt${look[k] === 'none' ? ' sel' : ''}" data-v="none">🚫</button>` +
            MAKEUP[k].map(c => `<button class="du-opt${look[k] === c ? ' sel' : ''}" data-v="${c}">${sw(c)}</button>`).join('') +
            (k === 'shadow' ? `<button class="du-opt bt-lash${look.lash === 'on' ? ' sel' : ''}" data-v="lash" aria-label="Wimpers">👁️<small>wimpers</small></button>` : '');
    }
    box.querySelectorAll('.du-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickBeauty(b.dataset.v);
    }));
}

function setBeautyHint(text) {
    document.getElementById('beautyHint').textContent = text;
}

function pickBeauty(v) {
    if (beauty.busy) return;
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (beauty.tab === 'spa') {
        const tool = SPA_TOOLS.find(t => t.t === v);
        if (v === 'cucumber') {
            setCucumbers(!beauty.cucumbers);
        } else {
            beauty.tool = v;
            playPop();
            speak(tool.say);
            setBeautyHint(v === 'sponge' ? '🧽 Veeg over het gezicht' : '👆 Wrijf over het gezicht');
        }
        renderBeautyOpts();
        return;
    }
    if (v === 'lash') {
        state.look.lash = state.look.lash === 'on' ? 'none' : 'on';
        beautyApply('🖌️', [[41, 38], [59, 38]], state.look.lash === 'on' ? 'Lange wimpers!' : 'Wimpers eraf!');
        return;
    }
    const k = beauty.tab;
    if (state.look[k] === v) return;
    state.look[k] = v;
    const spots = { lips: [[50, 51]], shadow: [[43, 39], [57, 39]], blush: [[39, 48], [61, 48]] }[k];
    beautyApply(k === 'lips' ? '💄' : '🖌️', spots, v === 'none' ? 'Weg ermee!' : randomPick(BEAUTY_SAY[k]));
}

// A lipstick or brush dabs each spot, then the look changes
function beautyApply(icon, spots, say) {
    beauty.busy = true;
    const tool = beautySpan('bt-tool', icon, beautyPt(spots[0][0] + 10, spots[0][1] - 10));
    spots.forEach(([x, y], i) => setTimeout(() => {
        const p = beautyPt(x, y);
        tool.style.left = p.x + 'px';
        tool.style.top = p.y + 'px';
        tool.classList.remove('dab');
        void tool.offsetWidth;
        tool.classList.add('dab');
        playFreqSweep(700 + i * 200, 1200 + i * 200, 0.2, 0.08);
    }, 80 + i * 380));
    setTimeout(() => {
        tool.remove();
        applyLook();
        renderBeautyOpts();
        spots.forEach(([x, y]) => beautySpark(x, y, 6));
        [1319, 1760].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 0.08, 'sine'), i * 60));
        speak(say);
        beauty.busy = false;
    }, 160 + spots.length * 380);
}

function setCucumbers(on) {
    beauty.cucumbers = on;
    const { cuc } = beautyLayers();
    cuc.classList.toggle('on', on);
    document.getElementById('beautyPreview').classList.toggle('relax', on);
    if (on) {
        playFreqSweep(500, 300, 0.3, 0.1);
        speak('Komkommers op je ogen. Aaah... lekker ontspannen!');
        [523, 659, 784, 659, 523].forEach((f, i) => setTimeout(() => { if (beauty.cucumbers) playTone(f, 0.6, 0.06, 'sine'); }, 900 + i * 500));
    } else {
        playFreqSweep(300, 700, 0.25, 0.1);
        speak('Kiekeboe! Ogen weer open!');
    }
}

function beautyRub(e) {
    const tool = beauty.tool;
    const p = beautySvgPt(e);
    if (Math.hypot(p.x - 50, p.y - 40) > 22) return;
    const { cream } = beautyLayers();
    if (tool === 'sponge') {
        let wiped = 0;
        [...cream.children].forEach(b => {
            if (Math.hypot(+b.getAttribute('cx') - p.x, +b.getAttribute('cy') - p.y) < 7) { b.remove(); wiped++; }
        });
        if (Math.random() < 0.3) beautySpan('bt-bubble', '🫧', beautyPt(p.x, p.y)).addEventListener('animationend', (ev) => ev.target.remove());
        if (wiped) playTone(900 + Math.random() * 500, 0.05, 0.05, 'sine');
        if (wiped && !cream.children.length && !beauty.cleanSaid) {
            beauty.cleanSaid = true;
            beauty.creamSaid = false;
            beautySpark(50, 40, 12);
            playCorrect();
            speak('Helemaal schoon! Wat een zacht velletje!');
        }
        return;
    }
    if (cream.children.length > 220) return;
    const b = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    b.setAttribute('cx', (p.x + (Math.random() - 0.5) * 2).toFixed(1));
    b.setAttribute('cy', (p.y + (Math.random() - 0.5) * 2).toFixed(1));
    b.setAttribute('r', (3.4 + Math.random() * 1.6).toFixed(1));
    b.setAttribute('fill', tool === 'mask' ? '#86efac' : '#fffbf5');
    b.setAttribute('stroke', tool === 'mask' ? '#4ade80' : '#f3e1d3');
    b.setAttribute('stroke-width', '0.4');
    cream.appendChild(b);
    beauty.cleanSaid = false;
    if (Math.random() < 0.25) playTone(300 + Math.random() * 150, 0.06, 0.05, 'sine');
    if (cream.children.length > 40 && !beauty.creamSaid) {
        beauty.creamSaid = true;
        speak(randomPick(['Smeer smeer! Wat een lekker romig gezichtje!', 'Zo wordt je huid heel zacht!']));
    }
}

const beautyPreview = document.getElementById('beautyPreview');
beautyPreview.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (beauty.tab !== 'spa' || beauty.busy) return;
    beauty.rubbing = true;
    beautyRub(e);
});
beautyPreview.addEventListener('pointermove', (e) => {
    if (beauty.rubbing && beauty.tab === 'spa') beautyRub(e);
});
window.addEventListener('pointerup', () => { beauty.rubbing = false; });

function beautyWipeAll() {
    const { cream } = beautyLayers();
    cream.innerHTML = '';
    if (beauty.cucumbers) setCucumbers(false);
    Object.assign(state.look, { lips: 'none', shadow: 'none', blush: 'none', lash: 'none' });
    applyLook();
    renderBeautyOpts();
    beautySpark(50, 40, 12);
    playFreqSweep(600, 200, 0.4, 0.15);
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak('Alles eraf! Opnieuw beginnen!');
}

function openBeauty() {
    beautyOpen = true;
    beautyEl.classList.add('open');
    if (!beautyPreview.firstElementChild) {
        beautyPreview.innerHTML = princessSVG('bt');
        beautySvg().setAttribute('viewBox', '22 12 56 56'); // close-up of the face
    }
    beauty.tab = 'spa';
    beauty.tool = 'cream';
    setBeautyHint('👆 Wrijf over het gezicht');
    applyLook();
    renderBeautyTabs();
    renderBeautyOpts();
    playMusicBox();
    speak('Beautysalon! Smeer crème op je gezicht, doe komkommers op je ogen, of kies make-up!');
}

function closeBeauty() {
    beautyOpen = false;
    beauty.busy = false;
    beautyEl.classList.remove('open');
    beautyEl.querySelectorAll('.bt-tool, .bt-bubble, .scope-spark').forEach(n => n.remove());
    if (beautySvg()) {
        beautyLayers().cream.innerHTML = '';
        if (beauty.cucumbers) {
            beauty.cucumbers = false;
            beautyLayers().cuc.classList.remove('on');
            beautyPreview.classList.remove('relax');
        }
    }
    saveLook();
    twirl();
    burst(state.x, 320, 50);
    playSparkleSound();
    const l = state.look;
    if (l.lips !== 'none' || l.shadow !== 'none' || l.blush !== 'none' || l.lash === 'on') {
        sayRandom(['Wat ben je mooi opgemaakt, prinses!', 'Spiegeltje, spiegeltje! Wat zie je er mooi uit!']);
    }
}

document.getElementById('beautyWash').addEventListener('pointerdown', (e) => { e.stopPropagation(); beautyWipeAll(); });
document.getElementById('beautyDone').addEventListener('pointerdown', (e) => { e.stopPropagation(); playWin(); closeBeauty(); });
document.getElementById('beautyClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeBeauty(); });
beautyEl.addEventListener('pointerdown', (e) => e.stopPropagation());
