/* ─────────── Kamers & verdiepingen ───────────
   Elke kamer staat in js/rooms/<key>.js en meldt zich aan met defineRoom().
   WINGS bepaalt op welke verdieping een kamer staat en in welke volgorde:
   een kamer verplaatsen = alleen de key in deze lijst verplaatsen. */
const ROOM_DEFS = {};
function defineRoom(def) { ROOM_DEFS[def.key] = def; }

// Van beneden naar boven (zo staan ze ook in de lift en op de kaart)
const WINGS = [
    { key: 'hal',   name: 'Beneden',           icon: '🏰', color: '#f472b6', gems: 12, liftX: 340,
      rooms: ['kasteelhal', 'troonzaal', 'balzaal', 'eetkamer', 'bakkerij', 'dierensalon'] },
    { key: 'mooi',  name: 'Mooi maken',        icon: '💅', color: '#a855f7', gems: 10, liftX: 30,
      rooms: ['spiegelkamer', 'badkamer', 'nagelsalon', 'juwelierskamer', 'borduurkamer'] },
    { key: 'speel', name: 'Speelverdieping',   icon: '🧸', color: '#f59e0b', gems: 12, liftX: 30,
      rooms: ['regenboogzaal', 'speelkamer', 'poppenhuis', 'cadeaukamer', 'hartjeskamer', 'ijskamer'] },
    { key: 'toren', name: 'Toren',             icon: '🌙', color: '#6366f1', gems: 8,  liftX: 30,
      rooms: ['slaapkamer', 'sterrenkamer', 'torenkamer'] }
];

// Het dorp: met de koets bereikbaar vanaf het kasteelplein (js/village.js)
const VILLAGE = { key: 'dorp', name: 'Dorp', icon: '🏘️', color: '#f97316', gems: 9,
    rooms: ['dorpsplein', 'markt', 'ijssalon'] };

const SCENES = {};
let scene = null;
let world = null;
// key -> { scene, idx } for every room in every scene
const ROOM_AT = {};

function makeWorldEl(key) {
    const w = el(`<div class="world" data-scene="${key}" style="display:none"></div>`);
    playfield.insertBefore(w, canvas);
    return w;
}

function initScenes() {
    WINGS.forEach(wing => {
        const rooms = wing.rooms.map(k => {
            if (!ROOM_DEFS[k]) throw new Error('Onbekende kamer: ' + k);
            return ROOM_DEFS[k];
        });
        SCENES[wing.key] = { key: wing.key, wing, inside: true, rooms, el: makeWorldEl(wing.key), gems: [], gemsGot: 0, gemCount: wing.gems, door: null, lift: null };
    });
    SCENES.out = { key: 'out', rooms: ROOMS_OUT, el: makeWorldEl('out'), gems: [], gemsGot: 0, gemCount: 14, door: null };
    SCENES.sea = { key: 'sea', rooms: ROOMS_SEA, el: makeWorldEl('sea'), gems: [], gemsGot: 0, gemCount: 12, door: null };
    SCENES.dorp = { key: 'dorp', rooms: VILLAGE.rooms.map(k => ROOM_DEFS[k]), el: makeWorldEl('dorp'), gems: [], gemsGot: 0, gemCount: VILLAGE.gems, door: null, koets: null };
    Object.values(SCENES).forEach(sc => sc.rooms.forEach((r, idx) => { ROOM_AT[r.key] = { scene: sc, idx }; }));
    scene = SCENES.hal;
    world = scene.el;
}

// World x of the left wall of a room (within its own scene)
function roomX(key) { return ROOM_AT[key].idx * ROOM_W; }
function sceneOf(key) { return ROOM_AT[key].scene; }
// Is the princess in this room right now?
function inRoom(key) { return ROOMS[state.room] && ROOMS[state.room].key === key; }

function buildWing(wing) {
    buildRooms('i-room');
    for (let i = 1; i < ROOMS.length; i++) {
        place(el('<div class="pillar"></div>'), i * ROOM_W - 22, -500);
    }
    ROOMS.forEach((room, i) => room.build(i * ROOM_W));
    buildLift(wing);
}

function buildRooms(cls, extra = '') {
    ROOMS.forEach((room, i) => {
        const r = el(`<div class="room ${cls} rm-${room.key}"><div class="wall"></div>${extra}<div class="floor"></div>
            <div class="room-sign">${room.icon} ${room.name}</div></div>`);
        r.style.left = i * ROOM_W + 'px';
        world.appendChild(r);
    });
}

function goThroughDoor(doorNode, toKey) {
    if (state.busy) return;
    state.busy = true;
    state.hold = 0;
    state.pending = null;
    dismountUnicorn(true);
    doorNode.classList.add('open');
    playFreqSweep(200, 500, 0.4, 0.15);
    playSparkleSound();
    burst(state.x, 300, 40);
    const fade = document.getElementById('doorFade');
    setTimeout(() => princessEl().classList.add('entering'), 150);
    setTimeout(() => fade.classList.add('show'), 450);
    setTimeout(() => {
        doorNode.classList.remove('open');
        setScene(toKey);
        const door = scene.door;
        state.x = state.targetX = door.walkX;
        state.facing = 1;
        if (state.pet.following) state.pet.x = state.x - 90;
        state.camX = Math.max(0, Math.min(Math.max(0, WORLD_W - state.viewW), state.x - state.viewW / 2));
        door.node.classList.add('open');
        if (window.speechSynthesis) speechSynthesis.cancel();
        setTimeout(() => speak(toKey === 'out' ? 'Naar buiten! Het kasteelplein!' : 'Naar binnen! De kasteelhal!'), 60);
    }, 900);
    setTimeout(() => {
        fade.classList.remove('show');
        princessEl().classList.remove('entering');
        burst(state.x, 320, 50);
    }, 1000);
    setTimeout(() => {
        scene.door.node.classList.remove('open');
        state.busy = false;
    }, 1700);
}

function setScene(key) {
    if (scene) scene.el.style.display = 'none';
    scene = SCENES[key];
    world = scene.el;
    world.style.display = '';
    ROOMS = scene.rooms;
    WORLD_W = ROOM_W * ROOMS.length;
    const pr = princessEl();
    if (pr) world.appendChild(pr);
    if (pr) pr.classList.toggle('mermaid', key === 'sea');
    const pet = petEl();
    if (pet && state.pet.following && key !== 'sea') {
        world.appendChild(pet);
        state.pet.key = key;
        state.pet.x = state.x - 90;
    }
    particles.length = 0;
    state.room = 0;
    roomPill.textContent = `${ROOMS[0].icon} ${ROOMS[0].name}`;
    updateGemPill();
    if (document.getElementById('prince')) updateBallroom();
}
