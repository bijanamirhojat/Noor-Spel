/* 🎹 Muziekkamer: vleugel (vrij spelen of liedjes naspelen), harp, trommel en xylofoon */
const PN_KEYS = [
    { n: 'C', f: 262, c: '#ef4444' }, { n: 'D', f: 294, c: '#fb923c' }, { n: 'E', f: 330, c: '#facc15' },
    { n: 'F', f: 349, c: '#4ade80' }, { n: 'G', f: 392, c: '#22d3ee' }, { n: 'A', f: 440, c: '#60a5fa' },
    { n: 'B', f: 494, c: '#a78bfa' }, { n: 'C2', f: 523, c: '#f472b6' }
];
const PN_SONGS = [
    { icon: '⭐', name: 'Altijd is Kortjakje ziek', notes: 'C C G G A A G F F E E D D C G G F F E E D G G F F E E D C C G G A A G F F E E D D C' },
    { icon: '🔔', name: 'Vader Jacob', notes: 'C D E C C D E C E F G E F G G A G F E C G A G F E C C G C C G C' },
    { icon: '🦆', name: 'Alle eendjes', notes: 'C D E F G G A A A A G A A A A G F F F F E E D D D D C' }
];

function pianoNote(i, dur = 0.5) {
    const k = PN_KEYS[i];
    playTone(k.f, dur, 0.2, 'triangle');
    playTone(k.f * 2, dur * 0.6, 0.05, 'sine');
}

defineRoom({
    key: 'muziekkamer',
    name: 'Muziekkamer',
    icon: '🎹',
    say: 'De muziekkamer',
    build(x) {
        place(el('<div class="music-notes"><span>🎵</span><span>🎶</span><span>🎼</span><span>🎵</span></div>'), x + 200, 50);
        addObj(`<div class="harp"><svg viewBox="0 0 120 220" width="120" height="220">
            <path d="M20 210 L20 30 Q20 8 44 12 Q80 20 100 70 L104 210 Z" fill="none" stroke="#f59e0b" stroke-width="10" stroke-linejoin="round"/>
            ${[...Array(7)].map((_, i) => `<line class="hs" x1="${30 + i * 11}" y1="${24 + i * 7}" x2="${30 + i * 11}" y2="204" stroke="${PN_KEYS[i].c}" stroke-width="2.5"/>`).join('')}
            <rect x="12" y="204" width="100" height="14" rx="6" fill="#d97706"/>
        </svg></div>`, x + 40, 232, x + 120, (node) => {
            node.classList.remove('strum'); void node.offsetWidth; node.classList.add('strum');
            [0, 2, 4, 7, 4, 2, 0, 2, 4, 7].forEach((k, i) => setTimeout(() => pianoNote(k, 0.6), i * 70));
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
            sparkleShower(p.x, p.y - 60, 30);
        });
        addObj(`<div class="grand-piano">
            <div class="lid"></div><div class="body"></div>
            <div class="keys">${PN_KEYS.map(k => `<span style="--c:${k.c}"></span>`).join('')}</div>
            <div class="leg" style="left:24px"></div><div class="leg" style="left:200px"></div>
            <div class="stool"></div>
            <div class="tap-hint" style="left:110px;top:-30px">👇</div>
        </div>`, x + 230, 222, x + 360, openPiano);
        addObj('<div class="drum"><div class="top"></div><div class="shell"></div><span class="stick l"></span><span class="stick r"></span></div>', x + 520, 342, x + 560, (node) => {
            node.classList.remove('boom'); void node.offsetWidth; node.classList.add('boom');
            [0, 180, 300, 420].forEach((t, i) => setTimeout(() => {
                playTone(i === 3 ? 70 : 110, 0.25, 0.35, 'sine');
                playFreqSweep(180, 60, 0.15, 0.15);
            }, t));
        });
        addObj(`<div class="xylo">${PN_KEYS.map((k, i) => `<span style="--c:${k.c};height:${96 - i * 8}px"></span>`).join('')}</div>`, x + 630, 330, x + 690, (node) => {
            node.querySelectorAll('span').forEach((s, i) => setTimeout(() => {
                s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit');
                playTone(PN_KEYS[i].f * 2, 0.35, 0.15, 'sine');
            }, i * 110));
        });
    }
});

/* ─────────── Piano (overlay) ─────────── */
const pnEl = document.getElementById('pianoOv');
let pianoOpen = false;
const pn = { song: -1, notes: [], pos: 0, playing: false };

function renderPnSongs() {
    const box = document.getElementById('pnSongs');
    box.innerHTML = `<button class="bd-btn${pn.song < 0 ? ' sel' : ''}" data-s="-1">🎹<small>Vrij spelen</small></button>` +
        PN_SONGS.map((s, i) => `<button class="bd-btn${pn.song === i ? ' sel' : ''}" data-s="${i}">${s.icon}<small>${s.name}</small></button>`).join('');
    box.querySelectorAll('.bd-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickSong(+b.dataset.s);
    }));
}

function pickSong(i) {
    pn.song = i;
    pn.pos = 0;
    pn.playing = false;
    pn.notes = i < 0 ? [] : PN_SONGS[i].notes.split(' ').map(n => PN_KEYS.findIndex(k => k.n === n));
    renderPnSongs();
    renderPnSheet();
    playPop();
}

// The song as a row of coloured dots; the next one to play pulses
function renderPnSheet() {
    const sheet = document.getElementById('pnSheet');
    if (pn.song < 0) {
        sheet.innerHTML = '<span class="pn-free">🎵 Speel maar wat je wilt! 🎵</span>';
    } else {
        sheet.innerHTML = pn.notes.map((k, i) => `<span class="pn-dot${i < pn.pos ? ' done' : ''}${i === pn.pos ? ' next' : ''}" style="--c:${PN_KEYS[k].c}"></span>`).join('');
        const next = sheet.querySelector('.pn-dot.next');
        if (next) sheet.scrollTop = next.offsetTop - sheet.clientHeight / 2;
    }
    document.querySelectorAll('.pn-key').forEach((key, i) => key.classList.toggle('glow', pn.song >= 0 && !pn.playing && pn.notes[pn.pos] === i));
}

function pressKey(i) {
    if (pn.playing) return;
    const key = document.querySelectorAll('.pn-key')[i];
    key.classList.remove('down'); void key.offsetWidth; key.classList.add('down');
    pianoNote(i);
    pnFloat(key, randomPick(['🎵', '🎶', '💖', '✨']));
    if (pn.song < 0 || pn.notes[pn.pos] !== i) return;
    pn.pos++;
    if (pn.pos >= pn.notes.length) {
        songDone();
        return;
    }
    renderPnSheet();
}

function pnFloat(node, text) {
    const r = node.getBoundingClientRect();
    const o = pnEl.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'scope-spark';
    s.textContent = text;
    s.style.left = (r.left + r.width / 2 - o.left) + 'px';
    s.style.top = (r.top - o.top + 10) + 'px';
    s.style.setProperty('--dx', ((Math.random() - 0.5) * 60) + 'px');
    s.style.setProperty('--dy', (-80 - Math.random() * 60) + 'px');
    pnEl.appendChild(s);
    setTimeout(() => s.remove(), 900);
}

// Whole song played: applause, then the piano plays it back
function songDone() {
    pn.playing = true;
    renderPnSheet();
    playWin();
    const keys = document.querySelectorAll('.pn-key');
    keys.forEach((k, i) => setTimeout(() => pnFloat(k, randomPick(['⭐', '🌟', '👏', '💖'])), i * 60));
    const notes = pn.notes.slice();
    setTimeout(() => {
        notes.forEach((k, i) => setTimeout(() => {
            if (!pianoOpen) return;
            keys[k].classList.remove('down'); void keys[k].offsetWidth; keys[k].classList.add('down');
            pianoNote(k, 0.35);
            document.querySelectorAll('.pn-dot')[i]?.classList.add('play');
        }, i * 300));
        setTimeout(() => {
            pn.playing = false;
            pn.pos = 0;
            renderPnSheet();
        }, notes.length * 300 + 400);
    }, 1200);
}

function buildPianoKeys() {
    const box = document.getElementById('pnKeys');
    box.innerHTML = PN_KEYS.map((k, i) => `<button class="pn-key" data-i="${i}" style="--c:${k.c}"><span></span></button>`).join('');
    box.querySelectorAll('.pn-key').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pressKey(+b.dataset.i);
    }));
}

function openPiano() {
    pianoOpen = true;
    pnEl.classList.add('open');
    if (!document.querySelector('.pn-key')) buildPianoKeys();
    pickSong(pn.song);
}

function closePiano() {
    pianoOpen = false;
    pn.playing = false;
    pnEl.classList.remove('open');
    twirl();
    burst(state.x, 320, 40);
    _playWhoosh();
}
document.getElementById('pnClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closePiano();
});
pnEl.addEventListener('pointerdown', (e) => e.stopPropagation());
