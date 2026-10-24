/* 🧩 Schuifkamer: een schuifpuzzel zoals de GiiKER Super Slide. Schuif de blokjes opzij tot het grote
   prinsessenblok onderaan door de uitgang kan. Veeg een blokje (of tik erop als het maar één kant op kan).
   💡 doet de beste volgende zet (slSolve zoekt de kortste oplossing). Levels lopen van 1 zet tot de klassieke
   Huarong Dao; voortgang en sterren staan in noor-prinses-schuif. */
const SL_KEY = 'noor-prinses-schuif';
const SL_W = 4;
const SL_H = 5;
// 'a' = het grote blok; elke andere letter is één blokje. [bord, kortste oplossing in stapjes]
const SL_LEVELS = [
    ['fd.cfbec.be...aa..aa', 1], ['cce.b.e.ff...daa..aa', 2], ['e.ffc...c...dbaadbaa', 3], ['.d.f.dbfaab.aa..c.e.', 4],
    ['.ccb...be...e.aaddaa', 5], ['..fc.daa.daa..be..be', 6], ['.ee..baadbaa..fc..f.', 7], ['.dd...bb.aac.aac..ee', 8],
    ['aac.aac.d.bed.be....', 9], ['c...ce..beaab.aa..dd', 10], ['.cc.b....eaa.eaa.fdd', 11], ['..aa..aa.dbbcde.c.e.', 12],
    ['..aa..aab...bddef.ce', 14], ['...caa..aadb..dbeeff', 16], ['aae.aa.dcc.g..bgffb.', 18], ['hheecc.fdaa.gaa.gbb.', 20],
    ['cc...aabdaabdfgg.fe.', 22], ['gg..bbaac.aaeefhd.fh', 25], ['..aabbaa.fdhcfgheeg.', 28], ['dfaadfaa..bb.ec.ggc.', 31],
    ['c.h.aah.aabedgbed.ff', 35], ['cbhicg.i.daaedaae.ff', 40], ['hfkkhaabdaaj.i.geicc', 44], ['.ccfieefaabjaadj.hhg', 49],
    ['ec.hddaa..aafgbifgbi', 57], ['dhcc.haa.eaabe.fbggf', 65], ['aaihaaghbcg.bcdf.eej', 76], ['edaacdaac.jjbgg.hffi', 88],
    ['hejcheff.daabdaagg.i', 104], ['gaahgaahcji..ddeffbb', 121], ['baacbaacdeefdghfi..j', 116]
];
const SL_EMOJI = { A: '👸', V: ['🦄', '🌷', '🧁', '🎀'], H: ['🌈', '🍭', '🐱'], S: ['⭐', '💖', '🍬', '🌸', '💎'] };

defineRoom({
    key: 'schuifkamer',
    name: 'Schuifkamer',
    icon: '🧩',
    say: 'De schuifkamer! Help de prinses eruit!',
    lampX: 520,
    build(x) {
        addObj(`<div class="sl-table">
            <div class="sl-device"><div class="grid">${slMiniHTML(SL_LEVELS[SL_LEVELS.length - 1][0])}</div><div class="leds">${'<i></i>'.repeat(8)}</div></div>
            <div class="top"></div><div class="leg l"></div><div class="leg r"></div>
            <div class="tap-hint" style="left:110px;top:-50px">👇</div>
        </div>`, x + 250, 170, x + 380, openSlide);
        addObj('<div class="frame" style="font-size:56px">🧩</div>', x + 70, 110, x + 110, () => sayRandom(['Een puzzelstukje!', 'Puzzelen is leuk!']));
        addObj('<div class="sl-beanbag"></div>', x + 610, 330, x + 650, (node) => {
            bounceEl(node, 'wobble');
            playFreqSweep(300, 150, 0.3, 0.12);
            sayRandom(['Plof! Lekker zacht!', 'Een zitzak!']);
        });
    }
});

/* ─────────── Oplosser ─────────── */
function slShape(p) { return p.w === 2 && p.h === 2 ? 'A' : p.w === 2 ? 'H' : p.h === 2 ? 'V' : 'S'; }

// Same-shaped blocks are interchangeable, so the key only stores shapes
function slKey(ps) {
    const g = new Array(SL_W * SL_H).fill('.');
    ps.forEach(p => {
        const c = slShape(p);
        for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) g[y * SL_W + x] = c;
    });
    return g.join('');
}

function slMoves(ps) {
    const occ = new Array(SL_W * SL_H).fill(-1);
    ps.forEach((p, i) => { for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) occ[y * SL_W + x] = i; });
    const out = [];
    ps.forEach((p, i) => {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            const nx = p.x + dx, ny = p.y + dy;
            if (nx < 0 || ny < 0 || nx + p.w > SL_W || ny + p.h > SL_H) return;
            for (let y = ny; y < ny + p.h; y++) for (let x = nx; x < nx + p.w; x++) {
                const o = occ[y * SL_W + x];
                if (o !== -1 && o !== i) return;
            }
            out.push({ i, dx, dy });
        });
    });
    return out;
}

function slWon(ps) { return ps[0].x === 1 && ps[0].y === 3; }

// Shortest list of moves to the goal (breadth first), or null
function slSolve(start) {
    const prev = new Map([[slKey(start), null]]);
    let frontier = [start];
    let end = slWon(start) ? start : null;
    while (frontier.length && !end) {
        const next = [];
        for (const ps of frontier) {
            const k = slKey(ps);
            for (const m of slMoves(ps)) {
                const q = ps.map(p => ({ ...p }));
                q[m.i].x += m.dx;
                q[m.i].y += m.dy;
                const kq = slKey(q);
                if (prev.has(kq)) continue;
                prev.set(kq, { k, m });
                if (slWon(q)) { end = q; break; }
                next.push(q);
            }
            if (end) break;
        }
        frontier = next;
    }
    if (!end) return null;
    const path = [];
    for (let k = slKey(end); prev.get(k); k = prev.get(k).k) path.unshift(prev.get(k).m);
    return path;
}

// Board string -> blocks (the big one first)
function slParse(grid) {
    const ps = [];
    const seen = new Set();
    [...grid].forEach((c) => {
        if (c === '.' || seen.has(c)) return;
        seen.add(c);
        const cells = [...grid].map((d, j) => d === c ? j : -1).filter(j => j >= 0);
        const xs = cells.map(j => j % SL_W), ys = cells.map(j => Math.floor(j / SL_W));
        const p = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs) + 1, h: Math.max(...ys) - Math.min(...ys) + 1 };
        if (c === 'a') ps.unshift(p); else ps.push(p);
    });
    return ps;
}

function slMiniHTML(grid) {
    return slParse(grid).map(p => `<b class="sh-${slShape(p)}" style="left:${p.x * 25}%;top:${p.y * 20}%;width:${p.w * 25}%;height:${p.h * 20}%"></b>`).join('');
}

/* ─────────── Puzzel (overlay) ─────────── */
const slEl = document.getElementById('slOv');
const slBoard = document.getElementById('slBoard');
let slOpen = false;
registerOverlay(() => slOpen, closeSlide);
const sl = { level: 0, ps: [], nodes: [], moves: 0, done: false, busy: false, drag: null, save: { unlocked: 1, stars: {} } };
try {
    const d = JSON.parse(localStorage.getItem(SL_KEY));
    if (d && Number.isInteger(d.unlocked)) sl.save = { unlocked: Math.min(SL_LEVELS.length, Math.max(1, d.unlocked)), stars: d.stars || {} };
} catch (e) {}

function slSave() {
    try { localStorage.setItem(SL_KEY, JSON.stringify(sl.save)); } catch (e) {}
}

function slLoad(level) {
    sl.level = level;
    sl.ps = slParse(SL_LEVELS[level][0]);
    sl.moves = 0;
    sl.done = false;
    sl.busy = false;
    const counts = { V: 0, H: 0, S: 0 };
    slBoard.querySelectorAll('.sl-piece').forEach(n => n.remove());
    sl.nodes = sl.ps.map((p, i) => {
        const sh = slShape(p);
        const emoji = sh === 'A' ? SL_EMOJI.A : SL_EMOJI[sh][counts[sh]++ % SL_EMOJI[sh].length];
        const n = el(`<div class="sl-piece sh-${sh}" data-i="${i}"><span>${emoji}</span></div>`);
        slBoard.appendChild(n);
        return n;
    });
    slEl.classList.remove('won');
    slRender();
    slRenderPanel();
}

function slRender() {
    sl.ps.forEach((p, i) => {
        const n = sl.nodes[i];
        n.style.left = (p.x * 25) + '%';
        n.style.top = (p.y * 20) + '%';
        n.style.width = (p.w * 25) + '%';
        n.style.height = (p.h * 20) + '%';
    });
    document.getElementById('slMoves').textContent = sl.moves;
}

function slStars(level) { return sl.save.stars[level] || 0; }

function slRenderPanel() {
    const lv = sl.level;
    document.getElementById('slLevel').textContent = lv === SL_LEVELS.length - 1 ? '👑 Meester' : `Level ${lv + 1}`;
    document.getElementById('slStars').textContent = '⭐'.repeat(slStars(lv)) + '☆'.repeat(3 - slStars(lv));
    document.getElementById('slBest').textContent = SL_LEVELS[lv][1];
    document.getElementById('slLeds').innerHTML = SL_LEVELS.map((_, i) =>
        `<i class="${i === lv ? 'cur' : slStars(i) ? 'lit' : i < sl.save.unlocked ? 'open' : ''}"></i>`).join('');
    document.getElementById('slPrev').disabled = lv === 0;
    document.getElementById('slNext').disabled = lv + 1 >= sl.save.unlocked;
    document.getElementById('slNext').classList.toggle('next', sl.done && lv + 1 < SL_LEVELS.length);
}

function slCanMove(i, dx, dy) {
    return slMoves(sl.ps).some(m => m.i === i && m.dx === dx && m.dy === dy);
}

function slDoMove(i, dx, dy) {
    if (sl.done || !slCanMove(i, dx, dy)) return false;
    sl.ps[i].x += dx;
    sl.ps[i].y += dy;
    sl.moves++;
    slRender();
    playTone(i === 0 ? 330 : 520 + (sl.moves % 4) * 60, 0.06, 0.12, 'triangle');
    if (slWon(sl.ps)) slWin();
    return true;
}

function slWiggle(n) {
    n.classList.remove('nope');
    void n.offsetWidth;
    n.classList.add('nope');
    playTone(200, 0.1, 0.08, 'square');
}

function slWin() {
    sl.done = true;
    const best = SL_LEVELS[sl.level][1];
    const stars = sl.moves <= best ? 3 : sl.moves <= best * 1.5 + 2 ? 2 : 1;
    sl.save.stars[sl.level] = Math.max(slStars(sl.level), stars);
    sl.save.unlocked = Math.max(sl.save.unlocked, Math.min(SL_LEVELS.length, sl.level + 2));
    slSave();
    slEl.classList.add('won');
    playWin();
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak(sl.level === SL_LEVELS.length - 1
        ? 'Wauw! Je hebt de meesterpuzzel opgelost! Jij bent een echte puzzelprinses!'
        : randomPick(['Gelukt! De prinses is eruit!', 'Hoera! De prinses kan naar buiten!', 'Super gedaan! Op naar het volgende level!']));
    const r = slBoard.getBoundingClientRect();
    const o = slEl.getBoundingClientRect();
    for (let i = 0; i < 18; i++) {
        const s = document.createElement('span');
        s.className = 'scope-spark';
        s.textContent = randomPick(['⭐', '✨', '💖', '🎉']);
        s.style.left = (r.left + r.width / 2 - o.left) + 'px';
        s.style.top = (r.bottom - o.top) + 'px';
        const a = -Math.random() * Math.PI;
        const d = 80 + Math.random() * 160;
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        slEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    slRenderPanel();
}

// The best next move: the block lights up and slides
function slHint() {
    if (sl.done || sl.busy) return;
    const path = slSolve(sl.ps);
    if (!path || !path.length) return;
    const m = path[0];
    const n = sl.nodes[m.i];
    n.classList.remove('hint');
    void n.offsetWidth;
    n.classList.add('hint');
    sl.busy = true;
    playFreqSweep(800, 1600, 0.2, 0.08);
    setTimeout(() => {
        sl.busy = false;
        slDoMove(m.i, m.dx, m.dy);
        if (!sl.done && Math.random() < 0.3) speak(randomPick(['Zo!', 'Deze kant op!', 'Kijk, zo kan het!']));
    }, 450);
}

/* Slepen: elke halve vakje verschuiven = één stapje; tikken = de enige kant die kan */
slBoard.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const n = e.target.closest('.sl-piece');
    if (!n || sl.done || sl.busy) return;
    sl.drag = { i: +n.dataset.i, x: e.clientX, y: e.clientY, moved: false };
    n.classList.add('held');
});
slBoard.addEventListener('pointermove', (e) => {
    const d = sl.drag;
    if (!d || sl.done) return;
    const cell = slBoard.getBoundingClientRect().width / SL_W;
    const ddx = e.clientX - d.x, ddy = e.clientY - d.y;
    if (Math.max(Math.abs(ddx), Math.abs(ddy)) < cell * 0.45) return;
    const [dx, dy] = Math.abs(ddx) > Math.abs(ddy) ? [Math.sign(ddx), 0] : [0, Math.sign(ddy)];
    if (slDoMove(d.i, dx, dy)) {
        d.x += dx * cell;
        d.y += dy * cell;
        d.moved = true;
    } else if (!d.blocked) {
        d.blocked = true;
        slWiggle(sl.nodes[d.i]);
    }
});
window.addEventListener('pointerup', () => {
    const d = sl.drag;
    if (!d) return;
    sl.drag = null;
    const n = sl.nodes[d.i];
    if (n) n.classList.remove('held');
    if (d.moved || d.blocked || sl.done) return;
    const options = slMoves(sl.ps).filter(m => m.i === d.i);
    if (options.length === 1) slDoMove(d.i, options[0].dx, options[0].dy);
    else {
        slWiggle(n);
        if (options.length > 1) speak('Veeg het blokje de kant op die je wilt!');
    }
});

function openSlide() {
    slOpen = true;
    slEl.classList.add('open');
    slLoad(Math.min(sl.save.unlocked - 1, SL_LEVELS.length - 1));
    playMusicBox();
    speak(sl.level === 0
        ? 'Help de prinses eruit! Schuif de blokjes opzij, tot het grote blok onderaan door de uitgang kan.'
        : `Level ${sl.level + 1}! Help de prinses eruit!`);
}

function closeSlide() {
    slOpen = false;
    sl.drag = null;
    slEl.classList.remove('open');
    burst(state.x, 320, 30);
    playSparkleSound();
}

[['slPrev', () => { if (sl.level > 0) { slLoad(sl.level - 1); playPop(); } }],
    ['slNext', () => { if (sl.level + 1 < sl.save.unlocked) { slLoad(sl.level + 1); playPop(); speak(`Level ${sl.level + 1}!`); } }],
    ['slReset', () => { slLoad(sl.level); playFreqSweep(600, 300, 0.2, 0.1); }],
    ['slHint', slHint],
    ['slClose', closeSlide]].forEach(([id, fn]) => {
    document.getElementById(id).addEventListener('pointerdown', (e) => { e.stopPropagation(); fn(); });
});
slEl.addEventListener('pointerdown', (e) => e.stopPropagation());
