/* ❄️ IJskamer */
// Ice rink (world x), set when the room is built; the princess glides here
let ICE_X0 = 0;
let ICE_X1 = 0;

defineRoom({
    key: 'ijskamer',
    name: 'IJskamer',
    icon: '❄️',
    say: 'De ijskamer',
    build(rsn) {
        place(el(`<div class="icicles"><svg viewBox="0 0 800 50" preserveAspectRatio="none"><g fill="#e0f2fe" stroke="#fff" stroke-width="1.5"><path d="M0 0 L10 28 L20 0 Z"/><path d="M20 0 L30 22 L40 0 Z"/><path d="M40 0 L50 30 L60 0 Z"/><path d="M60 0 L70 38 L80 0 Z"/><path d="M80 0 L90 19 L100 0 Z"/><path d="M100 0 L110 20 L120 0 Z"/><path d="M120 0 L130 44 L140 0 Z"/><path d="M140 0 L150 35 L160 0 Z"/><path d="M160 0 L170 21 L180 0 Z"/><path d="M180 0 L190 29 L200 0 Z"/><path d="M200 0 L210 36 L220 0 Z"/><path d="M220 0 L230 19 L240 0 Z"/><path d="M240 0 L250 34 L260 0 Z"/><path d="M260 0 L270 24 L280 0 Z"/><path d="M280 0 L290 19 L300 0 Z"/><path d="M300 0 L310 20 L320 0 Z"/><path d="M320 0 L330 31 L340 0 Z"/><path d="M340 0 L350 31 L360 0 Z"/><path d="M360 0 L370 20 L380 0 Z"/><path d="M380 0 L390 25 L400 0 Z"/><path d="M400 0 L410 20 L420 0 Z"/><path d="M420 0 L430 35 L440 0 Z"/><path d="M440 0 L450 31 L460 0 Z"/><path d="M460 0 L470 19 L480 0 Z"/><path d="M480 0 L490 44 L500 0 Z"/><path d="M500 0 L510 36 L520 0 Z"/><path d="M520 0 L530 21 L540 0 Z"/><path d="M540 0 L550 25 L560 0 Z"/><path d="M560 0 L570 38 L580 0 Z"/><path d="M580 0 L590 38 L600 0 Z"/><path d="M600 0 L610 36 L620 0 Z"/><path d="M620 0 L630 19 L640 0 Z"/><path d="M640 0 L650 36 L660 0 Z"/><path d="M660 0 L670 36 L680 0 Z"/><path d="M680 0 L690 30 L700 0 Z"/><path d="M700 0 L710 19 L720 0 Z"/><path d="M720 0 L730 25 L740 0 Z"/><path d="M740 0 L750 19 L760 0 Z"/><path d="M760 0 L770 35 L780 0 Z"/><path d="M780 0 L790 45 L800 0 Z"/></g></svg></div>`), rsn, 0);
        ICE_X0 = rsn + 360;
        ICE_X1 = rsn + 770;
        place(el('<div class="ice-rink"></div>'), ICE_X0 - 20, 400).style.width = (ICE_X1 - ICE_X0 + 40) + 'px';
        state.roomSnowman = addObj(`<div class="room-snowman"><div class="tap-hint" style="top:-40px">👇</div></div>`, rsn + 60, 215, rsn + 230, openSnowman);
        addObj('<div class="snow-globe"><div class="globe">🏰</div><div class="stand"></div><div class="ped"></div></div>', rsn + 250, 240, rsn + 300, shakeSnowGlobe);
        addObj('<div class="skate-sign">⛸️</div>', rsn + 380, 300, rsn + 420, () => danceMove('spin'));
        [[600, 370, 0], [690, 380, -3.5]].forEach(([x, y, d]) => {
            const pg = addObj('<div class="penguin slide">🐧</div>', rsn + x, y, rsn + x - 60, (node) => {
                node.classList.remove('hop'); void node.offsetWidth; node.classList.add('hop');
                playFreqSweep(1200, 1800, 0.1, 0.15);
                setTimeout(() => node.classList.remove('hop'), 1000);
            });
            pg.style.animationDelay = d + 's';
        });
        addObj('<div class="emoji-obj" style="font-size:72px">🐻‍❄️</div>', rsn + 680, 200, rsn + 660, (node) => {
            playTone(140, 0.4, 0.2, 'sawtooth');
            const r = node.getBoundingClientRect();
            const c = screenToWorld(r.left + r.width / 2, r.top);
            for (let i = 0; i < 24; i++) spawnSparkle(c.x, c.y, { speed: 140 });
        });
    }
});

/* ─────────── IJskamer: sneeuwpop ─────────── */
const SM_KEY = 'noor-prinses-sneeuwpop';
const SM_SCARVES = ['#ef4444', '#f472b6', '#3b82f6', '#22c55e', '#a855f7', '#facc15'];
const sm = { cfg: { balls: 0, hat: 'none', nose: false, eyes: 'coal', scarf: -1, buttons: false, arms: false }, alive: false };
let smOpen = false;
let smSaved = null;
try { smSaved = JSON.parse(localStorage.getItem(SM_KEY)); } catch (e) {}

function snowmanSVG(c, dropBall) {
    const ball = (i, cx, cy, r) => c.balls > i ? `<circle class="sm-ball${dropBall === i ? ' drop' : ''}" cx="${cx}" cy="${cy}" r="${r}" fill="url(#smShade)" stroke="#bfdbfe" stroke-width="2"/>` : '';
    let h = `<defs><radialGradient id="smShade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f1f5f9"/><stop offset="1" stop-color="#bfdbfe"/></radialGradient></defs>
        <ellipse cx="100" cy="258" rx="70" ry="8" fill="rgba(59,130,246,0.15)"/>
        <g class="sm-body">`;
    if (c.arms && c.balls > 1) {
        h += `<g class="sm-arm-l"><path d="M62 125 L22 98 M40 110 L30 92 M34 106 L18 108" stroke="#78350f" stroke-width="5" stroke-linecap="round" fill="none"/></g>
              <g class="sm-arm-r"><path d="M138 125 L178 98 M160 110 L170 92 M166 106 L182 108" stroke="#78350f" stroke-width="5" stroke-linecap="round" fill="none"/></g>`;
    }
    h += ball(0, 100, 205, 55) + ball(1, 100, 128, 40) + ball(2, 100, 64, 30);
    if (c.balls > 1 && c.buttons) h += [108, 126, 144].map(y => `<circle cx="100" cy="${y}" r="5" fill="#1f2937"/>`).join('');
    if (c.balls > 2) {
        if (c.eyes === 'star') h += `<text x="89" y="58" font-size="13" text-anchor="middle" dominant-baseline="central">⭐</text><text x="111" y="58" font-size="13" text-anchor="middle" dominant-baseline="central">⭐</text>`;
        else if (c.eyes === 'heart') h += `<text x="89" y="58" font-size="12" text-anchor="middle" dominant-baseline="central">💖</text><text x="111" y="58" font-size="12" text-anchor="middle" dominant-baseline="central">💖</text>`;
        else h += `<circle cx="89" cy="57" r="4.5" fill="#1f2937"/><circle cx="111" cy="57" r="4.5" fill="#1f2937"/><circle cx="90.5" cy="55.5" r="1.4" fill="#fff"/><circle cx="112.5" cy="55.5" r="1.4" fill="#fff"/>`;
        h += [[86, 76], [93, 80], [100, 81], [107, 80], [114, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#1f2937"/>`).join('');
        h += `<circle cx="80" cy="70" r="5" fill="#fda4af" opacity=".6"/><circle cx="120" cy="70" r="5" fill="#fda4af" opacity=".6"/>`;
        if (c.nose) h += `<path d="M99 63 L130 70 L99 70 Z" fill="#f97316" stroke="#c2410c" stroke-width="1.2" stroke-linejoin="round"/>`;
        if (c.scarf >= 0) {
            const col = SM_SCARVES[c.scarf];
            h += `<path d="M70 90 Q100 104 130 90 L130 100 Q100 114 70 100 Z" fill="${col}"/>
                  <path d="M116 98 L122 132 L108 130 L106 100 Z" fill="${col}"/>
                  <path d="M74 94 L126 94 M110 116 L120 117" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>`;
        }
        if (c.hat === 'top') h += `<rect x="78" y="10" width="44" height="32" rx="3" fill="#1f2937"/><rect x="66" y="38" width="68" height="8" rx="4" fill="#1f2937"/><rect x="78" y="30" width="44" height="7" fill="#ef4444"/>`;
        if (c.hat === 'crown') h += `<path d="M76 40 L79 16 L90 30 L100 10 L110 30 L121 16 L124 40 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="27" r="4" fill="#ec4899"/>`;
        if (c.hat === 'bow') h += `<path d="M100 36 L76 22 L78 48 Z M100 36 L124 22 L122 48 Z" fill="#f472b6" stroke="#db2777" stroke-width="2"/><circle cx="100" cy="36" r="6" fill="#db2777"/>`;
        if (c.hat === 'beanie') h += `<path d="M72 46 Q72 12 100 12 Q128 12 128 46 Z" fill="#a855f7"/><rect x="70" y="40" width="60" height="10" rx="5" fill="#e9d5ff"/><circle cx="100" cy="10" r="9" fill="#f9a8d4"/>`;
    }
    return h + '</g>';
}

function renderSnowman(dropBall) {
    const svg = document.getElementById('smSvg');
    svg.innerHTML = snowmanSVG(sm.cfg, dropBall);
    svg.classList.toggle('sm-alive', sm.alive);
}

function renderRoomSnowman() {
    const node = state.roomSnowman;
    if (!node) return;
    const hint = node.querySelector('.tap-hint');
    node.innerHTML = smSaved ? `<svg viewBox="0 0 200 270" class="sm-alive">${snowmanSVG(smSaved).replace('id="smShade"', 'id="smShadeRoom"').replace(/url\(#smShade\)/g, 'url(#smShadeRoom)')}</svg>`
        : '<div style="font-size:130px;line-height:1;text-align:center;padding-top:50px;filter:drop-shadow(0 6px 6px rgba(59,130,246,0.3))">⛄</div>';
    if (hint) node.appendChild(hint);
    else node.insertAdjacentHTML('beforeend', '<div class="tap-hint" style="top:-40px">👇</div>');
}

function renderSmTray() {
    const c = sm.cfg;
    const tray = document.getElementById('smTray');
    if (c.balls < 3) {
        tray.innerHTML = `<button class="sm-btn big" id="smRoll">❄️<small>Sneeuwbal ${c.balls + 1}</small></button>`;
        document.getElementById('smRoll').addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            sm.cfg.balls++;
            renderSnowman(sm.cfg.balls - 1);
            playFreqSweep(300, 120, 0.4, 0.2);
            setTimeout(() => playTone(120, 0.15, 0.2, 'triangle'), 450);
            renderSmTray();
        });
        return;
    }
    const hats = [['top', '🎩'], ['crown', '👑'], ['bow', '🎀'], ['beanie', '🧶']];
    const eyes = { coal: '⚫', star: '⭐', heart: '💖' };
    tray.innerHTML =
        hats.map(([v, ic]) => `<button class="sm-btn${c.hat === v ? ' sel' : ''}" data-hat="${v}">${ic}</button>`).join('') +
        `<button class="sm-btn" data-act="eyes">${eyes[c.eyes]}<small>Ogen</small></button>` +
        `<button class="sm-btn${c.nose ? ' sel' : ''}" data-act="nose">🥕<small>Neus</small></button>` +
        `<button class="sm-btn${c.scarf >= 0 ? ' sel' : ''}" data-act="scarf">🧣<span class="sw" style="background:${c.scarf >= 0 ? SM_SCARVES[c.scarf] : '#e5e7eb'}"></span></button>` +
        `<button class="sm-btn${c.buttons ? ' sel' : ''}" data-act="buttons">🔘<small>Knopen</small></button>` +
        `<button class="sm-btn${c.arms ? ' sel' : ''}" data-act="arms">🌿<small>Armen</small></button>` +
        '<span class="care-sep"></span>' +
        `<button class="sm-btn big" id="smAlive">✨<small>Tot leven!</small></button>` +
        `<button class="sm-btn" id="smNew">🔄<small>Opnieuw</small></button>`;
    tray.querySelectorAll('[data-hat]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        c.hat = c.hat === b.dataset.hat ? 'none' : b.dataset.hat;
        smChanged();
    }));
    tray.querySelectorAll('[data-act]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const a = b.dataset.act;
        if (a === 'eyes') c.eyes = { coal: 'star', star: 'heart', heart: 'coal' }[c.eyes];
        if (a === 'nose') c.nose = !c.nose;
        if (a === 'scarf') c.scarf = c.scarf + 1 >= SM_SCARVES.length ? -1 : c.scarf + 1;
        if (a === 'buttons') c.buttons = !c.buttons;
        if (a === 'arms') c.arms = !c.arms;
        smChanged();
    }));
    document.getElementById('smAlive').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        sm.alive = true;
        renderSnowman();
        playJingle();
        saveSnowman();
    });
    document.getElementById('smNew').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        sm.cfg = { balls: 0, hat: 'none', nose: false, eyes: 'coal', scarf: -1, buttons: false, arms: false };
        sm.alive = false;
        renderSnowman();
        renderSmTray();
        playFreqSweep(900, 200, 0.4, 0.12);
    });
}

function smChanged() {
    renderSnowman();
    renderSmTray();
    [1319, 1760].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 0.08, 'sine'), i * 60));
    saveSnowman();
}

function saveSnowman() {
    if (sm.cfg.balls < 3) return;
    smSaved = { ...sm.cfg };
    try { localStorage.setItem(SM_KEY, JSON.stringify(smSaved)); } catch (e) {}
    renderRoomSnowman();
}

function playJingle() {
    const notes = [659, 659, 659, 0, 659, 659, 659, 0, 659, 784, 523, 587, 659];
    notes.forEach((f, i) => { if (f) setTimeout(() => playTone(f, 0.22, 0.12, 'triangle'), i * 180); });
    [0, 360, 720, 1080, 1440, 1800, 2160].forEach(t => setTimeout(() => playTone(2400, 0.05, 0.04, 'square'), t));
}

function openSnowman() {
    smOpen = true;
    document.getElementById('snowOv').classList.add('open');
    if (smSaved && smSaved.balls === 3) {
        sm.cfg = { ...smSaved };
        sm.alive = true;
    }
    renderSnowman();
    renderSmTray();
    playMusicBox();
}

function closeSnowman() {
    smOpen = false;
    document.getElementById('snowOv').classList.remove('open');
    saveSnowman();
    _playWhoosh();
}
document.getElementById('smClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeSnowman();
});
document.getElementById('snowOv').addEventListener('pointerdown', (e) => e.stopPropagation());

function shakeSnowGlobe(node) {
    node.classList.remove('shake'); void node.offsetWidth; node.classList.add('shake');
    [2093, 1760, 2349, 1976].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.06, 'sine'), i * 100));
    const v = viewRange();
    for (let i = 0; i < 120; i++) {
        spawnSparkle(v.left + Math.random() * (v.right - v.left), v.top + Math.random() * 300, {
            vx: (Math.random() - 0.5) * 120, vy: 30 + Math.random() * 80, g: 0, size: 4 + Math.random() * 5, max: 3 + Math.random() * 2
        });
    }
}
