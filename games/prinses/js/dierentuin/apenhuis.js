/* 🐒 Apenhuis: aapjes slingeren aan lianen, een bananenboom (gooi een banaan naar een aapje) en een gorilla */
defineRoom({
    key: 'apenhuis',
    name: 'Apenhuis',
    icon: '🐒',
    say: 'Het apenhuis',
    build(x) {
        place(el('<div class="za-leaves"></div>'), x, -60);
        const monkeys = [[150, '🐒'], [330, '🐵'], [520, '🐒']].map(([mx, m], i) =>
            addObj(`<div class="za-vine" style="height:${200 + i * 40}px;animation-delay:${-i * 0.9}s"><span class="m">${m}</span></div>`, x + mx, -20, x + mx + 20, (node) => {
                zooAnim(node, 'swing');
                zooMonkey();
            }));
        addObj('<div class="za-tree"><span class="top">🌴</span><span class="bn" style="left:40px">🍌</span><span class="bn" style="left:70px">🍌</span><div class="tap-hint" style="left:50px;top:-40px">👇</div></div>', x + 640, 140, x + 660, (node) => {
            // Toss a banana to one of the monkeys; it munches it up
            const vine = randomPick(monkeys);
            const m = vine.querySelector('.m');
            const r = node.getBoundingClientRect();
            const mr = m.getBoundingClientRect();
            const a = screenToWorld(r.left + r.width / 2, r.top + r.height * 0.4);
            const b = screenToWorld(mr.left + mr.width / 2, mr.top + mr.height / 2);
            playFreqSweep(400, 900, 0.3, 0.1);
            zooToss('🍌', a.x - 20, a.y - 20, b.x - 20, b.y - 20, 700).then(() => {
                zooAnim(vine, 'eat');
                [500, 420, 500, 420].forEach((f, i) => setTimeout(() => playTone(f, 0.06, 0.1, 'triangle'), i * 100));
                setTimeout(zooMonkey, 450);
                for (let i = 0; i < 12; i++) spawnSparkle(b.x, b.y, { hue: 50, speed: 100, max: 1 });
            });
        });
        addObj('<div class="za-gorilla"><span>🦍</span></div>', x + 360, 300, x + 420, (node) => {
            zooAnim(node, 'drum');
            for (let i = 0; i < 6; i++) setTimeout(() => playTone(110 + (i % 2) * 20, 0.08, 0.2, 'triangle'), i * 120);
        });
        place(el('<div class="za-net"></div>'), x + 20, 250);
    }
});
