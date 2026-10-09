/* 🌙 Maan: de raket terug naar de wolken, kraters, de aarde in de lucht, een vlag en een alientje */
defineRoom({
    key: 'maan',
    name: 'Maan',
    icon: '🌙',
    say: 'De maan',
    build(x) {
        place(el('<div class="mn-earth">🌍</div>'), x + 560, -60);
        scene.koets = addRocket(x + 30, 130, x + 200, 'wolken');
        [[260, 380, 90], [470, 400, 120], [690, 384, 70]].forEach(([cx, cy, w]) =>
            place(el(`<div class="mn-crater" style="width:${w}px;height:${w * 0.32}px"></div>`), x + cx, cy));
        addObj('<div class="mn-flag"><div class="pole"></div><div class="cloth">👑</div></div>', x + 300, 220, x + 320, (node) => {
            zooAnim(node, 'wave');
            [784, 988, 1175].forEach((f, i) => setTimeout(() => playTone(f, 0.18, 0.08, 'triangle'), i * 120));
        });
        addObj('<div class="mn-alien"><span>👽</span><b>Hoi!</b></div>', x + 520, 270, x + 540, (node) => {
            zooAnim(node, 'hop');
            [1200, 1500, 1800, 1500].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 0.07, 'sine'), i * 80));
        });
        addObj('<div class="mn-rock">🪨</div>', x + 680, 340, x + 690, (node) => {
            // Low gravity: the moon rock floats up slowly and comes back down
            zooAnim(node, 'float');
            playFreqSweep(300, 700, 1.2, 0.06);
        });
    }
});
