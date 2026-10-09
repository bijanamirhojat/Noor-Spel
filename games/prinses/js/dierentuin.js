/* ─────────── Dierentuin ───────────
   Een eigen wereld (scene 'dierentuin') met de kamers uit js/dierentuin/*.js.
   De dierentuinbus rijdt heen en weer tussen het strand (eind van het dorp) en de ingang. */

function buildZoo() {
    buildRooms('z-room');
    for (let i = 0; i < 6; i++) {
        const c = place(el('<div class="cloud"></div>'), 80 + i * 330 + Math.random() * 80, -380 + Math.random() * 400);
        c.style.animationDelay = (-Math.random() * 9) + 's';
        c.style.transform = `scale(${0.7 + Math.random() * 0.5})`;
    }
    ROOMS.forEach((room, i) => room.build(i * ROOM_W));
}

function busVroom(ms) {
    playTone(660, 0.15, 0.1, 'square');
    setTimeout(() => playTone(523, 0.25, 0.1, 'square'), 170);
    for (let t = 300; t < ms; t += 120) setTimeout(() => playTone(70 + (t % 240) / 6, 0.1, 0.07, 'sawtooth'), t);
}

// A bus stop with the bus; toKey is the world it drives to. stopX: where the 🚏 sign stands (from the bus' left)
function addBus(x, walkX, toKey, stopX = 196) {
    const zoo = toKey === 'dierentuin';
    const node = addObj(`<div class="koets zbus">
        <div class="zb-stop" style="left:${stopX}px"><span>🚏</span><b>${zoo ? '🦁 Dierentuin' : '🏘️ Dorp'}</b></div>
        <div class="k-ride">
            <div class="zb-body"><div class="zb-win"><span>🦒</span></div><div class="zb-win"><span>🐒</span></div><div class="zb-win"><span>🐘</span></div><div class="zb-front"></div></div>
            <div class="k-wheel" style="left:30px"></div><div class="k-wheel" style="left:150px"></div>
        </div>
        <div class="tap-hint" style="left:100px;top:-30px">👇</div>
    </div>`, x, 230, walkX, (n) => rideCarriage(n, toKey, { sound: busVroom, toast: zoo ? '🦁 De dierentuin!' : '🏘️ Terug in het dorp!' }));
    return { node, walkX };
}

// Shared animal sounds for the zoo rooms
function zooRoar() {
    startNoise('dryer');
    playFreqSweep(180, 90, 0.9, 0.12);
    setTimeout(stopNoise, 800);
}
function zooMonkey() {
    [[600, 1200], [600, 1300], [900, 400], [900, 400]].forEach(([a, b], i) => setTimeout(() => playFreqSweep(a, b, 0.15, 0.1), i * 170));
}
function zooTrumpet() {
    playFreqSweep(300, 700, 0.25, 0.12);
    setTimeout(() => playFreqSweep(700, 520, 0.6, 0.12), 230);
}
function zooSqueak() {
    [1400, 1700, 1400].forEach((f, i) => setTimeout(() => playTone(f, 0.07, 0.08, 'square'), i * 90));
}

// Throw some food (or anything) through the room in an arc
function zooToss(html, x0, y0, x1, y1, ms = 700) {
    const f = place(el(`<div class="zoo-toss">${html}</div>`), x0, y0);
    f.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms cubic-bezier(.5,-0.8,.6,1)`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        f.style.left = x1 + 'px';
        f.style.top = y1 + 'px';
    }));
    return new Promise(res => setTimeout(() => { f.remove(); res(); }, ms));
}

// Replay a CSS animation class on a node
function zooAnim(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
}
