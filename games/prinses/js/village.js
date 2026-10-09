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
    </div>`, x, 230, walkX, (n) => rideCarriage(n, toKey));
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
        k = (scene.rides && scene.rides[from]) || scene.koets;
        state.x = state.targetX = k.walkX;
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

// Fly a little thing inside an overlay from one element to another (with a small arc)
function ovFly(ov, fromEl, toEl, html, ms = 600) {
    const o = ov.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const f = el(`<div class="ov-fly">${html}</div>`);
    f.style.left = (a.left + a.width / 2 - o.left) + 'px';
    f.style.top = (a.top + a.height / 2 - o.top) + 'px';
    f.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms cubic-bezier(.5,-0.7,.6,1)`;
    ov.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        f.style.left = (b.left + b.width / 2 - o.left) + 'px';
        f.style.top = (b.top + b.height / 2 - o.top) + 'px';
    }));
    return new Promise(res => setTimeout(() => { f.remove(); res(); }, ms));
}

// Hearts/stars bursting out of an element inside an overlay
function ovCheer(ov, node, kinds = ['💖', '✨', '⭐', '🎉']) {
    const o = ov.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        const sp = document.createElement('span');
        sp.className = 'scope-spark';
        sp.textContent = randomPick(kinds);
        const a = Math.random() * Math.PI * 2;
        const d = 50 + Math.random() * 80;
        sp.style.left = (r.left - o.left + r.width / 2) + 'px';
        sp.style.top = (r.top - o.top + r.height / 3) + 'px';
        sp.style.setProperty('--dx', Math.cos(a) * d + 'px');
        sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
        ov.appendChild(sp);
        setTimeout(() => sp.remove(), 900);
    }
}

// Replay a short bounce animation (v-jump, v-nope, v-pulse, v-wobble in village.css)
function bounceEl(node, kind = 'jump') {
    const cls = 'v-' + kind;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
}
