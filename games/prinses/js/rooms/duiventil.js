/* 🕊️ Duiventil: stuur een brief met de postduif. Kies naar wie, kies een plaatje voor op de brief; de duif vliegt
   weg en komt terug met een cadeautje (tik erop om het open te maken). Aantal brieven in noor-prinses-duif. */
const DV_KEY = 'noor-prinses-duif';
const DV_TO = [['👸', 'Mama'], ['🤴', 'Papa'], ['🦄', 'Eenhoorn'], ['🐱', 'Poes'], ['👵', 'Oma'], ['🧸', 'Beer']];
const DV_PICS = ['💖', '🌸', '⭐', '🍰', '🌈', '🦋'];
const DV_GIFTS = ['🍬', '🌹', '🧁', '💎', '🎀', '🍭', '🧸', '🌻', '🍓', '👑'];
const dvOv = document.getElementById('dvOv');
const dv = { step: 'naar', to: null, pic: null, sent: 0, round: 0 };
let dvOpen = false;
registerOverlay(() => dvOpen, closePost);
try { dv.sent = +localStorage.getItem(DV_KEY) || 0; } catch { /* geen opslag */ }

function coo() {
    [0, 260].forEach(t => setTimeout(() => { playFreqSweep(420, 340, 0.18, 0.1); }, t));
}

defineRoom({
    key: 'duiventil',
    name: 'Duiventil',
    icon: '🕊️',
    say: 'De duiventil',
    build(x) {
        place(el('<div class="dv-window"><div class="sky"><div class="cloud"></div></div></div>'), x + 560, 70);
        addObj(`<div class="dv-loft"><div class="roof"></div><div class="box"><i><span>🕊️</span></i><i><span>🕊️</span></i><i></i><i><span>🕊️</span></i></div><div class="post"></div>
            <div class="tap-hint" style="left:150px;top:70px">👇</div></div>`, x + 140, 60, x + 230, openPost);
        place(el('<div class="dv-beam"></div>'), x + 380, 200);
        [0, 1, 2].forEach(i => addObj(`<div class="emoji-obj dv-pigeon">🕊️</div>`, x + 395 + i * 55, 150, x + 420 + i * 55, (node) => {
            zooAnim(node, 'flutter');
            coo();
        }));
        addObj('<div class="emoji-obj dv-seed">🌾</div>', x + 470, 340, x + 500, () => {
            document.querySelectorAll('.dv-pigeon').forEach((p, i) => setTimeout(() => zooAnim(p, 'peck'), i * 150));
            [0, 120, 240, 360].forEach(t => setTimeout(() => playTone(1600, 0.03, 0.06, 'square'), t));
        });
    }
});

/* ─────────── Brief sturen (overlay) ─────────── */
function renderPost() {
    const tray = document.getElementById('dvTray');
    let h = '';
    if (dv.step === 'naar') h = DV_TO.map(([e, n], i) => `<button class="bd-btn dv-btn dv-who" data-a="to" data-v="${i}">${e}<small>${n}</small></button>`).join('');
    else if (dv.step === 'plaatje') h = DV_PICS.map(p => `<button class="bd-btn dv-btn" data-a="pic" data-v="${p}">${p}</button>`).join('');
    tray.innerHTML = h;
    tray.querySelectorAll('.dv-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        postAction(b.dataset.a, b.dataset.v);
    }));
    const letter = document.getElementById('dvLetter');
    // On the sill while you make it; the pigeon takes it away (sendLetter hides it)
    if (dv.step !== 'weg') letter.style.visibility = dv.step === 'plaatje' ? '' : 'hidden';
    letter.querySelector('.to').textContent = dv.to !== null ? DV_TO[dv.to][0] : '';
    letter.querySelector('.pic').textContent = dv.pic || '';
    document.getElementById('dvAsk').textContent = { naar: '✉️❓', plaatje: '🖍️❓', weg: '', terug: '🎁👇', open: '' }[dv.step];
}

function postAction(a, v) {
    if (a === 'to' && dv.step === 'naar') {
        dv.to = +v;
        dv.step = 'plaatje';
        playPop();
    } else if (a === 'pic' && dv.step === 'plaatje') {
        dv.pic = v;
        playSparkleSound();
        renderPost();
        setTimeout(sendLetter, 500);
        return;
    }
    renderPost();
}

function sendLetter() {
    dv.step = 'weg';
    renderPost();
    const round = dv.round;
    const bird = document.getElementById('dvBird');
    const letter = document.getElementById('dvLetter');
    letter.classList.add('fold');
    coo();
    setTimeout(() => {
        if (round !== dv.round) return;
        letter.style.visibility = 'hidden';
        bird.classList.add('carry');
        bird.classList.add('away');
        playFreqSweep(400, 1200, 0.6, 0.08);
        for (let i = 0; i < 10; i++) setTimeout(() => playTone(900, 0.03, 0.04, 'triangle'), i * 90);
    }, 700);
    // Off it flies… and back again with a present
    setTimeout(() => {
        if (round !== dv.round) return;
        bird.classList.remove('carry', 'away');
        bird.classList.add('back');
        document.getElementById('dvGift').classList.add('show');
        coo();
        dv.step = 'terug';
        dv.sent++;
        try { localStorage.setItem(DV_KEY, dv.sent); } catch { /* geen opslag */ }
        renderPost();
    }, 4200);
}

document.getElementById('dvGift').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (dv.step !== 'terug') return;
    dv.step = 'open';
    const g = e.currentTarget;
    g.querySelector('.box').textContent = randomPick(DV_GIFTS);
    g.classList.add('opened');
    document.getElementById('dvReply').innerHTML = `${DV_TO[dv.to][0]}<span>💖</span>`;
    document.getElementById('dvReply').classList.add('show');
    playWin();
    ovCheer(dvOv, g);
    renderPost();
    const round = dv.round;
    setTimeout(() => { if (round === dv.round && dvOpen) resetPost(); }, 3200);
});

function resetPost() {
    dv.round++;
    Object.assign(dv, { step: 'naar', to: null, pic: null });
    const bird = document.getElementById('dvBird');
    bird.className = 'dv-bird';
    document.getElementById('dvLetter').classList.remove('fold');
    const g = document.getElementById('dvGift');
    g.className = 'dv-gift';
    g.querySelector('.box').textContent = '🎁';
    document.getElementById('dvReply').classList.remove('show');
    renderPost();
}

function openPost() {
    dvOpen = true;
    dvOv.classList.add('open');
    resetPost();
    coo();
}

function closePost() {
    dvOpen = false;
    dv.round++;
    dvOv.classList.remove('open');
}

document.getElementById('dvClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closePost(); });
dvOv.addEventListener('pointerdown', (e) => e.stopPropagation());
