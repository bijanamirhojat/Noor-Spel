/* 🪞 Spiegelkamer */
defineRoom({
    key: 'spiegelkamer',
    name: 'Spiegelkamer',
    icon: '🪞',
    say: 'De spiegelkamer',
    build(r1) {
        const garland = '🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸🌷🌼🌸';
        place(el(`<div class="garland">${garland}</div>`), r1 + 20, 64);
        buildMirror(r1 + 280, 70);
        addObj('<div class="emoji-obj gleam">🌷</div>', r1 + 195, 370, r1 + 230, flowerPop);
        addObj('<div class="emoji-obj gleam">💐</div>', r1 + 620, 370, r1 + 650, flowerPop);
        addObj('<div class="emoji-obj" style="font-size:52px">🎀</div>', r1 + 200, 150, r1 + 230, () => sayRandom(['Een mooie strik!', 'Roze strik!']));
    }
});

function buildMirror(x, y) {
    const flowers = ['🌸', '🌷', '🌼', '🌺', '🌸', '🌷', '🌼', '🌺', '🌸', '🌷', '🌼', '🌺', '🌸', '🌷'];
    let flowerHtml = '';
    flowers.forEach((f, i) => {
        const a = (i / flowers.length) * Math.PI * 2;
        const fx = 120 + Math.cos(a) * 110;
        const fy = 150 + Math.sin(a) * 140;
        flowerHtml += `<span class="flower" style="left:${fx}px;top:${fy}px">${f}</span>`;
    });
    const html = `<div class="mirror">
        <div class="glass"><div class="reflection" id="reflection">${princessSVG('mr')}</div></div>
        ${flowerHtml}
        <div class="tap-hint" style="top:-6px">👇</div>
    </div>`;
    addObj(html, x, y, x + 120, mirrorMagic);
}

function mirrorMagic(node) {
    state.dressIdx = (state.dressIdx + 1) % DRESSES.length;
    applyDress();
    node.classList.remove('flash');
    void node.offsetWidth;
    node.classList.add('flash');
    twirl();
    playSparkleSound();
    const mx = roomX('spiegelkamer') + 400;
    sparkleShower(mx, 70, 50);
    burst(state.x, 330, 40);
    const color = DRESSES[state.dressIdx];
    const names = { '#f472b6': 'roze', '#a855f7': 'paarse', '#38bdf8': 'blauwe', '#34d399': 'groene', '#fbbf24': 'gouden', 'rainbow': 'regenboog', '#fb7185': 'rode' };
    sayRandom([
        `Een ${names[color]} jurk! Wat mooi!`,
        'Spiegeltje, spiegeltje! Wat ben je mooi!',
        `Glitter glitter! Een ${names[color]} jurk!`
    ]);
}

function flowerPop(node) {
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
    for (let i = 0; i < 30; i++) {
        spawnSparkle(p.x, p.y, { hue: 300 + Math.random() * 80, speed: 220 });
    }
    playCorrect();
    sayRandom(['Mooie bloemetjes!', 'Wat ruikt dat lekker!', 'Bloemetjes!']);
}
