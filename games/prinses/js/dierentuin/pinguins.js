/* 🐧 Pinguïns: een ijsglijbaan (een pinguïn glijdt het water in), waggelende pinguïns, een emmer vis en een ijsbeer */
defineRoom({
    key: 'pinguins',
    name: 'Pinguïns',
    icon: '🐧',
    say: 'De pinguïns',
    build(x) {
        place(el('<div class="zp-water"><div class="wave"></div></div>'), x + 260, 340);
        addObj(`<div class="zp-slide"><div class="ice"></div><span class="pg">🐧</span><div class="tap-hint" style="left:30px;top:-50px">👇</div></div>`, x + 20, 110, x + 150, (node) => {
            if (node.classList.contains('go')) return;
            node.classList.add('go');
            playFreqSweep(1200, 300, 0.9, 0.08);
            setTimeout(() => {
                zooSqueak();
                for (let i = 0; i < 24; i++) spawnSparkle(x + 330, 350, { vy: -120 - Math.random() * 120, vx: (Math.random() - 0.5) * 160, g: 260, hue: 195 + Math.random() * 20, size: 4 + Math.random() * 5, max: 1.2 });
                startNoise('shower');
                setTimeout(stopNoise, 400);
            }, 900);
            setTimeout(() => node.classList.remove('go'), 2600);
        });
        const pens = [[570, 300], [640, 316], [180, 322]].map(([px, py], i) =>
            addObj(`<div class="zp-pen" style="animation-delay:${-i * 0.3}s"><span>🐧</span></div>`, x + px, py, x + px + 30, (node) => {
                zooAnim(node, 'jump');
                zooSqueak();
            }));
        addObj('<div class="zp-bucket"><span class="f">🐟</span><span class="bk">🪣</span></div>', x + 710, 330, x + 720, (node) => {
            const p = randomPick(pens);
            const r = node.getBoundingClientRect();
            const pr = p.getBoundingClientRect();
            const a = screenToWorld(r.left + r.width / 2, r.top);
            const b = screenToWorld(pr.left + pr.width / 2, pr.top + 10);
            playFreqSweep(500, 1000, 0.25, 0.1);
            zooToss('🐟', a.x - 18, a.y - 20, b.x - 18, b.y - 10, 650).then(() => {
                zooAnim(p, 'gulp');
                zooSqueak();
            });
        });
        addObj('<div class="zp-floe"><div class="ice"></div><span>🐻‍❄️</span></div>', x + 330, 230, x + 420, (node) => {
            zooAnim(node, 'bob');
            playFreqSweep(200, 120, 0.5, 0.12);
        });
    }
});
