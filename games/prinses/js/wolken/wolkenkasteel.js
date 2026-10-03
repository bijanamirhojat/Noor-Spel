/* 🏰 Wolkenkasteel: harp, wolkenschaapje en het wolkenbed om wolkjes te kijken */
defineRoom({
    key: 'wolkenkasteel',
    name: 'Wolkenkasteel',
    icon: '🏰',
    say: 'Het wolkenkasteel',
    build(k0) {
        place(el(`<div class="cloud-castle">
            <div class="cc-tower" style="left:0;height:200px"></div>
            <div class="cc-tower" style="left:135px;height:260px"></div>
            <div class="cc-tower" style="left:270px;height:200px"></div>
            <div class="cc-body"><div class="cc-door"></div></div>
        </div>`), k0 + 230, 60);
        addObj(`<div class="harp"><svg viewBox="0 0 100 160">
            <path d="M18 150 L18 30 Q20 6 46 10 Q78 16 86 52 Q92 90 70 150 Z" fill="none" stroke="#f59e0b" stroke-width="9" stroke-linejoin="round"/>
            ${[28, 37, 46, 55, 64, 73].map((x, i) => `<line x1="${x}" y1="${18 + i * 4}" x2="${x}" y2="146" stroke="#fef3c7" stroke-width="2.2"/>`).join('')}
            <circle cx="46" cy="10" r="6" fill="#fde047"/></svg></div>`, k0 + 60, 230, k0 + 150, (node) => {
            bounceEl(node, 'wobble');
            [523, 659, 784, 988, 1175, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.8, 0.07, 'sine'), i * 70));
            sparkleShower(k0 + 110, 220, 24);
        });
        addObj(`<div class="cloud-bed"><div class="cb-puffs"></div><span class="cb-pillow">🌙</span>
            <div class="tap-hint" style="left:100px;top:-46px">👇</div></div>`, k0 + 380, 320, k0 + 470, openCloudWatch);
        addObj('<div class="emoji-obj cloud-sheep">🐑</div>', k0 + 680, 360, k0 + 660, (node) => {
            bounceEl(node, 'jump');
            playFreqSweep(500, 420, 0.35, 0.15);
            setTimeout(() => playFreqSweep(480, 380, 0.4, 0.13), 380);
        });
    }
});

/* ─────────── Wolkjes kijken ─────────── */
const CLOUD_SHAPES = ['🐰', '🐶', '🐱', '🐳', '🦋', '🐘', '🦄', '🐢', '🐟', '🦕', '🌸', '❤️', '⭐', '🚂', '🎈', '🐌', '🦆', '🍦'];
const CLOUD_KEY = 'noor-prinses-wolkjes';
const cloudOv = document.getElementById('cloudOv');
let cloudOpen = false;
let cloudTimer = null;
let cloudSeen = new Set();
try {
    const s = JSON.parse(localStorage.getItem(CLOUD_KEY));
    if (Array.isArray(s)) cloudSeen = new Set(s.filter(x => CLOUD_SHAPES.includes(x)));
} catch (e) {}

function renderCloudSeen() {
    document.getElementById('cwSeen').innerHTML = CLOUD_SHAPES.map(s =>
        `<span class="${cloudSeen.has(s) ? 'got' : ''}">${s}</span>`).join('');
}

function spawnCloudShape(head = 0) {
    const sky = document.getElementById('cwSky');
    if (sky.querySelectorAll('.cw-cloud:not(.seen)').length >= 4) return;
    // Mostly shapes she has not found yet
    const fresh = CLOUD_SHAPES.filter(s => !cloudSeen.has(s));
    const shape = Math.random() < 0.75 && fresh.length ? randomPick(fresh) : randomPick(CLOUD_SHAPES);
    const c = el(`<div class="cw-cloud"><span>${shape}</span></div>`);
    c.style.top = (8 + Math.random() * 55) + '%';
    const dur = 13 + Math.random() * 5;
    c.style.animationDuration = dur + 's';
    c.style.animationDelay = (-head * dur) + 's';   // head start: already part-way across
    sky.appendChild(c);
    c.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (c.classList.contains('seen')) return;
        c.classList.add('seen');
        ovCheer(cloudOv, c, ['✨', '💖', '⭐']);
        [784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.1, 'sine'), i * 90));
        const isNew = !cloudSeen.has(shape);
        cloudSeen.add(shape);
        try { localStorage.setItem(CLOUD_KEY, JSON.stringify([...cloudSeen])); } catch (err) {}
        renderCloudSeen();
        if (isNew && cloudSeen.size === CLOUD_SHAPES.length) {
            setTimeout(() => { playWin(); showToast('☁️ Alle wolkjes gevonden! 🎉', 2600); }, 500);
        }
    });
    setTimeout(() => c.remove(), dur * (1 - head) * 1000);
}

function openCloudWatch() {
    cloudOpen = true;
    cloudOv.classList.add('open');
    renderCloudSeen();
    document.getElementById('cwSky').innerHTML = '';
    spawnCloudShape(0.3);
    setTimeout(() => spawnCloudShape(0.1), 1200);
    cloudTimer = setInterval(spawnCloudShape, 2600);
    playLullaby();
}

function closeCloudWatch() {
    cloudOpen = false;
    clearInterval(cloudTimer);
    cloudOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('cwClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeCloudWatch(); });
cloudOv.addEventListener('pointerdown', (e) => e.stopPropagation());
