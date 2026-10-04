/* 📸 Fotostudio: kies een achtergrond, zet de prinses, Mama, Papa en allerlei dingen neer,
   en maak een foto. Foto's hangen aan de muur (localStorage) en kun je bewaren op de iPad. */
const PHOTO_KEY = 'noor-prinses-fotos';
const PHOTO_MAX = 6;
const PHOTO_W = 640;
const PHOTO_H = 480;
// stops: [colour, position]; deco: [emoji, x%, y%, size (% of the width)]
const BACKDROPS = {
    kasteel: { icon: '🏰', stops: [['#fce7f3', 0], ['#e9d5ff', 1]], deco: [['🏰', 18, 40, 26], ['🏰', 84, 42, 22], ['✨', 50, 12, 8], ['💖', 70, 14, 6]] },
    strand: { icon: '🏖️', stops: [['#7dd3fc', 0], ['#bae6fd', 0.58], ['#fde68a', 0.6], ['#fcd34d', 1]], deco: [['☀️', 86, 14, 14], ['🌴', 12, 50, 24], ['🐚', 72, 90, 7], ['⛵', 40, 50, 8]] },
    ruimte: { icon: '🚀', stops: [['#1e1b4b', 0], ['#4c1d95', 1]], deco: [['🪐', 82, 20, 16], ['🌙', 14, 16, 12], ['⭐', 40, 10, 5], ['⭐', 62, 34, 4], ['⭐', 28, 46, 4], ['🚀', 16, 76, 12]] },
    bos: { icon: '🌳', stops: [['#e0f2fe', 0], ['#bbf7d0', 0.6], ['#4ade80', 0.62], ['#16a34a', 1]], deco: [['🌳', 12, 44, 30], ['🌲', 88, 44, 30], ['🍄', 28, 90, 8], ['🌼', 72, 92, 7]] },
    zee: { icon: '🐠', stops: [['#22d3ee', 0], ['#1e3a8a', 1]], deco: [['🐠', 18, 28, 10], ['🐙', 84, 76, 14], ['🫧', 62, 18, 7], ['🪸', 12, 86, 14], ['🐟', 76, 36, 8]] },
    regenboog: { icon: '🌈', stops: [['#fef3c7', 0], ['#fbcfe8', 1]], deco: [['🌈', 50, 30, 50], ['☁️', 14, 44, 14], ['☁️', 86, 44, 14]] },
    feest: { icon: '🎉', stops: [['#fde68a', 0], ['#f9a8d4', 1]], deco: [['🎈', 10, 26, 14], ['🎈', 90, 22, 14], ['🎉', 50, 12, 12], ['🎊', 28, 14, 9], ['🎊', 72, 14, 9]] }
};
const STUDIO_PROPS = ['prinses', 'mama', 'papa', '🦄', '🐱', '🐶', '🐰', '🐔', '🐞', '🦋', '🌸', '🌷', '🌈', '⭐', '🎈', '🎂', '🧸', '🍭', '🍦', '👑', '💖', '✨'];
const STUDIO_PEOPLE = {
    prinses: { icon: '👸', svg: () => princessSVG('ph'), s: 26 },
    mama: { icon: '👩', svg: () => queenSVG(), s: 26 },
    papa: { icon: '🤴', svg: () => kingSVG(), s: 26 }
};

let photos = [];
try {
    const d = JSON.parse(localStorage.getItem(PHOTO_KEY));
    if (Array.isArray(d)) photos = d.filter(p => typeof p === 'string' && p.startsWith('data:image/')).slice(-PHOTO_MAX);
} catch (e) {}

function savePhotos() {
    // If storage is full, drop the oldest photo until it fits
    while (photos.length) {
        try { localStorage.setItem(PHOTO_KEY, JSON.stringify(photos)); return; } catch (e) { photos.shift(); }
    }
}

defineRoom({
    key: 'fotostudio',
    name: 'Fotostudio',
    icon: '📸',
    say: 'De fotostudio',
    build(x) {
        place(el('<div class="studio-light l"></div>'), x + 20, 60);
        addObj(`<div class="studio-camera">
            <div class="cam"><div class="lens"></div><div class="flash"></div></div>
            <div class="leg l"></div><div class="leg r"></div><div class="leg m"></div>
            <div class="tap-hint" style="left:30px;top:-46px">👇</div>
        </div>`, x + 120, 170, x + 170, openStudio);
        place(el('<div class="photo-wall-title">📸 Mijn foto\'s</div>'), x + 480, 58);
        for (let i = 0; i < PHOTO_MAX; i++) {
            const fx = x + 330 + (i % 3) * 150;
            const fy = 100 + Math.floor(i / 3) * 120;
            addObj(`<div class="photo-frame" data-i="${i}"><img alt=""></div>`, fx, fy, fx + 60, () => {
                const src = photos[photos.length - 1 - i];
                if (src) openPhotoView(src);
            });
        }
        renderPhotoWall();
    }
});

// Newest photo first
function renderPhotoWall() {
    document.querySelectorAll('.photo-frame').forEach(f => {
        const src = photos[photos.length - 1 - (+f.dataset.i)];
        f.classList.toggle('has', !!src);
        const img = f.querySelector('img');
        if (src) img.src = src; else img.removeAttribute('src');
    });
}

/* ─────────── Fotostudio (overlay) ─────────── */
const studioEl = document.getElementById('studioOv');
const studioStage = document.getElementById('studioStage');
let studioOpen = false;
let studioTab = 'props';
const st = { bd: 'kasteel', items: [], sel: null, drag: null };

function renderBackdrop() {
    const b = BACKDROPS[st.bd];
    const bg = studioStage.querySelector('.studio-bg');
    bg.style.background = `linear-gradient(180deg, ${b.stops.map(([c, p]) => `${c} ${p * 100}%`).join(', ')})`;
    bg.innerHTML = b.deco.map(([e, x, y, s]) => `<span style="left:${x}%;top:${y}%;--s:${s}">${e}</span>`).join('');
}

function itemHTML(it) {
    return STUDIO_PEOPLE[it.k] ? `<div class="person">${STUDIO_PEOPLE[it.k].svg()}</div>` : `<span>${it.k}</span>`;
}

function addStudioItem(k, x = 30 + Math.random() * 40, y = 35 + Math.random() * 30) {
    if (STUDIO_PEOPLE[k]) {
        const had = st.items.find(i => i.k === k);
        if (had) { selectItem(had); bounceEl(had.el, 'jump'); return; }
    }
    const it = { k, x, y, s: STUDIO_PEOPLE[k] ? STUDIO_PEOPLE[k].s : 14, el: null };
    it.el = el(`<div class="studio-item${STUDIO_PEOPLE[k] ? ' people' : ''}">${itemHTML(it)}</div>`);
    studioStage.appendChild(it.el);
    it.el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        selectItem(it);
        const r = studioStage.getBoundingClientRect();
        st.drag = { it, dx: e.clientX - (r.left + it.x / 100 * r.width), dy: e.clientY - (r.top + it.y / 100 * r.height), id: e.pointerId };
        try { it.el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    st.items.push(it);
    if (k === 'prinses') applyLook();
    placeItem(it);
    selectItem(it);
    it.el.classList.add('pop');
}

function placeItem(it) {
    it.el.style.left = it.x + '%';
    it.el.style.top = it.y + '%';
    it.el.style.setProperty('--s', it.s);
}

function selectItem(it) {
    st.sel = it;
    // Bring to front
    st.items = st.items.filter(i => i !== it).concat(it);
    studioStage.appendChild(it.el);
    st.items.forEach(i => i.el.classList.toggle('sel', i === it));
    document.getElementById('studioEdit').classList.toggle('show', !!it);
}

function deselect() {
    st.sel = null;
    st.items.forEach(i => i.el.classList.remove('sel'));
    document.getElementById('studioEdit').classList.remove('show');
}

studioStage.addEventListener('pointerdown', (e) => { e.stopPropagation(); deselect(); });
studioEl.addEventListener('pointermove', (e) => {
    const d = st.drag;
    if (!d || e.pointerId !== d.id) return;
    const r = studioStage.getBoundingClientRect();
    d.it.x = Math.max(0, Math.min(100, (e.clientX - d.dx - r.left) / r.width * 100));
    d.it.y = Math.max(0, Math.min(100, (e.clientY - d.dy - r.top) / r.height * 100));
    placeItem(d.it);
});
const endStudioDrag = (e) => { if (st.drag && e.pointerId === st.drag.id) st.drag = null; };
studioEl.addEventListener('pointerup', endStudioDrag);
studioEl.addEventListener('pointercancel', endStudioDrag);

function renderStudioTabs() {
    const box = document.getElementById('studioTabs');
    box.innerHTML = [['bd', '🖼️'], ['props', '🧸']].map(([k, ic]) => `<button class="du-tab${studioTab === k ? ' active' : ''}" data-k="${k}">${ic}</button>`).join('');
    box.querySelectorAll('.du-tab').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        studioTab = b.dataset.k;
        renderStudioTabs();
        renderStudioOpts();
        playPop();
    }));
}

function renderStudioOpts() {
    const box = document.getElementById('studioOpts');
    if (studioTab === 'bd') {
        box.innerHTML = Object.entries(BACKDROPS).map(([k, b]) => `<button class="du-opt${st.bd === k ? ' sel' : ''}" data-v="${k}"
            style="background:linear-gradient(180deg, ${b.stops.map(([c, p]) => `${c} ${p * 100}%`).join(', ')})">${b.icon}</button>`).join('');
    } else {
        box.innerHTML = STUDIO_PROPS.map(k => `<button class="du-opt" data-v="${k}">${STUDIO_PEOPLE[k] ? STUDIO_PEOPLE[k].icon : k}</button>`).join('');
    }
    box.querySelectorAll('.du-opt').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (studioTab === 'bd') {
            st.bd = b.dataset.v;
            renderBackdrop();
            renderStudioOpts();
            playFreqSweep(600, 1200, 0.2, 0.1);
        } else {
            addStudioItem(b.dataset.v);
            playPop();
        }
    }));
}

function resizeSelected(f) {
    const it = st.sel;
    if (!it) return;
    it.s = Math.max(5, Math.min(60, it.s * f));
    placeItem(it);
    playTone(f > 1 ? 880 : 520, 0.1, 0.1, 'sine');
}
document.getElementById('studioBigger').addEventListener('pointerdown', (e) => { e.stopPropagation(); resizeSelected(1.2); });
document.getElementById('studioSmaller').addEventListener('pointerdown', (e) => { e.stopPropagation(); resizeSelected(1 / 1.2); });
document.getElementById('studioDelete').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const it = st.sel;
    if (!it) return;
    it.el.remove();
    st.items = st.items.filter(i => i !== it);
    deselect();
    playFreqSweep(600, 150, 0.3, 0.12);
});

/* Taking the photo: draw backdrop + items on a canvas (people via their svg as an image) */
function svgImage(svgEl, w, h) {
    return new Promise((resolve) => {
        const clone = svgEl.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', w);
        clone.setAttribute('height', h);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    });
}

function drawEmoji(ctx, e, x, y, size) {
    ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(e, x, y);
}

async function renderPhoto() {
    const cv = document.createElement('canvas');
    cv.width = PHOTO_W;
    cv.height = PHOTO_H;
    const ctx = cv.getContext('2d');
    const b = BACKDROPS[st.bd];
    const g = ctx.createLinearGradient(0, 0, 0, PHOTO_H);
    b.stops.forEach(([c, p]) => g.addColorStop(p, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, PHOTO_W, PHOTO_H);
    b.deco.forEach(([e, x, y, s]) => drawEmoji(ctx, e, x / 100 * PHOTO_W, y / 100 * PHOTO_H, s / 100 * PHOTO_W));
    for (const it of st.items) {
        const cx = it.x / 100 * PHOTO_W;
        const cy = it.y / 100 * PHOTO_H;
        const w = it.s / 100 * PHOTO_W;
        if (STUDIO_PEOPLE[it.k]) {
            const h = w * 1.6;
            const img = await svgImage(it.el.querySelector('svg'), Math.round(w), Math.round(h));
            if (img) ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
        } else {
            drawEmoji(ctx, it.k, cx, cy, w);
        }
    }
    // A little white photo border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 16;
    ctx.strokeRect(0, 0, PHOTO_W, PHOTO_H);
    return cv.toDataURL('image/jpeg', 0.8);
}

document.getElementById('studioSnap').addEventListener('pointerdown', async (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (btn.disabled) return;
    btn.disabled = true;
    deselect();
    // Click! and a flash
    playFreqSweep(2000, 800, 0.08, 0.15);
    setTimeout(() => playFreqSweep(1200, 400, 0.12, 0.12), 90);
    const flash = document.getElementById('studioFlash');
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    let src = null;
    try { src = await renderPhoto(); } catch (err) {}
    btn.disabled = false;
    if (!src) return;
    photos.push(src);
    if (photos.length > PHOTO_MAX) photos.shift();
    savePhotos();
    renderPhotoWall();
    playWin();
    const card = document.getElementById('studioCard');
    card.querySelector('img').src = src;
    card.classList.remove('show'); void card.offsetWidth; card.classList.add('show');
    setTimeout(() => card.classList.remove('show'), 2600);
});

function openStudio() {
    studioOpen = true;
    studioEl.classList.add('open');
    if (!st.items.length) {
        renderBackdrop();
        addStudioItem('prinses', 50, 58);
        deselect();
    }
    applyLook();
    renderStudioTabs();
    renderStudioOpts();
    playMusicBox();
}

function closeStudio() {
    studioOpen = false;
    st.drag = null;
    studioEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('studioClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeStudio(); });
studioEl.addEventListener('pointerdown', (e) => e.stopPropagation());

/* ─────────── Foto bekijken + bewaren ─────────── */
const photoViewEl = document.getElementById('photoView');
let photoViewOpen = false;

function openPhotoView(src) {
    photoViewOpen = true;
    photoViewEl.querySelector('img').src = src;
    photoViewEl.classList.add('open');
    playPop();
}

function closePhotoView() {
    photoViewOpen = false;
    photoViewEl.classList.remove('open');
}

// Save to the iPad: the share sheet has "Bewaar afbeelding"; otherwise download the file
document.getElementById('photoSave').addEventListener('pointerdown', async (e) => {
    e.stopPropagation();
    const src = photoViewEl.querySelector('img').src;
    try {
        const blob = await (await fetch(src)).blob();
        const file = new File([blob], 'prinses-foto.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file] });
            return;
        }
    } catch (err) {
        if (err && err.name === 'AbortError') return;
    }
    const a = document.createElement('a');
    a.href = src;
    a.download = 'prinses-foto.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
});
document.getElementById('photoViewClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closePhotoView(); });
photoViewEl.addEventListener('pointerdown', (e) => e.stopPropagation());
