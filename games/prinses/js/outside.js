/* ─────────── Outside world ─────────── */
const UNICORN_W = 200;
const UNICORN_H = 188;

function unicornSVG() {
    const mane = ['#ef4444', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a855f7'];
    return `
    <svg viewBox="0 -20 160 150">
        <ellipse class="ushadow" cx="80" cy="126" rx="56" ry="5" fill="rgba(0,0,0,0.18)"/>
        <g class="ubody">
            <g class="utail">
                ${mane.map((c, i) => `<path d="M36 ${48 + i * 2} Q${14 - i} ${60 + i * 4} ${20 - i * 2} ${92 + i * 3}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}
            </g>
            <g class="leg-b"><rect x="40" y="76" width="11" height="44" rx="5" fill="#fff" stroke="#e9d5ff" stroke-width="2"/><rect x="40" y="114" width="11" height="8" rx="3" fill="#f472b6"/></g>
            <g class="leg-a"><rect x="102" y="76" width="11" height="44" rx="5" fill="#fff" stroke="#e9d5ff" stroke-width="2"/><rect x="102" y="114" width="11" height="8" rx="3" fill="#f472b6"/></g>
            <g class="leg-a"><rect x="54" y="76" width="11" height="44" rx="5" fill="#fff" stroke="#e9d5ff" stroke-width="2"/><rect x="54" y="114" width="11" height="8" rx="3" fill="#f472b6"/></g>
            <g class="leg-b"><rect x="116" y="76" width="11" height="44" rx="5" fill="#fff" stroke="#e9d5ff" stroke-width="2"/><rect x="116" y="114" width="11" height="8" rx="3" fill="#f472b6"/></g>
            <ellipse cx="82" cy="64" rx="50" ry="27" fill="#fff" stroke="#e9d5ff" stroke-width="2"/>
            <defs><linearGradient id="uwingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#fbcfe8"/><stop offset=".5" stop-color="#e9d5ff"/><stop offset="1" stop-color="#bae6fd"/>
            </linearGradient></defs>
            <g class="uwing">
                <path d="M66 46 C46 16 18 2 0 -16 C20 -12 32 -6 40 2 C24 -4 10 6 4 10 C22 8 36 14 44 22 C32 20 20 28 16 34 C36 30 52 38 66 52 Z"
                    fill="url(#uwingGrad)" stroke="#f0abfc" stroke-width="2" stroke-linejoin="round"/>
                <path d="M60 44 C44 24 30 14 14 4 M58 46 C44 34 32 28 20 24" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
            </g>
            <circle cx="60" cy="58" r="3" fill="#fbcfe8"/><circle cx="74" cy="72" r="2.5" fill="#bae6fd"/><circle cx="96" cy="60" r="3" fill="#fde68a"/>
            <path d="M106 52 L118 12 L140 16 L130 62 Z" fill="#fff" stroke="#e9d5ff" stroke-width="2" stroke-linejoin="round"/>
            ${mane.map((c, i) => `<circle cx="${116 - i * 2}" cy="${10 + i * 9}" r="7" fill="${c}"/>`).join('')}
            <ellipse cx="138" cy="20" rx="19" ry="13" fill="#fff" stroke="#e9d5ff" stroke-width="2"/>
            <ellipse cx="152" cy="27" rx="9" ry="8" fill="#fce7f3"/>
            <circle cx="154" cy="26" r="1.4" fill="#be185d"/>
            <path d="M128 9 L131 -3 L137 8 Z" fill="#fff" stroke="#e9d5ff" stroke-width="1.5"/>
            <path d="M136 8 L141 -18 L145 8 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M137.5 2 L144 0 M138.5 -5 L143 -7" stroke="#f59e0b" stroke-width="1.2"/>
            <path d="M136 17 Q140 13 144 17" stroke="#3b0764" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <circle cx="146" cy="24" r="3.5" fill="#fda4af" opacity=".7"/>
        </g>
    </svg>`;
}

function buildOutside() {
    buildRooms('o-room');
    place(el('<div class="hills"></div>'), 0, 250).style.width = WORLD_W + 'px';

    // Clouds across the sky (also fill the tall portrait sky)
    for (let i = 0; i < 14; i++) {
        const c = place(el('<div class="cloud"></div>'), 60 + i * 230 + Math.random() * 80, -380 + Math.random() * 480);
        c.style.animationDelay = (-Math.random() * 9) + 's';
        c.style.transform = `scale(${0.7 + Math.random() * 0.6})`;
    }

    /* o0: Kasteelplein */
    const o0 = 0;
    place(el('<div class="castle-wall stone"></div>'), o0 + 70, 60);
    const t1 = place(el('<div class="tower stone"><div class="win" style="top:60px"></div><div class="win" style="top:200px"></div></div>'), o0 + 10, -80);
    const t2 = place(el('<div class="tower stone"><div class="win" style="top:60px"></div><div class="win" style="top:200px"></div></div>'), o0 + 470, -80);
    place(el('<div class="door-sign">🏰 Naar binnen</div>'), o0 + 238, 78);
    SCENES.out.door = {
        walkX: o0 + 310,
        node: addObj('<div class="castle-door"><div class="tap-hint" style="top:90px">👇</div></div>', o0 + 220, 120, o0 + 310, (node) => goThroughDoor(node, 'hal'))
    };
    SCENES.out.koets = addKoets(o0 + 395, o0 + 545, 'dorp');
    addObj('<div class="fountain"><div class="basin"></div><div class="water"></div><div class="col"></div><div class="bowl"></div><div class="jet"></div></div>', o0 + 610, 205, o0 + 700, fountainSplash);
    addObj('<div class="sun">🌞</div>', o0 + 640, 10, o0 + 700, () => { sayRandom(['Hallo zon!', 'Wat een mooi weer!']); sparkleShower(o0 + 690, 0, 40); });

    /* o1: Bloementuin */
    const o1 = ROOM_W;
    place(el('<div class="fence"></div>'), o1, 330).style.width = ROOM_W + 'px';
    const blooms = [
        ['🌷', 'Een tulp!', 330], ['🌻', 'Een zonnebloem!', 45], ['🌹', 'Een roos!', 350],
        ['🌼', 'Een madeliefje!', 50], ['🌸', 'Een roze bloem!', 320], ['💐', 'Een bosje bloemen!', 290]
    ];
    blooms.slice(0, 4).forEach(([e, name, hue], i) => {
        const bx = o1 + 30 + i * 100;
        addObj(`<div class="bloom">${e}</div>`, bx, 318 + (i % 2) * 18, bx + 38, (node) => bloomGrow(node, name, hue));
    });
    addObj('<div class="flutter">🦋</div>', o1 + 120, 150, o1 + 200, butterflyTap);
    addObj('<div class="flutter" style="animation-delay:-3s">🦋</div>', o1 + 480, 100, o1 + 560, butterflyTap);
    addObj('<div class="bee">🐝</div>', o1 + 360, 220, o1 + 390, beeBuzz);
    addObj(`<div class="teahouse">
        <div class="th-chimney"></div>
        <span class="steam" style="position:absolute">☁️</span>
        <span class="steam" style="position:absolute;animation-delay:-1.2s">☁️</span>
        <div class="th-roof"></div>
        <div class="th-wall"></div>
        <div class="th-win" style="left:30px"></div>
        <div class="th-win" style="right:30px"></div>
        <div class="th-box" style="left:26px">🌷🌷🌷</div>
        <div class="th-box" style="right:26px">🌸🌸🌸</div>
        <div class="th-door"></div>
        <div class="th-sign">☕ Theehuisje</div>
        <div class="tap-hint" style="top:-40px">👇</div>
    </div>`, o1 + 450, 140, o1 + 770, openTea);

    /* o2: Vijver */
    const o2 = ROOM_W * 2;
    const pond = place(el(`<div class="pond">
        <div class="pad" style="left:90px;top:26px"></div>
        <div class="pad" style="left:250px;top:34px"></div>
        <div class="pad" style="left:430px;top:22px"></div>
        <span class="swan">🦢</span>
        <span class="fish">🐟</span>
    </div>`), o2 + 120, 372);
    pond.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (state.busy) return;
        const p = screenToWorld(e.clientX, e.clientY);
        splash(p.x, p.y);
        walkTo(p.x, null);
    });
    addObj('<div class="emoji-obj jumpy" style="font-size:44px">🐸</div>', o2 + 360, 345, o2 + 460, frogJump);
    addObj('<div class="emoji-obj" style="font-size:50px">🦆</div>', o2 + 650, 360, o2 + 640, () => { quack(); sayRandom(['Kwak kwak!', 'Een eendje!']); });
    addObj('<div class="flutter" style="animation-delay:-5s">🦋</div>', o2 + 300, 130, o2 + 360, butterflyTap);
    addObj('<div class="emoji-obj" style="font-size:120px">🌳</div>', o2 + 10, 250, o2 + 70, () => sayRandom(['Een grote boom!', 'Wat een mooie boom!']));

    /* o3: Eenhoornweide */
    const o3 = ROOM_W * 3;
    place(el('<div class="sky-rainbow"></div>'), o3 + 50, -60);
    place(el('<div class="fence"></div>'), o3, 330).style.width = ROOM_W + 'px';
    place(el('<div class="haystack"></div>'), o3 + 620, 312);
    const tree = addObj(`<div class="tree"><span class="crown">🌳</span>
        <span class="apple" style="left:50px;top:60px">🍎</span>
        <span class="apple" style="left:110px;top:40px">🍎</span>
        <span class="apple" style="left:130px;top:100px">🍎</span></div>`, o3 + 60, 170, o3 + 170, appleDrop);
    tree.style.zIndex = 2;

    /* o4: Speeltuin */
    const o4 = ROOM_W * 4;
    const swingX = o4 + 190;
    place(el(`<div class="swingset">
        <div class="leg" style="left:10px;transform:rotate(12deg)"></div>
        <div class="leg" style="left:40px;transform:rotate(-8deg)"></div>
        <div class="leg" style="left:228px;transform:rotate(8deg)"></div>
        <div class="leg" style="left:256px;transform:rotate(-12deg)"></div>
        <div class="bar"></div>
    </div>`), o4 + 50, 150).style.zIndex = 1;
    const swing = place(el('<div class="swing" id="swing"><div class="seat"></div></div>'), swingX - 45, 160);
    state.swing = { x: swingX, pivotY: 160, node: swing };
    addObj('<div style="width:120px;height:180px"><div class="tap-hint" style="top:-20px">👇</div></div>', swingX - 60, 150, swingX, swingRide);
    addObj(`<div class="slide"><svg viewBox="0 0 300 230">
        <defs><linearGradient id="slideGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f472b6"/><stop offset=".5" stop-color="#c084fc"/><stop offset="1" stop-color="#60a5fa"/>
        </linearGradient></defs>
        <line x1="12" y1="10" x2="12" y2="230" stroke="#fcd34d" stroke-width="8" stroke-linecap="round"/>
        <line x1="48" y1="10" x2="48" y2="230" stroke="#fcd34d" stroke-width="8" stroke-linecap="round"/>
        ${[40, 75, 110, 145, 180, 215].map(y => `<line x1="12" y1="${y}" x2="48" y2="${y}" stroke="#fde68a" stroke-width="6"/>`).join('')}
        <rect x="4" y="4" width="76" height="14" rx="6" fill="#f472b6"/>
        <path d="M70 14 Q140 40 180 120 Q220 200 296 222" stroke="url(#slideGrad)" stroke-width="26" fill="none" stroke-linecap="round"/>
        <path d="M70 2 Q140 28 180 108 Q220 188 296 210" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>
        <line x1="200" y1="160" x2="200" y2="230" stroke="#fcd34d" stroke-width="7"/>
    </svg><div class="tap-hint" style="left:30px;top:-44px">👇</div></div>`, o4 + 400, 172, o4 + 430, slideRide);
    addObj('<div class="carousel">🎠</div>', o4 + 690, 300, o4 + 690, () => { playMusicBox(); sayRandom(['Draaimolen! Hoera!', 'Een paardje!']); });

    state.skyStars = [];
    for (let i = 0; i < 10; i++) {
        const star = { node: el('<div class="skystar">🌟</div>'), got: false };
        world.appendChild(star.node);
        placeSkyStar(star, i);
        state.skyStars.push(star);
    }

    /* o5: Meer */
    const o5 = ROOM_W * 5;
    addObj('<div class="magic-shell">🐚<div class="tap-hint" style="top:-40px;font-size:30px">👇</div></div>', o5 + 20, 372, o5 + 50, diveIntoSea);
    place(el('<div class="lake"></div>'), LAKE_X0 - 20, 330).style.width = (ROOM_W * ROOMS_OUT.length - LAKE_X0 + 20) + 'px';
    place(el('<div class="dock"></div>'), o5 + 60, 430).style.width = (LAKE_X0 - o5 - 30) + 'px';
    [o5 + 90, LAKE_X0 - 10].forEach(x => place(el('<div class="dock-post"></div>'), x, 420));
    [[o5 + 330, 360], [o5 + 470, 392], [o5 + 560, 350]].forEach(([x, y], i) => place(el(`<div class="lily">${i % 2 ? '' : '<span>🌸</span>'}</div>`), x, y));
    addObj('<div class="lake-duck">🦆</div>', o5 + 640, 340, o5 + 640, () => { quack(); });
    const fish = place(el('<div class="lake-fish">🐟</div>'), o5 + 420, 380);
    fish.style.animationDelay = '-2s';
    place(el('<div class="lake-fish">🐠</div>'), o5 + 560, 400);
    addObj(`<div class="island"><div class="sand"></div><span class="palm">🌴</span>
        <div class="treasure" id="treasure"><div class="tbox"></div><div class="tlid"></div></div></div>`, o5 + 570, 250, o5 + 640, openTreasure);
    const boatSail = el(`<div class="boat-part boat-sail" id="boatSail"><div class="bflip"><svg viewBox="0 0 220 170">
        <line x1="150" y1="112" x2="150" y2="8" stroke="#92400e" stroke-width="6" stroke-linecap="round"/>
        <path d="M154 14 L154 100 L214 100 Z" fill="#fff" stroke="#f9a8d4" stroke-width="3"/>
        <path d="M146 22 L146 100 L92 100 Z" fill="#fbcfe8" stroke="#f9a8d4" stroke-width="3"/>
        <path d="M150 8 L172 14 L150 20 Z" fill="#ef4444"/>
        <text x="180" y="78" font-size="22" text-anchor="middle">💖</text>
    </svg></div></div>`);
    const boatHull = el(`<div class="boat-part boat-hull" id="boatHull"><div class="bflip"><svg viewBox="0 0 220 170">
        <path d="M6 108 L214 108 Q196 162 110 164 Q24 162 6 108 Z" fill="#f472b6" stroke="#be185d" stroke-width="3"/>
        <path d="M14 124 Q110 132 206 124" stroke="#fff" stroke-width="6" fill="none"/>
        <circle cx="60" cy="140" r="6" fill="#fde68a"/><circle cx="110" cy="144" r="6" fill="#fde68a"/><circle cx="160" cy="140" r="6" fill="#fde68a"/>
    </svg></div></div>`);
    world.appendChild(boatSail);
    world.appendChild(boatHull);
    const boatHit = el('<div class="boat-hit"><div class="tap-hint" style="top:-30px">👇</div></div>');
    world.appendChild(boatHit);
    boatHit.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (state.busy || state.boating) return;
        playPop();
        dismountUnicorn(true);
        if (state.flying) setFlying(false, true);
        walkTo(LAKE_X0, boardBoat);
    });

    const uni = el(`<div class="unicorn" id="unicorn"><div class="uflip">${unicornSVG()}</div><div class="tap-hint" style="top:-40px">👇</div></div>`);
    world.appendChild(uni);
    uni.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (state.busy || state.riding) return;
        playPop();
        burst(state.uniX, 330, 20);
        walkTo(state.uniX - 70, mountUnicorn);
    });
}

function unicornEl() { return document.getElementById('unicorn'); }

function mountUnicorn() {
    earnSticker('eenhoornweide', unicornEl());
    state.riding = true;
    state.x = state.targetX = state.uniX;
    princessEl().classList.add('riding');
    unicornEl().classList.add('ridden');
    document.getElementById('rideBtns').classList.add('show');
    speak('Hop! Op de eenhoorn! Galop! Wil je vliegen?');
    playWin();
    sparkleShower(state.x, 200, 50);
}

function dismountUnicorn(silent) {
    if (!state.riding) return;
    if (state.flying || state.alt > 1) setFlying(false, true);
    state.alt = state.targetAlt = 0;
    state.riding = false;
    state.uniX = state.x;
    princessEl().classList.remove('riding');
    unicornEl().classList.remove('ridden', 'walking');
    document.getElementById('rideBtns').classList.remove('show');
    state.x = state.targetX = Math.max(60, Math.min(WORLD_W - 60, state.x + (state.x > WORLD_W - 200 ? -90 : 90)));
    burst(state.x, 380, 30);
    if (!silent) speak('Dag eenhoorn!');
}

document.getElementById('dismount').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    dismountUnicorn(false);
});

function maxAlt() {
    const topY = -state.offsetY / state.scale;
    return Math.max(120, FEET_Y - PRINCESS_H - RIDE_LIFT - 20 - topY);
}

function setFlying(on, silent) {
    state.flying = on;
    const btns = document.getElementById('rideBtns');
    btns.classList.toggle('flying', on);
    document.getElementById('flyBtn').textContent = on ? '⬇️ Landen' : '✨ Vliegen';
    unicornEl().classList.toggle('flying', on);
    princessEl().classList.toggle('flying', on);
    if (on) {
        state.targetAlt = maxAlt() * 0.6;
        playFreqSweep(300, 1400, 0.6, 0.15);
        sparkleShower(state.x, 300, 60);
        if (!silent) speak('Vliegen! Omhoog! Tik in de lucht waar je heen wilt!');
    } else {
        state.targetAlt = 0;
        if (!silent) {
            playFreqSweep(1000, 300, 0.6, 0.12);
            speak('Landen! Goed zo!');
        }
    }
}

document.getElementById('flyBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!state.riding || state.busy) return;
    setFlying(!state.flying, false);
});

function placeSkyStar(star, i) {
    const n = 10;
    star.x = 150 + (i + Math.random() * 0.7) * ((ROOM_W * ROOMS_OUT.length - 300) / n);
    star.y = 40 + Math.random() * 190;
    star.node.style.left = star.x + 'px';
    star.node.style.top = star.y + 'px';
}

function checkSkyStars() {
    const py = FEET_Y - 110 - state.alt;
    state.skyStars.forEach((star, i) => {
        if (star.got) return;
        if (Math.abs(star.x - state.x) < 60 && Math.abs(star.y - py) < 70) {
            star.got = true;
            star.node.classList.add('got');
            burst(star.x, star.y, 36);
            playSparkleSound();
            if (Math.random() < 0.4) speak(randomPick(['Een ster gevangen!', 'Sterretje!', 'Hoera, een ster!']));
            setTimeout(() => {
                star.got = false;
                star.node.classList.remove('got');
                placeSkyStar(star, i);
            }, 7000);
        }
    });
}

function fountainSplash() {
    state.fountainBoost = performance.now() + 2500;
    playFreqSweep(900, 300, 0.3, 0.2);
    setTimeout(() => playFreqSweep(1200, 400, 0.25, 0.15), 150);
    sayRandom(['Plons! Glitterwater!', 'Wat een mooie fontein!', 'Spetter spetter!']);
    for (let i = 0; i < 60; i++) {
        spawnSparkle(700, 205, { vx: (Math.random() - 0.5) * 260, vy: -200 - Math.random() * 200, g: 380, hue: 180 + Math.random() * 40, max: 1.4 });
    }
}

function bloomGrow(node, name, hue) {
    node.classList.remove('grow');
    void node.offsetWidth;
    node.classList.add('grow');
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 3);
    for (let i = 0; i < 36; i++) spawnSparkle(p.x, p.y, { hue: hue + (Math.random() - 0.5) * 30, speed: 220 });
    playCorrect();
    speak(name);
}

function butterflyTap(node) {
    node.classList.add('flyaway');
    speak('Een vlinder! Vlieg maar!');
    playSparkleSound();
    setTimeout(() => node.classList.remove('flyaway'), 3500);
}

function beeBuzz() {
    playTone(220, 0.5, 0.12, 'sawtooth');
    setTimeout(() => playTone(240, 0.4, 0.1, 'sawtooth'), 250);
    speak('Zoem zoem! Een bij!');
}

function quack() {
    playTone(420, 0.1, 0.18, 'square');
    setTimeout(() => playTone(380, 0.12, 0.18, 'square'), 160);
}

function frogJump(node) {
    node.classList.remove('jump');
    void node.offsetWidth;
    node.classList.add('jump');
    playFreqSweep(300, 900, 0.2, 0.2);
    setTimeout(() => { playTone(180, 0.12, 0.2, 'square'); setTimeout(() => playTone(160, 0.14, 0.2, 'square'), 170); }, 450);
    speak('Kwak kwak! Een kikker!');
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.bottom);
    setTimeout(() => splash(p.x, p.y + 10), 600);
}

function splash(x, y) {
    const rip = el('<div class="ripple"></div>');
    place(rip, x, y);
    setTimeout(() => rip.remove(), 1000);
    for (let i = 0; i < 24; i++) {
        spawnSparkle(x, y, { vx: (Math.random() - 0.5) * 160, vy: -120 - Math.random() * 140, g: 400, hue: 190 + Math.random() * 30, max: 0.9 });
    }
    playFreqSweep(1400, 300, 0.12, 0.2);
}

function appleDrop(node) {
    const apple = [...node.querySelectorAll('.apple')].find(a => !a.classList.contains('fall'));
    if (!apple) return;
    apple.classList.add('fall');
    playFreqSweep(900, 250, 0.6, 0.15);
    setTimeout(() => playTone(160, 0.1, 0.25, 'triangle'), 750);
    speak(state.riding ? 'Een appel! Lekker voor de eenhoorn!' : 'Een appel valt uit de boom!');
    setTimeout(() => apple.classList.remove('fall'), 4000);
}

function swingRide() {
    state.busy = true;
    state.facing = 1;
    const sw = state.swing;
    state.x = sw.x;
    const lift = -64;
    const princessTop = FEET_Y - PRINCESS_H + lift;
    state.anim = { dx: 0, dy: lift, rot: 0, origin: `${PRINCESS_W / 2}px ${sw.pivotY - princessTop}px` };
    speak('Wiiii! Schommelen!');
    let lastSign = 0;
    tween(6000, (t, now) => {
        const amp = 32 * Math.sin(Math.PI * Math.min(1, t * 1.3)) * (1 - t * 0.6);
        const rot = amp * Math.sin(t * Math.PI * 2 * 4);
        state.anim.rot = rot;
        sw.node.style.transform = `rotate(${rot}deg)`;
        const sign = Math.sign(Math.cos(t * Math.PI * 2 * 4));
        if (sign !== lastSign) {
            lastSign = sign;
            playFreqSweep(sign > 0 ? 400 : 600, sign > 0 ? 700 : 350, 0.25, 0.08);
        }
        if (Math.random() < 0.5) {
            const a = rot * Math.PI / 180;
            spawnSparkle(sw.x + Math.sin(a) * 150, sw.pivotY + Math.cos(a) * 150, { speed: 40, g: 20 });
        }
    }, () => {
        sw.node.style.transform = '';
        resetAnim();
        state.busy = false;
        sayRandom(['Nog een keer?', 'Dat was leuk!']);
    });
}

function slideRide() {
    state.busy = true;
    state.facing = 1;
    const topDy = -(FEET_Y - 176);
    const startX = state.x;
    speak('Klimmen maar!');
    tween(1400, (t) => {
        state.anim.dy = topDy * t + Math.sin(t * Math.PI * 8) * 4;
    }, () => {
        speak('Wieeee!');
        playFreqSweep(1200, 300, 0.9, 0.15);
        const endX = startX + 270;
        tween(1000, (t) => {
            const e = ease(t);
            state.x = startX + 40 + (endX - startX - 40) * e;
            state.anim.dy = topDy * (1 - e);
            state.anim.rot = 12 * Math.sin(Math.PI * t);
            for (let k = 0; k < 2; k++) {
                spawnSparkle(state.x - 30, FEET_Y - 40 + state.anim.dy, { vx: -80, vy: -30, g: 30, size: 6 });
            }
        }, () => {
            resetAnim();
            state.targetX = state.x;
            burst(state.x, 400, 40);
            playCorrect();
            state.busy = false;
        });
    });
}

/* ─────────── Theehuisje ─────────── */
const teaEl = document.getElementById('tea');
const cupSvg = document.getElementById('cupSvg');
const cupWrap = document.getElementById('cupWrap');
const potWrap = document.getElementById('potWrap');
const streamEl = document.getElementById('stream');
let teaOpen = false;
let teaTab = 'cup';
let teaBusy = false;

const CUPS = [
    { fill: '#f9a8d4', name: 'Het roze stippenkopje', dots: true },
    { fill: '#93c5fd', name: 'Het blauwe bloemenkopje', deco: '🌼' },
    { fill: 'url(#cgold)', name: 'Het gouden kopje', rim: '#fff' },
    { fill: 'url(#crb)', name: 'Het regenboogkopje' },
    { fill: '#ffffff', name: 'Het witte hartjeskopje', deco: '💖' },
    { fill: '#c4b5fd', name: 'Het paarse sterrenkopje', deco: '⭐' }
];
const TEAS = [
    { c: '#c2410c', name: 'Gewone thee', short: 'Thee' },
    { c: '#f472b6', name: 'Aardbeienthee', short: 'Aardbei' },
    { c: '#4ade80', name: 'Muntthee', short: 'Munt' },
    { c: '#8b5cf6', name: 'Bosbessenthee', short: 'Bosbes' },
    { c: '#6b3a1e', name: 'Warme chocolademelk', short: 'Choco' },
    { c: 'url(#teaRb)', name: 'Regenboogthee', short: 'Regenboog', css: 'linear-gradient(90deg,#ef4444,#facc15,#4ade80,#60a5fa,#c084fc)' }
];
const TOPPINGS = [
    { id: 'suiker', e: '🧊', name: 'Een suikerklontje' },
    { id: 'melk', e: '🥛', name: 'Een scheutje melk' },
    { id: 'honing', e: '🍯', name: 'Honing' },
    { id: 'citroen', e: '🍋', name: 'Een schijfje citroen' },
    { id: 'aardbei', e: '🍓', name: 'Een aardbei' },
    { id: 'slagroom', e: '🍦', name: 'Slagroom' },
    { id: 'hagelslag', e: '🎉', name: 'Hagelslag' },
    { id: 'marshmallow', e: '🍡', name: 'Marshmallows' },
    { id: 'bloem', e: '🌸', name: 'Een bloemetje' },
    { id: 'glitter', e: '✨', name: 'Glitter' },
    { id: 'koekje', e: '🍪', name: 'Een koekje' }
];
const GUESTS = [
    { e: '🧸', name: 'Beer' },
    { e: '🐱', name: 'Poes' },
    { e: '🦄', name: 'Eenhoorn' },
    { e: '🐰', name: 'Konijn' }
];
let cup = { design: 0, tea: null, tops: [] };

function mixWhite(hex, amt) {
    if (!hex.startsWith('#')) return hex;
    const n = parseInt(hex.slice(1), 16);
    const mix = v => Math.round(v + (255 - v) * amt);
    const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
    return `rgb(${r},${g},${b})`;
}

function cupBody(d) {
    const c = CUPS[d];
    let deco = '';
    if (c.dots) deco += `<path d="M40 62 L200 62 Q196 168 120 176 Q44 168 40 62 Z" fill="url(#cdots)" opacity=".85"/>`;
    if (c.deco) deco += [[82, 118], [120, 138], [158, 118]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="24" text-anchor="middle" dominant-baseline="central">${c.deco}</text>`).join('');
    return `
        <ellipse cx="120" cy="184" rx="112" ry="16" fill="#fff" stroke="#f9a8d4" stroke-width="3"/>
        <ellipse cx="120" cy="182" rx="70" ry="8" fill="#fdf2f8"/>
        <path d="M196 86 q44 -2 38 36 q-6 30 -48 30" fill="none" stroke="${c.fill}" stroke-width="15" stroke-linecap="round"/>
        <path d="M196 86 q44 -2 38 36 q-6 30 -48 30" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
        <path d="M40 62 L200 62 Q196 168 120 176 Q44 168 40 62 Z" fill="${c.fill}" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
        ${deco}
        <ellipse cx="120" cy="62" rx="80" ry="16" fill="#fff7ed" stroke="${c.rim || '#fcd34d'}" stroke-width="5"/>`;
}

function teaFill() {
    if (!cup.tea) return 'transparent';
    const t = TEAS[cup.tea];
    return cup.tops.includes('melk') ? mixWhite(t.c, 0.45) : t.c;
}

function renderCup(animateTop) {
    const has = id => cup.tops.includes(id);
    const surfaceTopY = 66;
    let tops = '';
    const it = (id, inner) => `<g class="top-item${animateTop === id ? ' drop' : ''}">${inner}</g>`;
    if (has('melk') && cup.tea) tops += it('melk', `<path class="swirl" d="M92 66 q14 -8 28 0 t28 0" stroke="#fff" stroke-width="4" fill="none" opacity=".85" stroke-linecap="round"/>`);
    if (has('honing')) tops += it('honing', `<path class="swirl" d="M100 64 q20 10 40 0 q-10 -8 -20 -2 q-6 4 0 6" stroke="#fbbf24" stroke-width="5" fill="none" stroke-linecap="round"/>`);
    if (has('suiker')) tops += it('suiker', `<g class="bob-item"><rect x="78" y="56" width="16" height="14" rx="3" fill="#fff" stroke="#e5e7eb"/><rect x="146" y="58" width="15" height="13" rx="3" fill="#fff" stroke="#e5e7eb"/></g>`);
    if (has('marshmallow')) tops += it('marshmallow', `<g class="bob-item"><rect x="100" y="52" width="18" height="16" rx="7" fill="#fbcfe8"/><rect x="122" y="54" width="18" height="15" rx="7" fill="#fff"/><rect x="112" y="46" width="17" height="15" rx="7" fill="#fff" stroke="#fbcfe8"/></g>`);
    if (has('slagroom')) tops += it('slagroom', `<g><circle cx="95" cy="56" r="17" fill="#fff"/><circle cx="145" cy="56" r="17" fill="#fff"/><circle cx="120" cy="48" r="22" fill="#fff"/><circle cx="120" cy="28" r="13" fill="#fff"/><path d="M120 12 q6 4 0 10" fill="#fff"/></g>`);
    if (has('hagelslag')) {
        const y0 = has('slagroom') ? 36 : 60;
        const cols = ['#ef4444', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6'];
        let sp = '';
        for (let i = 0; i < 16; i++) {
            const x = 96 + (i * 37) % 50, y = y0 + (i * 13) % 20;
            sp += `<rect x="${x}" y="${y}" width="8" height="3" rx="1.5" fill="${cols[i % cols.length]}" transform="rotate(${(i * 47) % 180} ${x + 4} ${y + 1.5})"/>`;
        }
        tops += it('hagelslag', sp);
    }
    if (has('bloem')) tops += it('bloem', `<text x="120" y="${has('slagroom') ? 16 : 56}" font-size="28" text-anchor="middle" dominant-baseline="central">🌸</text>`);
    if (has('glitter')) {
        let g = '';
        [[96, 62], [118, 70], [140, 60], [108, 56], [150, 68], [128, 50], [86, 68]].forEach(([x, y], i) => {
            g += `<circle cx="${x}" cy="${y - (has('slagroom') ? 20 : 0)}" r="${2 + (i % 3)}" fill="#fff" class="gl-dot" style="animation: glTwinkle 0.8s ${-i * 0.2}s ease-in-out infinite alternate"/>`;
        });
        tops += it('glitter', g);
    }
    if (has('citroen')) tops += it('citroen', `<text x="196" y="58" font-size="34" text-anchor="middle" dominant-baseline="central">🍋</text>`);
    if (has('aardbei')) tops += it('aardbei', `<text x="46" y="54" font-size="32" text-anchor="middle" dominant-baseline="central">🍓</text>`);
    if (has('koekje')) tops += it('koekje', `<text x="30" y="178" font-size="34" text-anchor="middle" dominant-baseline="central">🍪</text>`);

    cupSvg.innerHTML = `${cupBody(cup.design)}
        <ellipse class="tea-surface${cup.tea ? '' : ' empty'}" cx="120" cy="${surfaceTopY}" rx="73" ry="12" fill="${teaFill()}"/>
        ${tops}
        <g class="spoon"><line x1="120" y1="66" x2="150" y2="-10" stroke="#d4d4d8" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="152" cy="-16" rx="7" ry="10" fill="#e4e4e7"/></g>`;
}

function renderPot() {
    document.getElementById('potSvg').innerHTML = `
        <path d="M40 78 Q4 60 6 40" stroke="#f472b6" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M122 62 q34 4 30 34 q-4 22 -30 22" stroke="#f472b6" stroke-width="12" fill="none"/>
        <ellipse cx="80" cy="96" rx="52" ry="46" fill="#f9a8d4" stroke="#ec4899" stroke-width="3"/>
        <path d="M34 96 Q80 116 126 96" stroke="#fff" stroke-width="5" fill="none"/>
        <text x="80" y="82" font-size="22" text-anchor="middle" dominant-baseline="central">🌸</text>
        <ellipse cx="80" cy="54" rx="34" ry="10" fill="#fbcfe8" stroke="#ec4899" stroke-width="3"/>
        <circle cx="80" cy="42" r="8" fill="#fcd34d"/>`;
}

function renderGuests() {
    document.getElementById('guests').innerHTML = GUESTS.map((g, i) =>
        `<button class="guest" data-g="${i}">${g.e}<span class="gname">${g.name}</span><span class="gcup">☕</span></button>`).join('');
    document.querySelectorAll('.guest').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            serveTea(+btn.dataset.g, btn);
        });
    });
}

function renderTabs() {
    const tabs = [['cup', '☕ Kopje'], ['tea', '🫖 Thee'], ['tops', '🍓 Erin']];
    const el2 = document.getElementById('teaTabs');
    el2.innerHTML = tabs.map(([k, label]) => `<button class="tea-tab${teaTab === k ? ' active' : ''}" data-k="${k}">${label}</button>`).join('');
    el2.querySelectorAll('.tea-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        teaTab = b.dataset.k;
        playPop();
        renderTabs();
        renderOpts();
    }));
}

function renderOpts() {
    const box = document.getElementById('teaOpts');
    if (teaTab === 'cup') {
        box.innerHTML = CUPS.map((c, i) => `<button class="tea-opt${cup.design === i ? ' sel' : ''}" data-i="${i}">
            <svg viewBox="0 0 240 200">${cupBody(i)}</svg></button>`).join('');
        box.querySelectorAll('.tea-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            chooseCup(+b.dataset.i);
        }));
    } else if (teaTab === 'tea') {
        box.innerHTML = TEAS.map((t, i) => `<button class="tea-opt${cup.tea === i ? ' sel' : ''}" data-i="${i}">
            <span class="drop-dot" style="background:${t.css || t.c}"></span><small>${t.short}</small></button>`).join('');
        box.querySelectorAll('.tea-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            pourTea(+b.dataset.i);
        }));
    } else {
        box.innerHTML = TOPPINGS.map((t, i) => `<button class="tea-opt${cup.tops.includes(t.id) ? ' sel' : ''}" data-i="${i}">${t.e}</button>`).join('') +
            `<button class="tea-opt stir-btn" id="stirBtn">🥄<small>Roeren</small></button>`;
        box.querySelectorAll('.tea-opt[data-i]').forEach(b => b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            addTopping(+b.dataset.i);
        }));
        document.getElementById('stirBtn').addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            stirTea();
        });
    }
}

function teaSpark(el2, n = 8) {
    const r = el2.getBoundingClientRect();
    const o = teaEl.getBoundingClientRect();
    const x = r.left + r.width / 2 - o.left;
    const y = r.top + r.height / 3 - o.top;
    const icons = ['✨', '⭐', '💖', '🌟', '💫'];
    for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(icons);
        const a = Math.random() * Math.PI * 2;
        const d = 50 + Math.random() * 60;
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        teaEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function sayNow(text) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    setTimeout(() => speak(text), 40);
}

function chooseCup(i) {
    if (teaBusy) return;
    cup.design = i;
    renderCup();
    playPop();
    teaSpark(cupWrap);
    sayNow(CUPS[i].name + '!');
    teaTab = 'tea';
    renderTabs();
    renderOpts();
}

function pourTea(i) {
    if (teaBusy) return;
    teaBusy = true;
    cup.tea = i;
    const t = TEAS[i];
    sayNow(t.name + '! Inschenken maar!');
    potWrap.classList.add('pour');
    const stage = document.getElementById('teaStage').getBoundingClientRect();
    setTimeout(() => {
        const pr = potWrap.getBoundingClientRect();
        const cr = cupWrap.getBoundingClientRect();
        const x = pr.left - stage.left + pr.width * 0.12;
        const y = pr.top - stage.top + pr.height * 0.42;
        const endY = cr.top - stage.top + cr.height * 0.32;
        streamEl.style.left = x + 'px';
        streamEl.style.top = y + 'px';
        streamEl.style.height = Math.max(20, endY - y) + 'px';
        streamEl.style.background = t.css || t.c;
        streamEl.classList.add('on');
        for (let k = 0; k < 5; k++) setTimeout(() => playFreqSweep(260 + k * 30, 420 + k * 40, 0.14, 0.12), k * 180);
    }, 450);
    setTimeout(() => renderCup(), 800);
    setTimeout(() => {
        streamEl.classList.remove('on');
        potWrap.classList.remove('pour');
        teaSpark(cupWrap, 10);
        teaBusy = false;
        teaTab = 'tops';
        renderTabs();
        renderOpts();
    }, 1600);
}

function addTopping(i) {
    if (teaBusy) return;
    const t = TOPPINGS[i];
    if (!cup.tea && !['koekje', 'citroen', 'aardbei'].includes(t.id)) {
        sayNow('Eerst thee inschenken!');
        teaTab = 'tea';
        renderTabs();
        renderOpts();
        return;
    }
    if (!cup.tops.includes(t.id)) cup.tops.push(t.id);
    renderCup(t.id);
    renderOpts();
    playTone(1000 + i * 60, 0.12, 0.14, 'triangle');
    if (t.id === 'glitter') playSparkleSound();
    teaSpark(cupWrap, 6);
    sayNow(t.name + '!');
}

function stirTea() {
    if (teaBusy || !cup.tea) {
        if (!cup.tea) sayNow('Eerst thee inschenken!');
        return;
    }
    teaBusy = true;
    cupSvg.classList.add('stirring');
    sayNow('Roeren, roeren, roeren!');
    for (let k = 0; k < 6; k++) setTimeout(() => playTone(2200 + (k % 2) * 300, 0.05, 0.08, 'sine'), k * 250);
    setTimeout(() => {
        cupSvg.classList.remove('stirring');
        teaBusy = false;
    }, 1550);
}

function serveTea(g, btn) {
    if (teaBusy) return;
    if (!cup.tea) {
        sayNow(GUESTS[g].name + ' wil graag thee! Kies eerst een kleurtje thee.');
        return;
    }
    teaBusy = true;
    const cr = cupWrap.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const dx = (br.left + br.width / 2) - (cr.left + cr.width / 2);
    const dy = (br.top + br.height / 2) - (cr.top + cr.height / 2);
    cupWrap.style.transform = `translate(calc(-50% + ${dx}px), ${dy}px) scale(0.25)`;
    playFreqSweep(500, 900, 0.3, 0.12);
    setTimeout(() => {
        cupWrap.style.opacity = '0';
        btn.classList.remove('drink');
        void btn.offsetWidth;
        btn.classList.add('drink', 'served');
        playFreqSweep(900, 200, 0.5, 0.15);
        teaSpark(btn, 12);
        const yum = cup.tops.length >= 3 ? 'Mmm, wat een feestthee!' : 'Mmm, lekker!';
        sayNow(`${GUESTS[g].name} zegt: slurp slurp! ${yum}`);
    }, 620);
    setTimeout(() => {
        cup = { design: cup.design, tea: null, tops: [] };
        cupWrap.style.transition = 'none';
        cupWrap.style.transform = '';
        cupWrap.style.opacity = '';
        renderCup();
        void cupWrap.offsetWidth;
        cupWrap.style.transition = '';
        cupWrap.classList.remove('fresh');
        void cupWrap.offsetWidth;
        cupWrap.classList.add('fresh');
        teaBusy = false;
        teaTab = 'cup';
        renderTabs();
        renderOpts();
        if (document.querySelectorAll('.guest.served').length === GUESTS.length) {
            playWin();
            sayNow('Iedereen heeft thee! Theefeest!');
            document.querySelectorAll('.guest').forEach((b, k) => setTimeout(() => teaSpark(b, 10), k * 150));
            setTimeout(() => document.querySelectorAll('.guest').forEach(b => b.classList.remove('served')), 3000);
        }
    }, 2200);
}

function openTea() {
    teaOpen = true;
    teaEl.classList.add('open');
    cup = { design: cup.design, tea: null, tops: [] };
    teaTab = 'cup';
    renderCup();
    renderPot();
    renderGuests();
    renderTabs();
    renderOpts();
    speak('Welkom in het theehuisje! Kies een kopje!');
    playMusicBox();
}

function closeTea() {
    teaOpen = false;
    teaEl.classList.remove('open');
    _playWhoosh();
    sayRandom(['Dag theehuisje!', 'Dat was een lekker theefeest!']);
}
document.getElementById('teaClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeTea();
});
teaEl.addEventListener('pointerdown', (e) => e.stopPropagation());

/* ─────────── Bootje ─────────── */
function boardBoat() {
    if (state.boating) return;
    state.busy = true;
    const from = state.x;
    playFreqSweep(300, 900, 0.3, 0.15);
    tween(500, (t) => {
        state.x = from + (BOAT_HOME - from) * t;
        state.anim.dy = -Math.sin(Math.PI * t) * 60;
    }, () => {
        resetAnim();
        state.x = state.targetX = BOAT_HOME;
        state.boating = true;
        state.facing = 1;
        document.getElementById('boatBtns').classList.add('show');
        splash(state.x, 440);
        state.busy = false;
        walkTo(BOAT_HOME + 260, null);
    });
}

function leaveBoat(instant) {
    if (!state.boating) return;
    if (instant) {
        state.boating = false;
        document.getElementById('boatBtns').classList.remove('show');
        return;
    }
    walkTo(BOAT_HOME, () => {
        state.busy = true;
        state.boating = false;
        document.getElementById('boatBtns').classList.remove('show');
        tween(500, (t) => {
            state.x = BOAT_HOME + (LAKE_X0 - 40 - BOAT_HOME) * t;
            state.anim.dy = -Math.sin(Math.PI * t) * 60;
        }, () => {
            resetAnim();
            state.targetX = state.x;
            state.busy = false;
            playCorrect();
        });
    });
}

document.getElementById('unboatBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!state.busy) leaveBoat(false);
});

function updateBoat(now, moving) {
    const sail = document.getElementById('boatSail');
    const hull = document.getElementById('boatHull');
    if (!sail) return;
    const bx = state.boating ? state.x : BOAT_HOME;
    const by = FEET_Y - 150 + Math.sin(now / 450) * 3;
    const left = state.boating && state.facing < 0;
    [sail, hull].forEach(n => {
        n.style.transform = `translate(${bx - 110}px, ${by}px) rotate(${Math.sin(now / 700) * 2}deg)`;
        n.classList.toggle('left', left);
    });
    const hit = sail.parentNode.querySelector('.boat-hit');
    if (hit) {
        hit.style.left = (bx - 100) + 'px';
        hit.style.top = (by + 10) + 'px';
        hit.style.display = state.boating ? 'none' : '';
    }
    if (state.boating && moving) {
        if (Math.random() < 0.8) {
            spawnSparkle(bx - state.facing * 100, FEET_Y - 6, { vx: -state.facing * 50, vy: -30 - Math.random() * 40, g: 120, hue: 190 + Math.random() * 25, size: 3 + Math.random() * 4, max: 0.8 });
        }
        state.swishT -= 1 / 60;
        if (state.swishT <= 0) {
            state.swishT = 0.6;
            playFreqSweep(500, 200, 0.3, 0.05);
        }
    }
}

function openTreasure() {
    const tr = document.getElementById('treasure');
    if (!state.boating) {
        // You need the boat to reach the island: nudge the boat
        const hit = document.querySelector('.boat-hit');
        if (hit) { hit.classList.remove('tap'); void hit.offsetWidth; hit.classList.add('tap'); }
        splash(BOAT_HOME, 440);
        return;
    }
    if (tr.classList.contains('open')) return;
    tr.classList.add('open');
    playWin();
    const x = ROOM_W * 5 + 710, y = 330;
    for (let i = 0; i < 70; i++) spawnSparkle(x, y, { vx: (Math.random() - 0.5) * 300, vy: -200 - Math.random() * 250, g: 380, hue: randomPick([45, 50, 190, 320]), size: 5 + Math.random() * 6, max: 1.5 });
    ['💎', '👑', '💍', '🪙', '⭐'].forEach((e, i) => {
        const f = tempEl(`<div class="magic-fly">${e}</div>`, x - 18, y - 20, 3300);
        f.style.setProperty('--dx', ((i - 2) * 70) + 'px');
        f.style.setProperty('--dy', (-160 - Math.random() * 80) + 'px');
    });
    setTimeout(() => tr.classList.remove('open'), 4500);
}

