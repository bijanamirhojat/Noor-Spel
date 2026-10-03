/* ─────────── Toverlift (tussen de verdiepingen) ─────────── */
const liftOv = document.getElementById('liftOv');
let liftOpen = false;

function buildLift(wing) {
    const x = wing.liftX;
    const node = addObj(`<div class="lift" style="--c:${wing.color}">
        <div class="lift-sign">${wing.icon}</div>
        <div class="lift-frame"><div class="lift-door l"></div><div class="lift-door r"></div></div>
        <div class="lift-call"><span>▲</span><span>▼</span></div>
        <div class="tap-hint">👇</div>
    </div>`, x, 150, x + 75, openLift);
    scene.lift = { node, walkX: x + 75 };
}

function openLift() {
    if (state.busy || overlayOpen()) return;
    liftOpen = true;
    const here = scene.key;
    const btns = WINGS.slice().reverse().map(w => `<button class="lift-floor${w.key === here ? ' here' : ''}" data-k="${w.key}" style="--c:${w.color}">
        <span class="lf-icon">${w.icon}</span><small>${w.name}</small></button>`).join('');
    document.getElementById('liftBtns').innerHTML = btns;
    document.getElementById('liftDisplay').textContent = scene.wing.icon;
    liftOv.querySelectorAll('.lift-floor').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.dataset.k === here) { closeLift(); return; }
        rideLift(b.dataset.k);
    }));
    liftOv.classList.add('open');
    scene.lift.node.classList.add('open');
    playPop();
}

function closeLift() {
    liftOpen = false;
    liftOv.classList.remove('open');
    if (scene.lift) scene.lift.node.classList.remove('open');
}

function rideLift(toKey) {
    const from = WINGS.findIndex(w => w.key === scene.key);
    const to = WINGS.findIndex(w => w.key === toKey);
    closeLift();
    state.busy = true;
    state.hold = 0;
    state.pending = null;
    const fade = document.getElementById('doorFade');
    princessEl().classList.add('entering');
    // Ding-dong, then a rising or falling hum while the lift moves
    playTone(1319, 0.3, 0.1, 'sine');
    setTimeout(() => playTone(1047, 0.4, 0.1, 'sine'), 220);
    setTimeout(() => fade.classList.add('show'), 300);
    setTimeout(() => playFreqSweep(to > from ? 300 : 700, to > from ? 700 : 300, 0.5, 0.08), 400);
    setTimeout(() => {
        setScene(toKey);
        state.x = state.targetX = scene.lift.walkX;
        state.facing = 1;
        if (state.pet.following) state.pet.x = state.x - 90;
        state.camX = Math.max(0, Math.min(Math.max(0, WORLD_W - state.viewW), state.x - state.viewW / 2));
        scene.lift.node.classList.add('open');
        showToast(`${scene.wing.icon} ${scene.wing.name}`, 1600);
    }, 750);
    setTimeout(() => {
        fade.classList.remove('show');
        princessEl().classList.remove('entering');
        playTone(1568, 0.35, 0.1, 'sine');
        burst(state.x, 320, 40);
    }, 900);
    setTimeout(() => {
        scene.lift.node.classList.remove('open');
        state.busy = false;
    }, 1500);
}

document.getElementById('liftClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeLift();
});
liftOv.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (e.target === liftOv) closeLift();
});


/* ─────────── Kaart (snel reizen) ─────────── */
const mapOv = document.getElementById('mapOv');
let mapOpen = false;

function mapTiles(sc) {
    return sc.rooms.map((r, i) => `<button class="map-room${scene === sc && state.room === i ? ' here' : ''}" data-k="${sc.key}" data-i="${i}">${r.icon}<small>${r.name}</small></button>`).join('');
}

function openMap() {
    if (state.busy || overlayOpen()) return;
    mapOpen = true;
    // The castle drawn as a cross-section: the clouds above it, then top floor first, ground floor last
    document.getElementById('mapCastle').innerHTML = `<div class="map-floor map-sky${scene === SCENES.wolken ? ' here' : ''}" style="--c:${SKY.color}">
            <div class="map-floor-name">${SKY.icon}<small>${SKY.name}</small></div>
            <div class="map-grid">${mapTiles(SCENES.wolken)}</div>
        </div>` + WINGS.slice().reverse().map(w => {
        const sc = SCENES[w.key];
        return `<div class="map-floor${scene === sc ? ' here' : ''}${w.key === 'toren' ? ' map-tower' : ''}" style="--c:${w.color}">
            <div class="map-floor-name">${w.icon}<small>${w.name}</small></div>
            <div class="map-grid">${mapTiles(sc)}</div>
        </div>`;
    }).join('');
    document.getElementById('mapOut').innerHTML = mapTiles(SCENES.out);
    document.getElementById('mapSea').innerHTML = mapTiles(SCENES.sea);
    document.getElementById('mapDorp').innerHTML = mapTiles(SCENES.dorp);
    mapOv.querySelectorAll('.map-room').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        travelTo(b.dataset.k, +b.dataset.i);
    }));
    mapOv.classList.add('open');
    playPop();
}

function closeMap() {
    mapOpen = false;
    mapOv.classList.remove('open');
}

function travelTo(key, room) {
    closeMap();
    state.busy = true;
    state.hold = 0;
    state.pending = null;
    const fade = document.getElementById('doorFade');
    [1568, 2093, 2637, 3136].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.08, 'sine'), i * 60));
    burst(state.x, 320, 40);
    fade.classList.add('show');
    setTimeout(() => {
        leaveBoat(true);
        if (key !== scene.key) {
            dismountUnicorn(true);
            setScene(key);
        }
        state.x = state.targetX = clampX(room * ROOM_W + 400);
        state.alt = state.targetAlt = key === 'sea' ? 140 : 0;
        if (state.riding) state.uniX = state.x;
        state.camX = Math.max(0, Math.min(Math.max(0, WORLD_W - state.viewW), state.x - state.viewW / 2));
        if (state.pet.following) state.pet.x = state.x - 90;
    }, 420);
    setTimeout(() => {
        fade.classList.remove('show');
        burst(state.x, 320, 50);
        state.busy = false;
    }, 560);
}

document.getElementById('mapBtn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    openMap();
});
document.getElementById('mapClose').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeMap();
});
mapOv.addEventListener('pointerdown', (e) => e.stopPropagation());
