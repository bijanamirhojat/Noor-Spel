/* 🧚 Elvenkamer: een sprookjesbos binnen in het kasteel, met rondvliegende elfjes
   en het spelletje "elfjes verstoppertje" in de elfenboom. */
const ELF_HUES = [0, 60, 140, 200, 280];

defineRoom({
    key: 'elvenkamer',
    name: 'Elvenkamer',
    icon: '🧚',
    say: 'De elvenkamer',
    build(x) {
        for (let i = 0; i < 14; i++) {
            const f = place(el('<div class="firefly"></div>'), x + 30 + Math.random() * 740, 40 + Math.random() * 300);
            f.style.animationDelay = (-Math.random() * 6) + 's';
            f.style.animationDuration = (4 + Math.random() * 4) + 's';
        }
        addObj(`<div class="elf-tree">
            <div class="crown"></div><div class="trunk"><div class="elf-door"></div></div>
            <div class="tap-hint" style="left:110px;top:-30px">👇</div>
        </div>`, x + 260, 40, x + 380, openElfGame);
        [[60, 300, 1.2, 0], [640, 280, 1.4, 1], [190, 340, 0.8, 2]].forEach(([mx, my, sc, i]) => {
            addObj(`<div class="glow-shroom" style="--s:${sc}"><div class="cap"></div><div class="stem"></div></div>`, x + mx, my, x + mx + 40, (node) => {
                node.classList.remove('pulse'); void node.offsetWidth; node.classList.add('pulse');
                playTone([784, 988, 1175][i], 0.6, 0.12, 'sine');
                const r = node.getBoundingClientRect();
                const c = screenToWorld(r.left + r.width / 2, r.top);
                for (let k = 0; k < 18; k++) spawnSparkle(c.x, c.y, { speed: 120, hue: 140 + Math.random() * 80 });
            });
        });
        // A ring of tiny mushrooms on the floor
        for (let i = 0; i < 9; i++) {
            const a = (i / 9) * Math.PI * 2;
            place(el('<div class="ring-shroom">🍄</div>'), x + 520 + Math.cos(a) * 90, 410 + Math.sin(a) * 22);
        }
        // Fairies flying around the room
        ELF_HUES.slice(0, 4).forEach((h, i) => {
            const startX = x + 120 + i * 170;
            const f = addObj(`<div class="elf-fly path${i}" style="--h:${h}deg"><span>🧚</span></div>`, startX, 90 + (i % 2) * 70, startX + 30, (node) => {
                node.classList.remove('spin'); void node.offsetWidth; node.classList.add('spin');
                [1568, 2093, 2637, 3136].forEach((fq, k) => setTimeout(() => playTone(fq, 0.15, 0.07, 'sine'), k * 70));
                const r = node.getBoundingClientRect();
                const c = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
                for (let k = 0; k < 30; k++) spawnSparkle(c.x, c.y, { speed: 160, hue: (h + 300) % 360 });
            });
            f.style.animationDelay = (-i * 2.3) + 's';
        });
    }
});

/* Elfjes verstoppertje */
const ELF_SPOTS = [
    ['🍄', 12, 72], ['🌸', 30, 80], ['🌷', 50, 76], ['🍃', 70, 80], ['🌻', 88, 72],
    ['🍁', 20, 42], ['🌼', 40, 38], ['🍄', 62, 40], ['🌿', 82, 40]
];
const elf = { round: 1, hidden: [], found: 0, lastFind: 0, hintT: null };
let elfOpen = false;

function newElfRound() {
    const count = Math.min(2 + elf.round, 5);
    elf.hidden = shuffle([...ELF_SPOTS.keys()]).slice(0, count);
    elf.found = 0;
    elf.lastFind = performance.now();
    const stage = document.getElementById('elfStage');
    stage.innerHTML = ELF_SPOTS.map(([e, x, y], i) =>
        `<button class="elf-spot" data-i="${i}" style="left:${x}%;top:${y}%">${e}</button>`).join('');
    stage.querySelectorAll('.elf-spot').forEach(b => b.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        searchSpot(b);
    }));
    renderElfFound();
    document.getElementById('elfAgain').style.display = 'none';
    clearInterval(elf.hintT);
    // After a while without finding one, a hiding spot starts to twinkle
    elf.hintT = setInterval(() => {
        if (!elfOpen || performance.now() - elf.lastFind < 7000) return;
        const left = elf.hidden.filter(i => !stage.querySelector(`.elf-spot[data-i="${i}"]`).classList.contains('empty'));
        if (!left.length) return;
        const b = stage.querySelector(`.elf-spot[data-i="${randomPick(left)}"]`);
        b.classList.remove('hint'); void b.offsetWidth; b.classList.add('hint');
    }, 2500);
}

function renderElfFound() {
    const total = elf.hidden.length;
    document.getElementById('elfFound').innerHTML = Array.from({ length: total }, (_, i) =>
        i < elf.found ? `<span style="--h:${ELF_HUES[i % ELF_HUES.length]}deg" class="got">🧚</span>` : '<span>❔</span>').join('');
}

function searchSpot(b) {
    if (b.classList.contains('empty')) return;
    b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
    const i = +b.dataset.i;
    if (!elf.hidden.includes(i)) {
        playTone(220, 0.1, 0.1, 'triangle');
        return;
    }
    b.classList.add('empty');
    elf.found++;
    elf.lastFind = performance.now();
    const stage = document.getElementById('elfStage');
    const fairy = el(`<div class="elf-pop" style="left:${ELF_SPOTS[i][1]}%;top:${ELF_SPOTS[i][2]}%;--h:${ELF_HUES[(elf.found - 1) % ELF_HUES.length]}deg">🧚</div>`);
    stage.appendChild(fairy);
    [1319, 1568, 1760, 2093, 1760, 2093].forEach((f, k) => setTimeout(() => playTone(f, 0.08, 0.08, 'square'), k * 60));
    const r = b.getBoundingClientRect();
    const o = document.getElementById('elfOv').getBoundingClientRect();
    for (let k = 0; k < 10; k++) {
        const sp = document.createElement('span');
        sp.className = 'scope-spark';
        sp.textContent = randomPick(['✨', '⭐', '💫', '🌟']);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 60;
        sp.style.left = (r.left - o.left + r.width / 2) + 'px';
        sp.style.top = (r.top - o.top + r.height / 2) + 'px';
        sp.style.setProperty('--dx', Math.cos(a) * d + 'px');
        sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
        document.getElementById('elfOv').appendChild(sp);
        setTimeout(() => sp.remove(), 900);
    }
    renderElfFound();
    if (elf.found === elf.hidden.length) {
        setTimeout(() => {
            playWin();
            stage.querySelectorAll('.elf-pop').forEach((f, k) => {
                f.style.setProperty('--a', `${(k / elf.hidden.length) * 360}deg`);
                f.classList.add('dance');
            });
            document.getElementById('elfAgain').style.display = '';
            elf.round++;
        }, 700);
    }
}

function openElfGame() {
    elfOpen = true;
    document.getElementById('elfOv').classList.add('open');
    newElfRound();
    playMusicBox();
}

function closeElfGame() {
    elfOpen = false;
    clearInterval(elf.hintT);
    document.getElementById('elfOv').classList.remove('open');
    _playWhoosh();
}

document.getElementById('elfAgain').addEventListener('pointerdown', (e) => { e.stopPropagation(); newElfRound(); playPop(); });
document.getElementById('elfClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeElfGame(); });
document.getElementById('elfOv').addEventListener('pointerdown', (e) => e.stopPropagation());
