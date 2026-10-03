/* 🏘️ Dorpsplein: koets terug naar het kasteel, wensput, lantaarn en duifjes */
defineRoom({
    key: 'dorpsplein',
    name: 'Dorpsplein',
    icon: '🏘️',
    say: 'Het dorpsplein',
    build(d0) {
        villageHouse(d0 + 10, 180, 300, '#fde68a', '#ef4444', { flowers: true });
        villageHouse(d0 + 300, 230, 340, '#fbcfe8', '#a855f7');
        villageHouse(d0 + 600, 190, 280, '#bae6fd', '#f97316', { flowers: true });

        scene.koets = addKoets(d0 + 20, d0 + 285, 'out');
        addObj(`<div class="well"><div class="w-roof"></div><div class="w-post l"></div><div class="w-post r"></div>
            <span class="w-bucket">🪣</span><div class="w-wall"></div><div class="tap-hint" style="left:62px;top:-30px">👇</div></div>`,
            d0 + 290, 230, d0 + 420, wishWell);
        addObj('<div class="lamppost"><div class="lp-lamp"></div><div class="lp-pole"></div></div>', d0 + 540, 150, d0 + 560, (node) => {
            const on = node.classList.toggle('on');
            playFreqSweep(on ? 600 : 900, on ? 1200 : 400, 0.2, 0.1);
            if (on) sparkleShower(d0 + 565, 150, 20);
        });
        [[640, 380], [700, 392], [750, 376]].forEach(([x, y], i) => {
            const b = addObj('<div class="pigeon">🐦</div>', d0 + x, y, d0 + x - 40, pigeonsFly);
            b.style.animationDelay = (-i * 0.4) + 's';
        });
    }
});

const WISHES = ['⭐', '🦄', '🎂', '🌈', '👑', '🐶', '🎈', '💖', '🧁', '🦋'];

function wishWell(node) {
    if (node.classList.contains('wish')) return;
    node.classList.add('wish');
    const r = node.getBoundingClientRect();
    const c = screenToWorld(r.left + r.width / 2, r.top + r.height * 0.55);
    // Coin flips in, plop, then the wish rises out of the well
    const coin = tempEl('<div class="magic-fly">🪙</div>', c.x - 18, c.y - 120, 900);
    coin.style.setProperty('--dx', '0px');
    coin.style.setProperty('--dy', '110px');
    playFreqSweep(1800, 2600, 0.15, 0.1);
    setTimeout(() => { splash(c.x, c.y); playTone(220, 0.2, 0.15, 'sine'); }, 600);
    setTimeout(() => {
        const wish = randomPick(WISHES);
        const f = tempEl(`<div class="magic-fly" style="font-size:64px">${wish}</div>`, c.x - 32, c.y - 40, 3300);
        f.style.setProperty('--dx', '0px');
        f.style.setProperty('--dy', '-220px');
        [784, 988, 1175, 1568].forEach((fq, i) => setTimeout(() => playTone(fq, 0.25, 0.09, 'sine'), i * 110));
        sparkleShower(c.x, c.y - 120, 40);
        showToast(`${wish} Je wens komt uit!`, 1800);
    }, 1100);
    setTimeout(() => node.classList.remove('wish'), 2600);
}

function pigeonsFly() {
    const birds = world.querySelectorAll('.pigeon');
    birds.forEach((b, i) => {
        b.classList.remove('fly');
        void b.offsetWidth;
        b.classList.add('fly');
        setTimeout(() => b.classList.remove('fly'), 3200);
    });
    for (let i = 0; i < 4; i++) setTimeout(() => playFreqSweep(1200, 1700, 0.08, 0.08), i * 120);
}
