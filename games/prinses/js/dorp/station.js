/* 🚂 Station: stap in en maak een (filmische) treinrit langs het hele koninkrijk.
   De rit is een overlay met lagen die met verschillende snelheid voorbij schuiven (parallax),
   filmbalken, titels per plek, dag/nacht en een regenboogspoor door de wolken. */
const TR_H = 600;            // logical scene height; everything inside is in these units
const TR_GROUND = 470;       // y of the rails
const TR_SPEED = 250;        // px per second at full speed
const TR_LAYERS = { far: 0.25, mid: 0.6, near: 1, front: 1.5 };

// Each part of the trip: length, sky, optional mode, title, and items [layer, x, bottom, html]
const TR_SEGS = [
    { len: 800, sky: 'day', items: [
        ['mid', 120, 0, '<div class="tr-house" style="--c:#fde68a;--r:#ef4444"></div>'], ['mid', 380, 0, '<div class="tr-house" style="--c:#fbcfe8;--r:#a855f7"></div>'],
        ['near', 300, 0, '<div class="tr-platform"><span>👋</span><span>👧</span><span>👦</span><span>🐶</span></div>'],
        ['far', 200, 0, '<div class="tr-hill" style="width:900px"></div>']] },
    { len: 1500, sky: 'day', title: '🏰 Het kasteel', zoom: true, items: [
        ['far', 0, 0, '<div class="tr-hill" style="width:1200px"></div>'],
        ['mid', 420, 10, '<div class="tr-big" style="font-size:300px">🏰</div>'],
        ['near', 760, 0, '<div class="tr-person">{{queen}}</div>'], ['near', 860, 0, '<div class="tr-person">{{king}}</div>'],
        ['near', 1100, 0, '<div class="tr-e" style="font-size:60px">🌷🌷🌷</div>'], ['front', 1200, -20, '<div class="tr-e" style="font-size:150px">🌳</div>']] },
    { len: 1500, sky: 'day', title: '🦄 De eenhoornweide', runner: true, items: [
        ['far', 100, 0, '<div class="tr-rainbow"></div>'], ['far', 0, 0, '<div class="tr-hill" style="width:1100px"></div>'],
        ['mid', 200, 0, '<div class="tr-e" style="font-size:160px">🌳</div>'], ['mid', 900, 0, '<div class="tr-e" style="font-size:180px">🌳</div>'],
        ['near', 100, 0, '<div class="tr-e" style="font-size:50px">🌸🌼🌷🌸🌼</div>'], ['near', 700, 0, '<div class="tr-e" style="font-size:50px">🌼🌷🌸🌼🌷</div>'],
        ['front', 600, -30, '<div class="tr-e" style="font-size:120px">🌻</div>']] },
    { len: 1600, sky: 'sea', mode: 'beach', title: '🌊 De zee', items: [
        ['mid', 0, 0, '<div class="tr-water" style="width:1300px"></div>'],
        ['mid', 250, 40, '<div class="tr-e tr-dolphin">🐬</div>'], ['mid', 650, 40, '<div class="tr-e tr-dolphin" style="animation-delay:-1s">🐬</div>'],
        ['mid', 480, 70, '<div class="tr-e" style="font-size:70px">⛵</div>'], ['mid', 950, 50, '<div class="tr-e tr-whale">🐳</div>'],
        ['near', 300, 0, '<div class="tr-e" style="font-size:40px">🦀</div>'], ['near', 900, 0, '<div class="tr-e" style="font-size:40px">🐚 ⭐</div>'],
        ['far', 300, 260, '<div class="tr-e" style="font-size:90px">☀️</div>']] },
    { len: 1300, sky: 'day', title: '🐔 De boerderij', items: [
        ['far', 0, 0, '<div class="tr-hill" style="width:1000px"></div>'],
        ['mid', 200, 0, '<div class="tr-barn"></div>'],
        ['near', 500, 0, '<div class="tr-e" style="font-size:80px">🐄</div>'], ['near', 650, 0, '<div class="tr-e" style="font-size:64px">🐑</div>'],
        ['near', 790, 0, '<div class="tr-e" style="font-size:64px">🐷</div>'], ['near', 920, 0, '<div class="tr-e" style="font-size:48px">🐔🐥🐥</div>'],
        ['front', 1100, -20, '<div class="tr-e" style="font-size:130px">🌾</div>']] },
    { len: 900, sky: 'tunnel', mode: 'tunnel', title: '🚇 Tunnel… oeeeh!', items: [
        ['near', 0, 0, '<div class="tr-tunnel-in"></div>'],
        ...[150, 330, 510, 690].map(x => ['near', x, 200, '<div class="tr-lamp"></div>'])] },
    { len: 1700, sky: 'cloud', mode: 'clouds', title: '☁️ Het wolkenrijk', zoom: true, items: [
        ['far', 300, 140, '<div class="tr-rainbow big"></div>'],
        ['mid', 300, 80, '<div class="tr-cloudcastle"><span>🏰</span></div>'], ['mid', 1000, 160, '<div class="tr-e" style="font-size:60px">🕊️</div>'],
        ['near', 200, 250, '<div class="tr-e" style="font-size:44px">⭐</div>'], ['near', 800, 290, '<div class="tr-e" style="font-size:50px">🌈</div>'],
        ['front', 500, 40, '<div class="tr-cloud"></div>'], ['front', 1300, 20, '<div class="tr-cloud"></div>']] },
    { len: 1500, sky: 'night', mode: 'night', title: '✨ De sterrennacht', items: [
        ['far', 0, 0, '<div class="tr-hill night" style="width:1100px"></div>'], ['far', 500, 300, '<div class="tr-e" style="font-size:90px">🌙</div>'],
        ['mid', 300, 260, '<div class="tr-shoot"></div>'], ['mid', 900, 300, '<div class="tr-shoot" style="animation-delay:-1.4s"></div>'],
        ['mid', 600, 0, '<div class="tr-e" style="font-size:200px;filter:brightness(0.5)">🏰</div>'],
        ['near', 300, 30, '<div class="tr-e tr-fly">✨</div>'], ['near', 800, 50, '<div class="tr-e tr-fly">✨</div>']] },
    { len: 1100, sky: 'dawn', title: '🏁 Thuis!', items: [
        ['far', 0, 0, '<div class="tr-hill" style="width:1000px"></div>'],
        ['mid', 1500, 0, '<div class="tr-house" style="--c:#bae6fd;--r:#f97316"></div>'],
        ['near', 1180, 0, '<div class="tr-platform"><span>🎉</span><span>👏</span><span>🐶</span><span>🎈</span></div>']] }
];
const TR_STOP = 120;         // the train stops this far before the end

defineRoom({
    key: 'station',
    name: 'Station',
    icon: '🚂',
    say: 'Het station',
    build(x) {
        villageHouse(x + 560, 200, 300, '#fecaca', '#7c3aed');
        place(el('<div class="st-sign">🚂 Station</div>'), x + 70, 70);
        place(el('<div class="st-clock"><span></span></div>'), x + 330, 60);
        place(el('<div class="st-platform"></div>'), x, 395).style.width = ROOM_W + 'px';
        addObj(`<div class="st-train">${trainHTML(false)}<div class="tap-hint" style="left:300px;top:-50px">👇</div></div>`, x + 40, 236, x + 380, openTrainRide);
    }
});

// The train: wagon (unicorn + cat), wagon (Mama & Papa), locomotive (princess). `people` = draw the riders.
function trainHTML(people) {
    return `<div class="tr-train-inner">
        <div class="tr-car c2"><div class="win">${people ? `<div class="tr-uni">${unicornSVG(uniLook, 'tru')}</div>` : ''}<span>🐱</span></div>${trWheels()}</div>
        <div class="tr-link"></div>
        <div class="tr-car c1"><div class="win">${people ? `<div class="tr-head">${queenSVG()}</div><div class="tr-head">${kingSVG()}</div>` : '<span>👑</span>'}</div>${trWheels()}</div>
        <div class="tr-link"></div>
        <div class="tr-loco">
            <div class="chimney"></div><div class="boiler"></div><div class="cab"><div class="win">${people ? `<div class="tr-head">${princessSVG('trp')}</div>` : '<span>👸</span>'}</div></div>
            <div class="nose"></div><div class="lamp"></div><div class="catcher"></div>${trWheels(true)}
        </div>
    </div>`;
}
function trWheels(big) {
    return `<div class="wheels${big ? ' big' : ''}"><span></span><span></span>${big ? '<span></span>' : ''}</div>`;
}

/* ─────────── Treinrit (overlay) ─────────── */
const trEl = document.getElementById('trainOv');
let trainOpen = false;
const tr = { dist: 0, speed: 0, seg: -1, raf: 0, last: 0, total: 0, starts: [], chugT: 0, puffT: 0, scale: 1, viewW: 1000, done: false };

function trBuild() {
    tr.starts = [];
    let s = 0;
    TR_SEGS.forEach(seg => { tr.starts.push(s); s += seg.len; });
    tr.total = s;
    const layers = {};
    Object.keys(TR_LAYERS).forEach(k => { layers[k] = ''; });
    TR_SEGS.forEach((seg, i) => {
        seg.items.forEach(([layer, x, bottom, html]) => {
            const f = TR_LAYERS[layer];
            const h = html.replace('{{queen}}', queenSVG()).replace('{{king}}', kingSVG());
            layers[layer] += `<div class="tr-item" style="left:${(tr.starts[i] + x) * f}px;bottom:${TR_H - TR_GROUND + bottom}px">${h}</div>`;
        });
    });
    Object.entries(layers).forEach(([k, h]) => { document.getElementById('trL_' + k).innerHTML = h; });
    document.getElementById('trTrain').innerHTML = trainHTML(true);
    document.getElementById('trRunner').innerHTML = unicornSVG(uniLook, 'trr');
    applyLook();
}

function trLayout() {
    const r = trEl.getBoundingClientRect();
    tr.scale = r.height / TR_H;
    tr.viewW = r.width / tr.scale;
    const sc = document.getElementById('trScene');
    sc.style.width = tr.viewW + 'px';
    sc.style.transform = `scale(${tr.scale})`;
    const trainX = tr.viewW * 0.12;
    document.getElementById('trTrain').style.left = trainX + 'px';
    document.getElementById('trRunner').style.left = (trainX + 560) + 'px';
}

function trTitle(text) {
    const t = document.getElementById('trTitle');
    t.textContent = text;
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    [784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 0.07, 'sine'), i * 140));
}

function trEnterSeg(i) {
    const seg = TR_SEGS[i];
    trEl.dataset.sky = seg.sky;
    trEl.dataset.mode = seg.mode || '';
    trEl.classList.toggle('zoom', !!seg.zoom);
    document.getElementById('trRunner').classList.toggle('on', !!seg.runner);
    if (seg.title) setTimeout(() => { if (trainOpen && tr.seg === i) trTitle(seg.title); }, 600);
    if (seg.mode === 'beach') setTimeout(() => [1800, 2100, 1800].forEach((f, k) => setTimeout(() => playFreqSweep(f, f * 0.8, 0.12, 0.05), k * 150)), 1500);
    if (seg.mode === 'clouds') trWhistle();
}

function trWhistle() {
    [[523, 0], [659, 0], [523, 350], [659, 350]].forEach(([f, t]) => setTimeout(() => playTone(f, 0.3, 0.09, 'square'), t));
    trPuff(true);
}

function trPuff(big) {
    const sc = document.getElementById('trScene');
    const chim = document.querySelector('#trTrain .chimney');
    if (!chim) return;
    const r = chim.getBoundingClientRect();
    const s0 = sc.getBoundingClientRect();
    const n = big ? 5 : 1;
    for (let i = 0; i < n; i++) {
        const p = el('<div class="tr-puff"></div>');
        p.style.left = ((r.left - s0.left) / tr.scale + 4) + 'px';
        p.style.top = ((r.top - s0.top) / tr.scale - 10) + 'px';
        p.style.setProperty('--dx', (-60 - Math.random() * 80 - i * 20) + 'px');
        p.style.setProperty('--s', (0.8 + Math.random() * 0.8 + (big ? 0.6 : 0)));
        sc.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    }
}

function trFrame(now) {
    if (!trainOpen) return;
    const dt = Math.min(0.05, (now - (tr.last || now)) / 1000);
    tr.last = now;
    // Speed up at the start, slow down into the station at the end
    const left = tr.total - TR_STOP - tr.dist;
    const target = tr.done ? 0 : Math.min(TR_SPEED, Math.max(0, left) * 0.9 + 6);
    tr.speed += (target - tr.speed) * Math.min(1, dt * (tr.speed < target ? 0.8 : 3));
    tr.dist = Math.min(tr.total - TR_STOP, tr.dist + tr.speed * dt);
    const trainX = tr.viewW * 0.12;
    Object.entries(TR_LAYERS).forEach(([k, f]) => {
        document.getElementById('trL_' + k).style.transform = `translateX(${trainX + tr.viewW * 0.3 - tr.dist * f}px)`;
    });
    document.getElementById('trGround').style.backgroundPositionX = (-tr.dist) + 'px';
    trEl.style.setProperty('--wheel', (tr.dist / 40) + 'rad');
    const i = tr.starts.findIndex((s, k) => tr.dist >= s && tr.dist < s + TR_SEGS[k].len);
    if (i >= 0 && i !== tr.seg) { tr.seg = i; trEnterSeg(i); }
    if (tr.speed > 5) {
        tr.chugT -= dt * tr.speed / TR_SPEED;
        if (tr.chugT <= 0) {
            tr.chugT = 0.32;
            playTone(70 + Math.random() * 20, 0.07, 0.12, 'triangle');
            trPuff(false);
        }
    }
    if (!tr.done && left <= 1 && tr.speed < 8) trArrive();
    tr.raf = requestAnimationFrame(trFrame);
}

function trArrive() {
    tr.done = true;
    trWhistle();
    playWin();
    setTimeout(() => {
        trEl.classList.remove('film');
        document.getElementById('trEnd').classList.add('show');
    }, 900);
}

function trStart() {
    tr.dist = 0;
    tr.speed = 0;
    tr.seg = -1;
    tr.last = 0;
    tr.done = false;
    document.getElementById('trEnd').classList.remove('show');
    trEl.classList.remove('film'); void trEl.offsetWidth; trEl.classList.add('film');
    setTimeout(trWhistle, 400);
    cancelAnimationFrame(tr.raf);
    tr.raf = requestAnimationFrame(trFrame);
}

function openTrainRide() {
    trainOpen = true;
    trEl.classList.add('open');
    trBuild();
    trLayout();
    trStart();
}

function closeTrainRide() {
    trainOpen = false;
    cancelAnimationFrame(tr.raf);
    trEl.classList.remove('open', 'film', 'zoom');
    document.querySelectorAll('#trScene .tr-puff').forEach(p => p.remove());
    _playWhoosh();
}

window.addEventListener('resize', () => { if (trainOpen) trLayout(); });
document.getElementById('trScene').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    trWhistle();
    const o = trEl.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['✨', '⭐', '💖']);
        const a = Math.random() * Math.PI * 2;
        s.style.left = (e.clientX - o.left) + 'px';
        s.style.top = (e.clientY - o.top) + 'px';
        s.style.setProperty('--dx', Math.cos(a) * 60 + 'px');
        s.style.setProperty('--dy', Math.sin(a) * 60 + 'px');
        trEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
});
document.getElementById('trAgain').addEventListener('pointerdown', (e) => { e.stopPropagation(); trStart(); });
document.getElementById('trEndClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeTrainRide(); });
document.getElementById('trClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeTrainRide(); });
trEl.addEventListener('pointerdown', (e) => e.stopPropagation());
