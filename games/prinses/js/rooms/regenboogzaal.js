/* 🌈 Regenboogzaal */
defineRoom({
    key: 'regenboogzaal',
    name: 'Regenboogzaal',
    icon: '🌈',
    say: 'De regenboogzaal',
    build(r3) {
        place(el('<div class="rainbow-window"></div>'), r3 + 250, 70);
        place(el(`<svg class="rainbow-arc" id="rainbowArc" viewBox="0 0 800 500">
            ${['#ef4444','#fb923c','#facc15','#4ade80','#60a5fa','#a855f7'].map((c, i) =>
                `<path d="M ${60 + i * 22} 420 A ${340 - i * 22} ${320 - i * 22} 0 0 1 ${740 - i * 22} 420" stroke="${c}"/>`).join('')}
            </svg>`), r3, 0);
        ['#f472b6', '#60a5fa', '#facc15', '#4ade80'].forEach((c, i) => {
            const d = place(el(`<div class="disco-light" style="background:radial-gradient(circle, ${c}, transparent 70%)"></div>`), r3 + 80 + i * 170, 120 + (i % 2) * 90);
            d.style.animationDelay = (i * -0.5) + 's';
        });
        addObj('<div class="discoball"><div class="chain"></div><div class="ball"></div></div>', r3 + 590, 0, r3 + 560, rainbowParty);
        addObj('<div class="pedestal"><div class="ball"></div><div class="col"></div><div class="tap-hint">👇</div></div>', r3 + 345, 285, r3 + 290, rainbowParty);
        addObj('<div class="emoji-obj">🎈</div>', r3 + 215, 240, r3 + 240, balloonPop);
        addObj('<div class="emoji-obj">🎈</div>', r3 + 660, 230, r3 + 690, balloonPop);
    }
});

function rainbowParty() {
    const arc = document.getElementById('rainbowArc');
    arc.classList.remove('show');
    void arc.getBoundingClientRect();
    arc.classList.add('show');
    world.classList.add('party');
    state.partyUntil = performance.now() + 6000;
    speak('Regenboog feest!');
    twirl();
    playMelody();
    clearTimeout(rainbowParty.t);
    rainbowParty.t = setTimeout(() => world.classList.remove('party'), 6000);
}
