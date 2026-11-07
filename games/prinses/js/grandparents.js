/* 👵👴 Opa en Oma logeren in het kasteel. Ze sjokken rustig rond, nemen vaak de toverlift naar
   een andere verdieping en je komt ze dus af en toe tegen. Tik ze aan voor een knuffel:
   Oma heeft altijd een snoepje in haar tas, Opa tovert een muntje achter je oor vandaan. */
const GP_W = 126;
const GP_H = 200;
const GP_SPEED = 55;
const grandparents = [];

function omaSVG() {
    return `<svg viewBox="0 0 100 160">
        <ellipse cx="50" cy="156" rx="28" ry="4" fill="rgba(0,0,0,0.18)"/>
        <g class="pbody">
            <path d="M34 62 Q22 108 18 152 L82 152 Q78 108 66 62 Z" fill="#0d9488"/>
            <path d="M18 152 L82 152" stroke="#99f6e4" stroke-width="4"/>
            <circle cx="34" cy="120" r="3" fill="#ccfbf1"/><circle cx="62" cy="104" r="3" fill="#ccfbf1"/><circle cx="48" cy="136" r="3" fill="#ccfbf1"/><circle cx="66" cy="138" r="3" fill="#ccfbf1"/>
            <ellipse cx="42" cy="152" rx="7" ry="3.5" fill="#57534e"/><ellipse cx="58" cy="152" rx="7" ry="3.5" fill="#57534e"/>
            <path d="M34 62 Q50 70 66 62 L66 82 Q50 88 34 82 Z" fill="#f9a8d4"/>
            <path d="M38 66 Q50 76 62 66" stroke="#fff" stroke-width="3" stroke-dasharray="0.1 4.5" stroke-linecap="round" fill="none"/>
            <path d="M36 68 Q28 84 30 98" stroke="#f9a8d4" stroke-width="8" stroke-linecap="round" fill="none"/>
            <path d="M64 68 Q72 84 70 98" stroke="#f9a8d4" stroke-width="8" stroke-linecap="round" fill="none"/>
            <circle cx="30" cy="100" r="4" fill="#ffd7c2"/><circle cx="70" cy="100" r="4" fill="#ffd7c2"/>
            <path d="M66 98 Q70 90 74 98" stroke="#7c2d12" stroke-width="2" fill="none"/>
            <rect x="64" y="98" width="16" height="13" rx="3" fill="#a21caf"/>
            <circle cx="72" cy="104" r="2" fill="#fcd34d"/>
            <rect x="46" y="52" width="8" height="10" fill="#ffd7c2"/>
            <circle cx="50" cy="38" r="17" fill="#ffe4d6"/>
            <circle cx="50" cy="16" r="9" fill="#e5e7eb" stroke="#d1d5db"/>
            <path d="M33 40 Q31 22 50 22 Q69 22 67 40 Q63 29 50 29 Q37 29 33 40 Z" fill="#e5e7eb" stroke="#d1d5db"/>
            <circle cx="44" cy="40" r="5.5" fill="rgba(255,255,255,.35)" stroke="#a16207" stroke-width="1.6"/>
            <circle cx="56" cy="40" r="5.5" fill="rgba(255,255,255,.35)" stroke="#a16207" stroke-width="1.6"/>
            <path d="M49.5 40 L50.5 40" stroke="#a16207" stroke-width="1.6"/>
            <ellipse cx="44" cy="40.5" rx="2" ry="2.6" fill="#1e3a8a"/><ellipse cx="56" cy="40.5" rx="2" ry="2.6" fill="#1e3a8a"/>
            <circle cx="44.8" cy="39.5" r="0.8" fill="#fff"/><circle cx="56.8" cy="39.5" r="0.8" fill="#fff"/>
            <circle cx="39" cy="47" r="3.2" fill="#fda4af" opacity=".7"/><circle cx="61" cy="47" r="3.2" fill="#fda4af" opacity=".7"/>
            <path d="M45 49 Q50 54 55 49" fill="none" stroke="#be123c" stroke-width="1.8" stroke-linecap="round"/>
        </g>
    </svg>`;
}

function opaSVG() {
    return `<svg viewBox="0 0 100 160">
        <ellipse cx="50" cy="156" rx="28" ry="4" fill="rgba(0,0,0,0.18)"/>
        <g class="pbody">
            <rect x="38" y="104" width="10" height="46" rx="3" fill="#78716c"/><rect x="52" y="104" width="10" height="46" rx="3" fill="#78716c"/>
            <ellipse cx="42" cy="152" rx="8" ry="4" fill="#44403c"/><ellipse cx="58" cy="152" rx="8" ry="4" fill="#44403c"/>
            <path d="M32 62 Q26 90 32 112 L68 112 Q74 90 68 62 Z" fill="#a16207"/>
            <path d="M50 64 L50 112" stroke="#713f12" stroke-width="1.5"/>
            <circle cx="50" cy="76" r="1.8" fill="#fde68a"/><circle cx="50" cy="88" r="1.8" fill="#fde68a"/><circle cx="50" cy="100" r="1.8" fill="#fde68a"/>
            <path d="M42 62 L50 72 L58 62 Z" fill="#fff"/>
            <path d="M48 66 L50 74 L52 66 Z" fill="#dc2626"/>
            <path d="M34 68 Q26 84 28 98" stroke="#a16207" stroke-width="8" stroke-linecap="round" fill="none"/>
            <path d="M66 68 Q74 84 74 96" stroke="#a16207" stroke-width="8" stroke-linecap="round" fill="none"/>
            <circle cx="28" cy="100" r="4.5" fill="#ffd7c2"/><circle cx="74" cy="98" r="4.5" fill="#ffd7c2"/>
            <path d="M74 98 L80 152" stroke="#57534e" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M68 99 Q72 92 76 98" stroke="#57534e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
            <rect x="46" y="52" width="8" height="10" fill="#ffd7c2"/>
            <circle cx="50" cy="38" r="17" fill="#ffe4d6"/>
            <path d="M33 42 Q31 30 36 26 Q36 36 38 42 Z M67 42 Q69 30 64 26 Q64 36 62 42 Z" fill="#e5e7eb" stroke="#d1d5db"/>
            <path d="M40 24 Q50 20 60 24" stroke="#f5d0c5" stroke-width="2" fill="none" opacity=".8"/>
            <circle cx="44" cy="39" r="5.5" fill="rgba(255,255,255,.35)" stroke="#111827" stroke-width="1.8"/>
            <circle cx="56" cy="39" r="5.5" fill="rgba(255,255,255,.35)" stroke="#111827" stroke-width="1.8"/>
            <path d="M49.5 39 L50.5 39" stroke="#111827" stroke-width="1.8"/>
            <ellipse cx="44" cy="39.5" rx="2" ry="2.6" fill="#1e1b4b"/><ellipse cx="56" cy="39.5" rx="2" ry="2.6" fill="#1e1b4b"/>
            <circle cx="44.8" cy="38.5" r="0.8" fill="#fff"/><circle cx="56.8" cy="38.5" r="0.8" fill="#fff"/>
            <path d="M39 32 l6 -1 M61 32 l-6 -1" stroke="#d1d5db" stroke-width="2.4" stroke-linecap="round"/>
            <circle cx="39" cy="46" r="3" fill="#fda4af" opacity=".6"/><circle cx="61" cy="46" r="3" fill="#fda4af" opacity=".6"/>
            <path d="M41 48 Q46 44 50 47 Q54 44 59 48 Q54 51 50 49 Q46 51 41 48 Z" fill="#e5e7eb" stroke="#d1d5db"/>
            <path d="M46 52 Q50 55 54 52" fill="none" stroke="#9f1239" stroke-width="1.8" stroke-linecap="round"/>
        </g>
    </svg>`;
}

function buildGrandparents() {
    [
        { id: 'oma', svg: omaSVG(), room: 'eetkamer' },
        { id: 'opa', svg: opaSVG(), room: 'torenkamer' }
    ].forEach(def => {
        const node = el(`<div class="parent grandparent" data-id="${def.id}"><div class="pflip">${def.svg}</div><div class="pbubble"></div></div>`);
        const g = { id: def.id, el: node, wing: null, x: roomX(def.room) + 400, facing: 1, wait: 0, goal: null, greeted: 0 };
        parentPlace(g, sceneOf(def.room).key);
        node.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            hugGrandparent(g);
        });
        grandparents.push(g);
    });
}

function pickGrandparentGoal(g) {
    // Often off to another floor, so you only run into them now and then
    const wing = Math.random() < 0.45 ? g.wing : randomPick(WINGS).key;
    const room = randomPick(SCENES[wing].rooms);
    g.goal = { wing, x: roomX(room.key) + 130 + Math.random() * 540 };
}

function updateGrandparents(dt, now) {
    grandparents.forEach(g => {
        let moving = false;
        if (now > g.wait) {
            if (!g.goal) pickGrandparentGoal(g);
            const liftX = SCENES[g.wing].wing.liftX + 75;
            const tx = g.goal.wing === g.wing ? g.goal.x : liftX;
            const dx = tx - g.x;
            if (Math.abs(dx) > 3) {
                g.x += Math.sign(dx) * Math.min(Math.abs(dx), GP_SPEED * dt);
                g.facing = Math.sign(dx);
                moving = true;
            } else if (g.goal.wing !== g.wing) {
                parentPlace(g, g.goal.wing);
                g.x = SCENES[g.goal.wing].wing.liftX + 75;
                g.wait = now + 1500;
            } else {
                g.goal = null;
                g.wait = now + 4000 + Math.random() * 8000;
            }
        }
        if (scene.key === g.wing && Math.abs(g.x - state.x) < 170) {
            if (!moving) g.facing = state.x < g.x ? -1 : 1;
            if (now - g.greeted > 25000) {
                g.greeted = now;
                parentBubble(g, randomPick(['👋', '💖', '😊', '🥰']));
            }
        }
        g.el.style.transform = `translate(${g.x - GP_W / 2}px, ${FEET_Y - GP_H}px)`;
        g.el.classList.toggle('walking', moving);
        g.el.classList.toggle('left', g.facing < 0);
    });
}

function hugGrandparent(g) {
    if (state.busy || overlayOpen() || scene.key !== g.wing) return;
    g.wait = performance.now() + 8000;
    g.goal = null;
    const side = state.x < g.x ? -1 : 1;
    walkTo(g.x + side * 80, () => {
        g.facing = side;
        state.facing = -side;
        g.el.classList.remove('hug');
        void g.el.offsetWidth;
        g.el.classList.add('hug');
        playCorrect();
        for (let i = 0; i < 20; i++) spawnSparkle((g.x + state.x) / 2, 300, { speed: 130, hue: 330 + Math.random() * 30 });
        if (g.id === 'oma') {
            parentBubble(g, randomPick(['🍬', '🍭', '🍪', '🍫']));
            speak(randomPick(['Dag lieverd! Kijk eens, een snoepje uit Oma’s tas.', 'Kusje van Oma!', 'Wat ben je weer groot geworden!']), { pitch: 1.3 });
        } else {
            parentBubble(g, randomPick(['🪙', '🎩', '😄', '💖']));
            speak(randomPick(['Hé, wat zit er achter jouw oor? Een muntje!', 'Dag prinsesje! Een dikke knuffel van Opa.', 'Hoho, wat een sterke knuffel!']), { pitch: 0.7 });
        }
        twirl();
    });
}
