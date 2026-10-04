/* 🐔 Kinderboerderij: dieren aaien, en in de schuur eieren rapen.
   Een vol mandje geeft een gouden ei; het kuikentje loopt daarna rond op de boerderij. */
const CHICK_KEY = 'noor-prinses-kuikens';
const EGG_GOAL = 10;
const EGG_MAX_FIELD = 6;
const CHICKS_SHOWN = 10;
let farmChicks = 0;
try {
    const n = parseInt(localStorage.getItem(CHICK_KEY), 10);
    if (n > 0) farmChicks = n;
} catch (e) {}

const FARM_ANIMALS = [
    { e: '🐄', x: 390, snd: () => { playTone(150, 0.9, 0.18, 'sawtooth'); playFreqSweep(170, 120, 0.9, 0.12); } },
    { e: '🐑', x: 500, snd: () => [0, 90, 180, 270].forEach(t => setTimeout(() => playTone(420, 0.09, 0.12, 'sawtooth'), t)) },
    { e: '🐷', x: 600, snd: () => [0, 160].forEach(t => setTimeout(() => playFreqSweep(260, 180, 0.12, 0.2), t)) },
    { e: '🐐', x: 700, snd: () => [0, 80, 160, 240, 320].forEach(t => setTimeout(() => playTone(560, 0.07, 0.1, 'sawtooth'), t)) }
];

defineRoom({
    key: 'boerderij',
    name: 'Kinderboerderij',
    icon: '🐔',
    say: 'De kinderboerderij',
    build(x) {
        place(el('<div class="farm-fence"></div>'), x, 318);
        addObj(`<div class="barn">
            <div class="roof"></div><div class="wall"><div class="loft">🐔</div><div class="door"><span></span><span></span></div></div>
            <div class="tap-hint" style="left:110px;top:-30px">👇</div>
        </div>`, x + 60, 120, x + 200, openEggs);
        place(el('<div class="hay">🌾</div>'), x + 300, 360);
        FARM_ANIMALS.forEach(a => {
            addObj(`<div class="emoji-obj farm-animal">${a.e}</div>`, x + a.x - 32, 318, x + a.x, (node) => {
                bounceEl(node, 'jump');
                a.snd();
                const r = node.getBoundingClientRect();
                const p = screenToWorld(r.left + r.width / 2, r.top);
                for (let i = 0; i < 14; i++) spawnSparkle(p.x, p.y, { speed: 100, hue: 330 + Math.random() * 30, size: 6 });
            });
        });
        place(el('<div class="chick-yard" id="chickYard"></div>'), x + 360, 412);
        renderChicks();
    }
});

function renderChicks() {
    const yard = document.getElementById('chickYard');
    if (!yard) return;
    const n = Math.min(farmChicks, CHICKS_SHOWN);
    yard.innerHTML = Array.from({ length: n }, (_, i) =>
        `<span class="yard-chick" style="left:${(i * 37) % 380}px;animation-duration:${5 + (i % 4)}s;animation-delay:${-i * 1.3}s"><b>🐥</b></span>`).join('');
}

/* ─────────── Eieren rapen (overlay) ─────────── */
const eggEl = document.getElementById('eggOv');
const eggField = document.getElementById('eggField');
let eggOpen = false;
const eg = { count: 0, timer: null, golden: false };
const HENS = [20, 50, 80];   // % from the left

function renderEggCount() {
    document.getElementById('eggCount').innerHTML = `🧺 ${eg.count} / ${EGG_GOAL}` + (farmChicks ? `  <small>🐥 ${farmChicks}</small>` : '');
}

function layEgg(golden) {
    const hens = eggField.querySelectorAll('.egg-hen');
    const h = Math.floor(Math.random() * HENS.length);
    const hen = hens[h];
    hen.classList.remove('lay'); void hen.offsetWidth; hen.classList.add('lay');
    [0, 120, 240].forEach(t => setTimeout(() => playTone(700 + Math.random() * 200, 0.06, 0.08, 'square'), t));
    const egg = document.createElement('button');
    egg.className = 'egg' + (golden ? ' golden' : '');
    egg.textContent = '🥚';
    egg.style.left = HENS[h] + '%';
    egg.style.top = '20%';
    eggField.appendChild(egg);
    // Roll out onto the grass
    void egg.offsetWidth;
    egg.classList.add('roll');
    egg.style.left = (golden ? 50 : 10 + Math.random() * 80) + '%';
    egg.style.top = (golden ? 55 : 42 + Math.random() * 30) + '%';
    egg.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (golden) hatchEgg(egg);
        else collectEgg(egg);
    });
}

function collectEgg(egg) {
    if (egg.classList.contains('got')) return;
    egg.classList.add('got');
    const basket = document.getElementById('eggBasket');
    const fr = eggField.getBoundingClientRect();
    const br = basket.getBoundingClientRect();
    egg.style.left = ((br.left + br.width / 2 - fr.left) / fr.width * 100) + '%';
    egg.style.top = ((br.top + br.height / 3 - fr.top) / fr.height * 100) + '%';
    playFreqSweep(600, 1200, 0.15, 0.12);
    setTimeout(() => {
        egg.remove();
        eg.count++;
        renderEggCount();
        basket.classList.remove('bump'); void basket.offsetWidth; basket.classList.add('bump');
        playTone(500 + eg.count * 60, 0.15, 0.12, 'triangle');
        if (eg.count >= EGG_GOAL) basketFull();
    }, 450);
}

function basketFull() {
    clearInterval(eg.timer);
    eg.timer = null;
    playWin();
    eggField.querySelectorAll('.egg:not(.golden)').forEach(e => e.remove());
    document.getElementById('eggHint').textContent = '🧺 Mandje vol! Kijk, een gouden ei! ✨';
    setTimeout(() => layEgg(true), 1000);
}

function hatchEgg(egg) {
    if (eg.golden) return;
    eg.golden = true;
    egg.classList.add('hatch');
    [0, 300, 600].forEach(t => setTimeout(() => playTone(300 + t, 0.1, 0.15, 'triangle'), t));
    setTimeout(() => { egg.textContent = '🐣'; playFreqSweep(800, 1600, 0.2, 0.12); }, 900);
    setTimeout(() => {
        egg.textContent = '🐥';
        egg.classList.add('chick');
        [1568, 2093, 1568, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 0.1, 'sine'), i * 110));
        farmChicks++;
        try { localStorage.setItem(CHICK_KEY, String(farmChicks)); } catch (e) {}
        renderChicks();
        renderEggCount();
        const fr = eggEl.getBoundingClientRect();
        const r = egg.getBoundingClientRect();
        for (let i = 0; i < 14; i++) {
            const s = document.createElement('span');
            s.className = 'scope-spark';
            s.textContent = randomPick(['💛', '✨', '⭐', '🐥']);
            const a = Math.random() * Math.PI * 2;
            const d = 60 + Math.random() * 90;
            s.style.left = (r.left + r.width / 2 - fr.left) + 'px';
            s.style.top = (r.top + r.height / 2 - fr.top) + 'px';
            s.style.setProperty('--dx', Math.cos(a) * d + 'px');
            s.style.setProperty('--dy', Math.sin(a) * d + 'px');
            eggEl.appendChild(s);
            setTimeout(() => s.remove(), 900);
        }
        document.getElementById('eggHint').textContent = '🐥 Een kuikentje! Het woont nu op de boerderij!';
        document.getElementById('eggAgain').style.display = '';
    }, 1700);
}

function newEggRound() {
    eggField.querySelectorAll('.egg').forEach(e => e.remove());
    eg.count = 0;
    eg.golden = false;
    document.getElementById('eggAgain').style.display = 'none';
    document.getElementById('eggHint').textContent = 'Tik op de eitjes en doe ze in het mandje!';
    renderEggCount();
    clearInterval(eg.timer);
    eg.timer = setInterval(() => {
        if (eggField.querySelectorAll('.egg:not(.got)').length < EGG_MAX_FIELD && Math.random() < 0.7) layEgg(false);
    }, 900);
    setTimeout(() => layEgg(false), 300);
}

function openEggs() {
    eggOpen = true;
    eggEl.classList.add('open');
    if (!eggField.querySelector('.egg-hen')) {
        eggField.insertAdjacentHTML('afterbegin', HENS.map(l => `<div class="egg-hen" style="left:${l}%"><span>🐔</span><div class="nest"></div></div>`).join('') +
            '<div class="egg-basket" id="eggBasket">🧺</div>');
    }
    newEggRound();
    playMusicBox();
}

function closeEggs() {
    eggOpen = false;
    clearInterval(eg.timer);
    eg.timer = null;
    eggEl.classList.remove('open');
    _playWhoosh();
}

document.getElementById('eggAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    newEggRound();
    playPop();
});
document.getElementById('eggClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeEggs();
});
eggEl.addEventListener('pointerdown', (e) => e.stopPropagation());
