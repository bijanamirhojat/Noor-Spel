/* 🐱 Poezenplaneten: planeten die poezen zijn (ze miauwen en spinnen), een slaperige planeet met een
   bolletje wol als maan en een kattenruimteschip.
   Binnen: "Poesjes naar huis": sleep elk astronautenkatje naar de poezenplaneet met dezelfde kleur
   (of tik het katje en dan de planeet). */
const KIT_PLANETS = ['roze', 'blauw', 'geel', 'groen'];
const KIT_N = 6;

defineRoom({
    key: 'poezenplaneten',
    name: 'Poezenplaneten',
    icon: '🐱',
    say: 'De poezenplaneten',
    build(x) {
        [[40, 40, 'roze', 150, { ring: '#fde047' }, 1], [380, 60, 'blauw', 110, {}, 1.3], [560, 30, 'oranje', 190, { sleepy: true }, 0.8]].forEach(([px, py, c, s, opts, pitch], i) => {
            addObj(`<div class="pp-float" style="animation-delay:${-i * 1.4}s">${catPlanetHTML(CAT_COLORS[c], s, opts)}</div>`, x + px, py, x + px + s / 2, (node) => catPlanetHappy(node, pitch));
        });
        place(el('<div class="pp-yarn"><span>🧶</span></div>'), x + 590, 0);
        addObj(`<div class="pp-ship"><div class="dome"><span>🐱</span><span>🐱</span><span>🐱</span></div><div class="saucer"></div><div class="lights"><i></i><i></i><i></i><i></i></div>
            <div class="tap-hint" style="left:80px;top:-56px">👇</div></div>`, x + 270, 260, x + 360, openKittens);
    }
});

/* ─────────── Poesjes naar huis (overlay) ─────────── */
const kitEl = document.getElementById('kittenOv');
const kitStage = document.getElementById('kitStage');
let kittenOpen = false;
const kit = { list: [], sel: null, home: 0, round: 0, drag: null };

function kitPlanets() { return [...kitStage.querySelectorAll('.kit-planet')]; }

function kitBuild() {
    kitStage.innerHTML = KIT_PLANETS.map((c, i) =>
        `<div class="kit-planet p${i}" data-c="${c}">${catPlanetHTML(CAT_COLORS[c], 150, i === 0 ? { ring: '#fde047' } : {})}</div>`).join('');
}

function kitNewRound() {
    kitStage.querySelectorAll('.kit').forEach(k => k.remove());
    kitPlanets().forEach(p => { p.dataset.n = 0; });
    kit.list = [];
    kit.sel = null;
    kit.home = 0;
    // Every planet gets at least one kitten
    const colors = shuffle([...KIT_PLANETS, ...Array.from({ length: KIT_N - KIT_PLANETS.length }, () => randomPick(KIT_PLANETS))]);
    colors.forEach((c, i) => {
        const hx = 30 + (i % 3) * 20 + (Math.random() - 0.5) * 6;
        const hy = 36 + Math.floor(i / 3) * 26 + (Math.random() - 0.5) * 6;
        const node = el(`<div class="kit" style="--c:${CAT_COLORS[c]};left:${hx}%;top:${hy}%;animation-delay:${-i * 0.5}s"><span class="helm"></span><span class="cat">🐱</span></div>`);
        const k = { node, c, hx, hy, done: false };
        node.addEventListener('pointerdown', (e) => kitDown(e, k));
        kitStage.appendChild(node);
        kit.list.push(k);
    });
    document.getElementById('kitHint').textContent = 'Breng elk poesje naar zijn eigen planeet 🐱';
}

function kitDown(e, k) {
    e.stopPropagation();
    if (k.done) return;
    try { k.node.setPointerCapture(e.pointerId); } catch (err) {}
    const r = kitStage.getBoundingClientRect();
    kit.drag = { k, id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, r };
    k.node.classList.add('drag');
    playPop();
}
kitStage.addEventListener('pointermove', (e) => {
    const d = kit.drag;
    if (!d || e.pointerId !== d.id) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 10) d.moved = true;
    if (!d.moved) return;
    d.k.node.style.left = ((e.clientX - d.r.left) / d.r.width * 100) + '%';
    d.k.node.style.top = ((e.clientY - d.r.top) / d.r.height * 100) + '%';
});
function kitUp(e) {
    const d = kit.drag;
    if (!d || e.pointerId !== d.id) return;
    kit.drag = null;
    d.k.node.classList.remove('drag');
    if (!d.moved) {
        // A tap: select this kitten, then tap a planet
        if (kit.sel) kit.sel.node.classList.remove('sel');
        kit.sel = d.k;
        d.k.node.classList.add('sel');
        meow(1.4);
        return;
    }
    const p = kitPlanets().find(pl => {
        const r = pl.getBoundingClientRect();
        return Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width * 0.65;
    });
    kitDrop(d.k, p);
}
kitStage.addEventListener('pointerup', kitUp);
kitStage.addEventListener('pointercancel', kitUp);

// Tap on a planet with a kitten selected
kitStage.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const p = e.target.closest('.kit-planet');
    if (!p || !kit.sel || e.target.closest('.kit')) return;
    const k = kit.sel;
    kit.sel = null;
    k.node.classList.remove('sel');
    kitDrop(k, p);
});

function kitDrop(k, p) {
    if (!p) { kitBack(k); return; }
    if (p.dataset.c !== k.c) {
        // Wrong planet: it shakes its head, the kitten floats back
        zooAnim(p, 'nope');
        playTone(240, 0.15, 0.08, 'triangle');
        document.getElementById('kitHint').textContent = 'Miauw? Dat is niet mijn kleur 🙈';
        kitBack(k);
        return;
    }
    // Home! The kitten lands on top of its planet
    k.done = true;
    const sr = kitStage.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    const onTop = +(p.dataset.n || 0);
    p.dataset.n = onTop + 1;
    k.node.classList.add('home');
    k.node.style.left = ((pr.left + pr.width * (0.3 + onTop * 0.2) - sr.left) / sr.width * 100) + '%';
    k.node.style.top = ((pr.top - 6 - sr.top) / sr.height * 100) + '%';   // sitting on top, between the ears
    catPlanetHappy(p, 1 + KIT_PLANETS.indexOf(k.c) * 0.15);
    ovCheer(kitEl, p, ['💖', '✨', '🐾', '⭐']);
    kit.home++;
    document.getElementById('kitHint').textContent = 'Miauw! Thuis! 💖';
    if (kit.home >= kit.list.length) {
        kit.round++;
        document.getElementById('kitCount').textContent = `⭐ ${kit.round}`;
        setTimeout(() => {
            playWin();
            kitPlanets().forEach(pl => ovCheer(kitEl, pl, ['🎉', '🐱', '💫']));
            document.getElementById('kitHint').textContent = 'Alle poesjes zijn thuis! 🎉';
        }, 700);
        setTimeout(() => { if (kittenOpen) kitNewRound(); }, 3200);
    }
}

function kitBack(k) {
    k.node.classList.add('back');
    k.node.style.left = k.hx + '%';
    k.node.style.top = k.hy + '%';
    setTimeout(() => k.node.classList.remove('back'), 500);
}

function openKittens() {
    kittenOpen = true;
    kitEl.classList.add('open');
    kit.round = 0;
    document.getElementById('kitCount').textContent = '⭐ 0';
    kitBuild();
    kitNewRound();
    meow();
}

function closeKittens() {
    kittenOpen = false;
    kit.drag = null;
    kitEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('kittenClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeKittens(); });
kitEl.addEventListener('pointerdown', (e) => e.stopPropagation());
