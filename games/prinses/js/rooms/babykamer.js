/* 👶 Babykamer: zorg voor de baby. Pap of melk geven (en een boertje), de luier verschonen, in bad,
   spelen (rammelaar, kiekeboe, bal, blokjes) en naar bed met een knuffel die hij zelf mag kiezen.
   Elke keer dat je hem helpt met iets wat hij echt nodig had, groeit hij een stukje: van baby naar
   dreumes naar peuter, tot hij net zo groot is als Noor (de streep op de meetlat). De wensen lopen
   langzaam leeg met de tijd en na eten moet de luier, na spelen is hij moe enzovoort.
   Alles staat in noor-prinses-baby: { g: groei, needs, t, knuffel }. */
const BB_KEY = 'noor-prinses-baby';
const BB_NEEDS = [
    { k: 'eat', icon: '🥣', want: 'Hij heeft honger!' },
    { k: 'diaper', icon: '🧷', want: 'Hij heeft een vieze luier! Pfoe!' },
    { k: 'bath', icon: '🛁', want: 'Hij wil in bad!' },
    { k: 'play', icon: '🧸', want: 'Hij wil spelen!' },
    { k: 'sleep', icon: '😴', want: 'Hij is moe, hij wil slapen.' }
];
// Growth points where a new stage starts, and how tall he is then (part of the stage height)
const BB_STAGES = [
    { g: 0, h: 0.3, name: 'een baby' },
    { g: 10, h: 0.45, name: 'een dreumes' },
    { g: 25, h: 0.64, name: 'een peuter' },
    { g: 45, h: 0.82, name: 'net zo groot als Noor' }
];
const BB_GROWN = BB_STAGES[BB_STAGES.length - 1].g;
const BB_KNUFFELS = [
    { k: 'beer', icon: '🧸', name: 'de beer' }, { k: 'konijn', icon: '🐰', name: 'het konijn' },
    { k: 'eenhoorn', icon: '🦄', name: 'de eenhoorn' }, { k: 'hond', icon: '🐶', name: 'het hondje' },
    { k: 'poes', icon: '🐱', name: 'de poes' }, { k: 'olifant', icon: '🐘', name: 'de olifant' }
];
const BB_TOYS = [
    { k: 'rattle', icon: '🪇', say: 'De rammelaar!' }, { k: 'peek', icon: '🙈', say: 'Kiekeboe!' },
    { k: 'ball', icon: '⚽', say: 'De bal!' }, { k: 'blocks', icon: '🧱', say: 'Blokjes!' }
];
/* What you can do with him. need: which wish it fills, gain: how much, after: what that does to the other
   wishes. Steps: tap (tap the button n times), hold (keep pressing), rub (rub over the baby),
   toys / knuffel (pick one of the buttons). */
const BB_ACTS = [
    { k: 'pap', icon: '🥣', label: 'Pap', need: 'eat', gain: 70, prop: 'chair', after: { diaper: -35 }, say: 'Pap eten! In de kinderstoel.', steps: [
        { kind: 'tap', icon: '🎽', n: 1, hint: '🎽 Doe een slabbetje om', say: 'Eerst een slabbetje om!' },
        { kind: 'tap', icon: '🥄', n: 5, hint: '🥄 Geef hem een hapje pap', say: 'Een hapje voor de baby!' }] },
    { k: 'melk', icon: '🍼', label: 'Melk', need: 'eat', gain: 60, prop: 'arms', after: { diaper: -25 }, say: 'Een flesje melk!', steps: [
        { kind: 'hold', icon: '🍼', ms: 3500, hint: '🍼 Houd de fles vast', say: 'Houd de fles maar vast.' },
        { kind: 'tap', icon: '🤚', n: 3, hint: '🤚 Klop zachtjes op zijn rug', say: 'Nu een boertje laten. Klop zachtjes op zijn rug.' }] },
    { k: 'luier', icon: '🧷', label: 'Luier', need: 'diaper', gain: 100, prop: 'table', after: {}, say: 'Een schone luier!', steps: [
        { kind: 'tap', icon: '🧷', n: 1, hint: '🧷 Doe de vieze luier af', say: 'Eerst de vieze luier af.' },
        { kind: 'rub', icon: '🧻', hint: '🧻 Veeg zijn billetjes schoon', say: 'Veeg de billetjes schoon met een doekje.' },
        { kind: 'tap', icon: '🧴', n: 1, hint: '🧴 Een beetje crème', say: 'Een beetje crème.' },
        { kind: 'tap', icon: '🩲', n: 1, hint: '🩲 Doe een schone luier om', say: 'En een schone luier om!' }] },
    { k: 'bad', icon: '🛁', label: 'Badje', need: 'bath', gain: 100, prop: 'tub', after: { sleep: -10 }, say: 'In bad! Lekker warm water.', steps: [
        { kind: 'rub', icon: '🧽', hint: '🧽 Zeep hem lekker in', say: 'Zeep hem maar lekker in.' },
        { kind: 'tap', icon: '🦆', n: 2, hint: '🦆 Het badeendje!', say: 'Het badeendje!' },
        { kind: 'tap', icon: '🚿', n: 1, hint: '🚿 Spoel de zeep eraf', say: 'Spoel de zeep eraf.' },
        { kind: 'rub', icon: '🧣', hint: '🧣 Droog hem af met de handdoek', say: 'Afdrogen met de handdoek.' }] },
    { k: 'spelen', icon: '🧸', label: 'Spelen', need: 'play', gain: 100, prop: 'mat', after: { sleep: -30, eat: -25, bath: -25 }, say: 'Spelen! Waar wil je mee spelen?', steps: [
        { kind: 'toys', n: 6, hint: '🧸 Speel met de baby', say: '' }] },
    { k: 'slapen', icon: '😴', label: 'Slapen', need: 'sleep', gain: 100, prop: 'bed', after: { eat: -30, diaper: -20 }, say: 'Bedtijd!', steps: [
        { kind: 'knuffel', hint: '🧸 Welke knuffel gaat mee naar bed?', say: 'Welke knuffel wil hij mee naar bed?' },
        { kind: 'tap', icon: '🛏️', n: 1, hint: '🛏️ Stop hem lekker in', say: 'Stop hem lekker in onder het dekentje.' },
        { kind: 'tap', icon: '💋', n: 1, hint: '💋 Een kusje welterusten', say: 'Een kusje welterusten.' },
        { kind: 'tap', icon: '💡', n: 1, hint: '💡 Doe het licht uit', say: 'En het licht uit.' }] }
];

defineRoom({
    key: 'babykamer',
    name: 'Babykamer',
    icon: '👶',
    say: 'De babykamer! Hallo baby!',
    build(x) {
        addObj(`<div class="bb-mobile"><div class="bar"></div><span>⭐</span><span>🌙</span><span>☁️</span><span>🐑</span></div>`, x + 250, 0, x + 330, (node) => {
            node.classList.remove('spin'); void node.offsetWidth; node.classList.add('spin');
            playMusicBox();
            sayRandom(['Het muziekmobiel!', 'Kijk, het draait!']);
        });
        addObj(`<div class="bb-crib"><div class="baby"></div><div class="bars"></div><div class="tap-hint" style="left:100px;top:-60px">👇</div></div>`,
            x + 210, 190, x + 330, openBaby);
        bb.roomBaby = document.querySelector('.bb-crib .baby');
        bbRoomRender();
        addObj('<div class="bb-ruler-wall"><i></i><b>👸</b></div>', x + 560, 90, x + 590, () => {
            const st = bbStage(bb.g);
            speak(bb.g >= BB_GROWN ? 'Hij is net zo groot als Noor!' : `Hij is nu ${st.name}. Zorg goed voor hem, dan groeit hij!`);
        });
        addObj('<div class="emoji-obj" style="font-size:60px">🧸</div>', x + 660, 330, x + 690, (node) => {
            bounceEl(node, 'wobble');
            sayRandom(['Een knuffel!', 'Zo zacht!']);
        });
    }
});

/* ─────────── De baby ─────────── */
const bb = { g: 0, needs: {}, t: Date.now(), knuffel: null, scene: null, mood: 'happy', timers: [], holdT: null, rub: null, blocks: 0, roomBaby: null, cryT: null };
BB_NEEDS.forEach(n => { bb.needs[n.k] = 45; });
try {
    const s = JSON.parse(localStorage.getItem(BB_KEY));
    if (s) {
        bb.g = Math.max(0, +s.g || 0);
        BB_NEEDS.forEach(n => { if (typeof s.needs?.[n.k] === 'number') bb.needs[n.k] = s.needs[n.k]; });
        bb.t = +s.t || Date.now();
        bb.knuffel = s.knuffel || null;
    }
} catch (e) {}

function bbSave() {
    bb.t = Date.now();
    try { localStorage.setItem(BB_KEY, JSON.stringify({ g: bb.g, needs: bb.needs, t: bb.t, knuffel: bb.knuffel })); } catch (e) {}
}

// Wishes slowly run empty: one point every two minutes, but never all the way
function bbDecay() {
    const pts = Math.floor((Date.now() - bb.t) / 120000);
    if (pts <= 0) return;
    BB_NEEDS.forEach(n => { bb.needs[n.k] = Math.max(Math.min(bb.needs[n.k], 10), bb.needs[n.k] - pts); });
    bbSave();
}

function bbStage(g) { return [...BB_STAGES].reverse().find(s => g >= s.g); }

// Height as part of the stage, smoothly between the stages
function bbHeight(g) {
    for (let i = 1; i < BB_STAGES.length; i++) {
        const a = BB_STAGES[i - 1], b = BB_STAGES[i];
        if (g < b.g) return a.h + (b.h - a.h) * (g - a.g) / (b.g - a.g);
    }
    return BB_STAGES[BB_STAGES.length - 1].h;
}

/* The baby as SVG. t = 0 (baby: big head, short legs) to 1 (as big as Noor). mood: happy, laugh, eat, cry, sleep.
   o.diaper: 'dirty' / 'clean' shows the diaper over the clothes, o.bare: no clothes (in the bath). Returns where the mouth, neck
   and hips are (part of the height, from the top), so the props can be placed on him. */
function bbFigure(g, mood = 'happy', o = {}) {
    const t = Math.min(1, g / BB_GROWN);
    const hr = 30 - 9 * t, bodyH = 36 + 30 * t, legH = 14 + 52 * t, bw = 46 - 8 * t;
    const top = 8, cy = top + hr, neck = cy + hr - 3, hip = neck + bodyH, feet = hip + legH, H = feet + 6;
    const skin = '#fcd9b6';
    const shirt = o.bare ? skin : t < 0.35 ? '#93c5fd' : '#fde047';
    const armY = neck + 9;
    const arms = [-1, 1].map(s => {
        const x0 = 50 + s * (bw / 2 - 5);
        const up = mood === 'laugh' || o.armsUp;
        const x1 = x0 + s * (12 + 8 * t), y1 = up ? armY - 24 : armY + 22 + 16 * t;
        return `<path d="M${x0} ${armY} L${x1} ${y1}" stroke="${shirt}" stroke-width="${13 - 2 * t}" stroke-linecap="round"/>
            <circle cx="${x1}" cy="${y1}" r="${6 - t}" fill="${skin}"/>`;
    }).join('');
    const legs = [-1, 1].map(s => `<rect x="${50 + s * 10 - 6}" y="${hip - 8}" width="12" height="${legH + 4}" rx="6" fill="${skin}"/>
        <ellipse cx="${50 + s * 11}" cy="${feet}" rx="9" ry="5" fill="${t < 0.35 ? '#fbcfe8' : '#ef4444'}"/>`).join('');
    const clothes = o.bare
        ? `<rect x="${50 - bw / 2}" y="${neck}" width="${bw}" height="${bodyH + 4}" rx="${bw / 2.6}" fill="${skin}"/>`
        : t < 0.35
        ? `<rect x="${50 - bw / 2}" y="${neck}" width="${bw}" height="${bodyH + 8}" rx="${bw / 2.4}" fill="${shirt}"/>
           <path d="M50 ${neck + bodyH * 0.35} l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1z" fill="#fff"/>`
        : `<rect x="${50 - bw / 2}" y="${neck}" width="${bw}" height="${bodyH + 2}" rx="12" fill="${shirt}"/>
           <rect x="${50 - bw / 2 + 1}" y="${hip - 12}" width="${bw - 2}" height="${16 + legH * 0.25}" rx="6" fill="#60a5fa"/>
           <circle cx="50" cy="${neck + bodyH * 0.38}" r="5" fill="#f472b6"/>`;
    const diaper = o.diaper ? `<path d="M${50 - bw / 2 + 1} ${hip - 14} h${bw - 2} v10 q0 14 -${bw / 2 - 1} 14 q-${bw / 2 - 1} 0 -${bw / 2 - 1} -14z"
        fill="${o.diaper === 'dirty' ? '#fde68a' : '#fff'}" stroke="#e5e7eb" stroke-width="1.5"/>
        <rect x="${50 - bw / 2}" y="${hip - 13}" width="7" height="5" rx="2" fill="#93c5fd"/><rect x="${50 + bw / 2 - 7}" y="${hip - 13}" width="7" height="5" rx="2" fill="#93c5fd"/>` : '';
    const ex = hr * 0.38, ey = cy - hr * 0.02, my = cy + hr * 0.45;
    const eye = (x) => {
        if (mood === 'laugh' || mood === 'cry') return `<path d="M${x - 4} ${ey + 1} Q${x} ${ey - 5} ${x + 4} ${ey + 1}" stroke="#1f2937" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
        if (mood === 'sleep') return `<path d="M${x - 4} ${ey - 1} Q${x} ${ey + 4} ${x + 4} ${ey - 1}" stroke="#1f2937" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
        return `<circle cx="${x}" cy="${ey}" r="3.6" fill="#1f2937"/><circle cx="${x + 1.2}" cy="${ey - 1.2}" r="1.2" fill="#fff"/>`;
    };
    const mouth = {
        happy: `<path d="M44 ${my - 1} Q50 ${my + 6} 56 ${my - 1}" stroke="#be185d" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
        laugh: `<path d="M42 ${my - 3} Q50 ${my + 11} 58 ${my - 3}Z" fill="#be185d"/>`,
        eat: `<circle cx="50" cy="${my + 1}" r="5.5" fill="#9f1239"/>`,
        cry: `<ellipse cx="50" cy="${my + 2}" rx="7.5" ry="6" fill="#9f1239"/>`,
        sleep: `<circle cx="50" cy="${my}" r="2.2" fill="#be185d"/>`
    }[mood];
    const tears = mood === 'cry' ? [-1, 1].map(s => `<ellipse cx="${50 + s * (ex + 3)}" cy="${ey + 9}" rx="2.4" ry="4" fill="#60a5fa"/>`).join('') : '';
    const hair = t < 0.2
        ? `<path d="M48 ${top + 2} q2 -9 9 -6 q-6 1 -4 7" stroke="#b45309" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
        : `<path d="M${50 - hr} ${cy - 1} A${hr} ${hr} 0 0 1 ${50 + hr} ${cy - 1} Q${50 + hr * 0.6} ${cy - hr * 0.6} 50 ${cy - hr * 0.55} Q${50 - hr * 0.7} ${cy - hr * 0.5} ${50 - hr} ${cy - 1}Z" fill="#92400e"/>`;
    const svg = `<svg viewBox="0 0 100 ${H}" xmlns="http://www.w3.org/2000/svg">
        ${legs}${clothes}${diaper}${arms}
        <circle cx="${50 - hr}" cy="${cy + 2}" r="${hr * 0.22}" fill="${skin}"/><circle cx="${50 + hr}" cy="${cy + 2}" r="${hr * 0.22}" fill="${skin}"/>
        <circle cx="50" cy="${cy}" r="${hr}" fill="${skin}"/>${hair}
        ${eye(50 - ex)}${eye(50 + ex)}
        <circle cx="${50 - hr * 0.58}" cy="${cy + hr * 0.28}" r="${hr * 0.17}" fill="#fda4af" opacity="0.7"/>
        <circle cx="${50 + hr * 0.58}" cy="${cy + hr * 0.28}" r="${hr * 0.17}" fill="#fda4af" opacity="0.7"/>
        ${mouth}${tears}</svg>`;
    return { svg, H, mouth: my / H, neck: neck / H, hip: hip / H };
}

function bbRoomRender() {
    if (!bb.roomBaby) return;
    const f = bbFigure(bb.g, bbLowest().v < 25 ? 'cry' : 'happy');
    bb.roomBaby.innerHTML = f.svg;
    // As tall as the princess (192px) when grown
    bb.roomBaby.style.height = Math.round(60 + 125 * (bbHeight(bb.g) - 0.3) / 0.52) + 'px';
}

function bbLowest() {
    return BB_NEEDS.map(n => ({ ...n, v: bb.needs[n.k] })).sort((a, b) => a.v - b.v)[0];
}

/* ─────────── Overlay ─────────── */
const bbEl = document.getElementById('bbOv');
let bbOpen = false;
registerOverlay(() => bbOpen, closeBaby);
const $bb = (id) => document.getElementById(id);
function bbLater(fn, ms) { bb.timers.push(setTimeout(fn, ms)); }
function bbClearTimers() { bb.timers.forEach(clearTimeout); bb.timers = []; clearInterval(bb.holdT); bb.holdT = null; }

function bbSay(text) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak(text);
}

function bbBubble(text, ms = 1400) {
    const b = $bb('bbBubble');
    b.textContent = text;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(b._t);
    if (ms) b._t = setTimeout(() => b.classList.remove('show'), ms);
}

// Draw the baby (and what he wears in this scene)
function bbDraw() {
    const sc = bb.scene;
    const f = bbFigure(bb.g, bb.mood, { diaper: sc && sc.diaper, bare: sc && sc.def.prop === 'tub', armsUp: bb.armsUp });
    const baby = $bb('bbBaby');
    $bb('bbSvg').innerHTML = f.svg;
    baby.style.aspectRatio = `100 / ${f.H}`;
    baby.style.setProperty('--mouth', f.mouth * 100 + '%');
    baby.style.setProperty('--neck', f.neck * 100 + '%');
    baby.style.setProperty('--hip', f.hip * 100 + '%');
    $bb('bbStage').style.setProperty('--h', bbHeight(bb.g));
    const k = BB_KNUFFELS.find(x => x.k === bb.knuffel);
    $bb('bbKnuffel').textContent = k ? k.icon : '';
}

function bbFace(mood, ms) {
    bb.mood = mood;
    bbDraw();
    clearTimeout(bb.faceT);
    if (ms) bb.faceT = setTimeout(() => { bb.mood = bb.scene && bb.scene.def.k === 'slapen' && bb.scene.asleep ? 'sleep' : 'happy'; bbDraw(); }, ms);
}

function bbRenderNeeds() {
    $bb('bbNeeds').innerHTML = BB_NEEDS.map(n => {
        const v = Math.round(bb.needs[n.k]);
        const c = v < 25 ? '#ef4444' : v < 55 ? '#facc15' : '#4ade80';
        return `<div class="bb-need"><span>${n.icon}</span><i><b style="width:${v}%;background:${c}"></b></i></div>`;
    }).join('');
    const st = bbStage(bb.g);
    const next = BB_STAGES.find(s => s.g > bb.g);
    $bb('bbGrow').innerHTML = next
        ? `🌱 <i><b style="width:${(bb.g - st.g) / (next.g - st.g) * 100}%"></b></i>`
        : '👸 = 👦';
}

/* ── De kamer: kies wat je gaat doen ── */
function bbRoom() {
    bbClearTimers();
    bb.scene = null;
    bb.armsUp = false;
    bbEl.dataset.scene = 'room';
    bbEl.classList.remove('night', 'bib', 'blanket', 'peek', 'bottle', 'rinse');
    $bb('bbSuds').style.opacity = 0;
    const low = bbLowest();
    bb.mood = low.v < 25 ? 'cry' : 'happy';
    bbDraw();
    bbRenderNeeds();
    const tools = $bb('bbTools');
    tools.innerHTML = '';
    BB_ACTS.forEach(a => {
        const b = el(`<button class="tool-btn wide bb-act" aria-label="${a.label}">${a.icon} ${a.label}</button>`);
        if (a.need === low.k && low.v < 55) b.classList.add('next');
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); bbStart(a, b); });
        tools.appendChild(b);
    });
    if (bb.g >= BB_GROWN) {
        const b = el('<button class="tool-btn wide bb-act bb-new">👶 Nieuw babytje</button>');
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); bbNewBaby(b); });
        tools.appendChild(b);
    }
    $bb('bbHint').textContent = low.v < 55 ? `${low.icon} ${low.want}` : '💖 Wat gaan we doen?';
    bbCryLoop();
}

// A crying baby cries now and then until you help him
function bbCryLoop() {
    clearInterval(bb.cryT);
    bb.cryT = setInterval(() => {
        if (!bbOpen || bb.scene || bbLowest().v >= 25) return;
        bbFace('cry');
        bbBubble('Wèèè! 😭', 1600);
        playFreqSweep(520, 720, 0.35, 0.07);
        setTimeout(() => playFreqSweep(700, 480, 0.5, 0.07), 380);
    }, 6000);
}

function bbStart(a, btn) {
    const need = bb.needs[a.need];
    const low = bbLowest();
    // Not needed now? Then he says what he does want
    if (need >= 90 && low.v < 90) {
        bounceEl(btn, 'nope');
        bbBubble(`💭 ${low.icon}`, 2000);
        bbSay(`Dat hoeft nu niet. ${low.want}`);
        return;
    }
    bb.scene = { def: a, i: 0, n: 0, p: 0, before: need, diaper: a.k === 'luier' ? (need < 60 ? 'dirty' : 'clean') : null };
    bbEl.dataset.scene = a.prop;
    $bb('bbBlocks').innerHTML = '';
    bb.blocks = 0;
    bb.mood = 'happy';
    bbDraw();
    playFreqSweep(400, 800, 0.2, 0.08);
    bbSay(a.say + (a.steps[0].say ? ' ' + a.steps[0].say : ''));
    if (bb.scene.diaper === 'dirty') bbBubble('Pfoe! 💩', 2200);
    bbStep();
}

function bbStepDef() { return bb.scene.def.steps[bb.scene.i]; }

function bbStep() {
    const sc = bb.scene;
    const st = bbStepDef();
    sc.n = 0;
    sc.p = 0;
    $bb('bbHint').textContent = st.hint;
    $bb('bbProg').classList.toggle('show', st.kind === 'hold' || st.kind === 'rub' || (st.n || 0) > 1);
    bbProg(0);
    const tools = $bb('bbTools');
    tools.innerHTML = '';
    const back = el('<button class="tool-btn bb-back" aria-label="Terug">⬅️</button>');
    back.addEventListener('pointerdown', (e) => { e.stopPropagation(); _playWhoosh(); bbRoom(); });
    tools.appendChild(back);
    const list = st.kind === 'toys' ? BB_TOYS : st.kind === 'knuffel' ? BB_KNUFFELS : [{ icon: st.icon }];
    list.forEach(it => {
        const b = el(`<button class="tool-btn bb-tool next" aria-label="${it.k || it.icon}">${it.icon}</button>`);
        if (st.kind === 'hold') {
            b.addEventListener('pointerdown', (e) => { e.stopPropagation(); b.setPointerCapture(e.pointerId); bbHoldStart(); });
            ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, bbHoldStop));
        } else {
            b.addEventListener('pointerdown', (e) => { e.stopPropagation(); bbUse(it, b); });
        }
        tools.appendChild(b);
    });
    if (st.say && sc.i > 0) bbSay(st.say);
}

function bbProg(p) { $bb('bbProg').firstElementChild.style.width = Math.min(100, p * 100) + '%'; }

function bbNext() {
    const sc = bb.scene;
    if (++sc.i >= sc.def.steps.length) { bbFinish(); return; }
    bbLater(() => { if (bb.scene === sc) bbStep(); }, 500);
}

// A button of the current step was tapped
function bbUse(it, btn) {
    const sc = bb.scene;
    if (!sc || sc.busy) return;
    const st = bbStepDef();
    if (st.kind === 'rub') {
        bounceEl(btn, 'pulse');
        bbSay('Wrijf maar met je vinger over de baby!');
        dragHint($bb('bbBaby'), { dx: 100, delay: 200 });
        return;
    }
    if (st.kind === 'knuffel') { bbPickKnuffel(it, btn); return; }
    if (st.kind === 'toys') { bbPlay(it, btn); return; }
    bbTap(st, btn);
}

function bbTap(st, btn) {
    const sc = bb.scene;
    const k = sc.def.k + ':' + st.icon;
    sc.n++;
    bbProg(sc.n / st.n);
    const mouth = $bb('bbMouth');
    if (k === 'pap:🎽') {
        bbEl.classList.add('bib');
        playTone(700, 0.1, 0.1, 'triangle');
    } else if (k === 'pap:🥄') {
        sc.busy = true;
        bbFace('eat');
        ovFly(bbEl, btn, mouth, '🥄', 450).then(() => {
            sc.busy = false;
            if (bb.scene !== sc) return;
            [0, 120].forEach(d => setTimeout(() => playTone(300, 0.06, 0.12, 'sine'), d));
            bbFace('happy', 0);
            bbBubble(randomPick(['Hap! 😋', 'Mmm! 😋', 'Nam nam!']), 900);
            if (sc.n === 3) bbSay('Mmm, lekker!');
            if (sc.n >= st.n) bbNext();
        });
        return;
    } else if (k === 'melk:🤚') {
        playTone(180, 0.06, 0.15, 'sine');
        bounceEl($bb('bbBaby'), 'pulse');
        if (sc.n >= st.n) {
            bbLater(() => {
                playFreqSweep(140, 90, 0.35, 0.18);
                bbBubble('Boer! 😆', 1400);
                bbFace('laugh', 1200);
                bbSay('Boer! Haha, wat een boertje!');
            }, 300);
            bbLater(bbNext, 900);
            return;
        }
    } else if (k === 'luier:🧷') {
        sc.diaper = null;
        bbDraw();
        const dirty = sc.before < 60;
        ovFly(bbEl, $bb('bbBaby'), $bb('bbBin'), dirty ? '💩' : '🩲', 600).then(() => playFreqSweep(300, 120, 0.2, 0.1));
        if (dirty) bbSay('Pfoe! Wat stinkt dat! In de prullenbak ermee.');
    } else if (k === 'luier:🧴') {
        ovCheer(bbEl, $bb('bbHip'), ['✨', '🤍']);
        playFreqSweep(800, 1200, 0.2, 0.08);
    } else if (k === 'luier:🩲') {
        sc.diaper = 'clean';
        bbFace('laugh', 1200);
        playCorrect();
    } else if (k === 'bad:🦆') {
        const d = $bb('bbDuck');
        d.classList.remove('go'); void d.offsetWidth; d.classList.add('go');
        playFreqSweep(1400, 900, 0.15, 0.1);
        setTimeout(() => playFreqSweep(1400, 900, 0.15, 0.1), 200);
        bbFace('laugh', 1000);
    } else if (k === 'bad:🚿') {
        bbEl.classList.add('rinse');
        startNoise('shower');
        bbLater(() => { stopNoise(); bbEl.classList.remove('rinse'); $bb('bbSuds').style.opacity = 0; }, 1400);
        bbLater(bbNext, 1600);
        return;
    } else if (k === 'slapen:🛏️') {
        bbEl.classList.add('blanket');
        playFreqSweep(500, 300, 0.4, 0.06);
    } else if (k === 'slapen:💋') {
        ovFly(bbEl, btn, mouth, '💋', 500).then(() => { ovCheer(bbEl, mouth, ['💖', '💕']); playTone(1200, 0.15, 0.08, 'sine'); });
    } else if (k === 'slapen:💡') {
        bbSleep();
        return;
    }
    if (sc.n >= st.n) bbNext();
}

function bbHoldStart() {
    const sc = bb.scene;
    if (!sc || bb.holdT) return;
    bbEl.classList.add('bottle');
    bbFace('eat');
    bb.holdT = setInterval(() => {
        const st = bbStepDef();
        sc.p = Math.min(1, sc.p + 100 / st.ms);
        bbProg(sc.p);
        $bb('bbBottle').style.setProperty('--milk', (1 - sc.p) * 100 + '%');
        if (Math.random() < 0.4) playFreqSweep(260, 180, 0.08, 0.06);
        if (sc.p >= 1) {
            bbHoldStop();
            bbEl.classList.remove('bottle');
            bbFace('happy');
            bbBubble('Op! 🍼', 1000);
            bbNext();
        }
    }, 100);
}

function bbHoldStop() {
    if (!bb.holdT) return;
    clearInterval(bb.holdT);
    bb.holdT = null;
    const sc = bb.scene;
    if (sc && sc.p < 1) {
        bbFace('happy');
        if (sc.p < 0.15) bbSay('Blijf de fles vasthouden!');
    }
}

// Rubbing over the baby: wiping, soap and drying
function bbRubAt(e) {
    const sc = bb.scene;
    const o = bbEl.getBoundingClientRect();
    const cur = $bb('bbCursor');
    cur.style.left = (e.clientX - o.left) + 'px';
    cur.style.top = (e.clientY - o.top) + 'px';
    const r = $bb('bbBaby').getBoundingClientRect();
    const inside = e.clientX > r.left - 30 && e.clientX < r.right + 30 && e.clientY > r.top - 30 && e.clientY < r.bottom + 30;
    if (bb.rub && inside) {
        const d = Math.hypot(e.clientX - bb.rub.x, e.clientY - bb.rub.y);
        sc.p = Math.min(1, sc.p + d / 700);
        bb.rub.acc += d;
        bbProg(sc.p);
        const k = sc.def.k + ':' + bbStepDef().icon;
        if (k === 'bad:🧽') $bb('bbSuds').style.opacity = Math.min(1, sc.p * 1.3);
        if (bb.rub.acc > 50) {
            bb.rub.acc = 0;
            const s = el(`<span class="bb-puff">${k === 'bad:🧽' ? '🫧' : k === 'bad:🧣' ? '💧' : '✨'}</span>`);
            s.style.left = cur.style.left;
            s.style.top = cur.style.top;
            bbEl.appendChild(s);
            s.addEventListener('animationend', () => s.remove());
            playTone(k === 'bad:🧽' ? 900 + Math.random() * 600 : 300 + Math.random() * 100, 0.04, 0.04, 'sine');
        }
        if (sc.p >= 1) {
            bb.rub = null;
            cur.classList.remove('show');
            bbFace('laugh', 1000);
            playCorrect();
            bbNext();
            return;
        }
    }
    if (bb.rub) { bb.rub.x = e.clientX; bb.rub.y = e.clientY; }
}

const bbStageEl = $bb('bbStage');
bbStageEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const sc = bb.scene;
    if (sc && !sc.busy && bbStepDef().kind === 'rub') {
        bb.rub = { x: e.clientX, y: e.clientY, acc: 0 };
        bbStageEl.setPointerCapture(e.pointerId);
        const c = $bb('bbCursor');
        c.textContent = bbStepDef().icon;
        c.classList.add('show');
        bbRubAt(e);
        return;
    }
    if (!e.target.closest('#bbBaby')) return;
    if (!sc) bbTickle();
    else if (bbStepDef().kind === 'toys') bbPlay(randomPick(BB_TOYS), $bb('bbBaby'));
    else if (bbStepDef().kind === 'tap' && !sc.busy) {
        const b = $bb('bbTools').querySelector('.bb-tool');
        if (b) bbUse({ icon: bbStepDef().icon }, b);
    }
});
bbStageEl.addEventListener('pointermove', (e) => { if (bb.rub) bbRubAt(e); });
const bbStopRub = () => { bb.rub = null; $bb('bbCursor').classList.remove('show'); };
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => bbStageEl.addEventListener(ev, bbStopRub));

function bbTickle() {
    const low = bbLowest();
    if (low.v < 25) {
        bbBubble(`💭 ${low.icon}`, 2000);
        bbSay(low.want);
        return;
    }
    bbFace('laugh', 1200);
    bbBubble(randomPick(['Hihihi! 😆', 'Gaga! 💖', 'Haha! 😄']), 1200);
    [1200, 1500, 1300, 1700].forEach((f, i) => setTimeout(() => playTone(f, 0.07, 0.06, 'sine'), i * 90));
}

/* ── Spelen ── */
function bbPlay(toy, btn) {
    const sc = bb.scene;
    if (sc.busy) return;
    sc.n++;
    bbProg(sc.n / bbStepDef().n);
    const baby = $bb('bbBaby');
    if (toy.k === 'rattle') {
        const r = $bb('bbRattle');
        r.classList.remove('go'); void r.offsetWidth; r.classList.add('go');
        for (let i = 0; i < 6; i++) setTimeout(() => playTone(2400 + Math.random() * 900, 0.03, 0.06, 'square'), i * 70);
        bbFace('laugh', 1000);
    } else if (toy.k === 'peek') {
        sc.busy = true;
        bbEl.classList.add('peek');
        bbSay('Waar is de baby?');
        setTimeout(() => {
            bbEl.classList.remove('peek');
            sc.busy = false;
            if (bb.scene !== sc) return;
            bbSay('Kiekeboe!');
            bbFace('laugh', 1300);
            [1000, 1300, 1600].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 0.08, 'sine'), i * 80));
            bbPlayed(sc);
        }, 1100);
        return;
    } else if (toy.k === 'ball') {
        sc.busy = true;
        ovFly(bbEl, btn, baby, '⚽', 450).then(() => {
            playFreqSweep(200, 400, 0.12, 0.12);
            bbFace('laugh', 1000);
            return ovFly(bbEl, baby, btn, '⚽', 450);
        }).then(() => {
            playFreqSweep(200, 400, 0.12, 0.12);
            sc.busy = false;
            if (bb.scene === sc) bbPlayed(sc);
        });
        return;
    } else if (toy.k === 'blocks') {
        const colors = ['#f87171', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
        bb.blocks++;
        $bb('bbBlocks').appendChild(el(`<i style="background:${colors[bb.blocks % colors.length]};--r:${(bb.blocks * 37) % 14 - 7}deg"></i>`));
        playTone(500 + bb.blocks * 80, 0.08, 0.1, 'triangle');
        if (bb.blocks >= 4) {
            const tw = $bb('bbBlocks');
            setTimeout(() => {
                tw.classList.add('fall');
                playFreqSweep(400, 100, 0.4, 0.12);
                bbFace('laugh', 1400);
                bbBubble('Boem! 😆', 1200);
            }, 300);
            setTimeout(() => { tw.classList.remove('fall'); tw.innerHTML = ''; bb.blocks = 0; }, 1300);
        }
    }
    bbPlayed(sc);
}

function bbPlayed(sc) {
    if (sc.n === 1) bbBubble('Gaga! 😄', 1000);
    if (sc.n >= bbStepDef().n) { sc.busy = true; bbLater(() => { sc.busy = false; bbNext(); }, 900); }
}

/* ── Slapen ── */
function bbPickKnuffel(k, btn) {
    bb.knuffel = k.k;
    bbDraw();
    bbEl.querySelectorAll('.bb-tool').forEach(b => b.classList.toggle('sel', b === btn));
    ovCheer(bbEl, btn, [k.icon, '💖']);
    playTone(900, 0.12, 0.1, 'sine');
    bbSay(`${k.name}! Die mag mee naar bed.`);
    bbSave();
    bbNext();
}

function bbSleep() {
    const sc = bb.scene;
    sc.busy = true;
    sc.asleep = true;
    bbEl.classList.add('night');
    $bb('bbTools').querySelectorAll('.bb-tool').forEach(b => b.classList.remove('next'));
    playTone(300, 0.1, 0.1, 'square');
    bbSay('Slaap lekker, kleintje.');
    bbLater(() => { bbFace('sleep'); playLullaby(); $bb('bbHint').textContent = '💤 Ssst... hij slaapt'; }, 1200);
    bbLater(() => {
        bbEl.classList.remove('night');
        playFreqSweep(400, 900, 0.5, 0.08);
        sc.asleep = false;
        bbFace('laugh', 1500);
        bb.armsUp = true;
        bbSay('Goedemorgen! Hij heeft lekker geslapen!');
        bbFinish();
    }, 8000);
}

/* ── Klaar ── */
function bbFinish() {
    const sc = bb.scene;
    const a = sc.def;
    sc.busy = true;
    const stBefore = bbStage(bb.g);
    bb.needs[a.need] = Math.min(100, bb.needs[a.need] + a.gain);
    Object.entries(a.after).forEach(([k, v]) => { bb.needs[k] = Math.max(5, bb.needs[k] + v); });
    // He only grows from things he really needed
    if (sc.before < 80 && bb.g < BB_GROWN) bb.g++;
    bbSave();
    bbRenderNeeds();
    bbDraw();
    bbRoomRender();
    $bb('bbProg').classList.remove('show');
    ovCheer(bbEl, $bb('bbBaby'), ['💖', '✨', '⭐']);
    playCorrect();
    const st = bbStage(bb.g);
    if (st !== stBefore) {
        bbLater(() => {
            playWin();
            ovCheer(bbEl, $bb('bbBaby'), ['🌱', '🎉', '⭐', '💖']);
            bbSay(st.g >= BB_GROWN ? 'Wauw! Hij is net zo groot als Noor! Wat heb je goed voor hem gezorgd!' : `Hij is gegroeid! Nu is hij ${st.name}!`);
            if (st.g >= BB_GROWN) burst(state.x, 200, 40);
        }, 1400);
    }
    bbLater(() => { bb.armsUp = false; bbRoom(); }, st !== stBefore ? 4200 : 1800);
}

function bbNewBaby(btn) {
    if (!btn.classList.contains('sure')) {
        btn.classList.add('sure');
        btn.textContent = '👶 Echt? Tik nog een keer';
        return;
    }
    bb.g = 0;
    BB_NEEDS.forEach(n => { bb.needs[n.k] = 45; });
    bbSave();
    bbRoomRender();
    playWin();
    bbSay('Een nieuw babytje! Zorg je ook zo goed voor hem?');
    bbRoom();
}

function openBaby() {
    bbOpen = true;
    bbDecay();
    bbEl.classList.add('open');
    bbRoom();
    const low = bbLowest();
    bbSay(low.v < 55 ? `Hallo baby! ${low.want}` : 'Hallo baby! Wat gaan we doen?');
}

function closeBaby() {
    bbOpen = false;
    bbClearTimers();
    clearInterval(bb.cryT);
    stopNoise();
    bb.scene = null;
    bb.rub = null;
    bbEl.classList.remove('open', 'night', 'bottle', 'rinse');
    if (window.speechSynthesis) speechSynthesis.cancel();
    bbRoomRender();
    _playWhoosh();
}

$bb('bbClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeBaby(); });
bbEl.addEventListener('pointerdown', (e) => e.stopPropagation());
