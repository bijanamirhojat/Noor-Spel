/* 🌦️ Weermakerij: met de weermachine maak je zelf het weer */
defineRoom({
    key: 'weermakerij',
    name: 'Weermakerij',
    icon: '🌦️',
    say: 'De weermakerij',
    build(m0) {
        addObj('<div class="vane"><span class="vane-bird">🐓</span><div class="vane-pole"></div></div>', m0 + 60, 130, m0 + 90, (node) => {
            bounceEl(node.querySelector('.vane-bird'), 'spin');
            playFreqSweep(500, 1300, 0.5, 0.08);
        });
        addObj(`<div class="wx-machine">
            <div class="wxm-body"></div>
            <div class="wxm-screen">☀️</div>
            <div class="wxm-knobs"><span>🌧️</span><span>❄️</span><span>⚡</span></div>
            <div class="wxm-pipe"></div><span class="wxm-puff">☁️</span>
            <div class="tap-hint" style="left:150px;top:-40px">👇</div>
        </div>`, m0 + 230, 130, m0 + 400, openWeather);
        addObj('<div class="rain-cloud"><div class="rc-body"></div></div>', m0 + 610, 90, m0 + 670, (node) => {
            bounceEl(node, 'jump');
            for (let i = 0; i < 40; i++) {
                spawnSparkle(m0 + 620 + Math.random() * 120, 170 + Math.random() * 20, { vx: 0, vy: 260 + Math.random() * 80, g: 300, hue: 205, size: 3 + Math.random() * 2, max: 1 });
            }
            playFreqSweep(2500, 1500, 0.4, 0.05);
        });
    }
});

/* ─────────── Weermaker-overlay ─────────── */
const weatherOv = document.getElementById('weatherOv');
const wx = { now: 'zon', wet: 0, snow: 0, flowers: 0, timer: null, flashTimer: null };
let weatherOpen = false;
const WX_BUTTONS = [
    ['zon', '☀️', 'Zon'], ['regen', '🌧️', 'Regen'], ['sneeuw', '❄️', 'Sneeuw'],
    ['onweer', '⚡', 'Onweer'], ['wind', '💨', 'Wind'], ['regenboog', '🌈', 'Regenboog']
];

function renderWeatherTray() {
    document.getElementById('wxTray').innerHTML = WX_BUTTONS.map(([k, e, n]) =>
        `<button class="bd-btn wx-btn${wx.now === k ? ' sel' : ''}" data-k="${k}">${e}<small>${n}</small></button>`).join('');
    document.querySelectorAll('.wx-btn').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        setWeather(b.dataset.k);
    }));
}

function wxDrops(kind, n) {
    const fall = document.getElementById('wxFall');
    fall.innerHTML = '';
    for (let i = 0; i < n; i++) {
        const d = document.createElement('span');
        d.className = 'wx-' + kind;
        if (kind === 'snow') d.textContent = '❄';
        d.style.left = (Math.random() * 100) + '%';
        d.style.animationDuration = (kind === 'snow' ? 3 + Math.random() * 3 : 0.6 + Math.random() * 0.4) + 's';
        d.style.animationDelay = (-Math.random() * 3) + 's';
        fall.appendChild(d);
    }
}

function setWeather(k) {
    const stage = document.getElementById('wxStage');
    const prev = wx.now;
    wx.now = k;
    clearInterval(wx.timer);
    clearInterval(wx.flashTimer);
    stopNoise();
    stage.className = 'wx-stage wx-' + k;
    document.getElementById('wxFall').innerHTML = '';
    if (k === 'regen' || k === 'onweer') {
        wxDrops('rain', 70);
        startNoise('shower');
        wx.wet = Math.max(1, wx.wet);
        if (k === 'onweer') {
            const flash = () => {
                stage.classList.remove('flash'); void stage.offsetWidth; stage.classList.add('flash');
                setTimeout(() => { playFreqSweep(90, 40, 1.2, 0.25); playFreqSweep(140, 60, 0.9, 0.12); }, 250);
            };
            flash();
            wx.flashTimer = setInterval(flash, 2600);
        } else {
            playFreqSweep(2400, 1200, 0.6, 0.05);
        }
    } else if (k === 'sneeuw') {
        wxDrops('snow', 45);
        wx.snow = Math.max(1, wx.snow);
        [1568, 1319, 1175, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.4, 0.06, 'sine'), i * 200));
    } else if (k === 'wind') {
        startNoise('dryer');
        playFreqSweep(300, 600, 1.2, 0.08);
    } else if (k === 'zon') {
        playMusicBox();
        wx.snow = Math.max(0, wx.snow - 2);
        // Sun after rain: the flowers grow and a rainbow appears
        if (wx.wet > 0) {
            wx.flowers = Math.min(3, wx.flowers + 1);
            wx.wet = 0;
            stage.classList.add('wx-regenboog-too');
            setTimeout(() => { playWin(); showToast('🌈 Zon na regen: een regenboog!', 2200); }, 600);
        }
    } else if (k === 'regenboog') {
        playMelody();
    }
    if (prev === 'zon' && k === 'zon') bounceEl(document.getElementById('wxSun'), 'jump');
    // Rain makes the puddle grow, snow piles up until there is a snowman
    if (k === 'regen' || k === 'onweer' || k === 'sneeuw') {
        wx.timer = setInterval(() => {
            if (k === 'sneeuw' && wx.snow < 3) {
                wx.snow++;
                if (wx.snow === 3) { playCorrect(); showToast('⛄ Een sneeuwpop!', 1600); }
            } else if (k !== 'sneeuw' && wx.wet < 3) {
                wx.wet++;
            }
            updateWeatherStage();
        }, 2200);
    }
    updateWeatherStage();
    renderWeatherTray();
}

function updateWeatherStage() {
    const stage = document.getElementById('wxStage');
    stage.dataset.snow = wx.snow;
    stage.dataset.wet = wx.wet;
    stage.dataset.flowers = wx.flowers;
}

function openWeather() {
    weatherOpen = true;
    weatherOv.classList.add('open');
    wx.wet = 0; wx.snow = 0; wx.flowers = 0;
    setWeather('zon');
}

function closeWeather() {
    weatherOpen = false;
    clearInterval(wx.timer);
    clearInterval(wx.flashTimer);
    stopNoise();
    weatherOv.classList.remove('open');
    _playWhoosh();
}

document.getElementById('wxClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeWeather(); });
weatherOv.addEventListener('pointerdown', (e) => e.stopPropagation());
