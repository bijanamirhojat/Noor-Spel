// No voice in this game: sounds and glitter only
speak = () => {};

/* ─────────── Constants ─────────── */
const WORLD_H = 500;
const ROOM_W = 800;
// Buiten en onder water: vaste volgorde, gebouwd in outside.js / sea.js
const ROOMS_OUT = [
    { key: 'kasteelplein',  name: 'Kasteelplein',  icon: '⛲', say: 'Het kasteelplein' },
    { key: 'bloementuin',   name: 'Bloementuin',   icon: '🌷', say: 'De bloementuin' },
    { key: 'vijver',        name: 'Vijver',        icon: '🦢', say: 'De vijver' },
    { key: 'eenhoornweide', name: 'Eenhoornweide', icon: '🦄', say: 'De eenhoornweide' },
    { key: 'speeltuin',     name: 'Speeltuin',     icon: '🎠', say: 'De speeltuin' },
    { key: 'meer',          name: 'Meer',          icon: '⛵', say: 'Het meer' },
    { key: 'piratenbaai',   name: 'Piratenbaai',   icon: '🏴‍☠️', say: 'De piratenbaai' }
];
const ROOMS_SEA = [
    { key: 'koraalrif', name: 'Koraalrif',         icon: '🐠', say: 'Het koraalrif' },
    { key: 'grot',      name: 'Zeemeerminnengrot', icon: '🧜‍♀️', say: 'De zeemeerminnengrot' },
    { key: 'baai',      name: 'Dolfijnenbaai',     icon: '🐬', say: 'De dolfijnenbaai' }
];
// The princess is in one scene at a time; these follow the active scene.
let ROOMS = [];
let WORLD_W = 0;
const PRINCESS_W = 120;
const PRINCESS_H = 192;
const FEET_Y = 452;
const SPEED = 280;
const RIDE_SPEED = 540;
// Lake (outside, last area): the princess can only go past the shore by boat
const LAKE_X0 = ROOM_W * 5 + 190;
const BOAT_HOME = LAKE_X0 + 80;
const BOAT_LIFT = -18;
const BALL_TILE_X0 = 150;
const RIDE_LIFT = 30;
const MIN_VIEW_W = 580;

const DRESSES = ['#f472b6', '#a855f7', '#38bdf8', '#34d399', '#fbbf24', 'rainbow', '#fb7185'];

const playfield = document.getElementById('playfield');
const canvas = document.getElementById('fx');
const ctx2d = canvas.getContext('2d');
const toastEl = document.getElementById('toast');
const gemPill = document.getElementById('gemPill');
const roomPill = document.getElementById('roomPill');
/* ─────────── State ─────────── */
const state = {
    x: 400,
    targetX: 400,
    facing: 1,
    camX: 0,
    scale: 1,
    viewW: 800,
    offsetY: 0,
    hold: 0,
    pending: null,
    busy: false,
    dressIdx: 0,
    room: 0,
    riding: false,
    uniX: ROOM_W * 3 + 470,
    fountainBoost: 0,
    clopT: 0,
    boating: false,
    swishT: 0,
    anim: { dx: 0, dy: 0, rot: 0, origin: '' },
    flying: false,
    alt: 0,
    targetAlt: 0,
    flapT: 0,
    pet: { following: false, x: 200, facing: -1, key: 'hal' },
    look: { hat: 'crown', back: 'none', face: 'none', hair: 0, neck: null, hairdo: 'long', clip: 'none', sparkle: 'none' },
    partyUntil: 0,
    lastTime: performance.now()
};

// Dress-up layers drawn on the princess (toggled by applyLook)
const PRINCESS_LAYERS = `
    <g class="lk" data-k="face" data-v="glasses" style="display:none">
        <path d="M43 39 c-2.5-3-7-1-6 2.5 c0.8 2.6 6 5.5 6 5.5 s5.2-2.9 6-5.5 c1-3.5-3.5-5.5-6-2.5 Z" fill="rgba(244,114,182,0.55)" stroke="#db2777" stroke-width="1.4"/>
        <path d="M57 39 c-2.5-3-7-1-6 2.5 c0.8 2.6 6 5.5 6 5.5 s5.2-2.9 6-5.5 c1-3.5-3.5-5.5-6-2.5 Z" fill="rgba(244,114,182,0.55)" stroke="#db2777" stroke-width="1.4"/>
        <path d="M49 41 Q50 40 51 41" stroke="#db2777" stroke-width="1.4" fill="none"/>
    </g>
    <g class="lk" data-k="face" data-v="whiskers" style="display:none">
        <ellipse cx="50" cy="47" rx="2.2" ry="1.6" fill="#f472b6"/>
        <path d="M41 47 L30 45 M41 49 L30 50 M59 47 L70 45 M59 49 L70 50" stroke="#374151" stroke-width="1" stroke-linecap="round"/>
    </g>
    <g class="lk" data-k="face" data-v="mask" style="display:none">
        <path fill-rule="evenodd" fill="#a855f7" stroke="#7e22ce" stroke-width="1"
            d="M32 38 Q50 33 68 38 Q69 47 59 47 Q50 43 41 47 Q31 47 32 38 Z M39.5 42 a3.5 4 0 1 0 7 0 a3.5 4 0 1 0 -7 0 Z M53.5 42 a3.5 4 0 1 0 7 0 a3.5 4 0 1 0 -7 0 Z"/>
    </g>
    <g class="lk" data-k="face" data-v="stars" style="display:none">
        <text x="37" y="51" font-size="7" text-anchor="middle">⭐</text>
        <text x="63" y="51" font-size="7" text-anchor="middle">💖</text>
        <text x="50" y="31" font-size="5" text-anchor="middle">✨</text>
    </g>
    <g class="lk" data-k="hat" data-v="crown">
        <path d="M36 24 L39 11 L45 19 L50 6 L55 19 L61 11 L64 24 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="50" cy="17" r="2.6" fill="#ec4899"/>
        <circle cx="42" cy="20" r="1.8" fill="#38bdf8"/>
        <circle cx="58" cy="20" r="1.8" fill="#a855f7"/>
    </g>
    <g class="lk" data-k="hat" data-v="tiara" style="display:none">
        <path d="M37 26 Q50 14 63 26" stroke="#e5e7eb" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M47 19 L50 12 L53 19 Z" fill="#e5e7eb"/>
        <circle cx="50" cy="17" r="2.8" fill="#38bdf8" stroke="#fff"/>
        <circle cx="42.5" cy="21" r="1.8" fill="#f472b6"/><circle cx="57.5" cy="21" r="1.8" fill="#f472b6"/>
    </g>
    <g class="lk" data-k="hat" data-v="witch" style="display:none">
        <path d="M36 25 L53 -16 Q58 -18 57 -11 L64 25 Z" fill="#7c3aed"/>
        <path d="M36 20 L63 20 L64 25 L36 25 Z" fill="#facc15"/>
        <path d="M22 27 Q50 19 78 27 Q50 33 22 27 Z" fill="#6d28d9"/>
        <text x="52" y="10" font-size="8" text-anchor="middle">⭐</text>
    </g>
    <g class="lk" data-k="hat" data-v="pirate" style="display:none">
        <path d="M24 29 Q28 2 50 5 Q72 2 76 29 Q50 21 24 29 Z" fill="#1f2937"/>
        <path d="M27 25 Q50 17 73 25" stroke="#facc15" stroke-width="2" fill="none"/>
        <circle cx="50" cy="13" r="4" fill="#fff"/>
        <circle cx="48.6" cy="12.5" r="0.9" fill="#1f2937"/><circle cx="51.4" cy="12.5" r="0.9" fill="#1f2937"/>
    </g>
    <g class="lk" data-k="hat" data-v="bunny" style="display:none">
        <ellipse cx="41" cy="6" rx="6" ry="16" transform="rotate(-14 41 6)" fill="#fff" stroke="#f9a8d4" stroke-width="1.5"/>
        <ellipse cx="41" cy="7" rx="2.8" ry="11" transform="rotate(-14 41 7)" fill="#fbcfe8"/>
        <ellipse cx="59" cy="6" rx="6" ry="16" transform="rotate(14 59 6)" fill="#fff" stroke="#f9a8d4" stroke-width="1.5"/>
        <ellipse cx="59" cy="7" rx="2.8" ry="11" transform="rotate(14 59 7)" fill="#fbcfe8"/>
        <path d="M33 26 Q50 14 67 26" stroke="#f472b6" stroke-width="3" fill="none"/>
    </g>
    <g class="lk" data-k="hat" data-v="unicorn" style="display:none">
        <path d="M34 26 L36 14 L43 22 Z" fill="#fbcfe8" stroke="#f472b6" stroke-width="1"/>
        <path d="M66 26 L64 14 L57 22 Z" fill="#fbcfe8" stroke="#f472b6" stroke-width="1"/>
        <path d="M45 24 L50 -8 L55 24 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M46.5 16 L53 14 M47.5 8 L52.3 6.5 M48.5 0 L51.5 -1" stroke="#f59e0b" stroke-width="1.3"/>
    </g>
    <g class="lk" data-k="hat" data-v="flowers" style="display:none">
        ${[[-160, '🌸'], [-135, '🌼'], [-110, '🌷'], [-90, '🌸'], [-70, '🌼'], [-45, '🌷'], [-20, '🌸']].map(([a, f]) => {
            const r = a * Math.PI / 180;
            return `<text x="${(50 + Math.cos(r) * 19).toFixed(1)}" y="${(43 + Math.sin(r) * 19).toFixed(1)}" font-size="9" text-anchor="middle" dominant-baseline="central">${f}</text>`;
        }).join('')}
    </g>
    <g class="lk" data-k="hat" data-v="cat" style="display:none">
        <path d="M33 30 L34 9 L46 22 Z" fill="#374151"/><path d="M35.5 25 L36 14 L42.5 21.5 Z" fill="#f9a8d4"/>
        <path d="M67 30 L66 9 L54 22 Z" fill="#374151"/><path d="M64.5 25 L64 14 L57.5 21.5 Z" fill="#f9a8d4"/>
    </g>`;

/* ─────────── Kapsels (kapsalon, js/rooms/kapsalon.js) ─────────── */
const HAIRDOS = [
    ['long', 'Lang'], ['rapunzel', 'Rapunzel'], ['short', 'Kort'], ['pigtails', 'Staartjes'],
    ['buns', 'Knotjes'], ['braid', 'Vlecht'], ['ponytail', 'Paardenstaart'], ['curls', 'Krullen']
];
const HAIR_SHORT = 'M31 34 Q29 48 33 56 L67 56 Q71 48 69 34 Z';

function HAIRDO_BACK(pre) {
    const f = `fill="url(#${pre}hair)"`;
    const curls = [[30, 34], [70, 34], [26, 46], [74, 46], [25, 58], [75, 58], [27, 70], [73, 70], [31, 82], [69, 82],
        [38, 88], [50, 90], [62, 88], [36, 76], [64, 76], [50, 78], [40, 64], [60, 64]];
    return `
            <g class="lk" data-k="hairdo" data-v="long"><path class="hair" d="M31 36 Q24 70 30 100 Q50 106 70 100 Q76 70 69 36 Z" ${f}/></g>
            <g class="lk" data-k="hairdo" data-v="rapunzel" style="display:none">
                <path class="hair" d="M31 36 Q18 90 22 150 Q50 158 78 150 Q82 90 69 36 Z" ${f}/>
                <text x="24" y="120" font-size="7">🌸</text><text x="70" y="136" font-size="7">🌼</text><text x="22" y="146" font-size="6">🌷</text>
            </g>
            <g class="lk" data-k="hairdo" data-v="short" style="display:none"><path class="hair" d="M30 34 Q25 52 29 62 Q50 68 71 62 Q75 52 70 34 Z" ${f}/></g>
            <g class="lk" data-k="hairdo" data-v="pigtails" style="display:none">
                <path class="hair" d="${HAIR_SHORT}" ${f}/>
                <ellipse class="hair" cx="23" cy="62" rx="8" ry="20" transform="rotate(18 23 62)" ${f}/>
                <ellipse class="hair" cx="77" cy="62" rx="8" ry="20" transform="rotate(-18 77 62)" ${f}/>
                <circle cx="29" cy="45" r="3.2" fill="#f472b6"/><circle cx="71" cy="45" r="3.2" fill="#f472b6"/>
            </g>
            <g class="lk" data-k="hairdo" data-v="buns" style="display:none">
                <path class="hair" d="${HAIR_SHORT}" ${f}/>
                <circle class="hair" cx="31" cy="24" r="9.5" ${f}/><circle class="hair" cx="69" cy="24" r="9.5" ${f}/>
                <path d="M25 22 Q31 17 37 22 M63 22 Q69 17 75 22" stroke="rgba(0,0,0,0.15)" stroke-width="1.2" fill="none"/>
            </g>
            <g class="lk" data-k="hairdo" data-v="braid" style="display:none"><path class="hair" d="${HAIR_SHORT}" ${f}/></g>
            <g class="lk" data-k="hairdo" data-v="ponytail" style="display:none">
                <path class="hair" d="${HAIR_SHORT}" ${f}/>
                <path class="hair" d="M58 24 Q84 18 88 46 Q90 72 78 94 Q82 68 74 50 Q68 38 60 34 Z" ${f}/>
                <circle cx="63" cy="26" r="3.2" fill="#f472b6"/>
            </g>
            <g class="lk" data-k="hairdo" data-v="curls" style="display:none">
                ${curls.map(([x, y]) => `<circle class="hair" cx="${x}" cy="${y}" r="9" ${f} stroke="rgba(0,0,0,0.12)" stroke-width="1"/>`).join('')}
            </g>`;
}

// The braid hangs over the shoulder, in front of the dress
function HAIRDO_FRONT(pre) {
    return `
            <g class="lk" data-k="hairdo" data-v="braid" style="display:none">
                ${[58, 68, 78, 88, 98].map((y, i) => `<ellipse class="hair" cx="${63 + i * 0.7}" cy="${y}" rx="5.5" ry="6.5" fill="url(#${pre}hair)" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>`).join('')}
                <text x="66.5" y="111" font-size="8" text-anchor="middle">🎀</text>
            </g>`;
}

const HAIR_CLIPS = [
    ['none', '🚫'], ['bow', '🎀'], ['flowers', '🌸'], ['butterfly', '🦋'], ['stars', '⭐'], ['hearts', '💖'], ['gems', '💎'], ['shell', '🐚']
];
const HAIR_EXTRAS = `
    <g class="lk" data-k="clip" data-v="bow" style="display:none"><text x="69" y="33" font-size="13" text-anchor="middle">🎀</text></g>
    <g class="lk" data-k="clip" data-v="flowers" style="display:none"><text x="32" y="33" font-size="9" text-anchor="middle">🌸</text><text x="68" y="33" font-size="9" text-anchor="middle">🌼</text></g>
    <g class="lk" data-k="clip" data-v="butterfly" style="display:none"><text x="69" y="31" font-size="11" text-anchor="middle">🦋</text></g>
    <g class="lk" data-k="clip" data-v="stars" style="display:none"><text x="32" y="33" font-size="7" text-anchor="middle">⭐</text><text x="68" y="33" font-size="7" text-anchor="middle">⭐</text><text x="70" y="25" font-size="5" text-anchor="middle">✨</text></g>
    <g class="lk" data-k="clip" data-v="hearts" style="display:none"><text x="32" y="33" font-size="8" text-anchor="middle">💖</text><text x="68" y="33" font-size="8" text-anchor="middle">💖</text></g>
    <g class="lk" data-k="clip" data-v="gems" style="display:none"><text x="32" y="34" font-size="7" text-anchor="middle">💎</text><text x="68" y="34" font-size="7" text-anchor="middle">💎</text></g>
    <g class="lk" data-k="clip" data-v="shell" style="display:none"><text x="69" y="33" font-size="10" text-anchor="middle">🐚</text></g>
    <g class="lk hair-glit" data-k="sparkle" data-v="on" style="display:none">
        ${[[30, 46], [70, 52], [28, 68], [72, 78], [38, 24], [62, 23], [50, 96]].map(([x, y], i) =>
            `<path d="M${x} ${y - 3.5} L${x + 1} ${y - 1} L${x + 3.5} ${y} L${x + 1} ${y + 1} L${x} ${y + 3.5} L${x - 1} ${y + 1} L${x - 3.5} ${y} L${x - 1} ${y - 1} Z" fill="#fff" stroke="#fde047" stroke-width="0.6" style="animation-delay:${i * -0.3}s"/>`).join('')}
    </g>`;

/* ─────────── Princess SVG ─────────── */
function princessSVG(prefix) {
    return `
    <svg viewBox="0 0 100 160" data-prefix="${prefix}">
        <defs>
            <linearGradient id="${prefix}rb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ef4444"/>
                <stop offset=".2" stop-color="#fb923c"/>
                <stop offset=".4" stop-color="#facc15"/>
                <stop offset=".6" stop-color="#4ade80"/>
                <stop offset=".8" stop-color="#60a5fa"/>
                <stop offset="1" stop-color="#c084fc"/>
            </linearGradient>
            <linearGradient id="${prefix}hair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fde047"/>
                <stop offset="1" stop-color="#f59e0b"/>
            </linearGradient>
        </defs>
        <ellipse cx="50" cy="156" rx="30" ry="4" fill="rgba(0,0,0,0.18)"/>
        <g class="bob">
            <g class="lk lk-wings" data-k="back" data-v="wings" style="display:none">
                <ellipse cx="24" cy="66" rx="17" ry="27" transform="rotate(-28 24 66)" fill="rgba(186,230,253,0.75)" stroke="#c4b5fd" stroke-width="1.5"/>
                <ellipse cx="28" cy="96" rx="11" ry="16" transform="rotate(24 28 96)" fill="rgba(251,207,232,0.75)" stroke="#c4b5fd" stroke-width="1.5"/>
                <ellipse cx="76" cy="66" rx="17" ry="27" transform="rotate(28 76 66)" fill="rgba(186,230,253,0.75)" stroke="#c4b5fd" stroke-width="1.5"/>
                <ellipse cx="72" cy="96" rx="11" ry="16" transform="rotate(-24 72 96)" fill="rgba(251,207,232,0.75)" stroke="#c4b5fd" stroke-width="1.5"/>
                <circle cx="20" cy="60" r="2" fill="#fff"/><circle cx="80" cy="60" r="2" fill="#fff"/>
            </g>
            <g class="lk lk-wings" data-k="back" data-v="butterfly" style="display:none">
                <path d="M50 70 C20 30 4 50 14 74 C4 92 26 112 50 84 Z" fill="#fb923c" stroke="#7c2d12" stroke-width="2"/>
                <path d="M50 70 C80 30 96 50 86 74 C96 92 74 112 50 84 Z" fill="#fb923c" stroke="#7c2d12" stroke-width="2"/>
                <circle cx="24" cy="62" r="5" fill="#fde68a"/><circle cx="76" cy="62" r="5" fill="#fde68a"/>
                <circle cx="26" cy="90" r="3.5" fill="#f472b6"/><circle cx="74" cy="90" r="3.5" fill="#f472b6"/>
            </g>
            <g class="lk" data-k="back" data-v="cape" style="display:none">
                <path d="M36 62 Q18 110 20 150 L80 150 Q82 110 64 62 Z" fill="#dc2626"/>
                <path d="M36 62 Q50 70 64 62" stroke="#fcd34d" stroke-width="4" fill="none" stroke-linecap="round"/>
            </g>
            ${HAIRDO_BACK(prefix)}
            <ellipse class="feet" cx="42" cy="152" rx="7" ry="4" fill="#ec4899"/>
            <ellipse class="feet" cx="58" cy="152" rx="7" ry="4" fill="#ec4899"/>
            <g class="tail" style="display:none">
                <defs><linearGradient id="${prefix}tail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#2dd4bf"/><stop offset=".6" stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/>
                </linearGradient></defs>
                <path d="M38 78 Q30 104 40 124 Q46 132 50 134 Q54 132 60 124 Q70 104 62 78 Z" fill="url(#${prefix}tail)" stroke="#0d9488" stroke-width="1.2"/>
                <path d="M40 92 q5 4 10 0 q5 4 10 0 M41 102 q4.5 4 9 0 q4.5 4 9 0 M43 112 q3.5 3.5 7 0 q3.5 3.5 7 0" stroke="rgba(255,255,255,0.6)" stroke-width="1.2" fill="none"/>
                <g class="tail-fin">
                    <path d="M50 130 Q38 140 26 154 Q42 152 50 142 Q58 152 74 154 Q62 140 50 130 Z" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.2"/>
                </g>
                <circle cx="45" cy="86" r="1.6" fill="#fff"/><circle cx="56" cy="108" r="1.4" fill="#fff"/>
            </g>
            <g class="skirt">
                <path class="dress" d="M38 78 Q30 110 12 146 Q50 160 88 146 Q70 110 62 78 Z" fill="#f472b6"/>
                <path d="M12 146 Q18 140 24 147 Q30 140 37 148 Q43 141 50 149 Q57 141 63 148 Q70 140 76 147 Q82 140 88 146" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
                <circle cx="34" cy="120" r="2" fill="#fff"/>
                <circle cx="52" cy="108" r="2.2" fill="#fff"/>
                <circle cx="64" cy="128" r="2" fill="#fff"/>
                <circle cx="44" cy="134" r="1.8" fill="#fff"/>
                <circle cx="72" cy="140" r="1.6" fill="#fff"/>
                <circle cx="26" cy="138" r="1.6" fill="#fff"/>
            </g>
            <g class="pjp">
                <path d="M38 78 L35 148 L48 148 L50 94 L52 148 L65 148 L62 78 Z" fill="#a5b4fc" stroke="#6366f1" stroke-width="1"/>
                <path d="M35 144 L48 144 M52 144 L65 144" stroke="#fff" stroke-width="3"/>
                <circle cx="42" cy="100" r="1.6" fill="#fff"/><circle cx="58" cy="112" r="1.6" fill="#fff"/><circle cx="41" cy="126" r="1.6" fill="#fff"/><circle cx="59" cy="134" r="1.4" fill="#fff"/>
            </g>
            <path class="dress" d="M38 64 Q50 60 62 64 L63 82 Q50 86 37 82 Z" fill="#f472b6"/>
            <g class="pjt">
                <path d="M44 63 L50 70 L56 63" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>
                <circle cx="50" cy="74" r="1.3" fill="#fff"/><circle cx="50" cy="79" r="1.3" fill="#fff"/>
                <path d="M41 70 l1.2 2.4 2.6 .4 -1.9 1.8 .5 2.6 -2.4 -1.3 -2.4 1.3 .5 -2.6 -1.9 -1.8 2.6 -.4 Z" fill="#fde047"/>
            </g>
            <path d="M37 80 Q50 86 63 80" fill="none" stroke="#fde68a" stroke-width="3"/>
            <path d="M39 68 Q30 80 28 92" stroke="#ffd7c2" stroke-width="6" stroke-linecap="round" fill="none"/>
            <circle cx="28" cy="93" r="4" fill="#ffd7c2"/>
            <path d="M61 68 Q70 78 76 88" stroke="#ffd7c2" stroke-width="6" stroke-linecap="round" fill="none"/>
            <line x1="76" y1="90" x2="88" y2="60" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>
            <circle cx="77" cy="89" r="4" fill="#ffd7c2"/>
            <path class="wand-star" d="M88 50 L90.5 55.5 L96.5 56 L92 60 L93.5 66 L88 63 L82.5 66 L84 60 L79.5 56 L85.5 55.5 Z" fill="#fde047" stroke="#f59e0b" stroke-width="1"/>
            <rect x="46" y="54" width="8" height="10" fill="#ffd7c2"/>
            <circle cx="50" cy="40" r="18" fill="#ffe4d6"/>
            <path class="hair" d="M32 40 Q32 20 50 20 Q68 20 68 40 Q62 28 54 30 Q48 26 42 31 Q36 30 32 40 Z" fill="url(#${prefix}hair)"/>
            <ellipse cx="43" cy="42" rx="2.6" ry="3.4" fill="#3b0764"/>
            <ellipse cx="57" cy="42" rx="2.6" ry="3.4" fill="#3b0764"/>
            <circle cx="44" cy="40.6" r="1" fill="#fff"/>
            <circle cx="58" cy="40.6" r="1" fill="#fff"/>
            <circle cx="39" cy="48" r="3.4" fill="#fda4af" opacity=".7"/>
            <circle cx="61" cy="48" r="3.4" fill="#fda4af" opacity=".7"/>
            <path d="M45 50 Q50 55 55 50" fill="none" stroke="#be123c" stroke-width="2" stroke-linecap="round"/>
            ${HAIRDO_FRONT(prefix)}
            <g class="pjc">
                <path d="M30 34 Q34 14 54 16 Q72 18 84 40 L78 44 Q66 28 54 26 Q40 26 34 38 Z" fill="#818cf8"/>
                <path d="M30 34 Q50 26 70 32" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
                <circle cx="82" cy="44" r="5" fill="#fff"/>
                <circle cx="48" cy="22" r="1.4" fill="#fde047"/><circle cx="62" cy="24" r="1.4" fill="#fde047"/>
            </g>
            <g class="necklace"></g>
            ${PRINCESS_LAYERS}
            ${HAIR_EXTRAS}
        </g>
    </svg>`;
}

const HAIRS = [
    ['#fde047', '#f59e0b'], ['#a16207', '#713f12'], ['#4b5563', '#111827'], ['#fb923c', '#c2410c'],
    ['#f9a8d4', '#ec4899'], ['#7dd3fc', '#3b82f6'], ['#d8b4fe', '#9333ea'], 'rainbow',
    ['#f8fafc', '#94a3b8'], ['#fca5a5', '#dc2626'], ['#86efac', '#16a34a']
];
const LOOK_KEY = 'noor-prinses-look';

function applyLook() {
    const look = state.look;
    document.querySelectorAll('svg[data-prefix]').forEach(svg => {
        const pre = svg.dataset.prefix;
        svg.querySelectorAll('.lk').forEach(g => {
            g.style.display = look[g.dataset.k] === g.dataset.v ? '' : 'none';
        });
        const neck = svg.querySelector('.necklace');
        if (neck) neck.innerHTML = necklaceMarkup(look.neck, [35, 60], [50, 86], [65, 60], 2.8);
        const h = HAIRS[look.hair] || HAIRS[0];
        if (h === 'rainbow') {
            svg.querySelectorAll('.hair').forEach(x => x.setAttribute('fill', `url(#${pre}rb)`));
        } else {
            svg.querySelectorAll('.hair').forEach(x => x.setAttribute('fill', `url(#${pre}hair)`));
            const stops = svg.querySelectorAll(`#${pre}hair stop`);
            if (stops.length === 2) {
                stops[0].setAttribute('stop-color', h[0]);
                stops[1].setAttribute('stop-color', h[1]);
            }
        }
    });
    applyDress();
}

function saveLook() {
    try { localStorage.setItem(LOOK_KEY, JSON.stringify({ ...state.look, dress: state.dressIdx })); } catch (e) {}
}

function loadLook() {
    try {
        const d = JSON.parse(localStorage.getItem(LOOK_KEY));
        if (d && typeof d === 'object') {
            ['hat', 'back', 'face', 'hairdo', 'clip', 'sparkle'].forEach(k => { if (typeof d[k] === 'string') state.look[k] = d[k]; });
            if (Number.isInteger(d.hair) && d.hair >= 0 && d.hair < HAIRS.length) state.look.hair = d.hair;
            if (d.neck && Array.isArray(d.neck.beads)) state.look.neck = { beads: d.neck.beads.slice(0, 14), pendant: d.neck.pendant || null };
            if (Number.isInteger(d.dress) && d.dress >= 0 && d.dress < DRESSES.length) state.dressIdx = d.dress;
        }
    } catch (e) {}
}

function applyDress() {
    const color = DRESSES[state.dressIdx];
    document.querySelectorAll('svg[data-prefix]').forEach(svg => {
        const fill = color === 'rainbow' ? `url(#${svg.dataset.prefix}rb)` : color;
        svg.querySelectorAll('.dress').forEach(d => d.setAttribute('fill', fill));
    });
}

/* ─────────── Build world ─────────── */
function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
}

function place(node, x, y) {
    node.style.position = 'absolute';
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    world.appendChild(node);
    return node;
}

// Tappable object: princess walks to walkX, then action runs.
function addObj(html, x, y, walkX, action) {
    const node = place(el(html), x, y);
    node.classList.add('obj');
    registerStickerObj(node, walkX);
    node.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (state.busy) return;
        stickerTap(node);
        node.classList.remove('tap');
        void node.offsetWidth;
        node.classList.add('tap');
        playPop();
        const r = node.getBoundingClientRect();
        const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 3);
        burst(p.x, p.y, 14);
        walkTo(walkX, action ? () => action(node) : null);
    });
    return node;
}

