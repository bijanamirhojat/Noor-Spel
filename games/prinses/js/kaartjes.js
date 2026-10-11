/* 🎫 Kaartjes: voor de koets, de trein, het bootje, de bus en de raket heb je een kaartje nodig.
   Die koop je bij een kaartjesautomaat (er staat er een bij elk vertrekpunt): kies het voertuig,
   gooi een muntje erin (die zijn er genoeg) en pak het kaartje uit het bakje. Bij het instappen
   wordt het kaartje geknipt. De kaartjes worden bewaard in TICKET_KEY. */
const TICKET_KEY = 'noor-prinses-kaartjes';
const TICKETS = [
    { key: 'koets', name: 'Koets', icon: '🐎', color: '#f472b6' },
    { key: 'trein', name: 'Trein', icon: '🚂', color: '#ef4444' },
    { key: 'boot', name: 'Bootje', icon: '⛵', color: '#0ea5e9' },
    { key: 'bus', name: 'Bus', icon: '🚌', color: '#f59e0b' },
    { key: 'raket', name: 'Raket', icon: '🚀', color: '#8b5cf6' }
];
const TICKET_BY = Object.fromEntries(TICKETS.map(t => [t.key, t]));
let tickets = {};
try {
    const d = JSON.parse(localStorage.getItem(TICKET_KEY));
    if (d && typeof d === 'object') TICKETS.forEach(t => { tickets[t.key] = Math.max(0, parseInt(d[t.key], 10) || 0); });
} catch (e) {}
function saveTickets() {
    try { localStorage.setItem(TICKET_KEY, JSON.stringify(tickets)); } catch (e) {}
}

function ticketHTML(t, extra = '') {
    return `<div class="tk-ticket${extra}" style="--c:${t.color}"><span>${t.icon}</span><b>${t.name}</b></div>`;
}

// A ticket machine in the world (bottom on the floor)
function addTicketMachine(x) {
    const node = addObj(`<div class="tk-machine">
        <div class="tk-head">🎫 Kaartjes</div>
        <div class="tk-scr"><span>🐎</span><span>🚂</span><span>⛵</span><span>🚌</span><span>🚀</span></div>
        <div class="tk-coin"></div><div class="tk-tray"></div>
    </div>`, x, FEET_Y - 170, x + 40, () => openTickets());
    return node;
}

// Use a ticket for a vehicle, then go(). Without a ticket: point at the ticket machine.
function needTicket(type, node, go) {
    if (state.busy) return;
    const t = TICKET_BY[type];
    if (!tickets[type]) {
        if (window.speechSynthesis) speechSynthesis.cancel();
        speak(`Je hebt nog geen kaartje voor de ${t.name.toLowerCase()}. Koop er een bij de kaartjesautomaat!`);
        showToast(`🎫 Eerst een ${t.icon} kaartje kopen bij de automaat!`, 2600);
        playTone(260, 0.2, 0.1, 'triangle');
        scene.el.querySelectorAll('.tk-machine, .zi-booth').forEach(m => {
            m.classList.remove('call'); void m.offsetWidth; m.classList.add('call');
        });
        return;
    }
    tickets[type]--;
    saveTickets();
    state.busy = true;
    // The ticket pops up above the princess and gets a clip
    const tk = el(`<div class="tk-punch">${ticketHTML(t)}<span class="snip">✂️</span></div>`);
    place(tk, state.x - 50, FEET_Y - 290);
    [0, 140].forEach(d => setTimeout(() => playTone(1600, 0.04, 0.1, 'square'), 500 + d));
    showToast(`✂️ Kaartje geknipt! ${tickets[type] ? `(nog ${tickets[type]})` : ''}`, 1500);
    setTimeout(() => {
        tk.remove();
        state.busy = false;
        go(node);
    }, 1100);
}

/* ─────────── Kaartjesautomaat (overlay) ─────────── */
const tkEl = document.getElementById('tkOv');
let ticketOpen = false;
registerOverlay(() => ticketOpen, closeTickets);
const tk = { pick: null, step: 'pick', busy: false };

function tkWallet() {
    const w = document.getElementById('tkWallet');
    const have = TICKETS.filter(t => tickets[t.key]);
    w.innerHTML = have.length
        ? have.map(t => `<div class="tk-have">${ticketHTML(t)}<i>${tickets[t.key]}×</i></div>`).join('')
        : '<div class="tk-empty">Nog geen kaartjes</div>';
    document.querySelectorAll('.tk-pick').forEach(b => {
        const n = tickets[b.dataset.k] || 0;
        b.querySelector('i').textContent = n ? n : '';
    });
}

function tkShow(step) {
    tk.step = step;
    tkEl.querySelectorAll('.tk-step').forEach(s => s.classList.toggle('show', s.dataset.step === step));
    document.getElementById('tkPurse').classList.toggle('next', step === 'coin');
    const say = { pick: 'Kies maar een kaartje!', coin: 'Doe een muntje erin!', take: 'Pak je kaartje!' };
    document.getElementById('tkMsg').textContent = { pick: '👆 Waar wil je heen?', coin: '🪙 Doe een muntje erin!', take: '🎫 Pak je kaartje!' }[step];
    if (step !== 'pick') speak(say[step]);
}

function tkPick(k) {
    if (tk.busy || tk.step !== 'pick') return;
    tk.pick = TICKET_BY[k];
    playPop();
    document.getElementById('tkChosen').innerHTML = ticketHTML(tk.pick);
    tkShow('coin');
}

function tkCoin() {
    if (tk.busy || tk.step !== 'coin') return;
    tk.busy = true;
    const purse = document.getElementById('tkPurse');
    ovFly(tkEl, purse, document.getElementById('tkSlot'), '🪙', 500).then(() => {
        playTone(1900, 0.06, 0.12, 'triangle');
        setTimeout(() => playTone(2400, 0.08, 0.1, 'triangle'), 70);
        // Print the ticket
        const m = document.getElementById('tkMachine');
        m.classList.add('print');
        for (let i = 0; i < 8; i++) setTimeout(() => playTone(300 + (i % 2) * 80, 0.06, 0.06, 'square'), 200 + i * 90);
        const out = document.getElementById('tkOut');
        out.innerHTML = ticketHTML(tk.pick);
        out.classList.remove('out'); void out.offsetWidth; out.classList.add('out');
        setTimeout(() => {
            m.classList.remove('print');
            tk.busy = false;
            tkShow('take');
        }, 1100);
    });
}

function tkTake() {
    if (tk.busy || tk.step !== 'take') return;
    tk.busy = true;
    const out = document.getElementById('tkOut');
    ovFly(tkEl, out, document.getElementById('tkWallet'), `<div style="font-size:30px">🎫</div>`, 550).then(() => {
        tickets[tk.pick.key] = (tickets[tk.pick.key] || 0) + 1;
        saveTickets();
        tkWallet();
        ovCheer(tkEl, document.getElementById('tkWallet'), ['✨', '🎫', '⭐']);
        playCorrect();
        speak(`Een kaartje voor de ${tk.pick.name.toLowerCase()}!`);
        tk.busy = false;
        tkShow('pick');
    });
    out.classList.remove('out');
    out.innerHTML = '';
}

const tkPicks = document.getElementById('tkPicks');
TICKETS.forEach(t => {
    const b = el(`<button class="tk-pick" data-k="${t.key}" style="--c:${t.color}"><span>${t.icon}</span>${t.name}<i></i></button>`);
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); tkPick(t.key); });
    tkPicks.appendChild(b);
});
document.getElementById('tkPurse').addEventListener('pointerdown', (e) => { e.stopPropagation(); tkCoin(); });
document.getElementById('tkOut').addEventListener('pointerdown', (e) => { e.stopPropagation(); tkTake(); });
document.getElementById('tkBack').addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!tk.busy) { playPop(); tkShow('pick'); } });

function openTickets() {
    ticketOpen = true;
    tkEl.classList.add('open');
    tk.busy = false;
    document.getElementById('tkOut').classList.remove('out');
    tkWallet();
    tkShow('pick');
    speak('De kaartjesautomaat! Waar wil je heen?');
}

function closeTickets() {
    ticketOpen = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    tkEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('tkClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeTickets(); });
tkEl.addEventListener('pointerdown', (e) => e.stopPropagation());
