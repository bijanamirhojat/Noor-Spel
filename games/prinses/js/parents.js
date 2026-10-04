/* 👑 Mama en Papa: de koningin en de koning lopen rond door het kasteel.
   Ze nemen de toverlift tussen de verdiepingen, zwaaien als de prinses in de buurt is,
   komen zingen bij haar bed als ze gaat slapen en slapen zelf in de grote slaapkamer. */
const PARENT_W = 138;
const PARENT_H = 220;
const PARENT_SPEED = 90;
const parents = [];

function queenSVG() {
    return `<svg viewBox="0 0 100 160">
        <ellipse cx="50" cy="156" rx="30" ry="4" fill="rgba(0,0,0,0.18)"/>
        <g class="pbody">
            <path d="M30 36 Q20 74 28 108 Q50 114 72 108 Q80 74 70 36 Z" fill="#7c2d12"/>
            <path d="M36 76 Q26 112 10 150 Q50 162 90 150 Q74 112 64 76 Z" fill="#7c3aed"/>
            <path d="M10 150 Q50 162 90 150" stroke="#fcd34d" stroke-width="4" fill="none"/>
            <path d="M50 80 L50 150" stroke="#fcd34d" stroke-width="2" opacity=".6"/>
            <circle cx="30" cy="128" r="2" fill="#fde68a"/><circle cx="68" cy="122" r="2" fill="#fde68a"/><circle cx="48" cy="104" r="2" fill="#fde68a"/>
            <path d="M37 62 Q50 58 63 62 L64 80 Q50 84 36 80 Z" fill="#6d28d9"/>
            <path d="M36 78 Q50 84 64 78" stroke="#fcd34d" stroke-width="3" fill="none"/>
            <path d="M39 66 Q30 80 30 94" stroke="#ffd7c2" stroke-width="6" stroke-linecap="round" fill="none"/>
            <path d="M61 66 Q70 80 70 94" stroke="#ffd7c2" stroke-width="6" stroke-linecap="round" fill="none"/>
            <circle cx="30" cy="95" r="4" fill="#ffd7c2"/><circle cx="70" cy="95" r="4" fill="#ffd7c2"/>
            <rect x="46" y="53" width="8" height="10" fill="#ffd7c2"/>
            <path d="M40 62 Q50 70 60 62" stroke="#fff" stroke-width="2.5" stroke-dasharray="0.1 4" stroke-linecap="round" fill="none"/>
            <circle cx="50" cy="39" r="17" fill="#ffe4d6"/>
            <path d="M33 40 Q32 20 50 20 Q68 20 67 40 Q62 28 50 28 Q38 28 33 40 Z" fill="#9a3412"/>
            <ellipse cx="44" cy="41" rx="2.4" ry="3.2" fill="#3b0764"/>
            <ellipse cx="56" cy="41" rx="2.4" ry="3.2" fill="#3b0764"/>
            <circle cx="45" cy="39.8" r="0.9" fill="#fff"/><circle cx="57" cy="39.8" r="0.9" fill="#fff"/>
            <path d="M41 36 l4 -1.5 M59 36 l-4 -1.5" stroke="#7c2d12" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="40" cy="47" r="3.2" fill="#fda4af" opacity=".7"/><circle cx="60" cy="47" r="3.2" fill="#fda4af" opacity=".7"/>
            <path d="M45 49 Q50 54 55 49" fill="#e11d48" stroke="#be123c" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M34 24 L36 4 L43 14 L50 -2 L57 14 L64 4 L66 24 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="50" cy="12" r="3" fill="#ef4444"/><circle cx="40" cy="17" r="2" fill="#22c55e"/><circle cx="60" cy="17" r="2" fill="#3b82f6"/>
        </g>
    </svg>`;
}

function kingSVG() {
    return `<svg viewBox="0 0 100 160">
        <ellipse cx="50" cy="156" rx="30" ry="4" fill="rgba(0,0,0,0.18)"/>
        <g class="pbody">
            <path d="M30 62 Q14 110 16 152 L84 152 Q86 110 70 62 Z" fill="#b91c1c"/>
            <path d="M16 152 L84 152" stroke="#fff" stroke-width="6"/>
            <rect x="40" y="70" width="20" height="74" rx="4" fill="#1d4ed8"/>
            <rect x="40" y="100" width="20" height="6" fill="#fcd34d"/>
            <ellipse cx="44" cy="152" rx="8" ry="4" fill="#111827"/><ellipse cx="56" cy="152" rx="8" ry="4" fill="#111827"/>
            <path d="M30 62 Q50 76 70 62 L68 72 Q50 84 32 72 Z" fill="#fff"/>
            <circle cx="40" cy="70" r="1.5" fill="#111827"/><circle cx="50" cy="75" r="1.5" fill="#111827"/><circle cx="60" cy="70" r="1.5" fill="#111827"/>
            <path d="M34 70 Q26 84 26 96" stroke="#b91c1c" stroke-width="8" stroke-linecap="round" fill="none"/>
            <path d="M66 70 Q74 84 76 92" stroke="#b91c1c" stroke-width="8" stroke-linecap="round" fill="none"/>
            <circle cx="26" cy="98" r="4.5" fill="#ffd7c2"/><circle cx="77" cy="94" r="4.5" fill="#ffd7c2"/>
            <line x1="78" y1="104" x2="86" y2="56" stroke="#fcd34d" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="86" cy="54" r="5" fill="#fcd34d" stroke="#f59e0b"/><circle cx="86" cy="54" r="2" fill="#ef4444"/>
            <rect x="46" y="52" width="8" height="10" fill="#ffd7c2"/>
            <circle cx="50" cy="38" r="17" fill="#ffe4d6"/>
            <path d="M33 38 Q33 22 50 22 Q67 22 67 38 Q62 30 50 30 Q38 30 33 38 Z" fill="#78350f"/>
            <path d="M35 42 Q36 60 50 62 Q64 60 65 42 Q60 52 50 52 Q40 52 35 42 Z" fill="#78350f"/>
            <path d="M42 48 Q46 45 50 48 Q54 45 58 48" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>
            <ellipse cx="44" cy="39" rx="2.4" ry="3.2" fill="#1e1b4b"/><ellipse cx="56" cy="39" rx="2.4" ry="3.2" fill="#1e1b4b"/>
            <circle cx="45" cy="37.8" r="0.9" fill="#fff"/><circle cx="57" cy="37.8" r="0.9" fill="#fff"/>
            <circle cx="40" cy="45" r="3" fill="#fda4af" opacity=".6"/><circle cx="60" cy="45" r="3" fill="#fda4af" opacity=".6"/>
            <path d="M46 52 Q50 55 54 52" fill="none" stroke="#9f1239" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M32 26 L34 6 L42 16 L50 0 L58 16 L66 6 L68 26 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
            <rect x="32" y="22" width="36" height="6" rx="2" fill="#dc2626"/>
            <circle cx="50" cy="12" r="3.2" fill="#3b82f6"/><circle cx="40" cy="18" r="2" fill="#ef4444"/><circle cx="60" cy="18" r="2" fill="#ef4444"/>
        </g>
    </svg>`;
}

function buildParents() {
    [
        { id: 'mama', svg: queenSVG(), wing: sceneOf('troonzaal').key, x: roomX('troonzaal') + 220 },
        { id: 'papa', svg: kingSVG(), wing: sceneOf('balzaal').key, x: roomX('balzaal') + 560 }
    ].forEach(def => {
        const node = el(`<div class="parent" data-id="${def.id}"><div class="pflip">${def.svg}</div><div class="pbubble"></div></div>`);
        const p = { id: def.id, el: node, wing: null, x: def.x, facing: -1, mode: 'wander', wait: 0, goal: null, greeted: 0, bedDy: 0 };
        parentPlace(p, def.wing);
        node.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            hugParent(p);
        });
        parents.push(p);
    });
}

function parentPlace(p, wingKey) {
    SCENES[wingKey].el.appendChild(p.el);
    p.wing = wingKey;
}

function parentBubble(p, text) {
    const b = p.el.querySelector('.pbubble');
    b.textContent = text;
    b.classList.add('show');
    clearTimeout(p.bubbleT);
    p.bubbleT = setTimeout(() => b.classList.remove('show'), 2200);
}

function pickParentGoal(p) {
    // Mostly stay on this floor, sometimes take the lift to another one
    const wing = Math.random() < 0.65 ? p.wing : randomPick(WINGS).key;
    const room = randomPick(SCENES[wing].rooms);
    p.goal = { wing, x: roomX(room.key) + 130 + Math.random() * 540 };
}

function updateParents(dt, now) {
    parents.forEach(p => {
        let moving = false;
        if (p.mode === 'wander' && now > p.wait) {
            if (!p.goal) pickParentGoal(p);
            const liftX = SCENES[p.wing].wing.liftX + 75;
            const tx = p.goal.wing === p.wing ? p.goal.x : liftX;
            const dx = tx - p.x;
            if (Math.abs(dx) > 3) {
                const step = Math.sign(dx) * Math.min(Math.abs(dx), PARENT_SPEED * dt);
                p.x += step;
                p.facing = Math.sign(dx);
                moving = true;
            } else if (p.goal.wing !== p.wing) {
                // Ride the lift to the other floor
                parentPlace(p, p.goal.wing);
                p.x = SCENES[p.goal.wing].wing.liftX + 75;
                p.wait = now + 1200;
            } else {
                p.goal = null;
                p.wait = now + 2500 + Math.random() * 5000;
            }
        }
        // Walking to a spot for an activity (family dinner)
        if (p.mode !== 'wander' && p.goalX != null) {
            const dx = p.goalX - p.x;
            if (Math.abs(dx) > 3) {
                p.x += Math.sign(dx) * Math.min(Math.abs(dx), 170 * dt);
                p.facing = Math.sign(dx);
                moving = true;
            } else {
                p.goalX = null;
            }
        }
        if (p.mode === 'wander' && scene.key === p.wing && Math.abs(p.x - state.x) < 170) {
            if (!moving) p.facing = state.x < p.x ? -1 : 1;
            if (now - p.greeted > 20000) {
                p.greeted = now;
                parentBubble(p, randomPick(['👋', '💖', '😊', '🥰']));
            }
        }
        const lying = p.mode === 'bed';
        p.el.style.transform = `translate(${p.x - PARENT_W / 2}px, ${FEET_Y - PARENT_H + (lying ? p.bedDy : 0)}px) rotate(${lying ? -90 : 0}deg)`;
        p.el.classList.toggle('walking', moving);
        p.el.classList.toggle('left', p.facing < 0);
    });
}

function hugParent(p) {
    if (state.busy || overlayOpen() || p.mode !== 'wander' || scene.key !== p.wing) return;
    const now = performance.now();
    p.wait = now + 7000;
    const side = state.x < p.x ? -1 : 1;
    walkTo(p.x + side * 85, () => {
        p.facing = side;
        state.facing = -side;
        p.el.classList.remove('hug');
        void p.el.offsetWidth;
        p.el.classList.add('hug');
        parentBubble(p, randomPick(['💖', '🥰', '🤗']));
        playCorrect();
        for (let i = 0; i < 24; i++) spawnSparkle((p.x + state.x) / 2, 300, { speed: 140, hue: 330 + Math.random() * 30 });
        twirl();
    });
}

/* Singing at the princess's bed (called from sleepInBed) */
function parentsSing() {
    const key = sceneOf('slaapkamer').key;
    const base = roomX('slaapkamer');
    const spots = { mama: base + 160, papa: base + 660 };
    parents.forEach(p => {
        parentPlace(p, key);
        p.mode = 'sing';
        p.goal = null;
        p.x = spots[p.id];
        p.facing = p.id === 'mama' ? 1 : -1;
        p.el.classList.add('singing');
        parentBubble(p, '🎵');
        clearInterval(p.noteT);
        p.noteT = setInterval(() => {
            const n = el(`<div class="magic-fly">${randomPick(['🎵', '🎶', '💖'])}</div>`);
            n.style.position = 'absolute';
            n.style.left = (p.x - 18) + 'px';
            n.style.top = (FEET_Y - PARENT_H + 10) + 'px';
            n.style.setProperty('--dx', ((Math.random() - 0.5) * 120) + 'px');
            n.style.setProperty('--dy', (-80 - Math.random() * 60) + 'px');
            SCENES[p.wing].el.appendChild(n);
            setTimeout(() => n.remove(), 3300);
        }, 700);
    });
    // Mama and Papa hum along an octave lower
    const notes = [523, 523, 784, 784, 880, 880, 784, 0, 698, 698, 659, 659, 587, 587, 523];
    notes.forEach((f, i) => { if (f) setTimeout(() => playTone(f / 2, 0.45, 0.07, 'triangle'), i * 420); });
}

function parentsWake() {
    const now = performance.now();
    parents.forEach(p => {
        if (p.mode !== 'sing') return;
        clearInterval(p.noteT);
        p.el.classList.remove('singing');
        p.mode = 'wander';
        p.wait = now + 3000;
        parentBubble(p, randomPick(['🌞', '💖', '😘']));
    });
}

/* Mama and Papa go to sleep in the big bedroom */
function parentsToBed() {
    if (parents.some(p => p.mode !== 'wander')) return;
    const key = sceneOf('ouderslaapkamer').key;
    const base = roomX('ouderslaapkamer');
    const cover = document.getElementById('bigBedCover');
    parents.forEach(p => {
        parentPlace(p, key);
        p.mode = 'bed';
        p.goal = null;
        p.facing = 1;
        p.x = base + 410;
        p.bedDy = p.id === 'mama' ? 8 : -20;
        p.el.classList.add('sleeping');
        parentBubble(p, '😴');
    });
    cover.classList.add('show');
    playLullaby();
    const zzz = setInterval(() => {
        const z = el('<div class="zzz">💤</div>');
        place(z, base + 230, 230);
        setTimeout(() => z.remove(), 2200);
        playTone(110 + Math.random() * 20, 0.6, 0.06, 'sawtooth');
    }, 1100);
    setTimeout(() => {
        clearInterval(zzz);
        cover.classList.remove('show');
        const now = performance.now();
        parents.forEach(p => {
            p.mode = 'wander';
            p.el.classList.remove('sleeping');
            p.x = base + (p.id === 'mama' ? 160 : 640);
            p.wait = now + 2500;
            parentBubble(p, '🌞');
        });
        playWin();
        sparkleShower(base + 400, 120, 40);
    }, 8000);
}
