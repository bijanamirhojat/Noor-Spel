/* 🌙 Klaar voor bed (vanuit de kledingkast in de slaapkamer):
   1. uitkleden en opruimen: kroon op het kussentje, schoentjes op het rek, jurk en rondslingerende kleren in de wasmand;
   2. pyjama aan: shirt, broek, sloffen en slaapmuts (de prinses verandert stap voor stap);
   3. naar bed: de prinses loopt in pyjama naar haar bed en gaat slapen.
   Slepen naar de goede plek, of gewoon tikken (dan vliegt het er vanzelf heen).
   De prinses blijft in pyjama tot je bij de kast je jurk weer aantrekt (klassen pj-* op .princess). */
const BED_UNDRESS = [
    { e: '👑', to: 'kussen', cls: 'no-hat', at: [50, 8] },
    { e: '👗', to: 'wasmand', cls: 'no-dress', at: [50, 52] },
    { e: '👠', to: 'rek', cls: 'no-shoes', at: [50, 93] },
    { e: '🧦', to: 'wasmand', at: [26, 90] },
    { e: '👕', to: 'wasmand', at: [72, 88] },
    { e: '🩳', to: 'wasmand', at: [33, 64] }
];
const BED_PYJAMA = [
    { e: '👚', cls: 'pj-top', name: 'pyjamashirt' },
    { e: '👖', cls: 'pj-pants', name: 'pyjamabroek' },
    { e: '🥿', cls: 'pj-slippers', name: 'sloffen' },
    { e: '<span class="bt-cap"></span>', cls: 'pj-cap', name: 'slaapmuts' }
];
const BED_ALL = ['no-hat', 'no-dress', 'no-shoes', 'pj-top', 'pj-pants', 'pj-slippers', 'pj-cap'];
let laundry = 0;     // clothes in the laundry basket in the room

function wearingPyjama() { return princessEl().classList.contains('pj-top'); }

const btEl = document.getElementById('bedtimeOv');
const btStage = document.getElementById('btStage');
const btDoll = document.getElementById('btDoll');
let bedtimeOpen = false;
const bt = { step: 1, left: 0, drag: null };

function btHint(t) { document.getElementById('btHint').textContent = t; }

function btBuild() {
    btDoll.className = 'bt-doll';
    btDoll.innerHTML = princessSVG('bt');
    applyLook();
    btStage.querySelectorAll('.bt-item').forEach(n => n.remove());
    bt.step = 1;
    bt.left = BED_UNDRESS.length;
    BED_UNDRESS.forEach(it => {
        // Worn things sit on the princess, the rest lies around on the floor
        const onDoll = !!it.cls;
        const node = el(`<button class="bt-item${onDoll ? ' worn' : ' floor'}" style="left:${it.at[0]}%;top:${it.at[1]}%">${it.e}</button>`);
        (onDoll ? btDoll.parentElement : btStage).appendChild(node);
        btItem(node, it, () => btDest(it.to), () => {
            if (it.cls) btDoll.classList.add(it.cls);
            if (it.to === 'wasmand') laundry++;
            bt.left--;
            if (bt.left === 0) setTimeout(btPyjama, 500);
        });
    });
    document.getElementById('btDrawer').classList.remove('open');
    document.getElementById('btBedBtn').classList.remove('show');
    btHint('Ruim alles op! 🧺 Kleren in de wasmand');
}

function btDest(to) { return btStage.querySelector(`.bt-dest[data-to="${to}"]`); }

// Make an item draggable to its target; a tap sends it there by itself
function btItem(node, it, target, done) {
    node.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (node.classList.contains('gone')) return;
        try { node.setPointerCapture(e.pointerId); } catch (err) {}
        const r = node.getBoundingClientRect();
        bt.drag = { node, it, target, done, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: e.clientX - (r.left + r.width / 2), oy: e.clientY - (r.top + r.height / 2), moved: false };
        node.classList.add('drag');
        playPop();
    });
}
btEl.addEventListener('pointermove', (e) => {
    const d = bt.drag;
    if (!d || e.pointerId !== d.id) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 10) d.moved = true;
    if (!d.moved) return;
    d.node.style.translate = `${e.clientX - d.sx}px ${e.clientY - d.sy}px`;
});
function btUp(e) {
    const d = bt.drag;
    if (!d || e.pointerId !== d.id) return;
    bt.drag = null;
    d.node.classList.remove('drag');
    const t = d.target();
    const r = t.getBoundingClientRect();
    const inside = e.clientX > r.left - 20 && e.clientX < r.right + 20 && e.clientY > r.top - 20 && e.clientY < r.bottom + 20;
    if (d.moved && !inside) {
        // Dropped somewhere else: gently back
        const other = [...btStage.querySelectorAll('.bt-dest')].find(x => { const q = x.getBoundingClientRect(); return e.clientX > q.left && e.clientX < q.right && e.clientY > q.top && e.clientY < q.bottom; });
        if (other) { zooAnim(other, 'nope'); btHint(d.it.to === 'wasmand' ? 'Dat moet in de wasmand 🧺' : d.it.to === 'kussen' ? 'De kroon gaat op het kussentje 👑' : d.it.to === 'rek' ? 'Schoentjes op het rek 👠' : 'Op de prinses! 👸'); }
        d.node.classList.add('back');
        d.node.style.translate = '';
        setTimeout(() => d.node.classList.remove('back'), 400);
        playTone(240, 0.12, 0.08, 'triangle');
        return;
    }
    d.node.style.translate = '';
    d.node.classList.add('gone');
    ovFly(btEl, d.node, t, d.node.innerHTML, 450).then(() => {
        zooAnim(t, 'got');
        playTone(660 + Math.random() * 300, 0.12, 0.08, 'sine');
        if (t.dataset.to) t.querySelector('.pile').insertAdjacentHTML('beforeend', `<span>${d.node.innerHTML}</span>`);
        d.done();
    });
}
btEl.addEventListener('pointerup', btUp);
btEl.addEventListener('pointercancel', btUp);

function btPyjama() {
    if (!bedtimeOpen) return;
    bt.step = 2;
    bt.left = BED_PYJAMA.length;
    playCorrect();
    btHint('Nu je pyjama aan! 👚 Sleep alles naar de prinses');
    const drawer = document.getElementById('btDrawer');
    drawer.classList.add('open');
    drawer.querySelector('.items').innerHTML = '';
    BED_PYJAMA.forEach(it => {
        const node = el(`<button class="bt-item pj">${it.e}</button>`);
        drawer.querySelector('.items').appendChild(node);
        btItem(node, it, () => btDoll, () => {
            btDoll.classList.add(it.cls);
            ovCheer(btEl, btDoll, ['✨', '⭐', '🌙']);
            bt.left--;
            if (bt.left === 0) setTimeout(btReady, 400);
        });
    });
}

function btReady() {
    if (!bedtimeOpen) return;
    bt.step = 3;
    playWin();
    ovCheer(btEl, btDoll, ['🌙', '⭐', '💤', '💖']);
    btHint('Klaar voor bed! 🌙');
    document.getElementById('btDrawer').classList.remove('open');
    document.getElementById('btBedBtn').classList.add('show');
}

document.getElementById('btBedBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeBedtime(true);
});

function openBedtime() {
    if (wearingPyjama()) {
        // Good morning: dress back on
        const pr = princessEl();
        BED_ALL.forEach(c => pr.classList.remove(c));
        sparkleShower(state.x, 120, 50);
        playWin();
        showToast('👗 Goedemorgen! Je jurk weer aan', 1800);
        return;
    }
    bedtimeOpen = true;
    btEl.classList.add('open');
    btBuild();
}

function closeBedtime(toBed) {
    bedtimeOpen = false;
    bt.drag = null;
    btEl.classList.remove('open');
    renderLaundry();
    if (!toBed) { _playWhoosh(); return; }
    // Wear the pyjama in the game too and go to sleep
    const pr = princessEl();
    BED_ALL.forEach(c => pr.classList.toggle(c, btDoll.classList.contains(c)));
    sparkleShower(state.x, 120, 40);
    walkTo(roomX('slaapkamer') + 386, chooseBedPlush);
}
document.getElementById('bedtimeClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeBedtime(false); });
btEl.addEventListener('pointerdown', (e) => e.stopPropagation());

/* ─────────── De wasmand in de kamer ─────────── */
function renderLaundry() {
    const n = document.getElementById('laundryPile');
    if (n) n.textContent = ['', '🧦', '🧦👕', '🧦👕👗', '👗🧦👕🩳'][Math.min(4, laundry)];
}

function washLaundry(node) {
    if (!laundry) {
        zooAnim(node, 'v-wobble');
        showToast('🧺 De wasmand is leeg!', 1500);
        return;
    }
    // Into the wash: bubbles, and the basket is empty again
    zooAnim(node, 'wash');
    laundry = 0;
    startNoise('shower');
    setTimeout(stopNoise, 1400);
    const r = node.getBoundingClientRect();
    const p = screenToWorld(r.left + r.width / 2, r.top);
    for (let i = 0; i < 30; i++) setTimeout(() => spawnSparkle(p.x + (Math.random() - 0.5) * 60, p.y, { vy: -60 - Math.random() * 60, vx: (Math.random() - 0.5) * 50, g: -20, hue: 190 + Math.random() * 40, size: 5 + Math.random() * 6, max: 1.8 }), i * 30);
    setTimeout(() => { renderLaundry(); playCorrect(); showToast('🫧 Alles is weer schoon!', 1600); }, 900);
}
