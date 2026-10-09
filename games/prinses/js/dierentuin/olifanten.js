/* 🐘 Olifanten: een grote olifant die water spuit, een babyolifantje in de modder en een baal hooi */
defineRoom({
    key: 'olifanten',
    name: 'Olifanten',
    icon: '🐘',
    say: 'De olifanten',
    build(x) {
        place(el('<div class="zo-pool"></div>'), x + 380, 352);
        addObj('<div class="zo-big"><span>🐘</span><div class="tap-hint" style="left:80px;top:-40px">👇</div></div>', x + 120, 172, x + 330, (node) => {
            zooAnim(node, 'trumpet');
            zooTrumpet();
            // A big shower out of the trunk, arcing to the left
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width * 0.12, r.top + r.height * 0.3);
            for (let i = 0; i < 50; i++) {
                setTimeout(() => spawnSparkle(p.x, p.y, { vx: -60 - Math.random() * 120, vy: -260 - Math.random() * 120, g: 420, hue: 195 + Math.random() * 25, size: 4 + Math.random() * 6, max: 1.6 }), i * 14);
            }
            startNoise('shower');
            setTimeout(stopNoise, 900);
        });
        addObj('<div class="zo-baby"><span>🐘</span></div>', x + 470, 300, x + 520, (node) => {
            zooAnim(node, 'splash');
            playFreqSweep(500, 900, 0.2, 0.1);
            setTimeout(() => {
                for (let i = 0; i < 24; i++) spawnSparkle(x + 530, 360, { vy: -100 - Math.random() * 120, vx: (Math.random() - 0.5) * 160, g: 260, hue: 30, size: 4 + Math.random() * 5, max: 1.1 });
                playTone(120, 0.15, 0.15, 'sine');
            }, 350);
        });
        addObj('<div class="zo-hay"><div class="bale"></div></div>', x + 660, 300, x + 680, (node) => {
            zooAnim(node, 'v-wobble');
            const r = node.getBoundingClientRect();
            const p = screenToWorld(r.left + r.width / 2, r.top);
            for (let i = 0; i < 18; i++) spawnSparkle(p.x, p.y, { hue: 48, speed: 120, size: 3 + Math.random() * 3, max: 1 });
            playFreqSweep(300, 500, 0.15, 0.08);
        });
    }
});
