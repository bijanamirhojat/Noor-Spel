/* 💅 Nagelsalon */
defineRoom({
    key: 'nagelsalon',
    name: 'Nagelsalon',
    icon: '💅',
    say: 'De nagelsalon',
    build(rs) {
        const bottleColors = ['#f472b6', '#ef4444', '#a855f7', '#38bdf8', '#34d399', '#fbbf24', '#fb923c', '#e5e7eb'];
        addObj(`<div class="vanity">
            <div class="vmirror">💅</div>
            <div class="bottles">${bottleColors.map(c => `<span class="mini-bottle" style="background:${c}"></span>`).join('')}</div>
            <div class="vtop"></div><div class="vbody"></div>
            <div class="tap-hint" style="top:-40px">👇</div>
        </div>`, rs + 260, 200, rs + 580, openNails);
        place(el('<div class="stool"></div>'), rs + 355, 340);
        addObj('<div class="frame" style="font-size:56px">💅</div>', rs + 70, 110, rs + 130, () => sayRandom(['Nagels lakken!', 'Welke kleur kies jij?']));
        addObj('<div class="frame" style="font-size:56px">💖</div>', rs + 610, 110, rs + 670, () => { sayRandom(['Een hartje!', 'Ik hou van glitter!']); sparkleShower(rs + 670, 150, 30); });
    }
});

/* ─────────── Nagelsalon ─────────── */
const nailsEl = document.getElementById('nails');
const handsSvg = document.getElementById('hands');
let nailsOpen = false;
const NAIL_COLORS = [
    { c: '#f472b6', name: 'Roze!' },
    { c: '#ef4444', name: 'Rood!' },
    { c: '#a855f7', name: 'Paars!' },
    { c: '#38bdf8', name: 'Blauw!' },
    { c: '#34d399', name: 'Groen!' },
    { c: 'gold', name: 'Goud!', css: 'linear-gradient(135deg, #fde68a, #f59e0b, #fef3c7, #d97706)' },
    { c: 'rainbow', name: 'Regenboog!', css: 'linear-gradient(180deg, #ef4444, #fb923c, #facc15, #4ade80, #60a5fa, #c084fc)' },
    { c: 'silver', name: 'Zilver glitter!', css: 'radial-gradient(circle, #fff 2px, transparent 3px) 0 0 / 10px 10px, linear-gradient(135deg, #e5e7eb, #9ca3af, #f9fafb)' }
];
const STICKERS = [
    { s: '💎', name: 'Een diamantje!' },
    { s: '⭐', name: 'Een sterretje!' },
    { s: '💖', name: 'Een hartje!' },
    { s: '🌸', name: 'Een bloemetje!' },
    { s: '🦄', name: 'Een eenhoorn!' }
];
const RINGS = [
    { band: 'url(#ngold)', gem: '#f472b6' },
    { band: 'url(#nsilverBase)', gem: '#38bdf8' },
    { band: '#fda4af', gem: '#ef4444', heart: true },
    { band: 'url(#ngold)', gem: '#a855f7' },
    { band: 'url(#nrb)', gem: '#ffffff' }
];

function ringSVG(r, w) {
    const gem = r.heart
        ? `<path d="M0 ${-w * 0.1} C${-w * 0.4} ${-w * 0.46} ${-w * 0.44} ${-w * 0.02} 0 ${w * 0.2} C${w * 0.44} ${-w * 0.02} ${w * 0.4} ${-w * 0.46} 0 ${-w * 0.1} Z" fill="${r.gem}" stroke="#fff" stroke-width="2" transform="translate(0,${-w * 0.2})"/>`
        : `<circle cx="0" cy="${-w * 0.22}" r="${w * 0.28}" fill="${r.gem}" stroke="#fff" stroke-width="2.5"/>
           <circle cx="${-w * 0.09}" cy="${-w * 0.31}" r="${w * 0.08}" fill="#fff" opacity=".9"/>`;
    return `<rect x="${-w / 2 - 4}" y="-7" width="${w + 8}" height="14" rx="7" fill="${r.band}" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>
        <rect x="${-w / 2}" y="-4" width="${w}" height="3.5" rx="1.75" fill="#fff" opacity=".55"/>
        ${gem}`;
}

let nailTool = { type: 'color', value: '#f472b6' };
let nails = [];
let nailPainting = false;

function nailFill(c) {
    if (c === 'gold') return 'url(#ngold)';
    if (c === 'rainbow') return 'url(#nrb)';
    if (c === 'silver') return 'url(#nsilver)';
    return c;
}

function buildHands() {
    const skin = '#ffd7c2';
    const fingers = [
        { x: -94, y: 330, a: -52, len: 96, w: 52 },
        { x: -64, y: 252, a: -10, len: 126, w: 46 },
        { x: -18, y: 240, a: -3, len: 146, w: 48 },
        { x: 28, y: 242, a: 4, len: 134, w: 46 },
        { x: 70, y: 262, a: 12, len: 104, w: 40 }
    ];
    let html = `<defs>
        <linearGradient id="nrb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ef4444"/><stop offset=".2" stop-color="#fb923c"/><stop offset=".4" stop-color="#facc15"/>
            <stop offset=".6" stop-color="#4ade80"/><stop offset=".8" stop-color="#60a5fa"/><stop offset="1" stop-color="#c084fc"/>
        </linearGradient>
        <linearGradient id="ngold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fde68a"/><stop offset=".4" stop-color="#f59e0b"/><stop offset=".7" stop-color="#fef3c7"/><stop offset="1" stop-color="#d97706"/>
        </linearGradient>
        <pattern id="nsilverDots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#fff"/></pattern>
        <linearGradient id="nsilverBase" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#e5e7eb"/><stop offset=".5" stop-color="#9ca3af"/><stop offset="1" stop-color="#f9fafb"/>
        </linearGradient>
        <linearGradient id="nsilver" href="#nsilverBase"/>
    </defs>`;
    let idx = 0;
    [[230, true], [590, false]].forEach(([cx, mirror]) => {
        html += `<g transform="translate(${cx},0) scale(${mirror ? -1 : 1},1)">`;
        html += `<rect x="-72" y="320" width="144" height="140" rx="30" fill="${skin}"/>`;
        html += `<ellipse cx="0" cy="320" rx="100" ry="100" fill="${skin}"/>`;
        fingers.forEach(f => {
            const i = idx++;
            const nw = f.w * 0.8, nh = f.w * 1.1;
            const nx = -nw / 2, ny = -f.len + 6;
            html += `<g class="finger" data-nail="${i}" transform="translate(${f.x},${f.y}) rotate(${f.a})">
                <rect x="${-f.w / 2}" y="${-f.len}" width="${f.w}" height="${f.len + 40}" rx="${f.w / 2}" fill="${skin}"/>
                <path d="M${-f.w * 0.3} ${-f.len + f.w * 1.4} q${f.w * 0.3} 6 ${f.w * 0.6} 0" stroke="#f1b8a0" stroke-width="2" fill="none"/>
                <g class="ring-slot" data-w="${f.w}" transform="translate(0,${-f.len * 0.36})"></g>
                <clipPath id="nc${i}"><rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="${nw * 0.45}"/></clipPath>
                <rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="${nw * 0.45}" fill="#fde2e4" stroke="#f9a8d4" stroke-width="2"/>
                <g class="paint-layer" clip-path="url(#nc${i})"></g>
                <g class="gl" clip-path="url(#nc${i})">
                    <circle cx="${nx + nw * 0.3}" cy="${ny + nh * 0.3}" r="2.2" fill="#fff"/>
                    <circle cx="${nx + nw * 0.7}" cy="${ny + nh * 0.45}" r="1.8" fill="#fff"/>
                    <circle cx="${nx + nw * 0.4}" cy="${ny + nh * 0.75}" r="2" fill="#fff"/>
                    <circle cx="${nx + nw * 0.75}" cy="${ny + nh * 0.8}" r="1.6" fill="#fff"/>
                </g>
                <ellipse cx="${nx + nw * 0.3}" cy="${ny + nh * 0.3}" rx="${nw * 0.12}" ry="${nh * 0.2}" fill="#fff" opacity=".6"/>
                <g transform="translate(0,${ny + nh * 0.55})${mirror ? ' scale(-1,1)' : ''}">
                    <text class="stk" x="0" y="0" font-size="${nw * 0.8}" text-anchor="middle" dominant-baseline="central"></text>
                </g>
            </g>`;
        });
        html += `</g>`;
    });
    handsSvg.innerHTML = html;
    nails = Array.from({ length: idx }, () => ({ color: null, sticker: null, ring: null }));
}

function buildNailTools() {
    const palette = document.getElementById('palette');
    palette.innerHTML = NAIL_COLORS.map((c, i) =>
        `<button class="bottle-btn${i === 0 ? ' sel' : ''}" data-i="${i}" aria-label="${c.name}">
            <span class="cap"></span><span class="glass" style="background:${c.css || c.c}"></span>
        </button>`).join('');
    const tools = document.getElementById('nailTools');
    tools.innerHTML = STICKERS.map((s, i) => `<button class="tool-btn" data-s="${i}">${s.s}</button>`).join('') +
        RINGS.map((r, i) => `<button class="tool-btn" data-r="${i}"><svg viewBox="-24 -28 48 40" width="44" height="38">${ringSVG(r, 34)}</svg></button>`).join('') +
        `<button class="tool-btn wide" id="glitterBtn">✨ Glitter</button>
         <button class="tool-btn wide" id="wipeBtn">🧽 Weg</button>
         <button class="tool-btn wide" id="doneBtn">✅ Klaar!</button>`;

    const selectBtn = (btn) => {
        nailsEl.querySelectorAll('.bottle-btn, .tool-btn[data-s], .tool-btn[data-r]').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
    };
    palette.querySelectorAll('.bottle-btn').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            const c = NAIL_COLORS[+btn.dataset.i];
            nailTool = { type: 'color', value: c.c };
            selectBtn(btn);
            playPop();
            if (window.speechSynthesis) speechSynthesis.cancel();
            speak(c.name);
        });
    });
    tools.querySelectorAll('.tool-btn[data-r]').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            nailTool = { type: 'ring', value: +btn.dataset.r };
            selectBtn(btn);
            playTone(1500, 0.15, 0.12, 'triangle');
        });
    });
    tools.querySelectorAll('.tool-btn[data-s]').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            const st = STICKERS[+btn.dataset.s];
            nailTool = { type: 'sticker', value: st.s };
            selectBtn(btn);
            playPop();
            if (window.speechSynthesis) speechSynthesis.cancel();
            speak(st.name);
        });
    });
    document.getElementById('glitterBtn').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        handsSvg.classList.toggle('glitter');
        playSparkleSound();
        speak(handsSvg.classList.contains('glitter') ? 'Glitter erop!' : 'Glitter eraf!');
        nailSparkAll(6);
    });
    document.getElementById('wipeBtn').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        handsSvg.querySelectorAll('.paint-layer').forEach(l => l.innerHTML = '');
        handsSvg.querySelectorAll('text.stk').forEach(t => t.textContent = '');
        handsSvg.querySelectorAll('.ring-slot').forEach(r => r.innerHTML = '');
        handsSvg.querySelectorAll('.finger').forEach(f => f.classList.remove('painted'));
        handsSvg.classList.remove('glitter');
        nails.forEach(n => { n.color = null; n.sticker = null; n.ring = null; });
        playFreqSweep(600, 200, 0.4, 0.15);
        speak('Alles weg! Opnieuw beginnen!');
    });
    document.getElementById('doneBtn').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        nailsDone();
    });
}

function nailSpark(x, y) {
    const icons = ['✨', '⭐', '💖', '🌟', '💫'];
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(icons);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 50;
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        nailsEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function nailCenter(i) {
    const f = handsSvg.querySelector(`.finger[data-nail="${i}"] rect:nth-of-type(2)`);
    const r = f.getBoundingClientRect();
    const o = nailsEl.getBoundingClientRect();
    return { x: r.left + r.width / 2 - o.left, y: r.top + r.height / 2 - o.top };
}

function nailSparkAll(n) {
    nails.forEach((nl, i) => { if (nl.color || n > 6) { const c = nailCenter(i); nailSpark(c.x, c.y); } });
}

function paintNail(i, isTap) {
    const finger = handsSvg.querySelector(`.finger[data-nail="${i}"]`);
    if (!finger) return;
    if (nailTool.type === 'color') {
        if (nails[i].color === nailTool.value) return;
        nails[i].color = nailTool.value;
        const layer = finger.querySelector('.paint-layer');
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('x', -40); r.setAttribute('y', -200);
        r.setAttribute('width', 80); r.setAttribute('height', 260);
        r.setAttribute('fill', nailFill(nailTool.value));
        r.setAttribute('class', 'paint');
        layer.appendChild(r);
        if (nailTool.value === 'silver') {
            const d = r.cloneNode();
            d.setAttribute('fill', 'url(#nsilverDots)');
            layer.appendChild(d);
        }
        while (layer.children.length > 3) layer.removeChild(layer.firstChild);
        finger.classList.add('painted');
        playFreqSweep(500 + i * 40, 900 + i * 40, 0.18, 0.1);
        const c = nailCenter(i);
        nailSpark(c.x, c.y);
        if (nails.every(n => n.color) && isTap !== 'drag-quiet') {
            speak('Alle nagels gelakt!');
        } else if (Math.random() < 0.25) {
            speak(randomPick(['Mooi!', 'Prachtig!', 'Wat glimt dat!']));
        }
    } else if (nailTool.type === 'ring') {
        if (!isTap) return;
        const slot = finger.querySelector('.ring-slot');
        if (nails[i].ring === nailTool.value) {
            nails[i].ring = null;
            slot.innerHTML = '';
            playFreqSweep(1200, 600, 0.15, 0.1);
            return;
        }
        nails[i].ring = nailTool.value;
        slot.innerHTML = `<g class="stk pop">${ringSVG(RINGS[nailTool.value], +slot.dataset.w)}</g>`;
        [1568, 2093, 2637].forEach((f, k) => setTimeout(() => playTone(f, 0.18, 0.08, 'sine'), k * 60));
        const r = slot.getBoundingClientRect();
        const o = nailsEl.getBoundingClientRect();
        nailSpark(r.left + r.width / 2 - o.left, r.top + r.height / 2 - o.top);
    } else if (nailTool.type === 'sticker') {
        if (nails[i].sticker === nailTool.value) return;
        nails[i].sticker = nailTool.value;
        const t = finger.querySelector('text.stk');
        t.textContent = nailTool.value;
        t.classList.remove('pop');
        void t.getBBox();
        t.classList.add('pop');
        playTone(1200, 0.12, 0.15, 'triangle');
        const c = nailCenter(i);
        nailSpark(c.x, c.y);
    }
}

function fingerAt(e) {
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const f = hit && hit.closest && hit.closest('.finger');
    return f ? +f.dataset.nail : -1;
}

handsSvg.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    nailPainting = true;
    const i = fingerAt(e);
    if (i >= 0) paintNail(i, true);
});
handsSvg.addEventListener('pointermove', (e) => {
    if (!nailPainting || nailTool.type === 'ring') return;
    const i = fingerAt(e);
    if (i >= 0) paintNail(i, false);
});
window.addEventListener('pointerup', () => { nailPainting = false; });
nailsEl.addEventListener('pointerdown', (e) => e.stopPropagation());

function nailsDone() {
    if (!nails.some(n => n.color || n.sticker || n.ring !== null)) {
        speak('Kies eerst een kleurtje en tik op een nagel!');
        return;
    }
    playWin();
    speak('Wat een prachtige nagels! Even blazen... Klaar!');
    handsSvg.classList.remove('drying');
    void handsSvg.getBoundingClientRect();
    handsSvg.classList.add('drying');
    nailSparkAll(10);
    setTimeout(() => nailSparkAll(10), 500);
    setTimeout(() => handsSvg.classList.remove('drying'), 1600);
}

function openNails() {
    nailsOpen = true;
    nailsEl.classList.add('open');
    speak('De nagelsalon! Kies een kleurtje en tik op een nagel!');
    playSparkleSound();
}

function closeNails() {
    nailsOpen = false;
    nailsEl.classList.remove('open');
    _playWhoosh();
    if (nails.some(n => n.color)) {
        burst(state.x, 330, 40);
        sayRandom(['Wat een mooie nagels, prinses!', 'Glimmende nagels!']);
    }
}
document.getElementById('nailsClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeNails();
});
