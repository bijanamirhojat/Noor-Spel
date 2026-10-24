/* 🎬 Bioscoop: eerst zelf popcorn maken (maïs erin, machine aan, pof pof, scheppen, iets lekkers erop),
   dan in de zaal een film kiezen. Het licht gaat uit, het gordijn open en de film speelt (emoji-acteurs die
   bewegen, met een verteller). Tik op je bakje om popcorn te eten. Aantal films in noor-prinses-films. */
const BIO_KEY = 'noor-prinses-films';
const PC_KERNELS = 28;
const PC_TOPS = [
    { k: 'zout', icon: '🧂', say: 'Zoute popcorn!', p: ['#ffffff', '#fef3c7', '#facc15'] },
    { k: 'karamel', icon: '🍯', say: 'Karamel! Zoet en knapperig!', p: ['#fcd34d', '#f59e0b', '#b45309'] },
    { k: 'regenboog', icon: '🌈', say: 'Regenboogpopcorn!', p: ['#f9a8d4', '#93c5fd', '#a855f7'] },
    { k: 'chocola', icon: '🍫', say: 'Chocoladepopcorn! Mmm!', p: ['#fef3c7', '#92400e', '#451a03'] }
];
// A film = 4 scenes; actors move from (x0,y0) to (x1,y1) in % of the screen during the scene
const BIO_FILMS = [
    { k: 'eenhoorn', poster: '🦄', title: 'De eenhoorn en de regenboog', scenes: [
        { bg: 'meadow', say: 'Er was eens een eenhoorn, in een mooie wei vol bloemen.', actors: [
            { e: '🦄', x0: -10, y0: 62, x1: 45, y1: 62, s: 90, flip: true, cls: 'walk' },
            { e: '🌸', x0: 15, y0: 82, s: 34 }, { e: '🌼', x0: 72, y0: 84, s: 34 }, { e: '🌷', x0: 86, y0: 80, s: 34 },
            { e: '🦋', x0: 80, y0: 20, x1: 60, y1: 35, s: 40, cls: 'bob' }] },
        { bg: 'rain', say: 'Oh nee! Het gaat regenen. De eenhoorn wordt een beetje verdrietig.', actors: [
            { e: '🌧️', x0: 30, y0: 2, x1: 45, y1: 6, s: 80 }, { e: '🌧️', x0: 70, y0: 0, x1: 58, y1: 4, s: 70 },
            { e: '🦄', x0: 45, y0: 62, s: 90, flip: true }, { e: '💧', x0: 52, y0: 40, x1: 52, y1: 55, s: 26, cls: 'blink' }] },
        { bg: 'sky', say: 'Maar kijk! Daar komt de zon. En... een regenboog!', actors: [
            { e: '☀️', x0: 90, y0: -20, x1: 80, y1: 6, s: 80, cls: 'spin' },
            { e: '🌈', x0: 30, y0: 30, s: 200, cls: 'grow' }, { e: '🦄', x0: 45, y0: 62, s: 90, flip: true, cls: 'hop' }] },
        { bg: 'sky', say: 'De eenhoorn vliegt over de regenboog. Hoera!', actors: [
            { e: '🌈', x0: 30, y0: 30, s: 200 },
            { e: '🦄', x0: 10, y0: 60, x1: 85, y1: 10, s: 80, flip: true, cls: 'bob' },
            { e: '✨', x0: 20, y0: 50, x1: 70, y1: 20, s: 40, cls: 'blink' }, { e: '💖', x0: 50, y0: 70, x1: 60, y1: 40, s: 36 }] }
    ] },
    { k: 'visje', poster: '🐠', title: 'Visje zoekt een vriendje', scenes: [
        { bg: 'sea', say: 'Diep in de zee zwemt een klein visje. Het zoekt een vriendje.', actors: [
            { e: '🐠', x0: 105, y0: 40, x1: 50, y1: 45, s: 70, cls: 'bob' },
            { e: '🪸', x0: 8, y0: 74, s: 70 }, { e: '🌿', x0: 84, y0: 76, s: 60 }, { e: '🫧', x0: 60, y0: 80, x1: 62, y1: 0, s: 30 }] },
        { bg: 'sea', say: 'Hallo octopus! Wil jij mijn vriendje zijn? De octopus zwaait met al zijn armpjes!', actors: [
            { e: '🐠', x0: 50, y0: 45, x1: 40, y1: 40, s: 70, cls: 'bob' },
            { e: '🐙', x0: 70, y0: 110, x1: 66, y1: 52, s: 90, cls: 'wiggle' }, { e: '🪸', x0: 8, y0: 74, s: 70 }] },
        { bg: 'sea', say: 'Oei, een haai! Snel verstoppen! Maar... de haai wil alleen maar spelen!', actors: [
            { e: '🦈', x0: 110, y0: 20, x1: 55, y1: 22, s: 100, cls: 'bob' },
            { e: '🪸', x0: 8, y0: 74, s: 70 }, { e: '🐠', x0: 40, y0: 40, x1: 12, y1: 66, s: 50 }, { e: '🐙', x0: 66, y0: 52, x1: 76, y1: 66, s: 70 },
            { e: '😊', x0: 66, y0: 8, s: 34, cls: 'blink' }] },
        { bg: 'sea', say: 'Nu zijn ze allemaal vriendjes. Ze zwemmen samen door de zee!', actors: [
            { e: '🦈', x0: 70, y0: 20, x1: 20, y1: 24, s: 90, cls: 'bob' }, { e: '🐠', x0: 80, y0: 50, x1: 34, y1: 50, s: 60, cls: 'bob' },
            { e: '🐙', x0: 90, y0: 64, x1: 50, y1: 64, s: 70, cls: 'wiggle' },
            { e: '🫧', x0: 30, y0: 90, x1: 34, y1: 0, s: 30 }, { e: '💖', x0: 45, y0: 40, x1: 45, y1: 10, s: 40, cls: 'grow' }] }
    ] },
    { k: 'ruimte', poster: '🚀', title: 'Poes gaat naar de maan', scenes: [
        { bg: 'night', say: 'Poes kijkt naar de maan. Daar wil ik heen! zegt poes.', actors: [
            { e: '🐱', x0: 30, y0: 66, s: 80, cls: 'hop' }, { e: '🌙', x0: 75, y0: 6, s: 70 },
            { e: '🚀', x0: 55, y0: 52, s: 100 }, { e: '⭐', x0: 20, y0: 10, s: 24, cls: 'blink' }, { e: '⭐', x0: 50, y0: 20, s: 20, cls: 'blink' }] },
        { bg: 'space', say: 'Drie... twee... een... Lancering! De raket vliegt omhoog!', actors: [
            { e: '🚀', x0: 40, y0: 90, x1: 60, y1: -40, s: 110, cls: 'shake' },
            { e: '🔥', x0: 42, y0: 110, x1: 56, y1: -10, s: 50, cls: 'blink' }, { e: '⭐', x0: 15, y0: 20, s: 26, cls: 'blink' }, { e: '🪐', x0: 78, y0: 30, s: 70 }] },
        { bg: 'space', say: 'Zoeffff! Langs de sterren en de planeten. Daar is de maan!', actors: [
            { e: '🌕', x0: 70, y0: 20, s: 160, cls: 'grow' }, { e: '🚀', x0: -10, y0: 70, x1: 40, y1: 40, s: 80 },
            { e: '⭐', x0: 15, y0: 15, s: 26, cls: 'blink' }, { e: '☄️', x0: 100, y0: 0, x1: 0, y1: 60, s: 40 }] },
        { bg: 'moon', say: 'Een ruimtevriendje! Hallo! zegt het mannetje. Miauw! zegt poes. Wat een feest!', actors: [
            { e: '🐱', x0: 28, y0: 66, s: 80, cls: 'hop' }, { e: '👽', x0: 105, y0: 66, x1: 62, y1: 66, s: 80, cls: 'wiggle' },
            { e: '🚀', x0: 6, y0: 46, s: 90 }, { e: '🌍', x0: 80, y0: 6, s: 60, cls: 'spin' }, { e: '💖', x0: 45, y0: 50, x1: 45, y1: 20, s: 40, cls: 'grow' }] }
    ] }
];
const BIO_SCENE_MS = 6500;

defineRoom({
    key: 'bioscoop',
    name: 'Bioscoop',
    icon: '🎬',
    say: 'De bioscoop',
    build(x) {
        addObj(`<div class="bio-house">
            <div class="bh-roof"></div>
            <div class="bh-sign">${[...Array(14)].map((_, i) => `<i style="--i:${i}"></i>`).join('')}<b>🎬 BIOSCOOP</b></div>
            <div class="bh-posters">${BIO_FILMS.map(f => `<span>${f.poster}</span>`).join('')}</div>
            <div class="bh-doors"><div></div><div></div></div>
            <div class="bh-carpet"></div>
            <div class="tap-hint" style="left:180px;top:-40px">👇</div>
        </div>`, x + 150, 60, x + 340, openCinema);
        addObj(`<div class="bio-cart"><div class="glass"><span>🍿</span></div><div class="cart"></div>
            <div class="wheel" style="left:14px"></div><div class="wheel" style="right:14px"></div></div>`, x + 600, 220, x + 640, (node) => {
            bounceEl(node, 'wobble');
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top + 30);
            for (let i = 0; i < 24; i++) setTimeout(() => {
                spawnSparkle(p.x + (Math.random() - 0.5) * 50, p.y, { vx: (Math.random() - 0.5) * 220, vy: -150 - Math.random() * 150, g: 420, hue: 45, size: 5 + Math.random() * 4, max: 1 });
                pcPopSound();
            }, i * 50);
            sayRandom(['Pof pof pof! Popcorn!', 'Lekker, popcorn!']);
        });
        addObj('<div class="emoji-obj" style="font-size:54px">🎟️</div>', x + 40, 340, x + 80, () => {
            playTone(1200, 0.1, 0.1, 'triangle');
            sayRandom(['Een kaartje voor de film!', 'Welke film gaan we kijken?']);
        });
    }
});

function pcPopSound() {
    playFreqSweep(900 + Math.random() * 700, 300, 0.05, 0.12);
}

/* ─────────── Bioscoop (overlay) ─────────── */
const bioEl = document.getElementById('bioOv');
let bioOpen = false;
registerOverlay(() => bioOpen, closeCinema);
const bio = { step: 'corn', kernels: 0, popped: 0, pile: 0, fill: 0, top: null, film: null, timers: [], count: 0 };
try { bio.count = Math.max(0, parseInt(localStorage.getItem(BIO_KEY), 10) || 0); } catch (e) {}

function bioLater(fn, ms) { bio.timers.push(setTimeout(fn, ms)); }
function bioClearTimers() { bio.timers.forEach(clearTimeout); bio.timers = []; }

function bioHint(text) { document.getElementById('bioHint').textContent = text; }

// Pulse the button that is next
function bioStep(step) {
    bio.step = step;
    bioEl.querySelectorAll('[data-step]').forEach(b => b.classList.toggle('next', b.dataset.step === step));
    document.getElementById('pcTops').classList.toggle('show', step === 'top' || step === 'go');
    document.getElementById('pcGo').classList.toggle('show', step === 'top' || step === 'go');
    bioHint({
        corn: '🌽 Doe maïs in de machine',
        heat: '🔴 Zet de machine aan',
        popping: '🍿 Pof pof pof...',
        scoop: '🥄 Schep de popcorn in je bakje',
        top: '😋 Wat wil je erop?',
        go: '🎬 Naar de film!'
    }[step]);
}

function pcRender() {
    document.getElementById('pcPile').style.height = Math.min(92, bio.pile * 3.2) + '%';
    const box = document.getElementById('pcBox');
    box.style.setProperty('--f', bio.fill);
    const t = PC_TOPS.find(x => x.k === bio.top) || PC_TOPS[0];
    ['--p1', '--p2', '--p3'].forEach((v, i) => box.style.setProperty(v, bio.top ? t.p[i] : PC_TOPS[0].p[i]));
}

function pcAddCorn() {
    if (bio.step !== 'corn') { bioNudge(); return; }
    const kettle = document.getElementById('pcKettle');
    for (let i = 0; i < 14; i++) {
        const k = document.createElement('span');
        k.className = 'pc-kernel';
        k.style.left = (20 + Math.random() * 60) + '%';
        k.style.animationDelay = (i * 0.04) + 's';
        kettle.appendChild(k);
    }
    for (let i = 0; i < 10; i++) setTimeout(() => playTone(1800 + Math.random() * 800, 0.03, 0.05, 'square'), i * 45);
    bio.kernels = PC_KERNELS;
    speak('Maïs erin! Nu de machine aanzetten!');
    bioStep('heat');
}

function pcTurnOn() {
    if (bio.step !== 'heat') { bioNudge(); return; }
    bioStep('popping');
    const m = document.getElementById('pcMachine');
    m.classList.add('on');
    speak('Aan! Even wachten... luister maar!');
    const glass = document.getElementById('pcGlass');
    for (let i = 0; i < bio.kernels; i++) {
        bioLater(() => {
            const pc = document.createElement('span');
            pc.className = 'pc-piece fly';
            pc.style.left = (30 + Math.random() * 40) + '%';
            pc.style.setProperty('--dx', ((Math.random() - 0.5) * 220) + 'px');
            pc.style.setProperty('--dy', (-60 - Math.random() * 140) + 'px');
            glass.appendChild(pc);
            pc.addEventListener('animationend', () => pc.remove());
            pcPopSound();
            bio.pile++;
            pcRender();
        }, 1200 + i * 110 + Math.random() * 120);
    }
    bioLater(() => {
        m.classList.remove('on');
        document.getElementById('pcKettle').querySelectorAll('.pc-kernel').forEach(k => k.remove());
        playCorrect();
        speak('Klaar! Wat veel popcorn! Schep het maar in je bakje!');
        bioStep('scoop');
    }, 1700 + bio.kernels * 110);
}

function pcScoop() {
    if (bio.step !== 'scoop') { bioNudge(); return; }
    if (bio.pile <= 0) return;
    bio.pile = Math.max(0, bio.pile - 10);
    bio.fill = Math.min(1, bio.fill + 0.36);
    playFreqSweep(500, 900, 0.2, 0.1);
    const box = document.getElementById('pcBox');
    box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
    pcRender();
    if (bio.pile <= 0) {
        bio.fill = 1;
        pcRender();
        speak('Je bakje is vol! Wat wil je erop?');
        bioStep('top');
    }
}

function pcTopping(k) {
    if (bio.step !== 'top' && bio.step !== 'go') { bioNudge(); return; }
    const t = PC_TOPS.find(x => x.k === k);
    bio.top = k;
    pcRender();
    document.querySelectorAll('#pcTops .tool-btn').forEach(b => b.classList.toggle('sel', b.dataset.k === k));
    const r = document.getElementById('pcBox').getBoundingClientRect();
    const o = bioEl.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', t.icon]);
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.top + 20 - o.top) + 'px';
        const a = -Math.random() * Math.PI;
        s.style.setProperty('--dx', Math.cos(a) * 70 + 'px');
        s.style.setProperty('--dy', Math.sin(a) * 70 + 'px');
        bioEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    [1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 0.08, 'sine'), i * 70));
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak(t.say);
    bioStep('go');
}

function bioNudge() {
    const next = bioEl.querySelector('[data-step].next');
    if (next) { next.classList.remove('nudge'); void next.offsetWidth; next.classList.add('nudge'); }
    playTone(330, 0.12, 0.08, 'triangle');
}

/* ── De zaal ── */
function bioToHall() {
    if (bio.step !== 'top' && bio.step !== 'go') { bioNudge(); return; }
    bioEl.dataset.phase = 'hall';
    document.getElementById('bioSnackSpot').appendChild(document.getElementById('pcBox'));
    bioShowPosters();
    playFreqSweep(400, 800, 0.3, 0.1);
    speak('Naar de zaal! Welke film wil je kijken?');
}

function bioShowPosters() {
    bioEl.classList.remove('dark');
    document.getElementById('bioScreen').classList.remove('playing', 'shut');
    document.getElementById('bioFilm').innerHTML = '';
    document.getElementById('bioTitle').textContent = '';
    const box = document.getElementById('bioPosters');
    box.style.display = '';
    box.innerHTML = BIO_FILMS.map((f, i) => `<button class="bio-poster" data-i="${i}"><span>${f.poster}</span><small>${f.title}</small></button>`).join('');
    box.querySelectorAll('.bio-poster').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        bioPlay(BIO_FILMS[+b.dataset.i]);
    }));
    bioHint('🎞️ Kies een film');
}

function bioPlay(film) {
    if (bio.film) return;
    bio.film = film;
    document.getElementById('bioPosters').style.display = 'none';
    const screen = document.getElementById('bioScreen');
    screen.classList.add('shut');
    bioEl.classList.add('dark');
    bioHint('🍿 Tik op je bakje om popcorn te eten');
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak('Het licht gaat uit... ssst! De film begint!');
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.1, 'triangle'), 600 + i * 220));
    bioLater(() => {
        document.getElementById('bioTitle').textContent = film.title;
        screen.classList.remove('shut');
        screen.classList.add('playing');
    }, 1500);
    film.scenes.forEach((sc, i) => bioLater(() => bioScene(sc), 3800 + i * BIO_SCENE_MS));
    bioLater(bioEnd, 3800 + film.scenes.length * BIO_SCENE_MS);
}

function bioScene(sc) {
    document.getElementById('bioTitle').textContent = '';
    const stage = document.getElementById('bioFilm');
    stage.className = 'bio-film bg-' + sc.bg;
    stage.innerHTML = sc.actors.map(a => `<span class="bio-actor ${a.cls || ''}" style="left:${a.x0}%;top:${a.y0}%;font-size:${a.s}px">
        <span${a.flip ? ' class="flip"' : ''}>${a.e}</span></span>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        stage.querySelectorAll('.bio-actor').forEach((n, i) => {
            const a = sc.actors[i];
            n.style.transition = `left ${BIO_SCENE_MS - 800}ms ease-in-out, top ${BIO_SCENE_MS - 800}ms ease-in-out`;
            if (a.x1 !== undefined) { n.style.left = a.x1 + '%'; n.style.top = a.y1 + '%'; }
        });
    }));
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak(sc.say);
    // Someone in the audience reacts
    bioLater(() => {
        const v = randomPick([...bioEl.querySelectorAll('.bio-viewer')]);
        v.classList.remove('react'); void v.offsetWidth; v.classList.add('react');
        [988, 1175, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.07, 0.05, 'sine'), i * 70));
    }, 2500 + Math.random() * 2000);
}

function bioEnd() {
    const film = bio.film;
    bio.film = null;
    bio.count++;
    try { localStorage.setItem(BIO_KEY, String(bio.count)); } catch (e) {}
    const stage = document.getElementById('bioFilm');
    stage.className = 'bio-film bg-end';
    stage.innerHTML = '<span class="bio-the-end">Einde</span>';
    speak(`Einde! Wat een mooie film: ${film.title}! Klap maar in je handjes!`);
    startNoise('applause');
    bioEl.querySelectorAll('.bio-viewer').forEach((v, i) => setTimeout(() => { v.classList.remove('react'); void v.offsetWidth; v.classList.add('react'); }, i * 150));
    bioLater(() => stopNoise(), 2200);
    bioLater(() => {
        playWin();
        bioShowPosters();
        bioHint(`🎞️ Nog een film? (al ${bio.count} gekeken)`);
    }, 3200);
}

function bioEat() {
    if (bio.fill <= 0) {
        if (window.speechSynthesis) speechSynthesis.cancel();
        speak('Op! Alle popcorn is op!');
        return;
    }
    bio.fill = Math.max(0, +(bio.fill - 0.1).toFixed(2));
    pcRender();
    [0, 90, 180].forEach(d => setTimeout(() => playTone(120 + Math.random() * 80, 0.05, 0.18, 'square'), d));
    const r = document.getElementById('pcBox').getBoundingClientRect();
    const o = bioEl.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'bio-nom';
    s.textContent = bio.fill <= 0 ? 'Op!' : randomPick(['Nom!', 'Mmm!', 'Knabbel!']);
    s.style.left = (r.left + r.width / 2 - o.left) + 'px';
    s.style.top = (r.top - o.top) + 'px';
    bioEl.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
    if (bio.fill <= 0 && !bio.film) speak('Op! Alles opgegeten!');
}

function bioReset() {
    bioClearTimers();
    stopNoise();
    Object.assign(bio, { kernels: 0, popped: 0, pile: 0, fill: 0, top: null, film: null });
    bioEl.dataset.phase = 'pop';
    bioEl.classList.remove('dark');
    document.getElementById('pcMachine').classList.remove('on');
    document.getElementById('pcBoxSpot').appendChild(document.getElementById('pcBox'));
    bioEl.querySelectorAll('.pc-kernel, .pc-piece, .bio-nom, .scope-spark').forEach(n => n.remove());
    document.querySelectorAll('#pcTops .tool-btn').forEach(b => b.classList.remove('sel'));
    pcRender();
    bioStep('corn');
}

function openCinema() {
    bioOpen = true;
    bioEl.classList.add('open');
    bioReset();
    playMusicBox();
    speak('Welkom in de bioscoop! Eerst maken we popcorn. Doe de maïs in de machine!');
}

function closeCinema() {
    bioOpen = false;
    bioClearTimers();
    stopNoise();
    bioEl.classList.remove('open', 'dark');
    if (window.speechSynthesis) speechSynthesis.cancel();
    burst(state.x, 320, 30);
    sayRandom(['Wat was dat leuk!', 'Dag bioscoop!']);
}

document.getElementById('pcTops').innerHTML = PC_TOPS.map(t => `<button class="tool-btn" data-k="${t.k}" aria-label="${t.k}">${t.icon}</button>`).join('');
document.querySelectorAll('#pcTops .tool-btn').forEach(b => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); pcTopping(b.dataset.k); }));
[['pcCorn', pcAddCorn], ['pcOn', pcTurnOn], ['pcScoop', pcScoop], ['pcGo', bioToHall]].forEach(([id, fn]) => {
    document.getElementById(id).addEventListener('pointerdown', (e) => { e.stopPropagation(); fn(); });
});
document.getElementById('pcGlass').addEventListener('pointerdown', (e) => { e.stopPropagation(); if (bio.step === 'scoop') pcScoop(); });
document.getElementById('pcBox').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (bioEl.dataset.phase === 'hall') bioEat();
});
document.getElementById('bioNewPop').addEventListener('pointerdown', (e) => { e.stopPropagation(); bioReset(); speak('Nieuwe popcorn maken!'); });
document.getElementById('bioClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeCinema(); });
bioEl.addEventListener('pointerdown', (e) => e.stopPropagation());
