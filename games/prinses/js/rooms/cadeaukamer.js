/* 🎁 Cadeaukamer */
defineRoom({
    key: 'cadeaukamer',
    name: 'Cadeaukamer',
    icon: '🎁',
    say: 'De cadeaukamer',
    build(rg) {
        const flags = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
        place(el(`<div class="bunting"><svg viewBox="0 0 800 60"><path d="M0 8 Q400 40 800 8" stroke="#b45309" stroke-width="2" fill="none"/>
            ${Array.from({ length: 16 }, (_, i) => { const x = 25 + i * 50, y = 8 + 32 * Math.sin(Math.PI * (x / 800)) * 0.9; return `<path d="M${x - 16} ${y} L${x + 16} ${y} L${x} ${y + 30} Z" fill="${flags[i % 6]}"/>`; }).join('')}
        </svg></div>`), rg, 40);
        addObj(`<div class="present-pile">
            <span class="gift" style="left:10px;top:90px;font-size:90px">🎁</span>
            <span class="gift" style="left:110px;top:60px;font-size:110px;animation-delay:-0.8s">🎁</span>
            <span class="gift" style="left:60px;top:10px;font-size:70px;animation-delay:-1.6s">🎁</span>
            <div class="tap-hint" style="left:110px;top:-36px">👇</div>
        </div>`, rg + 260, 200, rg + 390, openGifts);
        state.toyShelf = place(el(`<div class="toy-shelf"><div class="toys" style="top:0"></div><div class="plank" style="top:50px"></div><div class="toys" style="top:66px"></div><div class="plank" style="top:116px"></div></div>`), rg + 440, 120);
        addObj('<div class="popper">🎉</div>', rg + 60, 330, rg + 100, () => { confettiAt(rg + 90, 330); });
        addObj('<div class="emoji-obj">🎈</div>', rg + 700, 280, rg + 700, balloonPop);
        addObj('<div class="emoji-obj">🎈</div>', rg + 160, 250, rg + 170, balloonPop);
    }
});

/* ─────────── Cadeaukamer ─────────── */
const GIFT_KEY = 'noor-prinses-cadeaus';
const SURPRISES = ['🧸', '🦄', '🪀', '🎈', '🚂', '🪁', '🎨', '🐶', '🐱', '🐰', '🦋', '👑', '💍', '🌈', '⭐', '🎠', '🧩', '🪆', '🎀', '🍭', '🐣', '🦖', '🚀', '🎺'];
const GIFT_PAPERS = [['#f472b6', '#fbcfe8'], ['#60a5fa', '#bfdbfe'], ['#a855f7', '#e9d5ff'], ['#22c55e', '#bbf7d0'], ['#facc15', '#fef08a'], ['#ef4444', '#fecaca']];
const GIFT_RIBBONS = ['#fde047', '#ffffff', '#f472b6', '#a855f7', '#22d3ee'];
let gifts = [];
try { const g = JSON.parse(localStorage.getItem(GIFT_KEY)); if (Array.isArray(g)) gifts = g.filter(x => typeof x === 'string').slice(-40); } catch (e) {}
const gf = { paper: 0, ribbon: 0, pattern: 0, stage: 0, toy: null, busy: false };
let giftOpen = false;

function renderToyShelf() {
    if (!state.toyShelf) return;
    const rows = state.toyShelf.querySelectorAll('.toys');
    const recent = gifts.slice(-18);
    rows[0].textContent = recent.slice(0, 9).join('');
    rows[1].textContent = recent.slice(9, 18).join('');
}

function giftSVG() {
    const [c1, c2] = GIFT_PAPERS[gf.paper];
    const rib = GIFT_RIBBONS[gf.ribbon];
    const pat = gf.pattern === 0
        ? `<pattern id="gfPat" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${c1}"/><circle cx="10" cy="10" r="4" fill="${c2}"/></pattern>`
        : gf.pattern === 1
        ? `<pattern id="gfPat" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="20" fill="${c1}"/><rect width="8" height="20" fill="${c2}"/></pattern>`
        : `<pattern id="gfPat" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${c1}"/><text x="12" y="16" font-size="12" text-anchor="middle">⭐</text></pattern>`;
    const tears = [
        'M36 96 L70 92 L62 118 L80 130 L44 150 Z',
        'M164 100 L130 96 L140 124 L118 140 L160 160 Z',
        'M60 176 L100 150 L140 176 Z'
    ];
    let h = `<defs>${pat}</defs>
        <ellipse cx="100" cy="186" rx="80" ry="8" fill="rgba(0,0,0,0.12)"/>
        <rect x="34" y="88" width="132" height="94" rx="6" fill="url(#gfPat)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>`;
    for (let i = 0; i < gf.stage - 1 && i < 3; i++) h += `<path d="${tears[i]}" fill="#d6a77a" stroke="#a16207" stroke-width="2" stroke-linejoin="round"/>`;
    if (gf.stage < 4) h += `<rect x="92" y="88" width="16" height="94" fill="${rib}" opacity="${gf.stage >= 1 ? 0 : 1}"/>`;
    h += `<g class="gf-lid${gf.stage >= 4 ? ' off' : ''}">
            <rect x="26" y="64" width="148" height="30" rx="6" fill="url(#gfPat)" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
            ${gf.stage < 1 ? `<rect x="92" y="64" width="16" height="30" fill="${rib}"/>` : ''}
        </g>`;
    if (gf.stage === 0) {
        h += `<g class="gf-bow"><ellipse cx="84" cy="56" rx="18" ry="11" fill="${rib}" stroke="rgba(0,0,0,0.15)" stroke-width="2" transform="rotate(-20 84 56)"/>
              <ellipse cx="116" cy="56" rx="18" ry="11" fill="${rib}" stroke="rgba(0,0,0,0.15)" stroke-width="2" transform="rotate(20 116 56)"/>
              <circle cx="100" cy="60" r="8" fill="${rib}" stroke="rgba(0,0,0,0.15)" stroke-width="2"/></g>`;
    }
    if (gf.stage >= 4 && gf.toy) {
        h += `<rect x="38" y="92" width="124" height="20" fill="#78350f" opacity=".35"/>
              <text class="gf-toy" x="100" y="104" font-size="52" text-anchor="middle" dominant-baseline="central">${gf.toy}</text>`;
    }
    return h;
}

function renderGift() {
    document.getElementById('gfSvg').innerHTML = giftSVG();
    const unique = new Set(gifts).size;
    document.getElementById('gfCount').textContent = `🎁 ${unique} / ${SURPRISES.length} verrassingen`;
}

function newGift() {
    gf.paper = Math.floor(Math.random() * GIFT_PAPERS.length);
    gf.ribbon = Math.floor(Math.random() * GIFT_RIBBONS.length);
    gf.pattern = Math.floor(Math.random() * 3);
    gf.stage = 0;
    // Prefer surprises she hasn't found yet
    const fresh = SURPRISES.filter(t => !gifts.includes(t));
    gf.toy = randomPick(fresh.length ? fresh : SURPRISES);
    document.getElementById('gfNext').style.display = 'none';
    renderGift();
}

function giftScraps(n, colors) {
    const st = document.getElementById('gfStage');
    const r = document.getElementById('gfSvg').getBoundingClientRect();
    const o = st.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const sc = document.createElement('div');
        sc.className = 'gf-scrap';
        sc.style.background = randomPick(colors);
        sc.style.clipPath = 'polygon(0 20%, 60% 0, 100% 40%, 80% 100%, 20% 80%)';
        sc.style.left = (r.left - o.left + r.width * (0.3 + Math.random() * 0.4)) + 'px';
        sc.style.top = (r.top - o.top + r.height * (0.45 + Math.random() * 0.3)) + 'px';
        sc.style.setProperty('--dx', ((Math.random() - 0.5) * 400) + 'px');
        sc.style.setProperty('--dy', (-80 - Math.random() * 200) + 'px');
        sc.style.setProperty('--rot', ((Math.random() - 0.5) * 720) + 'deg');
        st.appendChild(sc);
        setTimeout(() => sc.remove(), 900);
    }
}

function tapGift() {
    if (gf.busy || gf.stage >= 4) return;
    const svg = document.getElementById('gfSvg');
    svg.classList.remove('shake'); void svg.getBoundingClientRect(); svg.classList.add('shake');
    if (gf.stage === 0) {
        const bow = svg.querySelector('.gf-bow');
        if (bow) bow.classList.add('off');
        playFreqSweep(400, 1400, 0.3, 0.12);
        gf.busy = true;
        setTimeout(() => { gf.stage = 1; gf.busy = false; renderGift(); }, 500);
        return;
    }
    if (gf.stage < 4) {
        gf.stage++;
        giftScraps(8, GIFT_PAPERS[gf.paper]);
        playFreqSweep(2000, 500, 0.18, 0.12);
        if (gf.stage < 4) { renderGift(); return; }
        // Lid pops and the surprise jumps out
        renderGift();
        playFreqSweep(200, 900, 0.25, 0.2);
        setTimeout(() => { playWin(); }, 300);
        const r = svg.getBoundingClientRect();
        const o = document.getElementById('giftOv').getBoundingClientRect();
        for (let k = 0; k < 3; k++) setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                const sp = document.createElement('span');
                sp.className = 'scope-spark';
                sp.textContent = randomPick(['✨', '🎉', '⭐', '💖', '🎊']);
                const a = Math.random() * Math.PI * 2;
                const d = 60 + Math.random() * 90;
                sp.style.left = (r.left - o.left + r.width / 2) + 'px';
                sp.style.top = (r.top - o.top + r.height * 0.35) + 'px';
                sp.style.setProperty('--dx', Math.cos(a) * d + 'px');
                sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
                document.getElementById('giftOv').appendChild(sp);
                setTimeout(() => sp.remove(), 900);
            }
        }, 300 + k * 200);
        gifts.push(gf.toy);
        try { localStorage.setItem(GIFT_KEY, JSON.stringify(gifts.slice(-40))); } catch (e) {}
        renderToyShelf();
        setTimeout(() => { document.getElementById('gfNext').style.display = ''; renderGift(); }, 900);
    }
}

document.getElementById('gfSvg').addEventListener('pointerdown', (e) => { e.stopPropagation(); tapGift(); });
document.getElementById('gfNext').addEventListener('pointerdown', (e) => { e.stopPropagation(); newGift(); playPop(); });

function openGifts() {
    giftOpen = true;
    document.getElementById('giftOv').classList.add('open');
    newGift();
    playMusicBox();
}

function closeGifts() {
    giftOpen = false;
    document.getElementById('giftOv').classList.remove('open');
    _playWhoosh();
}
document.getElementById('gfClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeGifts();
});
document.getElementById('giftOv').addEventListener('pointerdown', (e) => e.stopPropagation());

function confettiAt(x, y) {
    playFreqSweep(200, 60, 0.25, 0.3);
    setTimeout(playSparkleSound, 150);
    for (let i = 0; i < 80; i++) {
        spawnSparkle(x, y, { vx: (Math.random() - 0.3) * 400, vy: -250 - Math.random() * 300, g: 420, size: 5 + Math.random() * 6, max: 1.6 + Math.random() * 0.8 });
    }
}
