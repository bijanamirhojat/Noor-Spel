/* 🏰 Kasteelhal: deur naar buiten, lift naar boven (zie WINGS) en de poes */
defineRoom({
    key: 'kasteelhal',
    name: 'Kasteelhal',
    icon: '🏰',
    say: 'De kasteelhal',
    build(r0) {
        place(el('<div class="door-sign">🌳 Naar buiten</div>'), r0 + 78, 78);
        scene.door = {
            walkX: r0 + 150,
            node: addObj('<div class="castle-door"><div class="tap-hint" style="top:90px">👇</div></div>', r0 + 60, 120, r0 + 150, (node) => goThroughDoor(node, 'out'))
        };
        addObj('<div class="torch"><div class="stick"></div><div class="flame"></div></div>', r0 + 280, 170, r0 + 295, torchPuff);
        addObj('<div class="torch"><div class="stick"></div><div class="flame"></div></div>', r0 + 765, 170, r0 + 760, torchPuff);
        addObj('<div class="banner">👑</div>', r0 + 530, 60, r0 + 575, () => sayRandom(['Het kasteel van de prinses!', 'Hoera!']));
        addObj('<div class="frame">🦄</div>', r0 + 630, 110, r0 + 690, () => { speak('Een eenhoorn!'); sparkleShower(r0 + 690, 170, 30); });
        place(el('<div class="rug"></div>'), r0 + 440, 425).classList.add('obj');

        /* Pet cat (starts in the hall) */
        const pet = el('<div class="pet" id="pet"><span class="pbob"><span class="pflip">🐈</span></span><span class="collar">💖</span></div>');
        world.appendChild(pet);
        state.pet.x = r0 + 230;
        pet.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (state.busy) return;
            togglePet();
        });
    }
});

function torchPuff(node) {
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top);
    for (let i = 0; i < 40; i++) {
        spawnSparkle(p.x, p.y, {
            vx: (Math.random() - 0.5) * 80,
            vy: -60 - Math.random() * 140,
            hue: 280 + Math.random() * 60
        });
    }
    playFreqSweep(300, 900, 0.3, 0.15);
}
