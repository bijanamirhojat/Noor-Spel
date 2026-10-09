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

// One tab per world; the castle tab shows the floors as a cross-section
let mapTab = 'kasteel';
function mapWorlds() {
    return [
        { key: 'kasteel', icon: '🏰', name: 'Kasteel', color: '#f472b6', scenes: WINGS.map(w => SCENES[w.key]) },
        { key: 'out', icon: '🌳', name: 'Buiten', color: '#22c55e', scenes: [SCENES.out] },
        { key: 'sea', icon: '🧜‍♀️', name: 'Onder water', color: '#06b6d4', scenes: [SCENES.sea] },
        { key: 'dorp', icon: VILLAGE.icon, name: VILLAGE.name, color: VILLAGE.color, scenes: [SCENES.dorp] },
        { key: 'dierentuin', icon: ZOO.icon, name: ZOO.name, color: ZOO.color, scenes: [SCENES.dierentuin] },
        { key: 'wolken', icon: SKY.icon, name: SKY.name, color: SKY.color, scenes: [SCENES.wolken] }
    ];
}

function renderMapTabs() {
    document.getElementById('mapTabs').innerHTML = mapWorlds().map(w =>
        `<button class="map-tab${w.key === mapTab ? ' on' : ''}${w.scenes.includes(scene) ? ' here' : ''}" data-w="${w.key}" style="--c:${w.color}">
            <span>${w.icon}</span><small>${w.name}</small></button>`).join('');
    document.querySelectorAll('.map-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (mapTab === b.dataset.w) return;
        mapTab = b.dataset.w;
        renderMapTabs();
        renderMapBody();
        playFreqSweep(900, 1300, 0.12, 0.08);
    }));
}

function renderMapBody() {
    const body = document.getElementById('mapBody');
    const w = mapWorlds().find(x => x.key === mapTab);
    body.className = 'map-body' + (mapTab === 'kasteel' ? ' castle' : ' places');
    body.style.setProperty('--c', w.color);
    body.style.setProperty('--n', Math.max(...WINGS.map(x => x.rooms.length)));
    if (mapTab === 'kasteel') {
        body.innerHTML = `<div class="map-castle">${WINGS.slice().reverse().map(wing => {
            const sc = SCENES[wing.key];
            return `<div class="map-floor${scene === sc ? ' here' : ''}${wing.key === 'toren' ? ' map-tower' : ''}" style="--c:${wing.color}">
                <div class="map-floor-name">${wing.icon}<small>${wing.name}</small></div>
                <div class="map-grid">${mapTiles(sc)}</div>
            </div>`;
        }).join('')}</div>`;
    } else {
        // Spread the places over as many columns as gives the biggest tiles, so everything fits without scrolling
        const n = w.scenes[0].rooms.length;
        const W = mapOv.clientWidth - 110, H = mapOv.clientHeight - 240;
        let cols = 1, best = 0;
        for (let c = 1; c <= n; c++) {
            const t = Math.min(W / (c + 0.6), H / (Math.ceil(n / c) + 0.2));
            if (t > best + 1) { best = t; cols = c; }
        }
        body.style.setProperty('--cols', cols);
        body.style.setProperty('--rows', Math.ceil(n / cols));
        body.innerHTML = `<div class="map-world${w.scenes.includes(scene) ? ' here' : ''}"><div class="map-grid">${mapTiles(w.scenes[0])}</div></div>`;
    }
    body.querySelectorAll('.map-room').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        travelTo(b.dataset.k, +b.dataset.i);
    }));
    body.classList.remove('pop');
    void body.offsetWidth;
    body.classList.add('pop');
}

function openMap() {
    if (state.busy || overlayOpen()) return;
    mapOpen = true;
    // Open on the world the princess is in
    mapTab = (mapWorlds().find(w => w.scenes.includes(scene)) || mapWorlds()[0]).key;
    mapOv.classList.add('open');
    renderMapTabs();
    renderMapBody();
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
