/* 💻 Werkkamer: een bureau met een computer waarop je kunt "werken" (mailtjes beantwoorden,
   woordjes typen op het toetsenbord, videobellen), een draaistoel, een printer en een whiteboard. */
const PC_WORDS = [['🐱', 'KAT'], ['🐶', 'HOND'], ['🌹', 'ROOS'], ['👑', 'NOOR'], ['👸', 'MAMA'], ['🤴', 'PAPA'],
    ['🐟', 'VIS'], ['⭐', 'STER'], ['🌙', 'MAAN'], ['☀️', 'ZON'], ['🌳', 'BOOM'], ['🍰', 'TAART']];
const PC_MAILS = [
    ['🐻', 'Beer', 'Hoi! Wil je komen spelen?'],
    ['🐸', 'Kikker', 'Kwaak! Ik heb een taart gebakken!'],
    ['🐰', 'Konijn', 'Ik ben jarig! Kom je op mijn feestje?'],
    ['🐱', 'Poes', 'Miauw! Waar is mijn bolletje wol?'],
    ['🦊', 'Vos', 'Wat is jouw lievelingskleur?'],
    ['🐷', 'Varken', 'Knor! Ik heb in de modder gespeeld!'],
    ['🦉', 'Uil', 'Oehoe! Slaap jij ook zo lekker?'],
    ['🐘', 'Olifant', 'Toeter! Ik heb een nieuwe hoed!']
];
const PC_REPLIES = ['👍', '❤️', '😂', '🎉', '🌸', '😘', '🥳', '⭐'];
const PC_CALLS = {
    mama: ['👸', 'Mama', 'Hoi lieverd! Werk je hard? Ik ben trots op je!'],
    papa: ['🤴', 'Papa', 'Hallo prinses! Zullen we straks samen eten?'],
    eenhoorn: ['🦄', 'Eenhoorn', 'Hihihi! Ik vlieg zo naar je toe!'],
    poes: ['🐱', 'Poes', 'Miauw! Prrrr... prrrr...']
};
const PC_KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const PC_DOODLES = ['🌈', '🦄', '🏰', '🌸', '🐱', '💖', '⭐', '🦋', '🍭', '👑'];

function pcClack() {
    playTone(1800 + Math.random() * 600, 0.03, 0.08, 'square');
}

defineRoom({
    key: 'werkkamer',
    name: 'Werkkamer',
    icon: '💻',
    say: 'De werkkamer. Aan het werk!',
    build(x) {
        place(el(`<div class="wk-shelf">
            <div class="row"><span class="map" style="background:#f472b6"></span><span class="map" style="background:#60a5fa"></span><span class="map" style="background:#facc15"></span><span class="map tilt" style="background:#a78bfa"></span></div>
            <div class="row"><span class="book">📚</span><span class="book">🗂️</span></div>
            <div class="row"><span class="book">🏆</span><span class="map" style="background:#34d399"></span><span class="map" style="background:#fb923c"></span></div>
        </div>`), x + 30, 110);
        place(el('<div class="wk-clock"><div class="hand h"></div><div class="hand m"></div></div>'), x + 260, 50);
        addObj('<div class="wk-board"><div class="bars"><i style="height:30%"></i><i style="height:60%"></i><i style="height:45%"></i><i style="height:85%"></i></div><span class="doodle">💖</span></div>', x + 560, 90, x + 620, (node) => {
            const d = node.querySelector('.doodle');
            d.textContent = randomPick(PC_DOODLES.filter(e => e !== d.textContent));
            bounceEl(d, 'jump');
            for (let i = 0; i < 4; i++) setTimeout(() => playFreqSweep(700 + Math.random() * 300, 900, 0.08, 0.05), i * 90);
        });
        addObj(`<div class="wk-desk">
            <div class="mon"><div class="scr"><span id="wkScreen">💻</span></div></div><div class="neck"></div>
            <div class="kb"></div><div class="mouse"></div>
            <div class="top"></div><div class="side l"></div><div class="side r"></div><div class="drawer"></div>
            <div class="tap-hint" style="left:120px;top:-44px">👇</div>
        </div>`, x + 180, 222, x + 300, openPc);
        addObj('<div class="emoji-obj wk-cup">☕</div>', x + 192, 316, x + 230, (node) => {
            bounceEl(node, 'wobble');
            for (let i = 0; i < 3; i++) setTimeout(() => playFreqSweep(300, 220, 0.12, 0.1), i * 160);
            setTimeout(() => speak('Mmm, lekker!'), 500);
        });
        addObj('<div class="wk-chair"><div class="back"></div><div class="seat"></div><div class="pole"></div><div class="feet"></div></div>', x + 450, 290, x + 480, (node) => {
            node.classList.remove('spin'); void node.offsetWidth; node.classList.add('spin');
            playFreqSweep(300, 900, 0.8, 0.1);
            speak('Wieeee!');
        });
        addObj('<div class="wk-printer"><div class="paper"><span></span></div><div class="body"><i></i></div><div class="kast"></div></div>', x + 600, 262, x + 640, (node) => {
            const p = node.querySelector('.paper');
            p.querySelector('span').textContent = randomPick(PC_DOODLES);
            p.classList.remove('out'); void p.offsetWidth; p.classList.add('out');
            for (let i = 0; i < 8; i++) setTimeout(() => playTone(160 + (i % 2) * 40, 0.08, 0.08, 'sawtooth'), i * 110);
            setTimeout(() => { playSparkleSound(); speak('Geprint!'); }, 1000);
        });
        addObj('<div class="emoji-obj wk-plant">🪴</div>', x + 720, 362, x + 720, (node) => {
            bounceEl(node, 'jump');
            sparkleShower(x + 745, 360, 16);
        });
    }
});

/* ─────────── Werken op de computer (overlay) ─────────── */
const pcEl = document.getElementById('pcOv');
let pcOpen = false;
registerOverlay(() => pcOpen, closePc);
const pc = { app: null, done: new Set(), mails: [], mail: null, mailsSent: 0, word: null, words: [], typed: 0, call: null, busy: false, timers: [] };

function pcLater(fn, ms) { pc.timers.push(setTimeout(fn, ms)); }
function pcClearTimers() { pc.timers.forEach(clearTimeout); pc.timers = []; }

// Keyboard below the monitor (always there; only the typing app gives it a job)
const pcKb = document.getElementById('pcKb');
PC_KEYS.forEach(row => {
    const r = el('<div class="pc-kbrow"></div>');
    [...row].forEach(ch => r.appendChild(el(`<button class="pc-key" data-k="${ch}">${ch}</button>`)));
    pcKb.appendChild(r);
});
pcKb.appendChild(el('<div class="pc-kbrow"><button class="pc-key space" data-k=" "></button></div>'));
pcKb.querySelectorAll('.pc-key').forEach(k => k.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    k.classList.remove('press'); void k.offsetWidth; k.classList.add('press');
    pcClack();
    if (pc.app === 'type') pcTypeKey(k.dataset.k, k);
}));

function pcShow(app) {
    pcClearTimers();
    pc.app = app;
    pc.busy = false;
    pcEl.classList.toggle('typing', app === 'type');
    document.getElementById('pcDesk').classList.toggle('hide', !!app);
    pcEl.querySelectorAll('.pc-app').forEach(a => a.classList.toggle('open', a.dataset.app === app));
    document.getElementById('pcHome').classList.toggle('show', !!app);
    pcKb.querySelectorAll('.pc-key').forEach(k => k.classList.remove('next'));
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (app === 'mail') pcMailNext();
    else if (app === 'type') pcTypeNext();
    else if (app === 'call') pcCallList();
}

function pcMarkDone(app) {
    if (pc.done.has(app)) return;
    pc.done.add(app);
    const t = document.querySelector(`#pcTodo [data-a="${app}"]`);
    t.classList.add('done');
    ovCheer(pcEl, t);
    if (pc.done.size === 3) pcLater(pcAllDone, 1800);
}

function pcAllDone() {
    pcShow(null);
    const d = document.getElementById('pcDone');
    d.classList.add('show');
    ovCheer(pcEl, d, ['🎉', '⭐', '💖', '☕']);
    playCorrect();
    speak('Werk klaar! Goed gewerkt! Tijd voor pauze.');
    pcLater(() => ovCheer(pcEl, d, ['🎉', '✨', '🍪']), 600);
}

/* ✉️ Mail: a letter from an animal; answer with an emoji and send it */
function pcMailNext() {
    if (!pc.mails.length) pc.mails = shuffle(PC_MAILS.slice());
    pc.mail = pc.mails.pop();
    const [who, name, text] = pc.mail;
    const box = document.getElementById('pcMail');
    box.className = 'pc-mail arrive';
    document.getElementById('pcMailFrom').textContent = who;
    document.getElementById('pcMailName').textContent = `Van: ${name}`;
    document.getElementById('pcMailText').textContent = text;
    const reply = document.getElementById('pcMailReply');
    reply.innerHTML = '';
    shuffle(PC_REPLIES.slice()).slice(0, 3).forEach(r => {
        const b = el(`<button class="pc-reply">${r}</button>`);
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); pcMailSend(r, b); });
        reply.appendChild(b);
    });
    playTone(1320, 0.1, 0.1, 'sine');
    pcLater(() => playTone(1760, 0.15, 0.1, 'sine'), 120);
    speak(`Een mailtje van ${name}! ${text}`);
}

function pcMailSend(r, btn) {
    if (pc.busy) return;
    pc.busy = true;
    const box = document.getElementById('pcMail');
    ovFly(pcEl, btn, document.getElementById('pcMailFrom'), r, 500).then(() => {
        if (!pcOpen || pc.app !== 'mail') return;
        box.className = 'pc-mail send';
        _playWhoosh();
        pc.mailsSent++;
        document.getElementById('pcMailCount').textContent = `📤 ${pc.mailsSent}`;
        showToast('✉️ Verstuurd!', 1200);
        if (pc.mailsSent >= 3) pcMarkDone('mail');
        pcLater(() => { pc.busy = false; pcMailNext(); }, 1300);
    });
}

/* ⌨️ Typen: type the word with the keyboard, the next letter blinks */
function pcTypeNext() {
    if (!pc.words.length) pc.words = shuffle(PC_WORDS.slice());
    pc.word = pc.words.pop();
    pc.typed = 0;
    const [pic, word] = pc.word;
    const pe = document.getElementById('pcTypePic');
    pe.textContent = pic;
    pe.classList.remove('done');
    const w = document.getElementById('pcTypeWord');
    w.innerHTML = [...word].map(c => `<span>${c}</span>`).join('');
    pcTypeHint();
    speak(`Typ ${word.toLowerCase()}`);
}

function pcTypeHint() {
    const word = pc.word[1];
    pcKb.querySelectorAll('.pc-key').forEach(k => k.classList.toggle('next', !pc.busy && k.dataset.k === word[pc.typed]));
    document.querySelectorAll('#pcTypeWord span').forEach((s, i) => {
        s.classList.toggle('on', i < pc.typed);
        s.classList.toggle('cur', i === pc.typed);
    });
}

function pcTypeKey(k, keyEl) {
    if (pc.busy || !pc.word) return;
    const word = pc.word[1];
    if (k !== word[pc.typed]) {
        bounceEl(keyEl, 'nope');
        return;
    }
    pc.typed++;
    playTone(500 + pc.typed * 120, 0.1, 0.1, 'triangle');
    pcTypeHint();
    if (pc.typed < word.length) return;
    pc.busy = true;
    pcTypeHint();
    const pe = document.getElementById('pcTypePic');
    pe.classList.add('done');
    ovCheer(pcEl, pe);
    playCorrect();
    speak(word.toLowerCase());
    pcMarkDone('type');
    pcLater(() => { pc.busy = false; pcTypeNext(); }, 2200);
}

/* 📞 Bellen: pick someone, it rings, they wave and say something */
function pcCallList() {
    pc.call = null;
    document.getElementById('pcCallList').classList.remove('hide');
    document.getElementById('pcCallOn').className = 'pc-callon';
}

function pcCall(key) {
    if (pc.busy) return;
    pc.busy = true;
    const [face, name, line] = PC_CALLS[key];
    pc.call = key;
    document.getElementById('pcCallList').classList.add('hide');
    const on = document.getElementById('pcCallOn');
    on.className = 'pc-callon ring';
    document.getElementById('pcCallFace').textContent = face;
    document.getElementById('pcCallName').textContent = `${name} bellen...`;
    document.getElementById('pcCallSay').textContent = '';
    for (let i = 0; i < 2; i++) {
        pcLater(() => { playTone(880, 0.25, 0.08, 'sine'); pcLater(() => playTone(660, 0.25, 0.08, 'sine'), 280); }, i * 900);
    }
    pcLater(() => {
        on.className = 'pc-callon live';
        document.getElementById('pcCallName').textContent = name;
        document.getElementById('pcCallSay').textContent = line;
        speak(line);
        pc.busy = false;
        pcMarkDone('call');
    }, 1900);
}

document.querySelectorAll('.pc-contact').forEach(b => b.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    pcCall(b.dataset.c);
}));
document.getElementById('pcHangup').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    pcClearTimers();
    pc.busy = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    playFreqSweep(600, 300, 0.25, 0.1);
    pcCallList();
});

document.querySelectorAll('.pc-icon').forEach(b => b.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    playPop();
    pcShow(b.dataset.app);
}));
document.getElementById('pcHome').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    playPop();
    pcShow(null);
});
document.getElementById('pcDone').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.currentTarget.classList.remove('show');
    pc.done.clear();
    document.querySelectorAll('#pcTodo [data-a]').forEach(t => t.classList.remove('done'));
    pc.mailsSent = 0;
    document.getElementById('pcMailCount').textContent = '📤 0';
});

function openPc() {
    // Papa makes room so the princess can work herself
    const papa = papaAtComputer();
    if (papa) {
        parentStopWork(papa, '👍');
        papa.goal = { wing: papa.wing, x: roomX('werkkamer') + 700 };
    }
    pcOpen = true;
    pcEl.classList.add('open');
    document.getElementById('pcDone').classList.remove('show');
    pcShow(null);
    playFreqSweep(300, 1200, 0.5, 0.1);
    speak('Aan het werk! Kies iets op de computer.');
}

function closePc() {
    pcOpen = false;
    pcClearTimers();
    pc.app = null;
    pc.busy = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    pcEl.classList.remove('open');
    _playWhoosh();
}
document.getElementById('pcClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closePc(); });
pcEl.addEventListener('pointerdown', (e) => e.stopPropagation());
