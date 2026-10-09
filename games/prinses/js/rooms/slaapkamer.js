/* 🛏️ Slaapkamer: hemelbed, kledingkast ("Klaar voor bed", js/rooms/pyjama.js), de wasmand en de knuffelmand
   (met het teddybeertje en de knuffels uit de grijpmachine op de kermis, zie knuffels in js/dorp/kermis.js) */
defineRoom({
    key: 'slaapkamer',
    name: 'Slaapkamer',
    icon: '🛏️',
    say: 'De slaapkamer',
    build(r6) {
        place(el('<div class="tower-window"></div>'), r6 + 565, 70);
        addObj(`<div class="sk-wardrobe"><div class="door l"><i></i></div><div class="door r"><i></i></div><span class="pj">🌙</span>
            <div class="tap-hint" style="left:36px;top:-50px">👇</div></div>`, r6 + 680, 190, r6 + 700, openBedtime);
        addObj('<div class="sk-basket"><span id="laundryPile"></span><div class="mand"></div></div>', r6 + 585, 318, r6 + 620, washLaundry);
        addObj(`<div class="bed">
            <div class="post" style="left:0"></div><div class="post" style="left:310px"></div>
            <div class="curtain" style="left:-8px"></div><div class="curtain" style="left:292px"></div>
            <div class="canopy"></div>
            <div class="head">💖</div>
            <div class="mattress"></div><div class="pillow"></div><div class="blanket"></div>
            <div class="bedleg" style="left:30px"></div><div class="bedleg" style="left:280px"></div>
            <div class="tap-hint" style="top:-44px">👇</div>
        </div>`, r6 + 250, 202, r6 + 386, sleepInBed);
        place(el('<div class="bed-cover" id="bedCover"></div>'), r6 + 356, 330);
        addObj('<div class="sk-plush"><span class="toys" id="plushPile"></span><div class="mand"></div><b>Knuffels</b></div>', r6 + 172, 300, r6 + 210, plushHug);
        addObj('<div class="emoji-obj" style="font-size:44px">🎶</div>', r6 + 610, 110, r6 + 640, () => { playLullaby(); speak('Een slaapliedje!'); });
    }
});

function sleepInBed() {
    state.busy = true;
    state.facing = 1;
    const night = document.getElementById('night');
    const cover = document.getElementById('bedCover');
    speak('Welterusten prinses!');
    tween(600, (t) => {
        state.anim.rot = -90 * ease(t);
        state.anim.dy = -30 * ease(t);
    }, () => {
        cover.classList.add('show');
        night.classList.add('show');
        playLullaby();
        parentsSing();
        const zzzTimer = setInterval(() => {
            const z = el('<div class="zzz">💤</div>');
            place(z, state.x - 90, 280);
            setTimeout(() => z.remove(), 2200);
        }, 900);
        setTimeout(() => {
            clearInterval(zzzTimer);
            night.classList.remove('show');
            cover.classList.remove('show');
            parentsWake();
            speak('Goedemorgen prinses! Kukeleku!');
            playWin();
            sparkleShower(state.x, 100, 60);
            tween(600, (t) => {
                state.anim.rot = -90 * (1 - ease(t));
                state.anim.dy = -30 * (1 - ease(t));
            }, () => {
                resetAnim();
                state.busy = false;
            });
        }, 7000);
    });
}

function playLullaby() {
    // Altijd is Kortjakje ziek / Twinkle twinkle
    const notes = [523, 523, 784, 784, 880, 880, 784, 0, 698, 698, 659, 659, 587, 587, 523];
    notes.forEach((f, i) => { if (f) setTimeout(() => playTone(f, 0.4, 0.12, 'sine'), i * 420); });
}

// The cuddly toy basket: the teddy plus the toys won at the claw machine
function renderPlushBasket() {
    const n = document.getElementById('plushPile');
    if (!n) return;
    n.innerHTML = ['🧸', ...knuffels].slice(-9).map((k, i) => `<span style="animation-delay:${-i * 0.3}s">${k}</span>`).join('');
}

function plushHug(node) {
    node.classList.remove('hug'); void node.offsetWidth; node.classList.add('hug');
    teddyHug(node);
}
