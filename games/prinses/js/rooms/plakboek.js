/* 📖 Plakboekkamer: een boek met bladzijden om op te tekenen (vinger), letters en stickers te plakken.
   Elke bladzijde wordt bewaard als plaatje (localStorage). */
const SCRAP_KEY = 'noor-prinses-plakboek';
const SCRAP_PAGES = 8;
const SCRAP_W = 800;
const SCRAP_H = 600;
const SCRAP_COLORS = ['#111827', '#ef4444', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#3b82f6', '#a855f7', '#f472b6', '#92400e', '#9ca3af', '#ffffff'];
const SCRAP_SIZES = [8, 18, 34];
const SCRAP_STICKERS = ['🦄', '🐱', '🐶', '🐰', '🐞', '🦋', '🐠', '🐥', '🌸', '🌷', '🌻', '🌈', '⭐', '🌙', '☀️', '💖', '👑', '🎈', '🎂', '🍓', '🍦', '🏰', '🧸', '✨'];
const SCRAP_LETTER_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
const SCRAP_TOOLS = [['pen', '✏️'], ['rainbow', '🌈'], ['glitter', '✨'], ['eraser', '🧽'], ['letters', '🔤'], ['stickers', '⭐']];

let scrapPages = new Array(SCRAP_PAGES).fill(null);
let scrapLast = 0;
try {
    const d = JSON.parse(localStorage.getItem(SCRAP_KEY));
    if (d && Array.isArray(d.pages)) {
        d.pages.slice(0, SCRAP_PAGES).forEach((p, i) => { if (typeof p === 'string' && p.startsWith('data:image/')) scrapPages[i] = p; });
        if (Number.isInteger(d.last)) scrapLast = Math.max(0, Math.min(SCRAP_PAGES - 1, d.last));
    }
} catch (e) {}

function saveScrapbook() {
    const data = () => JSON.stringify({ pages: scrapPages, last: scrapLast });
    try { localStorage.setItem(SCRAP_KEY, data()); } catch (e) {
        // Storage full: keep at least the current page
        scrapPages = scrapPages.map((p, i) => (i === sb.page ? p : null));
        try { localStorage.setItem(SCRAP_KEY, data()); } catch (err) {}
    }
}

defineRoom({
    key: 'plakboek',
    name: 'Plakboekkamer',
    icon: '📖',
    say: 'De plakboekkamer',
    build(x) {
        place(el('<div class="scrap-frame"><img id="scrapThumb" alt=""><span>📖</span></div>'), x + 520, 70);
        addObj(`<div class="scrap-desk">
            <div class="book"><div class="pg l"></div><div class="pg r"></div><span class="doodle">🌈⭐</span></div>
            <div class="top"></div><div class="leg l"></div><div class="leg r"></div>
            <div class="tap-hint" style="left:110px;top:-50px">👇</div>
        </div>`, x + 180, 250, x + 300, openScrapbook);
        addObj('<div class="crayons"><span style="--c:#ef4444"></span><span style="--c:#facc15"></span><span style="--c:#22c55e"></span><span style="--c:#3b82f6"></span><span style="--c:#a855f7"></span><span style="--c:#ec4899"></span></div>',
            x + 40, 360, x + 80, (node) => {
                bounceEl(node, 'wobble');
                const r = node.getBoundingClientRect();
                const p = screenToWorld(r.left + r.width / 2, r.top);
                for (let i = 0; i < 24; i++) spawnSparkle(p.x, p.y, { speed: 120, hue: Math.random() * 360, size: 6 });
                playFreqSweep(500, 1300, 0.3, 0.1);
            });
        addObj('<div class="emoji-obj">✂️</div>', x + 640, 370, x + 660, (node) => {
            bounceEl(node, 'jump');
            [0, 160].forEach(t => setTimeout(() => playFreqSweep(2400, 1600, 0.06, 0.12), t));
        });
        renderScrapThumb();
    }
});

function renderScrapThumb() {
    const img = document.getElementById('scrapThumb');
    if (!img) return;
    const src = scrapPages[scrapLast] || scrapPages.find(Boolean);
    if (src) img.src = src;
    img.parentElement.classList.toggle('has', !!src);
}

/* ─────────── Plakboek (overlay) ─────────── */
const sbEl = document.getElementById('scrapOv');
const sbCanvas = document.getElementById('scrapCanvas');
const sbCtx = sbCanvas.getContext('2d');
let scrapOpen = false;
const sb = { page: 0, tool: 'pen', color: SCRAP_COLORS[1], size: 1, sticker: '🦄', letter: 'A', drawing: false, last: null, hue: 0, dirty: false, saveT: 0, clearArm: 0 };

function sbPaper() {
    sbCtx.fillStyle = '#fffdf7';
    sbCtx.fillRect(0, 0, SCRAP_W, SCRAP_H);
}

function loadScrapPage(i) {
    sb.page = i;
    sbPaper();
    const src = scrapPages[i];
    if (src) {
        const img = new Image();
        img.onload = () => { if (sb.page === i) sbCtx.drawImage(img, 0, 0, SCRAP_W, SCRAP_H); };
        img.src = src;
    }
    document.getElementById('scrapPageNo').textContent = `${i + 1} / ${SCRAP_PAGES}`;
}

function storeScrapPage() {
    if (!sb.dirty) return;
    sb.dirty = false;
    scrapPages[sb.page] = sbCanvas.toDataURL('image/jpeg', 0.82);
    scrapLast = sb.page;
    saveScrapbook();
    renderScrapThumb();
}

function turnScrapPage(d) {
    const next = sb.page + d;
    if (next < 0 || next >= SCRAP_PAGES) return;
    storeScrapPage();
    const book = document.getElementById('scrapBook');
    book.classList.remove('turn-l', 'turn-r'); void book.offsetWidth;
    book.classList.add(d > 0 ? 'turn-r' : 'turn-l');
    loadScrapPage(next);
    playFreqSweep(900, 1300, 0.12, 0.08);
}

function sbPoint(e) {
    const r = sbCanvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * SCRAP_W, y: (e.clientY - r.top) / r.height * SCRAP_H };
}

function sbStroke(a, b) {
    const w = SCRAP_SIZES[sb.size];
    if (sb.tool === 'glitter') {
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const n = Math.max(1, Math.round(d / 6));
        for (let i = 0; i < n; i++) {
            const t = i / n;
            const x = a.x + (b.x - a.x) * t + (Math.random() - 0.5) * w * 1.6;
            const y = a.y + (b.y - a.y) * t + (Math.random() - 0.5) * w * 1.6;
            sbCtx.fillStyle = Math.random() < 0.35 ? '#fff' : `hsl(${Math.random() * 360}, 90%, 65%)`;
            const s = 2 + Math.random() * w * 0.25;
            sbCtx.beginPath();
            sbCtx.moveTo(x, y - s * 2); sbCtx.lineTo(x + s * 0.6, y - s * 0.6); sbCtx.lineTo(x + s * 2, y);
            sbCtx.lineTo(x + s * 0.6, y + s * 0.6); sbCtx.lineTo(x, y + s * 2); sbCtx.lineTo(x - s * 0.6, y + s * 0.6);
            sbCtx.lineTo(x - s * 2, y); sbCtx.lineTo(x - s * 0.6, y - s * 0.6); sbCtx.closePath();
            sbCtx.fill();
        }
        return;
    }
    sbCtx.lineCap = 'round';
    sbCtx.lineJoin = 'round';
    sbCtx.lineWidth = sb.tool === 'eraser' ? w * 1.8 : w;
    if (sb.tool === 'rainbow') {
        sb.hue = (sb.hue + Math.hypot(b.x - a.x, b.y - a.y) * 0.8) % 360;
        sbCtx.strokeStyle = `hsl(${sb.hue}, 90%, 58%)`;
    } else {
        sbCtx.strokeStyle = sb.tool === 'eraser' ? '#fffdf7' : sb.color;
    }
    sbCtx.beginPath();
    sbCtx.moveTo(a.x, a.y);
    sbCtx.lineTo(b.x + 0.01, b.y);
    sbCtx.stroke();
}

function sbStamp(p) {
    const big = [70, 110, 160][sb.size];
    sbCtx.textAlign = 'center';
    sbCtx.textBaseline = 'middle';
    if (sb.tool === 'letters') {
        sbCtx.font = `${big}px 'Fredoka One', 'Arial Rounded MT Bold', sans-serif`;
        sbCtx.lineWidth = big * 0.12;
        sbCtx.strokeStyle = '#fff';
        sbCtx.strokeText(sb.letter, p.x, p.y);
        sbCtx.fillStyle = randomPick(SCRAP_LETTER_COLORS);
        sbCtx.fillText(sb.letter, p.x, p.y);
        playTone(600 + (sb.letter.charCodeAt(0) - 65) * 25, 0.15, 0.1, 'triangle');
    } else {
        sbCtx.font = `${big}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        sbCtx.fillText(sb.sticker, p.x, p.y);
        playPop();
    }
    // A little pop on top of the page
    const r = sbCanvas.getBoundingClientRect();
    const o = sbEl.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '⭐', '💖']);
        const a = Math.random() * Math.PI * 2;
        s.style.left = (r.left - o.left + p.x / SCRAP_W * r.width) + 'px';
        s.style.top = (r.top - o.top + p.y / SCRAP_H * r.height) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * 50 + 'px');
        s.style.setProperty('--dy', Math.sin(a) * 50 + 'px');
        sbEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    sb.dirty = true;
    scheduleScrapSave();
}

function scheduleScrapSave() {
    clearTimeout(sb.saveT);
    sb.saveT = setTimeout(storeScrapPage, 900);
}

sbCanvas.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const p = sbPoint(e);
    if (sb.tool === 'letters' || sb.tool === 'stickers') {
        sbStamp(p);
        return;
    }
    sb.drawing = true;
    sb.last = p;
    try { sbCanvas.setPointerCapture(e.pointerId); } catch (_) {}
    sbStroke(p, p);
    sb.dirty = true;
});
sbCanvas.addEventListener('pointermove', (e) => {
    if (!sb.drawing) return;
    const p = sbPoint(e);
    sbStroke(sb.last, p);
    sb.last = p;
    if (Math.random() < 0.15) playTone(300 + Math.random() * 200, 0.04, 0.03, 'sine');
});
const sbEnd = () => {
    if (!sb.drawing) return;
    sb.drawing = false;
    scheduleScrapSave();
};
sbCanvas.addEventListener('pointerup', sbEnd);
sbCanvas.addEventListener('pointercancel', sbEnd);

function renderScrapTools() {
    const box = document.getElementById('scrapTools');
    box.innerHTML = SCRAP_TOOLS.map(([k, ic]) => `<button class="du-tab${sb.tool === k ? ' active' : ''}" data-k="${k}">${ic}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        sb.tool = b.dataset.k;
        renderScrapTools();
        renderScrapOpts();
        playPop();
    }));
}

function renderScrapOpts() {
    const box = document.getElementById('scrapOpts');
    const sizes = `<span class="sb-sep"></span>` + SCRAP_SIZES.map((s, i) =>
        `<button class="sb-size${sb.size === i ? ' sel' : ''}" data-size="${i}"><span style="width:${6 + i * 9}px;height:${6 + i * 9}px"></span></button>`).join('');
    if (sb.tool === 'pen') {
        box.innerHTML = SCRAP_COLORS.map(c => `<button class="sb-color${sb.color === c ? ' sel' : ''}" data-c="${c}" style="--c:${c}"></button>`).join('') + sizes;
    } else if (sb.tool === 'letters') {
        box.innerHTML = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((l, i) =>
            `<button class="sb-letter${sb.letter === l ? ' sel' : ''}" data-l="${l}" style="color:${SCRAP_LETTER_COLORS[i % SCRAP_LETTER_COLORS.length]}">${l}</button>`).join('') + sizes;
    } else if (sb.tool === 'stickers') {
        box.innerHTML = SCRAP_STICKERS.map(s => `<button class="sb-sticker${sb.sticker === s ? ' sel' : ''}" data-s="${s}">${s}</button>`).join('') + sizes;
    } else {
        box.innerHTML = `<span class="sb-tip">${sb.tool === 'eraser' ? '🧽 Gummen' : sb.tool === 'rainbow' ? '🌈 Regenboogkwast' : '✨ Glitterkwast'}</span>` + sizes;
    }
    box.querySelectorAll('button').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.dataset.c) sb.color = b.dataset.c;
        if (b.dataset.l) sb.letter = b.dataset.l;
        if (b.dataset.s) sb.sticker = b.dataset.s;
        if (b.dataset.size) sb.size = +b.dataset.size;
        renderScrapOpts();
        playTone(900, 0.06, 0.08, 'sine');
    }));
}

document.getElementById('scrapPrev').addEventListener('pointerdown', (e) => { e.stopPropagation(); turnScrapPage(-1); });
document.getElementById('scrapNext').addEventListener('pointerdown', (e) => { e.stopPropagation(); turnScrapPage(1); });
// Clearing asks for a second tap, so a page is not wiped by accident
document.getElementById('scrapClear').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const now = performance.now();
    if (now - sb.clearArm > 2500) {
        sb.clearArm = now;
        btn.classList.add('arm');
        btn.textContent = '🗑️ Zeker?';
        setTimeout(() => { btn.classList.remove('arm'); btn.textContent = '🗑️'; }, 2500);
        playTone(300, 0.1, 0.1, 'triangle');
        return;
    }
    sb.clearArm = 0;
    btn.classList.remove('arm');
    btn.textContent = '🗑️';
    sbPaper();
    scrapPages[sb.page] = null;
    sb.dirty = false;
    saveScrapbook();
    renderScrapThumb();
    playFreqSweep(600, 150, 0.4, 0.12);
});

function openScrapbook() {
    scrapOpen = true;
    sbEl.classList.add('open');
    loadScrapPage(scrapLast);
    renderScrapTools();
    renderScrapOpts();
    playMusicBox();
}

function closeScrapbook() {
    clearTimeout(sb.saveT);
    storeScrapPage();
    scrapOpen = false;
    sb.drawing = false;
    sbEl.classList.remove('open');
    twirl();
    _playWhoosh();
}
document.getElementById('scrapClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeScrapbook(); });
sbEl.addEventListener('pointerdown', (e) => e.stopPropagation());
