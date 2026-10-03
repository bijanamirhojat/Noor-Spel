/* 💖 Hartjeskamer */
defineRoom({
    key: 'hartjeskamer',
    name: 'Hartjeskamer',
    icon: '💖',
    say: 'De hartjeskamer',
    build(rh) {
        [[60, 70], [590, 70]].forEach(([x, y]) => place(el(`<div class="heart-window">${heartSVG('url(#hwSky)', `<defs><linearGradient id="hwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#fbcfe8"/></linearGradient></defs>`, '#fff', 6)}</div>`), rh + x, y));
        [210, 520].forEach(x => place(el(`<div class="heart-lamp">${heartSVG('#fb7185')}</div>`), rh + x, 0));
        const pump = addObj(`<div class="heart-pump">${heartSVG('#e11d48')}<div class="tap-hint" style="top:-40px">👇</div></div>`, rh + 315, 220, rh + 270, pumpHeart);
        state.heartPump = { node: pump, size: 0 };
        place(el('<div class="bell-bar" style="width:290px"></div>'), rh + 40, 252);
        ['#fb7185', '#f472b6', '#e879f9', '#c084fc', '#a78bfa'].forEach((c, i) => {
            addObj(`<div class="heart-bell">${heartSVG(c)}</div>`, rh + 50 + i * 58, 258, rh + 78 + i * 58, (node) => ringHeartBell(node, i));
        });
        addObj(`<div class="heart-cushion">${heartSVG('#f9a8d4', '', '#fff', 4)}</div>`, rh + 520, 340, rh + 610, bounceCushion);
        [[40, 120], [700, 130]].forEach(([x, y], i) => {
            const b = addObj(`<div class="heart-balloon">${heartSVG(i ? '#c084fc' : '#fb7185')}</div>`, rh + x, y, rh + x + 30, balloonPop);
            b.style.animationDelay = (-i * 1.2) + 's';
        });
        addObj(`<div class="mailbox"><div class="post"></div><div class="box"></div><div class="slot"></div><span class="letter">💌</span><div class="tap-hint" style="top:-44px">👇</div></div>`, rh + 680, 220, rh + 660, () => openHeartPost('heart'));
    }
});

/* ─────────── Hartjeskamer ─────────── */
function heartSVG(fill, defs = '', stroke = '', sw = 0) {
    return `<svg class="heart-svg" viewBox="0 0 100 92">${defs}
        <path d="M50 88 C20 66 2 50 2 28 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 28 C98 50 80 66 50 88 Z"
            fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>
        <ellipse cx="28" cy="26" rx="10" ry="7" fill="#fff" opacity=".45" transform="rotate(-30 28 26)"/>
    </svg>`;
}

function pumpHeart(node) {
    const hp = state.heartPump;
    if (hp.boom) return;
    hp.size++;
    node.style.transform = `scale(${1 + hp.size * 0.16})`;
    playTone(400 + hp.size * 90, 0.15, 0.15, 'triangle');
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    burst(c.x, c.y, 10 + hp.size * 4);
    if (hp.size < 6) return;
    hp.boom = true;
    node.classList.add('boom');
    playFreqSweep(200, 60, 0.3, 0.3);
    setTimeout(playWin, 150);
    for (let i = 0; i < 120; i++) {
        spawnSparkle(c.x, c.y, { speed: 420, g: 160, size: 6 + Math.random() * 8, max: 1.6 + Math.random() });
    }
    spellRain(['💖', '💕', '💗', '💓', '❤️', '💝']);
    setTimeout(() => {
        node.classList.remove('boom');
        node.style.transition = 'none';
        node.style.transform = 'scale(0.2)';
        void node.offsetWidth;
        node.style.transition = '';
        node.style.transform = '';
        hp.size = 0;
        hp.boom = false;
    }, 2200);
}

const BELL_NOTES = [523, 587, 659, 784, 880];
function ringHeartBell(node, i) {
    node.classList.remove('ring');
    void node.offsetWidth;
    node.classList.add('ring');
    playTone(BELL_NOTES[i], 0.6, 0.18, 'sine');
    playTone(BELL_NOTES[i] * 2, 0.4, 0.05, 'sine');
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    for (let k = 0; k < 10; k++) spawnSparkle(c.x, c.y, { vy: -120 - Math.random() * 80, vx: (Math.random() - 0.5) * 80, g: 40 });
}

function bounceCushion(node) {
    if (state.busy) return;
    state.busy = true;
    const bounces = 3;
    tween(1800, (t) => {
        const k = (t * bounces) % 1;
        const height = 140 * (1 - t * 0.4);
        state.anim.dy = -Math.sin(Math.PI * k) * height - 26;
    }, () => {
        resetAnim();
        state.busy = false;
    });
    for (let b = 0; b < bounces; b++) {
        setTimeout(() => {
            node.classList.remove('squish');
            void node.offsetWidth;
            node.classList.add('squish');
            playFreqSweep(200, 700, 0.25, 0.18);
            burst(state.x, 380, 20);
        }, b * 600);
    }
}

/* Hartjespost / Sterrenpost: draw with a trail of stamps, sign your name, send it */
const hpEl = document.getElementById('hpost');
const hpPaper = document.getElementById('hpPaper');
const hpHearts = document.getElementById('hpHearts');
const hpNameEl = document.getElementById('hpName');
const hpKbd = document.getElementById('hpKbd');
let hpOpen = false;
const HP_THEMES = {
    heart: { title: '💌 Hartjespost', stamps: ['❤️', '🧡', '💛', '💚', '💙', '💜', '💖', '🌈'], env: '💌', sizeIcon: '💗',
             letters: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'] },
    star:  { title: '⭐ Sterrenpost', stamps: ['⭐', '🌟', '✨', '💫', '🌙', '☀️', '🪐', '🌈'], env: '✉️', sizeIcon: '⭐',
             letters: ['#fde047', '#fef3c7', '#fbbf24', '#a5f3fc', '#f9a8d4', '#c4b5fd', '#ffffff'] }
};
const HP_SIZES = [[22, 'S'], [36, 'M'], [56, 'L']];
const HP_NAME_KEY = 'noor-prinses-naam';
const hp = { theme: 'heart', heart: 0, size: 1, drawing: false, last: null, rainbow: 0, count: 0, name: '' };
try { hp.name = (localStorage.getItem(HP_NAME_KEY) || '').slice(0, 14); } catch (e) {}

function hpTheme() { return HP_THEMES[hp.theme]; }

function renderHpName() {
    const t = hpTheme();
    const size = Math.min(56, Math.max(28, hpPaper.clientWidth / Math.max(6, hp.name.length + 2)));
    hpNameEl.style.fontSize = size + 'px';
    hpNameEl.innerHTML = hp.name.split('').map((ch, i) =>
        ch === ' ' ? '<span>&nbsp;</span>' : `<span style="color:${t.letters[i % t.letters.length]}">${ch}</span>`).join('');
}

function saveHpName() {
    try { localStorage.setItem(HP_NAME_KEY, hp.name); } catch (e) {}
}

function renderHpKeyboard() {
    const rows = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ'];
    const cols = hpTheme().letters;
    hpKbd.innerHTML = rows.map((r, ri) => `<div class="row">${r.split('').map((ch, i) =>
        `<button class="hp-key" data-k="${ch}" style="background:${['#f472b6', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f87171'][(ri * 7 + i) % 7]}">${ch}</button>`).join('')}${ri === 3 ? '<button class="hp-key wide" data-k="⌫" style="background:#9ca3af">⌫</button>' : ''}</div>`).join('') +
        '<div class="row"><button class="hp-key wide" data-k=" " style="background:#c084fc;width:180px">spatie</button><button class="hp-key wide" data-k="ok" style="background:#22c55e">✅</button></div>';
    hpKbd.querySelectorAll('.hp-key').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const k = b.dataset.k;
        if (k === 'ok') {
            hpKbd.classList.remove('show');
            playCorrect();
            return;
        }
        if (k === '⌫') {
            hp.name = hp.name.slice(0, -1);
            playFreqSweep(700, 300, 0.12, 0.1);
        } else if (hp.name.length < 14) {
            hp.name += k;
            playTone(600 + (k.charCodeAt(0) % 26) * 40, 0.12, 0.12, 'triangle');
        }
        saveHpName();
        renderHpName();
    }));
}

function renderHpTools() {
    const t = hpTheme();
    const box = document.getElementById('hpTools');
    box.innerHTML =
        t.stamps.map((h, i) => `<button class="hp-btn${hp.heart === i ? ' sel' : ''}" data-h="${i}">${h}</button>`).join('') +
        '<span class="care-sep"></span>' +
        HP_SIZES.map(([px, l], i) => `<button class="hp-btn${hp.size === i ? ' sel' : ''}" data-s="${i}"><span style="font-size:${12 + i * 9}px">${t.sizeIcon}</span></button>`).join('') +
        '<span class="care-sep"></span>' +
        '<button class="hp-btn" id="hpNameBtn">🔤<small>Naam</small></button>' +
        '<button class="hp-btn" id="hpClear">🧽<small>Leeg</small></button>' +
        `<button class="hp-btn" id="hpSend">${t.env}<small>Versturen</small></button>`;
    box.querySelectorAll('[data-h]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        hp.heart = +b.dataset.h;
        renderHpTools();
        playPop();
    }));
    box.querySelectorAll('[data-s]').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        hp.size = +b.dataset.s;
        renderHpTools();
        playPop();
    }));
    document.getElementById('hpNameBtn').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        hpKbd.classList.toggle('show');
        playPop();
    });
    document.getElementById('hpClear').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        hpHearts.innerHTML = '';
        hp.count = 0;
        playFreqSweep(900, 200, 0.4, 0.12);
    });
    document.getElementById('hpSend').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        sendHeartPost();
    });
}

function stampHeart(x, y) {
    if (hp.count > 400 && hpHearts.firstElementChild) hpHearts.firstElementChild.remove();
    const stamps = hpTheme().stamps;
    const h = document.createElement('span');
    h.className = 'hp-heart';
    h.textContent = stamps[hp.heart] === '🌈' ? stamps[(hp.rainbow++) % 7] : stamps[hp.heart];
    h.style.left = x + 'px';
    h.style.top = y + 'px';
    h.style.fontSize = HP_SIZES[hp.size][0] + 'px';
    h.style.rotate = ((Math.random() - 0.5) * 30) + 'deg';
    hpHearts.appendChild(h);
    hp.count++;
    playTone(900 + Math.random() * 700, 0.05, 0.05, 'sine');
}

function hpPoint(e) {
    const r = hpPaper.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

hpPaper.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    hp.drawing = true;
    const pt = hpPoint(e);
    hp.last = pt;
    stampHeart(pt.x, pt.y);
});
hpPaper.addEventListener('pointermove', (e) => {
    if (!hp.drawing) return;
    const pt = hpPoint(e);
    const gap = HP_SIZES[hp.size][0] * 0.7;
    let d = Math.hypot(pt.x - hp.last.x, pt.y - hp.last.y);
    // Fill the gap with evenly spaced stamps so fast swipes stay a line
    while (d >= gap) {
        const k = gap / d;
        hp.last = { x: hp.last.x + (pt.x - hp.last.x) * k, y: hp.last.y + (pt.y - hp.last.y) * k };
        stampHeart(hp.last.x, hp.last.y);
        d = Math.hypot(pt.x - hp.last.x, pt.y - hp.last.y);
    }
});
window.addEventListener('pointerup', () => { hp.drawing = false; });
hpEl.addEventListener('pointerdown', (e) => e.stopPropagation());

function sendHeartPost() {
    if (!hpHearts.children.length && !hp.name) {
        const b = document.querySelector('.hp-btn[data-h]');
        if (b) { b.classList.remove('hint'); void b.offsetWidth; b.classList.add('hint'); }
        return;
    }
    hpKbd.classList.remove('show');
    hpPaper.classList.remove('fresh');
    hpPaper.classList.add('send');
    playFreqSweep(400, 1600, 0.6, 0.12);
    setTimeout(() => {
        const env = document.createElement('div');
        env.className = 'hp-envelope';
        env.textContent = hpTheme().env;
        hpEl.querySelector('.hp-stage').appendChild(env);
        playWin();
        setTimeout(() => env.remove(), 1400);
    }, 450);
    setTimeout(() => {
        // The drawing goes in the envelope; the name stays for the next letter
        hpHearts.innerHTML = '';
        hp.count = 0;
        hpPaper.classList.remove('send');
        void hpPaper.offsetWidth;
        hpPaper.classList.add('fresh');
    }, 1700);
}

function openHeartPost(theme = 'heart') {
    hpOpen = true;
    if (hp.theme !== theme) {
        hpHearts.innerHTML = '';
        hp.count = 0;
        hp.heart = 0;
    }
    hp.theme = theme;
    hpEl.classList.toggle('star', theme === 'star');
    document.getElementById('hpTitle').textContent = hpTheme().title;
    hpEl.classList.add('open');
    renderHpTools();
    renderHpKeyboard();
    renderHpName();
    playMusicBox();
}

function closeHeartPost() {
    hpOpen = false;
    hpEl.classList.remove('open');
    hpKbd.classList.remove('show');
    hp.drawing = false;
    _playWhoosh();
}
document.getElementById('hpClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeHeartPost();
});
