/* 🏆 Trofeeënkamer: een vol stickerboek ruil je in voor een trofee (zie js/stickers.js).
   Daarna begint het boek weer leeg en vult deze kamer zich langzaam. */
const TROPHY_KEY = 'noor-prinses-trofeeen';
const TROPHIES = [
    { e: '🏆', name: 'Gouden beker' }, { e: '⭐', name: 'Grote ster' }, { e: '👑', name: 'Gouden kroon' },
    { e: '💎', name: 'Diamant' }, { e: '🦄', name: 'Eenhoornbeeld' }, { e: '🌈', name: 'Regenboog' },
    { e: '🏅', name: 'Medaille' }, { e: '🌟', name: 'Stralende ster' }, { e: '💖', name: 'Gouden hart' },
    { e: '🔮', name: 'Toverbol' }, { e: '🪄', name: 'Toverstaf' }, { e: '🎀', name: 'Gouden strik' }
];
const TROPHY_SLOTS = 12;
const TROPHY_SHELVES = [110, 210, 310];     // y van de planken (bovenkant)
let trophies = 0;

try {
    const n = parseInt(localStorage.getItem(TROPHY_KEY), 10);
    if (n > 0) trophies = n;
} catch (e) {}

function saveTrophies() {
    try { localStorage.setItem(TROPHY_KEY, String(trophies)); } catch (e) {}
}

function trophyAt(i) { return TROPHIES[i % TROPHIES.length]; }

// World position of trophy slot i (in its room)
function trophySlotPos(i) {
    return { x: roomX('trofeekamer') + 150 + (i % 4) * 150, y: TROPHY_SHELVES[Math.floor(i / 4) % 3] };
}

defineRoom({
    key: 'trofeekamer',
    name: 'Trofeeënkamer',
    icon: '🏆',
    say: 'De trofeeënkamer',
    build(x) {
        place(el('<div class="trophy-banner" id="trophyBanner"></div>'), x + 250, 58);
        TROPHY_SHELVES.forEach(y => place(el('<div class="trophy-shelf"></div>'), x + 100, y + 62));
        for (let i = 0; i < TROPHY_SLOTS; i++) {
            const p = { x: x + 150 + (i % 4) * 150, y: TROPHY_SHELVES[Math.floor(i / 4)] };
            const slot = addObj(`<div class="trophy-slot" data-i="${i}"><span class="tr-e"></span></div>`, p.x - 36, p.y - 4, p.x, () => {
                if (i >= trophies) return;
                slot.classList.remove('spin'); void slot.offsetWidth; slot.classList.add('spin');
                [1568, 2093, 2637].forEach((f, k) => setTimeout(() => playTone(f, 0.2, 0.08, 'sine'), k * 80));
                sparkleShower(p.x, p.y + 20, 20);
                showToast(`${trophyAt(i).e} ${trophyAt(i).name}`, 1500);
            });
        }
        addObj(`<div class="book-stand"><div class="book">📒</div><div class="count" id="bookStandCount"></div><div class="col"></div>
            <div class="tap-hint" style="left:30px;top:-50px">👇</div></div>`, x + 34, 330, x + 100, openStickers);
        renderTrophies();
    }
});

function renderTrophies() {
    document.querySelectorAll('.trophy-slot').forEach(s => {
        const i = +s.dataset.i;
        const has = i < trophies;
        s.classList.toggle('has', has);
        // Past 12 the shelves show the newest twelve
        const idx = trophies > TROPHY_SLOTS ? trophies - TROPHY_SLOTS + i : i;
        s.querySelector('.tr-e').textContent = has ? trophyAt(idx).e : '';
    });
    const banner = document.getElementById('trophyBanner');
    if (banner) banner.textContent = trophies ? `🏆 ${trophies} ${trophies === 1 ? 'trofee' : 'trofeeën'}!` : '🏆 Vul je stickerboek!';
    updateBookStand();
}

function updateBookStand() {
    const c = document.getElementById('bookStandCount');
    if (c) c.textContent = `${stickerCount()} / ${Object.keys(ROOM_AT).length}`;
}

// Full sticker book -> one trophy; the book starts over
function tradeStickers() {
    if (stickerCount() < Object.keys(ROOM_AT).length) return;
    const slot = Math.min(trophies, TROPHY_SLOTS - 1);
    const t = trophyAt(trophies);
    trophies++;
    saveTrophies();
    stickers.clear();
    stickFresh.clear();
    Object.keys(stickTapped).forEach(k => delete stickTapped[k]);
    saveStickers();
    updateStickerBtn();
    closeStickers();
    renderTrophies();
    playWin();
    showToast(`${t.e} Een nieuwe trofee! Op naar de trofeeënkamer!`, 2600);
    spellRain(['🏆', '⭐', '✨', t.e]);
    // Bring the princess to the trophy room to see it on the shelf
    const at = ROOM_AT.trofeekamer;
    setTimeout(() => {
        travelTo(at.scene.key, at.idx);
        setTimeout(() => {
            const p = trophySlotPos(slot);
            const node = document.querySelector(`.trophy-slot[data-i="${slot}"]`);
            node.classList.remove('new'); void node.offsetWidth; node.classList.add('new');
            sparkleShower(p.x, p.y + 20, 60);
            [784, 988, 1175, 1568, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 0.1, 'triangle'), i * 110));
        }, 900);
    }, 1600);
}
