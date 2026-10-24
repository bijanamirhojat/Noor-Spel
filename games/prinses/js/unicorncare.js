/* 🪣 Eenhoorn verzorgen (de verzorgemmer op de eenhoornweide): modder eraf wassen, blaadjes uit de manen
   borstelen, een appel of wortel geven, laten drinken en aaien. Alles gedaan? Dan is de eenhoorn superblij.
   Het aantal keer staat in noor-prinses-eenhoornzorg. De eenhoorn zelf is unicornSVG() uit js/outside.js. */
const UC_KEY = 'noor-prinses-eenhoornzorg';
const ucEl = document.getElementById('ucOv');
let ucOpen = false;
registerOverlay(() => ucOpen, closeUniCare);
const UC_NEEDS = [['wash', '🧽'], ['brush', '🪮'], ['food', '🍎'], ['drink', '💧'], ['love', '💖']];
const UC_TOOLS = [
    { t: 'sponge', icon: '🧽', say: 'Het sponsje! Wrijf de modder eraf!', hint: '🧽 Wrijf over de vlekken' },
    { t: 'brush', icon: '🪮', say: 'De borstel! Borstel de blaadjes uit de manen!', hint: '🪮 Borstel de manen en de staart' },
    { t: 'apple', icon: '🍎', say: 'Een appel!' },
    { t: 'carrot', icon: '🥕', say: 'Een wortel!' },
    { t: 'water', icon: '💧', say: 'Water drinken!' },
    { t: 'hand', icon: '🤚', say: 'Aaien! Wrijf maar zachtjes over de eenhoorn!', hint: '🤚 Aai de eenhoorn' }
];
// Spots in unicornSVG units
const UC_MUD = [[60, 58], [92, 72], [110, 56], [72, 74], [46, 104], [118, 106], [98, 50], [58, 112]];
const UC_KNOTS = [[116, 12, '🍂'], [113, 30, '🌿'], [108, 48, '🍃'], [24, 70, '🌿'], [18, 90, '🍂']];
const UC_MOUTH = [156, 30];
const uc = { tool: 'sponge', rubbing: false, done: {}, pets: 0, busy: false, count: 0, finished: false };
try { uc.count = Math.max(0, parseInt(localStorage.getItem(UC_KEY), 10) || 0); } catch (e) {}

function ucSvg() { return document.querySelector('#ucUni svg'); }

function ucPt(x, y) {
    const pt = ucSvg().createSVGPoint();
    pt.x = x;
    pt.y = y;
    const p = pt.matrixTransform(ucSvg().getScreenCTM());
    const o = ucEl.getBoundingClientRect();
    return { x: p.x - o.left, y: p.y - o.top };
}

function ucSvgPt(e) {
    const pt = ucSvg().createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(ucSvg().getScreenCTM().inverse());
}

function ucSpan(cls, text, p) {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    s.style.left = p.x + 'px';
    s.style.top = p.y + 'px';
    ucEl.appendChild(s);
    return s;
}

function ucSpark(x, y, n = 8, icons = ['✨', '💖', '⭐']) {
    const c = ucPt(x, y);
    for (let i = 0; i < n; i++) {
        const s = ucSpan('scope-spark', randomPick(icons), c);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 80;
        s.style.setProperty('--dx', Math.cos(a) * d + 'px');
        s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        setTimeout(() => s.remove(), 900);
    }
}

function ucNeigh() {
    const u = document.getElementById('ucUni');
    u.classList.remove('happy');
    void u.offsetWidth;
    u.classList.add('happy');
    playFreqSweep(500, 1100, 0.25, 0.1);
    setTimeout(() => playFreqSweep(1100, 700, 0.35, 0.08), 250);
}

function renderUcNeeds() {
    document.getElementById('ucNeeds').innerHTML = UC_NEEDS.map(([k, ic]) =>
        `<span class="uc-need${uc.done[k] ? ' done' : ''}">${ic}</span>`).join('') + `<span class="uc-count">🦄 ${uc.count}</span>`;
}

function renderUcTools() {
    const box = document.getElementById('ucTools');
    box.innerHTML = UC_TOOLS.map(t => `<button class="tool-btn uc-tool${uc.tool === t.t ? ' sel' : ''}" data-t="${t.t}">${t.icon}</button>`).join('');
    box.querySelectorAll('.uc-tool').forEach(b => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickUcTool(b.dataset.t, b);
    }));
}

function pickUcTool(t, btn) {
    if (uc.busy) return;
    const tool = UC_TOOLS.find(x => x.t === t);
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (tool.hint) {
        uc.tool = t;
        renderUcTools();
        document.getElementById('ucHint').textContent = tool.hint;
        playPop();
        speak(tool.say);
        return;
    }
    ucFeed(tool, btn);
}

// Something flies from the button to the mouth: munch munch, or slurp slurp
function ucFeed(tool, btn) {
    uc.busy = true;
    const r = btn.getBoundingClientRect();
    const o = ucEl.getBoundingClientRect();
    const item = ucSpan('uc-food', tool.t === 'water' ? '🪣' : tool.icon, { x: r.left + r.width / 2 - o.left, y: r.top - o.top });
    const m = ucPt(UC_MOUTH[0], UC_MOUTH[1] + (tool.t === 'water' ? 16 : 0));
    playFreqSweep(400, 900, 0.3, 0.1);
    requestAnimationFrame(() => {
        item.style.left = m.x + 'px';
        item.style.top = m.y + 'px';
    });
    const uni = document.getElementById('ucUni');
    setTimeout(() => {
        uni.classList.add(tool.t === 'water' ? 'drink' : 'munch');
        if (tool.t === 'water') {
            speak('Slurp slurp! Lekker water!');
            [0, 300, 600, 900].forEach(d => setTimeout(() => {
                playFreqSweep(600, 300, 0.15, 0.1);
                ucSpan('uc-drop', '💧', ucPt(UC_MOUTH[0] - 4, UC_MOUTH[1] + 8)).addEventListener('animationend', (ev) => ev.target.remove());
            }, d));
        } else {
            speak(randomPick([`Mmm! ${tool.t === 'apple' ? 'Een appel' : 'Een wortel'}! Knabbel knabbel!`, 'Nom nom nom! Lekker!']));
            [0, 220, 440, 660].forEach(d => setTimeout(() => {
                playTone(140 + Math.random() * 60, 0.06, 0.2, 'square');
                item.style.transform = `translate(-50%, -50%) scale(${1 - (d + 220) / 1000})`;
            }, d));
        }
    }, 550);
    setTimeout(() => {
        item.remove();
        uni.classList.remove('munch', 'drink');
        ucNeigh();
        ucSpark(UC_MOUTH[0] - 10, UC_MOUTH[1] - 10, 8, ['💖', '✨']);
        uc.busy = false;
        ucDone(tool.t === 'water' ? 'drink' : 'food');
    }, 1650);
}

function ucRub(e) {
    const p = ucSvgPt(e);
    const svg = ucSvg();
    if (uc.tool === 'sponge') {
        svg.querySelectorAll('.uc-mud').forEach(m => {
            if (Math.hypot(+m.dataset.x - p.x, +m.dataset.y - p.y) > 14) return;
            const hp = +m.dataset.hp - 0.12;
            m.dataset.hp = hp;
            m.setAttribute('opacity', Math.max(0, hp));
            if (hp <= 0) {
                m.remove();
                playCorrect();
                ucSpark(+m.dataset.x, +m.dataset.y, 5, ['🫧', '✨']);
                if (!svg.querySelector('.uc-mud')) ucDone('wash');
            }
        });
        if (Math.random() < 0.3) {
            ucSpan('uc-bubble', '🫧', ucPt(p.x, p.y)).addEventListener('animationend', (ev) => ev.target.remove());
            playTone(800 + Math.random() * 600, 0.05, 0.05, 'sine');
        }
    } else if (uc.tool === 'brush') {
        if (Math.random() < 0.15) playFreqSweep(2000, 1400, 0.08, 0.05);
        svg.querySelectorAll('.uc-knot').forEach(k => {
            if (k.classList.contains('fall') || Math.hypot(+k.dataset.x - p.x, +k.dataset.y - p.y) > 14) return;
            const hp = +k.dataset.hp - 0.2;
            k.dataset.hp = hp;
            if (hp > 0) return;
            k.classList.add('fall');
            playFreqSweep(900, 300, 0.4, 0.1);
            ucSpark(+k.dataset.x, +k.dataset.y, 5, ['✨', '🌟']);
            setTimeout(() => {
                k.remove();
                if (!svg.querySelector('.uc-knot')) ucDone('brush');
            }, 700);
        });
        if (Math.random() < 0.2) ucSpan('uc-bubble', '✨', ucPt(p.x, p.y)).addEventListener('animationend', (ev) => ev.target.remove());
    } else if (uc.tool === 'hand') {
        if (Math.random() > 0.25) return;
        ucSpan('uc-bubble', '💖', ucPt(p.x, p.y)).addEventListener('animationend', (ev) => ev.target.remove());
        playTone(700 + Math.random() * 300, 0.12, 0.06, 'sine');
        uc.pets++;
        if (uc.pets === 4) speak(randomPick(['Hihihi! Dat kriebelt!', 'Wat aai je lief!']));
        if (uc.pets === 10) {
            ucNeigh();
            ucDone('love');
        }
    }
}

function ucDone(k) {
    if (uc.done[k]) return;
    uc.done[k] = true;
    renderUcNeeds();
    const say = { wash: 'Alle modder is eraf! Helemaal schoon!', brush: 'Wat glanzen de manen nu!', love: 'De eenhoorn vindt je lief!' }[k];
    if (say) setTimeout(() => speak(say), 300);
    if (UC_NEEDS.every(([n]) => uc.done[n])) setTimeout(ucAllDone, 1200);
}

function ucAllDone() {
    if (!ucOpen || uc.finished) return;
    uc.finished = true;
    uc.count++;
    try { localStorage.setItem(UC_KEY, String(uc.count)); } catch (e) {}
    renderUcNeeds();
    earnSticker('eenhoornweide', unicornEl());
    if (window.speechSynthesis) speechSynthesis.cancel();
    speak('Hoera! De eenhoorn is schoon, heeft gegeten en gedronken, en is superblij! Dankjewel prinses!');
    playWin();
    document.getElementById('ucUni').classList.add('party');
    for (let i = 0; i < 4; i++) setTimeout(() => ucSpark(80, 40, 12, ['🌈', '✨', '💖', '⭐']), i * 300);
    document.getElementById('ucAgain').classList.add('show');
}

// A fresh round: the unicorn rolled in the mud again
function ucNewRound() {
    const uni = document.getElementById('ucUni');
    uni.classList.remove('party', 'happy');
    uni.innerHTML = unicornSVG(uniLook, 'uc');
    const svg = ucSvg();
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'uc-dirt');
    const mud = [...UC_MUD].sort(() => Math.random() - 0.5).slice(0, 5);
    const knots = [...UC_KNOTS].sort(() => Math.random() - 0.5).slice(0, 4);
    g.innerHTML = mud.map(([x, y]) => `<g class="uc-mud" data-x="${x}" data-y="${y}" data-hp="1">
            <ellipse cx="${x}" cy="${y}" rx="8" ry="5.5" fill="#92400e" opacity=".85"/>
            <circle cx="${x + 6}" cy="${y - 4}" r="3" fill="#a16207" opacity=".85"/><circle cx="${x - 5}" cy="${y + 4}" r="2.4" fill="#78350f" opacity=".85"/>
        </g>`).join('') +
        knots.map(([x, y, e]) => `<text class="uc-knot" data-x="${x}" data-y="${y}" data-hp="1" x="${x}" y="${y}" font-size="13" text-anchor="middle" dominant-baseline="central">${e}</text>`).join('');
    svg.querySelector('.ubody').appendChild(g);
    uc.done = {};
    uc.pets = 0;
    uc.finished = false;
    uc.tool = 'sponge';
    document.getElementById('ucHint').textContent = UC_TOOLS[0].hint;
    document.getElementById('ucAgain').classList.remove('show');
    renderUcNeeds();
    renderUcTools();
}

const ucStage = document.getElementById('ucStage');
ucStage.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (uc.busy) return;
    uc.rubbing = true;
    ucRub(e);
});
ucStage.addEventListener('pointermove', (e) => { if (uc.rubbing && !uc.busy) ucRub(e); });
window.addEventListener('pointerup', () => { uc.rubbing = false; });

function openUniCare() {
    ucOpen = true;
    ucEl.classList.add('open');
    ucNewRound();
    playMusicBox();
    speak('Oei, de eenhoorn heeft in de modder gespeeld! Was hem schoon, borstel de manen, en geef hem eten en drinken!');
}

function closeUniCare() {
    ucOpen = false;
    uc.busy = false;
    ucEl.classList.remove('open');
    ucEl.querySelectorAll('.uc-food, .uc-drop, .uc-bubble, .scope-spark').forEach(n => n.remove());
    const u = unicornEl();
    if (u) {
        u.classList.remove('neigh'); void u.offsetWidth; u.classList.add('neigh');
        sparkleShower(state.uniX, 200, 40);
    }
    playFreqSweep(500, 1400, 0.4, 0.12);
}

document.getElementById('ucAgain').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    ucNewRound();
    playPop();
    speak('Oh nee! Weer in de modder gerold!');
});
document.getElementById('ucClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeUniCare(); });
ucEl.addEventListener('pointerdown', (e) => e.stopPropagation());
