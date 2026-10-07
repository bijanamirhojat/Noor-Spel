/* 🚽 WC: wc-papier dat eindeloos afrolt, een bezet/vrij-bordje, en het spel
   "Wie moet er plassen?": help de dieren één voor één (papier, doortrekken, handen wassen). */
const WC_ANIMALS = ['🐻', '🐸', '🐷', '🐵', '🐰', '🐱', '🐶', '🦊'];
const WC_STEPS = ['paper', 'flush', 'wash'];

function wcToot() {
    // A silly little "prrrt"
    for (let i = 0; i < 6; i++) setTimeout(() => playTone(90 + Math.random() * 40, 0.06, 0.18, 'sawtooth'), i * 45);
}
function wcFlushSound() {
    startNoise('shower');
    playFreqSweep(500, 120, 1.2, 0.1);
    setTimeout(stopNoise, 1200);
}

defineRoom({
    key: 'wc',
    name: 'WC',
    icon: '🚽',
    say: 'De wc',
    build(x) {
        addObj('<div class="wc-sign"><span class="free">🟢 Vrij</span><span class="busy">🔴 Bezet</span></div>', x + 60, 80, x + 100, (node) => {
            node.classList.toggle('on');
            playTone(node.classList.contains('on') ? 400 : 700, 0.12, 0.1, 'square');
        });
        addObj('<div class="wc-roll"><div class="holder"></div><div class="roll"></div><div class="strip"></div></div>', x + 160, 190, x + 200, (node) => {
            const strip = node.querySelector('.strip');
            const h = Math.min(260, (parseFloat(strip.style.height) || 0) + 70);
            strip.style.height = h + 'px';
            playFreqSweep(900, 1500, 0.15, 0.08);
            if (h >= 260) setTimeout(() => { strip.style.height = '0px'; playFreqSweep(1500, 600, 0.3, 0.08); }, 900);
        });
        addObj(`<div class="wc-toilet">
            <div class="tank"><span class="btn"></span></div><div class="lid"></div><div class="bowl"><div class="water"></div></div><div class="foot"></div>
            <div class="tap-hint" style="left:44px;top:-50px">👇</div>
        </div>`, x + 300, 200, x + 400, openWc);
        addObj('<div class="wc-sink"><div class="mirror"></div><div class="basin"></div><div class="ped"></div><span class="soap">🧼</span></div>', x + 520, 130, x + 580, (node) => {
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top + r.height * 0.55);
            for (let i = 0; i < 24; i++) spawnSparkle(p.x + (Math.random() - 0.5) * 60, p.y, { vy: -50 - Math.random() * 40, vx: (Math.random() - 0.5) * 40, g: -15, hue: 190 + Math.random() * 40, size: 5 + Math.random() * 6, max: 1.6 });
            playFreqSweep(1200, 1800, 0.2, 0.06);
        });
        addObj('<div class="emoji-obj wc-spray">🌸</div>', x + 700, 260, x + 700, (node) => {
            bounceEl(node, 'jump');
            startNoise('shower');
            setTimeout(stopNoise, 400);
            sparkleShower(x + 720, 230, 30);
        });
        place(el('<div class="wc-duck">🦆</div>'), x + 690, 400);
    }
});

/* ─────────── Wie moet er plassen? (overlay) ─────────── */
const wcEl = document.getElementById('wcOv');
let wcOpen = false;
const wc = { queue: [], who: null, step: 0, paper: 0, washes: 0, helped: 0, busy: false };

function wcUpdateButtons() {
    const step = WC_STEPS[wc.step];
    document.querySelectorAll('.wc-btn').forEach(b => b.classList.toggle('next', !!wc.who && !wc.busy && b.dataset.s === step));
    const hints = { paper: '🧻 Eerst wc-papier!', flush: '🚽 Nu doortrekken!', wash: '🧼 Handen wassen!' };
    document.getElementById('wcHint').textContent = wc.who ? hints[step] : '';
}

function wcNext() {
    wc.step = 0;
    wc.paper = 0;
    wc.washes = 0;
    if (!wc.queue.length) wc.queue = shuffle(WC_ANIMALS.slice());
    wc.who = wc.queue.pop();
    const st = document.getElementById('wcStage');
    st.querySelector('.wc-paper-strip').style.height = '0px';
    st.querySelector('.wc-foam').classList.remove('on');
    const a = document.getElementById('wcWho');
    a.textContent = wc.who;
    a.className = 'wc-who dance';
    document.getElementById('wcBubble').textContent = 'Ik moet nodig! 🙈';
    document.getElementById('wcBubble').classList.add('show');
    wc.busy = true;
    // Hop onto the toilet, then a silly "prrrt"
    setTimeout(() => {
        a.className = 'wc-who sit';
        document.getElementById('wcBubble').classList.remove('show');
        setTimeout(() => {
            wcToot();
            const puff = document.getElementById('wcPuff');
            puff.classList.remove('go'); void puff.offsetWidth; puff.classList.add('go');
            a.classList.add('blush');
            setTimeout(() => { wc.busy = false; wcUpdateButtons(); }, 600);
        }, 700);
    }, 1400);
    wcUpdateButtons();
}

function wcDo(s) {
    if (!wc.who || wc.busy) return;
    const btn = document.querySelector(`.wc-btn[data-s="${s}"]`);
    if (WC_STEPS[wc.step] !== s) {
        btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope');
        playTone(220, 0.12, 0.1, 'triangle');
        return;
    }
    const st = document.getElementById('wcStage');
    if (s === 'paper') {
        // Rrrrrrrol... a little more each tap
        wc.paper++;
        st.querySelector('.wc-paper-strip').style.height = (wc.paper * 60) + 'px';
        playFreqSweep(900, 1500, 0.15, 0.08);
        if (wc.paper >= 3) {
            wc.step++;
            setTimeout(() => { st.querySelector('.wc-paper-strip').style.height = '0px'; }, 500);
        }
    } else if (s === 'flush') {
        wc.busy = true;
        const a = document.getElementById('wcWho');
        a.className = 'wc-who off';
        wcFlushSound();
        const bowl = st.querySelector('.wc-bowl');
        bowl.classList.remove('swirl'); void bowl.offsetWidth; bowl.classList.add('swirl');
        // Sometimes a rubber duck pops out
        if (Math.random() < 0.4) {
            const duck = st.querySelector('.wc-duckpop');
            duck.classList.remove('go'); void duck.offsetWidth; duck.classList.add('go');
            setTimeout(() => { playTone(500, 0.1, 0.15, 'square'); setTimeout(() => playTone(420, 0.12, 0.15, 'square'), 120); }, 900);
        }
        setTimeout(() => { wc.step++; wc.busy = false; wcUpdateButtons(); }, 1300);
    } else if (s === 'wash') {
        wc.washes++;
        st.querySelector('.wc-foam').classList.add('on');
        playTone(900 + wc.washes * 150, 0.08, 0.08, 'sine');
        const r = st.querySelector('.wc-tapsink').getBoundingClientRect();
        const o = wcEl.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
            const b = document.createElement('span');
            b.className = 'scope-spark';
            b.textContent = '🫧';
            b.style.left = (r.left + r.width / 2 - o.left) + 'px';
            b.style.top = (r.top - o.top) + 'px';
            b.style.setProperty('--dx', ((Math.random() - 0.5) * 120) + 'px');
            b.style.setProperty('--dy', (-60 - Math.random() * 80) + 'px');
            wcEl.appendChild(b);
            setTimeout(() => b.remove(), 900);
        }
        if (wc.washes >= 3) {
            wc.busy = true;
            wc.helped++;
            document.getElementById('wcCount').textContent = `⭐ ${wc.helped}`;
            const a = document.getElementById('wcWho');
            a.className = 'wc-who happy';
            document.getElementById('wcBubble').textContent = 'Dankjewel! Schoon! ✨';
            document.getElementById('wcBubble').classList.add('show');
            playCorrect();
            setTimeout(() => {
                st.querySelector('.wc-foam').classList.remove('on');
                a.className = 'wc-who leave';
                document.getElementById('wcBubble').classList.remove('show');
            }, 1400);
            setTimeout(wcNext, 2200);
        }
    }
    wcUpdateButtons();
}

document.querySelectorAll('.wc-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    wcDo(b.dataset.s);
}));

function openWc() {
    wcOpen = true;
    wcEl.classList.add('open');
    wc.queue = [];
    wc.helped = 0;
    document.getElementById('wcCount').textContent = '⭐ 0';
    wcNext();
}

function closeWc() {
    wcOpen = false;
    wc.who = null;
    stopNoise();
    wcEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('wcClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeWc(); });
wcEl.addEventListener('pointerdown', (e) => e.stopPropagation());
