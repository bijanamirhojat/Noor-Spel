/* 🩺 Dokterskamer: knuffeldieren die zich niet lekker voelen komen bij de dokter. Eerst kijken wat er is
   (thermometer, stethoscoop, lampje, schoonmaken), dan beter maken (drankje, druppels, thee, pleister).
   Het goede hulpmiddel licht op, dus fout kan bijna niet. Beter gemaakte patiënten staan in noor-prinses-dokter. */
const DR_KEY = 'noor-prinses-dokter';
const DR_TOOLS = {
    thermo: { icon: '🌡️', name: 'thermometer' },
    steth: { icon: '🩺', name: 'stethoscoop' },
    lamp: { icon: '🔦', name: 'lampje' },
    clean: { icon: '🧽', name: 'schoonmaken' },
    spoon: { icon: '🥄', name: 'drankje' },
    drops: { icon: '💧', name: 'druppels' },
    tea: { icon: '🍵', name: 'thee met honing' },
    plaster: { icon: '🩹', name: 'pleister' }
};
const DR_PATIENTS = [
    { icon: '🐻', name: 'Beertje' }, { icon: '🐰', name: 'Konijntje' }, { icon: '🐶', name: 'Hondje' },
    { icon: '🐱', name: 'Poesje' }, { icon: '🐼', name: 'Panda' }, { icon: '🦊', name: 'Vosje' },
    { icon: '🐷', name: 'Biggetje' }, { icon: '🐸', name: 'Kikkertje' }
];
// What is wrong: how it hurts, what you check with (and what you find), what makes it better.
// spot = where on the patient (% of the patient box)
const DR_ILLS = [
    { key: 'koorts', mood: '🤒', say: 'Ik heb het zo warm', check: 'thermo', found: '🌡️ 39°', foundSay: 'Negenendertig graden. Koorts!',
        cure: 'spoon', cureSay: 'Een lepeltje drankje. Lekker!', spot: [50, 20] },
    { key: 'oor', mood: '😣', say: 'Au, mijn oortje doet pijn', check: 'lamp', found: '👂 rood', foundSay: 'Oei, een rood oortje.',
        cure: 'drops', cureSay: 'Drup drup, oordruppels erin.', spot: [14, 14] },
    { key: 'hoest', mood: '😷', say: 'Kuch kuch! Ik moet zo hoesten', check: 'steth', found: '🫁 kuch!', foundSay: 'Ik hoor het. Kuch kuch!',
        cure: 'tea', cureSay: 'Warme thee met honing. Mmm!', spot: [50, 62] },
    { key: 'buik', mood: '😖', say: 'Mijn buikje doet pijn', check: 'steth', found: '🌀 rommel!', foundSay: 'Rommel rommel, in het buikje!',
        cure: 'spoon', cureSay: 'Een lepeltje drankje voor het buikje.', spot: [50, 70] },
    { key: 'au', mood: '😢', say: 'Ik ben gevallen! Au', check: 'clean', found: '✨ schoon', foundSay: 'Eerst goed schoonmaken.',
        cure: 'plaster', cureSay: 'Een pleister erop. Klaar!', spot: [76, 44], wound: true }
];

let drHelped = 0;
try { drHelped = +localStorage.getItem(DR_KEY) || 0; } catch (e) {}

defineRoom({
    key: 'dokterskamer',
    name: 'Dokterskamer',
    icon: '🩺',
    say: 'De dokterskamer. Dokter spelen!',
    lampX: 360,
    build(x) {
        place(el('<div class="dr-cross"></div>'), x + 230, 60);
        addObj(`<div class="dr-bed"><span class="patient">🧸</span><div class="pillow"></div><div class="mattress"></div>
            <div class="leg l"></div><div class="leg r"></div>
            <div class="tap-hint" style="left:130px;top:-40px">👇</div></div>`, x + 160, 250, x + 300, openDoctor);
        addObj('<div class="dr-cabinet"><div class="inside"><span>💊</span><span>🩹</span><span>🧴</span><span>🌡️</span></div><div class="door l"></div><div class="door r"></div></div>',
            x + 30, 110, x + 100, (node) => {
                node.classList.toggle('open');
                playFreqSweep(node.classList.contains('open') ? 400 : 700, node.classList.contains('open') ? 700 : 400, 0.15, 0.08);
            });
        addObj('<div class="dr-chart"><b>❤️</b><b>⭐ 🌙</b><b>🍎 🐟 ☁️</b><b>🌸 🚗 🎈 🐞</b></div>', x + 470, 70, x + 520, (node) => {
            bounceEl(node, 'pulse');
            speak(randomPick(['Wat zie je? Een hartje!', 'Kun je de vis zien?', 'Heel goed gekeken!', 'Zie je het lieveheersbeestje?']));
        });
        addObj('<div class="dr-height"><i></i></div>', x + 660, 40, x + 680, () => {
            [523, 659, 784].forEach((f, k) => setTimeout(() => playTone(f, 0.12, 0.08, 'triangle'), k * 90));
            sparkleShower(x + 680, 160, 14);
            speak(randomPick(['Wat ben jij groot geworden!', 'Zo lang al! Knap hoor!']));
        });
        place(el(`<div class="dr-board" id="drBoard"></div>`), x + 470, 300);
        renderDoctorBoard();
    }
});

function renderDoctorBoard() {
    const b = document.getElementById('drBoard');
    if (b) b.innerHTML = `😊 ${drHelped}<small>beter gemaakt</small>`;
}

/* ─────────── Dokter spelen (overlay) ─────────── */
const drEl = document.getElementById('drOv');
let doctorOpen = false;
registerOverlay(() => doctorOpen, closeDoctor);
const dr = { pat: null, ill: null, step: 'wait', busy: false, last: -1 };

function drHint(t) { document.getElementById('drHint').textContent = t; }

function drRender() {
    const want = dr.step === 'check' ? dr.ill.check : dr.step === 'cure' ? dr.ill.cure : null;
    document.querySelectorAll('.dr-tool').forEach(b => b.classList.toggle('next', !dr.busy && b.dataset.t === want));
    document.getElementById('drNext').classList.toggle('show', dr.step === 'done');
}

function drNewPatient() {
    dr.busy = true;
    // Never the same animal twice in a row
    let i;
    do i = Math.floor(Math.random() * DR_PATIENTS.length); while (i === dr.last);
    dr.last = i;
    dr.pat = DR_PATIENTS[i];
    dr.ill = randomPick(DR_ILLS);
    dr.step = 'wait';
    const p = document.getElementById('drPatient');
    p.querySelector('.face').textContent = dr.pat.icon;
    p.querySelector('.mood').textContent = dr.ill.mood;
    p.querySelector('.extra').innerHTML = '';
    const wound = p.querySelector('.wound');
    wound.className = 'wound' + (dr.ill.wound ? ' show' : '');
    wound.style.left = dr.ill.spot[0] + '%';
    wound.style.top = dr.ill.spot[1] + '%';
    document.getElementById('drFound').classList.remove('show');
    p.classList.remove('happy', 'leave', 'come'); void p.offsetWidth; p.classList.add('come');
    drHint(`${dr.ill.mood} ${dr.pat.name} komt bij de dokter...`);
    drRender();
    setTimeout(() => {
        if (!doctorOpen) return;
        dr.busy = false;
        dr.step = 'check';
        drHint(`${dr.ill.mood} "${dr.ill.say}!" Kijk wat er is.`);
        speak(`Dag dokter. ${dr.ill.say}.`);
        playFreqSweep(500, 350, 0.3, 0.08);
        drRender();
    }, 1100);
}

function drUse(t, btn) {
    if (dr.busy || (dr.step !== 'check' && dr.step !== 'cure')) return;
    const want = dr.step === 'check' ? dr.ill.check : dr.ill.cure;
    const p = document.getElementById('drPatient');
    if (t !== want) {
        bounceEl(btn, 'nope');
        playTone(260, 0.15, 0.08, 'triangle');
        speak(randomPick(['Hihi, dat kietelt!', 'Hmm, iets anders?', 'Nee, dat is het niet.']));
        return;
    }
    dr.busy = true;
    drRender();
    ovFly(drEl, btn, p.querySelector('.wound'), DR_TOOLS[t].icon, 650).then(() => {
        if (!doctorOpen) return;
        if (dr.step === 'check') drChecked(p);
        else drCured(p);
    });
}

function drChecked(p) {
    const found = document.getElementById('drFound');
    found.textContent = dr.ill.found;
    found.classList.remove('show'); void found.offsetWidth; found.classList.add('show');
    if (dr.ill.check === 'thermo') [880, 988, 1175].forEach((f, k) => setTimeout(() => playTone(f, 0.08, 0.08, 'square'), k * 150));
    else if (dr.ill.check === 'steth') [0, 1, 2, 3].forEach(k => setTimeout(() => playTone(90, 0.12, 0.2, 'sine'), k * 380));
    else if (dr.ill.check === 'clean') {
        startNoise('shower');
        setTimeout(stopNoise, 700);
        p.querySelector('.wound').classList.add('clean');
    } else playFreqSweep(600, 1200, 0.3, 0.06);
    speak(dr.ill.foundSay);
    setTimeout(() => {
        if (!doctorOpen) return;
        dr.step = 'cure';
        dr.busy = false;
        drHint(`${DR_TOOLS[dr.ill.cure].icon} Wat maakt ${dr.pat.name} weer beter?`);
        drRender();
    }, 1300);
}

function drCured(p) {
    if (dr.ill.cure === 'plaster') p.querySelector('.wound').classList.add('plaster');
    else p.querySelector('.extra').innerHTML = `<span>${DR_TOOLS[dr.ill.cure].icon}</span>`;
    document.getElementById('drFound').classList.remove('show');
    speak(dr.ill.cureSay);
    playPop();
    setTimeout(() => {
        if (!doctorOpen) return;
        p.querySelector('.mood').textContent = '😊';
        p.classList.add('happy');
        drHelped++;
        try { localStorage.setItem(DR_KEY, String(drHelped)); } catch (e) {}
        renderDoctorBoard();
        document.getElementById('drCount').textContent = `😊 ${drHelped}`;
        playWin();
        ovCheer(drEl, p, ['💖', '⭐', '✨', '😊']);
        drHint(`😊 ${dr.pat.name} is weer beter!`);
        speak(`Dankjewel dokter! Ik ben weer beter!`);
        dr.step = 'done';
        dr.busy = false;
        drRender();
    }, 1200);
}

const drTools = document.getElementById('drTools');
Object.entries(DR_TOOLS).forEach(([k, t]) => {
    const b = el(`<button class="tool-btn dr-tool" data-t="${k}" aria-label="${t.name}">${t.icon}</button>`);
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); drUse(k, b); });
    drTools.appendChild(b);
});
document.getElementById('drNext').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (dr.busy || dr.step !== 'done') return;
    const p = document.getElementById('drPatient');
    p.classList.add('leave');
    _playWhoosh();
    dr.busy = true;
    setTimeout(() => { if (doctorOpen) drNewPatient(); }, 700);
});

function openDoctor() {
    doctorOpen = true;
    drEl.classList.add('open');
    document.getElementById('drCount').textContent = `😊 ${drHelped}`;
    drNewPatient();
}

function closeDoctor() {
    doctorOpen = false;
    dr.busy = false;
    stopNoise();
    if (window.speechSynthesis) speechSynthesis.cancel();
    drEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('drClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeDoctor(); });
drEl.addEventListener('pointerdown', (e) => e.stopPropagation());
