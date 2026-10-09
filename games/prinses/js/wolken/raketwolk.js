/* 🚀 Raketwolk: het lanceerplatform hoog in de wolken, met de raket naar de ruimte en een sterrenkijker */
defineRoom({
    key: 'raketwolk',
    name: 'Raketwolk',
    icon: '🚀',
    say: 'De raketwolk',
    build(x) {
        place(el('<div class="rw-pad"></div>'), x + 240, 330);
        scene.rides = { ruimte: addRocket(x + 300, 70, x + 450, 'ruimte') };
        addObj('<div class="rw-scope"><div class="tube"></div><div class="legs"></div></div>', x + 60, 250, x + 120, (node) => {
            zooAnim(node, 'v-wobble');
            [1568, 2093, 2637].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.06, 'sine'), i * 120));
            for (let i = 0; i < 20; i++) spawnSparkle(x + 160 + Math.random() * 120, -60 + Math.random() * 80, { hue: 50, speed: 60, max: 1.6 });
            showToast('🔭 Ik zie een poezenplaneet! 🐱', 1800);
        });
        addObj('<div class="rw-count"><span>3</span><span>2</span><span>1</span></div>', x + 620, 140, x + 640, (node) => {
            zooAnim(node, 'go');
            [0, 1, 2].forEach(i => setTimeout(() => playTone(523 + i * 130, 0.2, 0.1, 'square'), i * 450));
            setTimeout(() => playFreqSweep(400, 1600, 0.5, 0.1), 1350);
        });
    }
});
