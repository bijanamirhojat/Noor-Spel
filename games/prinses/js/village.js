/* ─────────── Dorp ───────────
   Een eigen wereld (scene 'dorp') met de kamers uit js/dorp/*.js.
   De koets rijdt heen en weer tussen het kasteelplein en het dorpsplein. */

function buildVillage() {
    buildRooms('d-room');
    for (let i = 0; i < 8; i++) {
        const c = place(el('<div class="cloud"></div>'), 80 + i * 300 + Math.random() * 80, -380 + Math.random() * 420);
        c.style.animationDelay = (-Math.random() * 9) + 's';
        c.style.transform = `scale(${0.7 + Math.random() * 0.5})`;
    }
    ROOMS.forEach((room, i) => room.build(i * ROOM_W));
}

// A house front in the background (not tappable). Windows are laid out in a grid.
function villageHouse(x, w, h, color, roof, opts = {}) {
    const cols = w >= 200 ? 3 : 2;
    const rows = Math.max(1, Math.floor((h - 120) / 80));
    let wins = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const lit = Math.random() < 0.4 ? ' lit' : '';
            wins += `<div class="d-win${lit}" style="left:${(c + 0.5) * (w / cols) - 22}px;top:${30 + r * 80}px"></div>`;
        }
    }
    const door = opts.door === false ? '' : `<div class="d-door" style="left:${w / 2 - 28}px"></div>`;
    const flowers = opts.flowers ? `<div class="d-box" style="left:${w / 2 - 45}px;top:${30 + (rows - 1) * 80 + 50}px">🌷🌸🌷</div>` : '';
    return place(el(`<div class="d-house" style="--c:${color};--roof:${roof};width:${w}px;height:${h}px">
        <div class="d-roof"></div>${wins}${door}${flowers}</div>`), x, 400 - h);
}

/* ─────────── Koets ─────────── */
function addKoets(x, walkX, toKey) {
    const node = addObj(`<div class="koets">
        <div class="k-ride">
            <span class="k-horse">🐎</span>
            <div class="k-body"><div class="k-win"></div><span class="k-crown">👑</span></div>
            <div class="k-wheel" style="left:92px"></div><div class="k-wheel" style="left:170px"></div>
        </div>
        <div class="tap-hint" style="left:150px;top:-10px">👇</div>
    </div>`, x, 230, walkX, (n) => needTicket('koets', n, () => rideCarriage(n, toKey)));
    return { node, walkX };
}

function clipClop(ms) {
    for (let t = 0; t < ms; t += 170) {
        setTimeout(() => playTone((t / 170) % 2 ? 700 : 900, 0.05, 0.07, 'triangle'), t);
    }
}

// Ride a vehicle to another world. The vehicle you arrive in is the one there that goes back to where you
// came from (scene.rides[fromKey]), else that world's koets. opts: { sound(ms), toast }
function rideCarriage(node, toKey, opts = {}) {
    if (state.busy) return;
    state.busy = true;
    state.hold = 0;
    state.pending = null;
    dismountUnicorn(true);
    const p = princessEl();
    p.classList.add('entering');
    playFreqSweep(500, 900, 0.2, 0.1);
    (opts.sound || clipClop)(2300);
    setTimeout(() => node.classList.add('drive'), 350);
    const fade = document.getElementById('doorFade');
    let k = null;
    setTimeout(() => fade.classList.add('show'), 1000);
    setTimeout(() => {
        node.classList.remove('drive');
        const from = scene.key;
        setScene(toKey);
        k = (scene.rides && scene.rides[from]) || scene.koets || { walkX: 150, node: el('<div></div>') };
        state.x = state.targetX = k.walkX;
        state.alt = state.targetAlt = 0;
        state.facing = -1;
        if (state.pet.following) state.pet.x = state.x + 90;
        state.camX = Math.max(0, Math.min(Math.max(0, WORLD_W - state.viewW), state.x - state.viewW / 2));
        k.node.classList.add('arrive');
    }, 1450);
    setTimeout(() => fade.classList.remove('show'), 1550);
    setTimeout(() => {
        k.node.classList.remove('arrive');
        p.classList.remove('entering');
        burst(state.x, 320, 40);
        playSparkleSound();
        showToast(opts.toast || (toKey === 'dorp' ? '🏘️ Het dorp!' : '🏰 Terug bij het kasteel!'), 1600);
        state.busy = false;
    }, 2500);
}

