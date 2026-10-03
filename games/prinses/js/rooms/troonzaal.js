/* 👑 Troonzaal */
defineRoom({
    key: 'troonzaal',
    name: 'Troonzaal',
    icon: '👑',
    say: 'De troonzaal',
    build(r2) {
        place(el('<div class="chandelier"><div class="chain"></div><div class="candles">🕯️🕯️🕯️</div><div class="body"></div><div class="drops">💎💎💎💎</div></div>'), r2 + 150, 20);
        place(el('<div class="chandelier"><div class="chain"></div><div class="candles">🕯️🕯️🕯️</div><div class="body"></div><div class="drops">💎💎💎💎</div></div>'), r2 + 500, 20);
        addObj('<div class="throne"><div class="back"></div><div class="seat"></div><div class="legs"></div><div class="tap-hint">👇</div></div>', r2 + 315, 200, r2 + 400, sitOnThrone);
        addObj('<div class="emoji-obj">🐶</div>', r2 + 620, 385, r2 + 610, dogBark);
        addObj('<div class="emoji-obj gleam" style="font-size:56px">🎂</div>', r2 + 90, 385, r2 + 130, () => { sayRandom(['Taart! Lekker!', 'Mmm, taart!']); playCorrect(); sparkleShower(r2 + 130, 380, 24); });
    }
});

function sitOnThrone() {
    state.busy = true;
    const p = princessEl();
    p.classList.add('sitting');
    state.facing = 1;
    playWin();
    speak('Hoera voor de prinses!');
    showToast('👑 Hoera voor de prinses! 👑');
    for (let i = 0; i < 5; i++) {
        setTimeout(() => sparkleShower(roomX('troonzaal') + 150 + i * 125, 20, 30), i * 180);
    }
    setTimeout(() => {
        p.classList.remove('sitting');
        state.busy = false;
    }, 2600);
}

function dogBark() {
    playTone(300, 0.1, 0.25, 'square');
    setTimeout(() => playTone(260, 0.12, 0.25, 'square'), 180);
    speak('Woef woef!', { rate: 0.9, pitch: 1.3 });
}
