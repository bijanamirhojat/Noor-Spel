/* 🦒 Savanne: een giraf die blaadjes eet, een leeuw op een rots, een zebra en de voederkar.
   Voederkar: "Wie eet wat?" geef elk dier het goede eten (kies uit 3). */
const ZOO_FOOD = [
    ['🐒', '🍌'], ['🦒', '🌿'], ['🐧', '🐟'], ['🐘', '🥜'], ['🦁', '🍖'],
    ['🐼', '🎋'], ['🐰', '🥕'], ['🐻', '🍯'], ['🐿️', '🌰'], ['🐦', '🌻']
];

defineRoom({
    key: 'savanne',
    name: 'Savanne',
    icon: '🦒',
    say: 'De savanne',
    build(x) {
        place(el('<div class="zs-sun"></div>'), x + 80, -20);
        place(el('<div class="zs-acacia"><div class="crown"></div><div class="trunk"></div></div>'), x + 480, 30);
        addObj('<div class="zs-giraffe"><span>🦒</span></div>', x + 400, 150, x + 470, (node) => {
            zooAnim(node, 'stretch');
            playFreqSweep(300, 900, 0.6, 0.08);
            setTimeout(() => [500, 430, 500, 430].forEach((f, i) => setTimeout(() => playTone(f, 0.06, 0.08, 'triangle'), i * 110)), 650);
            setTimeout(() => sparkleShower(x + 560, 60, 14), 650);
        });
        addObj('<div class="zs-rock"><div class="stone"></div><span class="lion">🦁</span></div>', x + 30, 230, x + 140, (node) => {
            zooAnim(node.querySelector('.lion'), 'roar');
            zooRoar();
        });
        addObj('<div class="zs-zebra"><span>🦓</span></div>', x + 640, 300, x + 680, (node) => {
            zooAnim(node, 'hop');
            [700, 900, 700].forEach((f, i) => setTimeout(() => playTone(f, 0.06, 0.08, 'triangle'), i * 140));
        });
        addObj(`<div class="zs-cart"><div class="box"><span>🍌🥕🐟🌿</span></div><div class="wheel l"></div><div class="wheel r"></div><div class="handle"></div><div class="sign">🍽️ Voeren</div>
            <div class="tap-hint" style="left:70px;top:-50px">👇</div></div>`, x + 210, 280, x + 300, openZooFeed);
    }
});

/* ─────────── Wie eet wat? (overlay) ─────────── */
const zfEl = document.getElementById('zooFeedOv');
let zooFeedOpen = false;
const zf = { queue: [], cur: null, fed: 0, busy: false };

function zfNext() {
    if (!zf.queue.length) zf.queue = shuffle(ZOO_FOOD.slice());
    zf.cur = zf.queue.pop();
    zf.busy = false;
    const [animal, food] = zf.cur;
    const others = shuffle(ZOO_FOOD.filter(f => f[1] !== food).map(f => f[1])).slice(0, 2);
    const choices = shuffle([food, ...others]);
    const a = document.getElementById('zfAnimal');
    a.textContent = animal;
    zooAnim(a, 'enter');
    const bub = document.getElementById('zfBubble');
    bub.innerHTML = 'Ik heb honger! 🤤';
    bub.classList.add('show');
    document.getElementById('zfChoices').innerHTML = choices.map(c => `<button class="zf-food" data-f="${c}">${c}</button>`).join('');
    document.querySelectorAll('.zf-food').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        zfPick(b);
    }));
    zooSqueak();
}

function zfPick(btn) {
    if (zf.busy) return;
    const a = document.getElementById('zfAnimal');
    const bub = document.getElementById('zfBubble');
    if (btn.dataset.f !== zf.cur[1]) {
        // Not that one: a gentle head shake
        zooAnim(btn, 'v-nope');
        zooAnim(a, 'nope');
        bub.innerHTML = 'Dat lust ik niet 🙈';
        playTone(240, 0.15, 0.08, 'triangle');
        return;
    }
    zf.busy = true;
    btn.classList.add('used');
    ovFly(zfEl, btn, a, btn.dataset.f, 600).then(() => {
        zooAnim(a, 'munch');
        bub.innerHTML = 'Mmm, lekker! 💖';
        [500, 420, 500, 420].forEach((f, i) => setTimeout(() => playTone(f, 0.06, 0.1, 'triangle'), i * 110));
        setTimeout(playCorrect, 450);
        ovCheer(zfEl, a, ['💖', '✨', '⭐']);
        zf.fed++;
        const c = document.getElementById('zfCount');
        c.textContent = `⭐ ${zf.fed}`;
        bounceEl(c, 'jump');
        if (zf.fed % ZOO_FOOD.length === 0) setTimeout(() => { playWin(); ovCheer(zfEl, c, ['🎉', '🦁', '🐒', '🐘', '🦒']); }, 600);
        setTimeout(() => {
            if (!zooFeedOpen) return;
            zooAnim(a, 'leave');
            bub.classList.remove('show');
            setTimeout(() => { if (zooFeedOpen) zfNext(); }, 500);
        }, 1500);
    });
}

function openZooFeed() {
    zooFeedOpen = true;
    zfEl.classList.add('open');
    zf.queue = [];
    zf.fed = 0;
    document.getElementById('zfCount').textContent = '⭐ 0';
    zfNext();
}

function closeZooFeed() {
    zooFeedOpen = false;
    zfEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('zooFeedClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeZooFeed(); });
zfEl.addEventListener('pointerdown', (e) => e.stopPropagation());
