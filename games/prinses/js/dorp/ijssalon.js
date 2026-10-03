/* 🍦 IJssalon: jij bent de ijsverkoper. Maak het ijsje dat het diertje wil hebben. */
defineRoom({
    key: 'ijssalon',
    name: 'IJssalon',
    icon: '🍦',
    say: 'De ijssalon',
    build(s0) {
        villageHouse(s0 + 600, 190, 300, '#fde68a', '#0ea5e9', { flowers: true });
        addObj(`<div class="icecream-shop">
            <div class="is-sign">🍦</div>
            <div class="is-front"><div class="is-window"><span>🍨🍧🍦</span></div><div class="is-door"></div></div>
            <div class="is-awning"></div>
            <div class="tap-hint" style="left:160px;top:-70px">👇</div>
        </div>`, s0 + 120, 120, s0 + 300, openIceShop);
        addObj(`<div class="ice-table"><div class="umbrella"></div><div class="pole"></div><div class="top"></div><span class="cup">🍨</span></div>`,
            s0 + 500, 220, s0 + 560, (node) => {
                bounceEl(node, 'wobble');
                playTone(880, 0.1, 0.1, 'sine');
                setTimeout(() => playTone(1175, 0.15, 0.1, 'sine'), 120);
                sparkleShower(s0 + 560, 300, 16);
            });
        addObj('<div class="emoji-obj">🐶</div>', s0 + 700, 380, s0 + 690, dogBark);
    }
});

/* ─────────── IJssalon-overlay ─────────── */
const IC_FLAVORS = [
    { k: 'aardbei', c: '#f9a8d4' }, { k: 'chocola', c: '#92400e' }, { k: 'vanille', c: '#fef3c7' },
    { k: 'pistache', c: '#86efac' }, { k: 'bosbes', c: '#a78bfa' }, { k: 'citroen', c: '#fde047' }
];
const IC_TOPS = ['kers', 'hagel', 'wafel'];
const IC_CUSTOMERS = ['🐰', '🐻', '🐱', '🐶', '🦊', '🐼', '🐨', '🐷', '🐸', '🦄'];
const iceOv = document.getElementById('iceOv');
const ic = { cont: null, scoops: [], top: null, order: null, served: 0, coins: 0, busy: false };
let iceOpen = false;

function iceSVG(d, id) {
    const cont = d.cont;
    let h = '';
    if (cont === 'hoorn') {
        h += `<path d="M28 76 L72 76 L50 142 Z" fill="#f59e0b" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/>
              <path d="M35 86 L62 112 M42 78 L67 102 M58 78 L36 100 M66 84 L41 116 M50 76 L60 92" stroke="#b45309" stroke-width="1.5" opacity=".6"/>`;
    } else if (cont === 'bakje') {
        h += `<path d="M22 80 L78 80 L70 124 L30 124 Z" fill="#f472b6" stroke="#be185d" stroke-width="2" stroke-linejoin="round"/>
              <path d="M25 94 L75 94" stroke="#fff" stroke-width="4" opacity=".8"/>
              <circle cx="38" cy="108" r="3" fill="#fff"/><circle cx="50" cy="111" r="3" fill="#fff"/><circle cx="62" cy="108" r="3" fill="#fff"/>`;
    }
    const base = cont === 'bakje' ? 72 : 68;
    d.scoops.forEach((k, i) => {
        const f = IC_FLAVORS.find(x => x.k === k);
        const y = base - i * 22;
        h += `<g class="${id === 'icSvg' && i === d.scoops.length - 1 ? 'ic-new' : ''}">
            <path d="M30 ${y + 6} Q30 ${y - 21} 50 ${y - 21} Q70 ${y - 21} 70 ${y + 6} Q66 ${y + 14} 61 ${y + 8} Q56 ${y + 15} 50 ${y + 8} Q44 ${y + 15} 39 ${y + 8} Q34 ${y + 14} 30 ${y + 6} Z"
                fill="${f.c}" stroke="rgba(0,0,0,0.15)" stroke-width="1.5"/>
            <ellipse cx="42" cy="${y - 10}" rx="5" ry="3" fill="#fff" opacity=".55"/></g>`;
    });
    const topY = d.scoops.length ? base - (d.scoops.length - 1) * 22 - 20 : (cont === 'bakje' ? 80 : 76);
    if (d.top === 'kers') {
        h += `<path d="M50 ${topY - 6} Q54 ${topY - 20} 62 ${topY - 22}" stroke="#15803d" stroke-width="2.5" fill="none"/>
              <circle cx="50" cy="${topY - 4}" r="7" fill="#dc2626"/><circle cx="47" cy="${topY - 7}" r="2" fill="#fff" opacity=".7"/>`;
    } else if (d.top === 'hagel') {
        const cols = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#fff', '#a855f7'];
        for (let i = 0; i < 12; i++) {
            const x = 36 + (i * 7) % 28, y = topY + 4 + (i * 5) % 12;
            h += `<rect x="${x}" y="${y}" width="5" height="2" rx="1" fill="${cols[i % cols.length]}" transform="rotate(${(i * 47) % 180} ${x + 2} ${y + 1})"/>`;
        }
    } else if (d.top === 'wafel') {
        h += `<rect x="54" y="${topY - 22}" width="10" height="30" rx="2" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" transform="rotate(20 59 ${topY - 7})"/>`;
    }
    return h;
}

function iceSame(a, b) {
    return a.cont === b.cont && a.top === b.top && a.scoops.length === b.scoops.length && a.scoops.every((k, i) => k === b.scoops[i]);
}

function newCustomer() {
    // Start easy: one scoop. More scoops and toppings after a few happy customers.
    const maxScoops = Math.min(3, 1 + Math.floor(ic.served / 2));
    const n = 1 + Math.floor(Math.random() * maxScoops);
    ic.order = {
        cont: randomPick(['hoorn', 'bakje']),
        scoops: Array.from({ length: n }, () => randomPick(IC_FLAVORS).k),
        top: ic.served >= 1 && Math.random() < 0.5 ? randomPick(IC_TOPS) : null
    };
    ic.cont = null; ic.scoops = []; ic.top = null;
    const cust = document.getElementById('icCustomer');
    document.getElementById('icAnimal').textContent = randomPick(IC_CUSTOMERS);
    document.getElementById('icOrder').innerHTML = iceSVG(ic.order, 'icOrder');
    cust.classList.remove('leave');
    bounceEl(cust, 'arrive');
    renderIce();
}

function renderIce() {
    document.getElementById('icSvg').innerHTML = iceSVG(ic, 'icSvg') +
        (ic.cont ? '' : '<text x="50" y="100" font-size="30" text-anchor="middle" opacity=".25">❓</text>');
    document.getElementById('icCoins').textContent = ic.coins;
}

function renderIceTray() {
    const cone = `<svg viewBox="20 60 60 90">${iceSVG({ cont: 'hoorn', scoops: [], top: null })}</svg>`;
    const cup = `<svg viewBox="15 60 70 70">${iceSVG({ cont: 'bakje', scoops: [], top: null })}</svg>`;
    const topIcon = { kers: '🍒', hagel: '🌈', wafel: '🧇' };
    document.getElementById('icTray').innerHTML =
        `<button class="bd-btn ic-btn" data-a="cont" data-v="hoorn">${cone}</button>
         <button class="bd-btn ic-btn" data-a="cont" data-v="bakje">${cup}</button>
         <span class="care-sep"></span>` +
        IC_FLAVORS.map(f => `<button class="bd-btn ic-btn" data-a="scoop" data-v="${f.k}"><span class="sw" style="background:${f.c}"></span></button>`).join('') +
        `<span class="care-sep"></span>` +
        IC_TOPS.map(t => `<button class="bd-btn ic-btn" data-a="top" data-v="${t}">${topIcon[t]}</button>`).join('') +
        `<span class="care-sep"></span>
         <button class="bd-btn ic-btn" data-a="reset">🔄</button>
         <button class="bd-btn ic-btn ic-give" data-a="give">✅</button>`;
    document.querySelectorAll('.ic-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        iceAction(b, b.dataset.a, b.dataset.v);
    }));
}

function iceAction(btn, a, v) {
    if (ic.busy) return;
    const make = document.getElementById('icMake');
    if (a === 'cont') {
        ic.cont = v;
        playPop();
    } else if (a === 'scoop') {
        if (!ic.cont) ic.cont = 'hoorn';
        if (ic.scoops.length >= 3) { bounceEl(make, 'nope'); playTone(262, 0.15, 0.1, 'triangle'); return; }
        ic.scoops.push(v);
        playFreqSweep(300, 700, 0.15, 0.12);
    } else if (a === 'top') {
        if (!ic.cont) ic.cont = 'hoorn';
        ic.top = ic.top === v ? null : v;
        playSparkleSound();
    } else if (a === 'reset') {
        ic.cont = null; ic.scoops = []; ic.top = null;
        playFreqSweep(800, 300, 0.2, 0.1);
    } else if (a === 'give') {
        serveIce();
        return;
    }
    bounceEl(make, 'jump');
    renderIce();
}

function serveIce() {
    const cust = document.getElementById('icCustomer');
    const bubble = document.getElementById('icBubble');
    if (!ic.cont || !ic.scoops.length) { bounceEl(document.getElementById('icMake'), 'nope'); return; }
    if (!iceSame(ic, ic.order)) {
        // Not quite: the customer shakes their head and points at the wish
        bounceEl(cust, 'nope');
        bounceEl(bubble, 'pulse');
        playTone(330, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(262, 0.2, 0.1, 'triangle'), 140);
        return;
    }
    ic.busy = true;
    ic.served++;
    const make = document.getElementById('icMake');
    ovFly(iceOv, make, cust, `<svg viewBox="0 0 100 150" width="90" height="135">${iceSVG(ic, 'fly')}</svg>`, 600).then(() => {
        document.getElementById('icSvg').innerHTML = '';
        bounceEl(cust, 'jump');
        ovCheer(iceOv, cust);
        playWin();
        // Pay: one coin per scoop, plus one for a topping, counted into the till
        const pay = ic.order.scoops.length + (ic.order.top ? 1 : 0);
        const till = document.getElementById('icKassa');
        for (let i = 0; i < pay; i++) {
            setTimeout(() => {
                ovFly(iceOv, cust, till, '🪙', 450).then(() => {
                    ic.coins++;
                    document.getElementById('icCoins').textContent = ic.coins;
                    bounceEl(till, 'jump');
                    playTone(COUNT_NOTES[i % COUNT_NOTES.length], 0.2, 0.1, 'triangle');
                    playTone(2400, 0.05, 0.05, 'square');
                });
            }, 500 + i * 380);
        }
        setTimeout(() => cust.classList.add('leave'), 900 + pay * 380);
        setTimeout(() => { ic.busy = false; newCustomer(); }, 1600 + pay * 380);
    });
}

function openIceShop() {
    iceOpen = true;
    iceOv.classList.add('open');
    renderIceTray();
    newCustomer();
    playMusicBox();
}

function closeIceShop() {
    iceOpen = false;
    iceOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('icClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeIceShop(); });
iceOv.addEventListener('pointerdown', (e) => e.stopPropagation());
