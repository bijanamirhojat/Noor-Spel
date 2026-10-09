/* 🎟️ Ingang: de bus terug naar het dorp, de grote poort, een kaartjeshuisje en een ballonnenverkoper */
const ZI_BALLOONS = ['🎈', '🎈', '🎈'];

defineRoom({
    key: 'zooingang',
    name: 'Ingang',
    icon: '🎟️',
    say: 'De ingang van de dierentuin',
    build(x) {
        scene.koets = addBus(x + 10, x + 270, 'dorp');
        addObj(`<div class="zi-gate"><div class="post l"></div><div class="post r"></div>
            <div class="arch"><span>🦁</span> Dierentuin <span>🦒</span></div><div class="bars"></div></div>`, x + 290, 60, x + 400, (node) => {
            zooAnim(node.querySelector('.arch'), 'roar');
            zooRoar();
        });
        addObj('<div class="zi-booth"><div class="roof"></div><div class="win"><span>🐼</span></div><div class="slot"></div><span class="ticket">🎟️</span><div class="sign">Kaartjes</div></div>', x + 640, 150, x + 680, (node) => {
            zooAnim(node, 'print');
            for (let i = 0; i < 6; i++) setTimeout(() => playTone(1200 + (i % 2) * 300, 0.04, 0.05, 'square'), i * 60);
            setTimeout(() => { playCorrect(); showToast('🎟️ Kaartje! Welkom in de dierentuin!', 1800); }, 500);
        });
        addObj(`<div class="zi-balloons">${ZI_BALLOONS.map((b, i) => `<span class="b" style="--h:${i * 110}deg;left:${i * 30}px;animation-delay:${-i * 0.7}s">${b}</span>`).join('')}<div class="strings"></div><span class="seller">🤡</span></div>`,
        x + 535, 170, x + 570, (node) => {
            const bs = [...node.querySelectorAll('.b:not(.away)')];
            if (!bs.length) return;
            const b = randomPick(bs);
            b.classList.add('away');
            playFreqSweep(500, 1400, 0.6, 0.08);
            setTimeout(() => b.classList.remove('away'), 3500);
        });
    }
});
