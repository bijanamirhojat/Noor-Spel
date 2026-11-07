/* 🎣 Vissen bij de vijver: tik in het water en het haakje zakt daarheen. Een vis zwemt erop af en bijt:
   de dobber gaat onder en dan snel tikken om hem op te halen (te laat = hij zwemt weg). De vangst gaat
   in de emmer en in de verzamelrij onderaan; tik de emmer aan om de visjes weer vrij te laten.
   Ook een zeldzame gouden vis en een oude laars. Wat je ooit gevangen hebt staat in noor-prinses-vissen. */
const VS_KEY = 'noor-prinses-vissen';
const VS_KINDS = [
    { id: 'vis', e: '🐟', say: 'Een visje!', w: 5 },
    { id: 'tropisch', e: '🐠', say: 'Een tropisch visje!', w: 4 },
    { id: 'kogelvis', e: '🐡', say: 'Een kogelvis! Hij is helemaal rond!', w: 3 },
    { id: 'garnaal', e: '🦐', say: 'Een garnaal!', w: 2 },
    { id: 'krab', e: '🦀', say: 'Een krab! Knip knip!', w: 2, bottom: true },
    { id: 'inktvis', e: '🐙', say: 'Een inktvis met acht armen!', w: 1 },
    { id: 'goud', e: '🐟', say: 'Wauw! Een gouden vis!', w: 0.6, gold: true },
    { id: 'laars', e: '👢', say: 'Haha, een oude laars!', w: 0.7, bottom: true, still: true }
];
const VS_FISH = 5;
const vsOv = document.getElementById('vsOv');
const vs = { fish: [], hook: { x: 0, y: 0, tx: 0, ty: 0, phase: 'idle' }, biter: null, biteEnd: 0, nextBite: 0, caught: {}, bucket: [], raf: 0, last: 0, round: 0 };
let vsOpen = false;
registerOverlay(() => vsOpen, closeFishing);
try { vs.caught = JSON.parse(localStorage.getItem(VS_KEY)) || {}; } catch { /* geen opslag */ }

const vsWater = () => document.getElementById('vsWater');

function vsPickKind() {
    const total = VS_KINDS.reduce((s, k) => s + k.w, 0);
    let r = Math.random() * total;
    return VS_KINDS.find(k => (r -= k.w) < 0) || VS_KINDS[0];
}

function vsSpawn(fromSide) {
    const kind = vsPickKind();
    const w = vsWater().clientWidth, h = vsWater().clientHeight;
    const node = el(`<div class="vs-fish${kind.gold ? ' vs-gold' : ''}"><span>${kind.e}</span></div>`);
    vsWater().appendChild(node);
    const dir = Math.random() < 0.5 ? -1 : 1;
    const f = {
        kind, node,
        x: fromSide ? (dir > 0 ? -40 : w + 40) : w * (0.3 + Math.random() * 0.65),
        y: kind.bottom ? h - 34 : h * (0.18 + Math.random() * 0.6),
        vx: kind.still ? 0 : dir * (kind.bottom ? 25 : 40 + Math.random() * 50),
        phase: Math.random() * 6, chase: false, shy: 0
    };
    vs.fish.push(f);
    return f;
}

// Tap in the water: drop the hook there, or reel in when something bites
function vsTap(e) {
    e.stopPropagation();
    const h = vs.hook;
    if (h.phase === 'bite') { vsReel(); return; }
    if (h.phase === 'reel') return;
    const r = vsWater().getBoundingClientRect();
    // Not under the jetty (it covers the left 22%)
    h.tx = Math.max(r.width * 0.25, Math.min(r.width - 30, e.clientX - r.left));
    h.ty = Math.max(30, Math.min(r.height - 26, e.clientY - r.top));
    h.phase = 'down';
    vs.fish.forEach(f => { f.chase = false; });
    playFreqSweep(900, 300, 0.25, 0.08);
}

function vsReel() {
    const h = vs.hook, f = vs.biter;
    h.phase = 'reel';
    h.tx = h.x;
    h.ty = -30;
    document.getElementById('vsBobber').classList.remove('dip');
    playFreqSweep(300, 1200, 0.6, 0.08);
    for (let i = 0; i < 6; i++) setTimeout(() => playTone(1600 + i * 80, 0.03, 0.04, 'square'), i * 90);
    f.node.classList.add('hooked');
}

// Out of the water: into the bucket
function vsLanded() {
    const f = vs.biter, round = vs.round;
    vs.biter = null;
    vs.fish.splice(vs.fish.indexOf(f), 1);
    const bucket = document.getElementById('vsBucket');
    const html = f.kind.gold ? `<span class="vs-gold">${f.kind.e}</span>` : f.kind.e;
    f.node.style.visibility = 'hidden';
    playCorrect();
    speak(f.kind.say);
    ovFly(vsOv, f.node, bucket, html, 650).then(() => {
        f.node.remove();
        if (round !== vs.round) return;
        vs.bucket.push(f.kind);
        vs.caught[f.kind.id] = (vs.caught[f.kind.id] || 0) + 1;
        try { localStorage.setItem(VS_KEY, JSON.stringify(vs.caught)); } catch { /* geen opslag */ }
        vsRenderBucket();
        vsRenderAlbum(f.kind.id);
        bounceEl(bucket, 'jump');
        ovCheer(vsOv, bucket, f.kind.gold ? ['✨', '⭐', '🌟'] : ['💦', '✨', '💖']);
        if (f.kind.gold) playWin();
    });
    vs.hook.phase = 'idle';
    setTimeout(() => { if (round === vs.round && vsOpen) vsSpawn(true); }, 1500);
}

function vsRenderBucket() {
    document.getElementById('vsBucketIn').innerHTML = vs.bucket.slice(-6).map(k => `<span class="${k.gold ? 'vs-gold' : ''}">${k.e}</span>`).join('');
}

function vsRenderAlbum(newId) {
    document.getElementById('vsAlbum').innerHTML = VS_KINDS.map(k => {
        const n = vs.caught[k.id] || 0;
        return `<div class="vs-card${n ? ' got' : ''}${k.id === newId ? ' v-jump' : ''}"><span class="${k.gold ? 'vs-gold' : ''}">${k.e}</span><b>${n || ''}</b></div>`;
    }).join('');
}

// Let the fish in the bucket go again
function vsRelease(e) {
    e.stopPropagation();
    if (!vs.bucket.length) { bounceEl(document.getElementById('vsBucket'), 'nope'); return; }
    const bucket = document.getElementById('vsBucket');
    vs.bucket.forEach((k, i) => setTimeout(() => {
        ovFly(vsOv, bucket, vsWater(), k.gold ? `<span class="vs-gold">${k.e}</span>` : k.e, 600);
        playFreqSweep(700, 200, 0.2, 0.08);
    }, i * 150));
    vs.bucket = [];
    vsRenderBucket();
    speak('Dag visjes! Zwem maar lekker!');
}

function vsFrame(now) {
    if (!vsOpen) return;
    const dt = Math.min(0.05, (now - (vs.last || now)) / 1000);
    vs.last = now;
    const water = vsWater();
    const w = water.clientWidth, hgt = water.clientHeight;
    const h = vs.hook;
    const tip = vsTip();

    // Hook: hangs below the rod, sinks to where you tapped, or comes up with the catch
    if (h.phase === 'idle') { h.tx = tip.x; h.ty = 40; }
    const dx = h.tx - h.x, dy = h.ty - h.y;
    const sp = h.phase === 'reel' ? 520 : 420;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
        const s = Math.min(1, sp * dt / d);
        h.x += dx * s;
        h.y += dy * s;
    } else if (h.phase === 'down') {
        h.phase = 'wait';
        vs.nextBite = now + 700 + Math.random() * 1300;
    }
    if (h.phase === 'reel' && h.y < 0) vsLanded();

    // A fish notices the hook and swims to it
    if (h.phase === 'wait' && now > vs.nextBite && !vs.fish.some(f => f.chase)) {
        const near = vs.fish.filter(f => f.shy < now && (!f.kind.still || Math.hypot(f.x - h.x, f.y - h.y) < 90))
            .sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
        if (near) near.chase = true;
        else vs.nextBite = now + 1500;
    }
    if (h.phase === 'bite' && now > vs.biteEnd) {
        // Too late: it got away
        const f = vs.biter;
        vs.biter = null;
        f.chase = false;
        f.shy = now + 4000;
        f.vx = (f.x < w / 2 ? -1 : 1) * 160;
        f.node.classList.remove('nibble');
        document.getElementById('vsBobber').classList.remove('dip');
        h.phase = 'wait';
        vs.nextBite = now + 1200;
        playTone(330, 0.12, 0.1, 'triangle');
        setTimeout(() => playTone(262, 0.18, 0.1, 'triangle'), 140);
        speak('Oei, hij is weg! Probeer het nog eens.');
    }

    vs.fish.forEach(f => {
        if (f === vs.biter) {
            f.x = h.x + (h.phase === 'reel' ? 0 : Math.sin(now / 60) * 3);
            f.y = h.y + 8;
        } else if (f.chase && h.phase === 'wait') {
            const fx = h.x - f.x, fy = h.y + 8 - f.y, fd = Math.hypot(fx, fy);
            if (fd < 10) {
                vs.biter = f;
                f.chase = false;
                h.phase = 'bite';
                vs.biteEnd = now + 3500;
                f.node.classList.add('nibble');
                document.getElementById('vsBobber').classList.add('dip');
                playFreqSweep(500, 150, 0.2, 0.15);
                speak('Beet! Tik snel!');
            } else {
                const s = Math.min(1, (f.kind.still ? 30 : 110) * dt / fd);
                f.x += fx * s;
                f.y += fy * s;
                if (Math.abs(fx) > 4) f.vx = Math.sign(fx) * Math.abs(f.vx || 30);
            }
        } else {
            f.x += f.vx * dt;
            if (!f.kind.bottom) f.y += Math.sin(now / 700 + f.phase) * 12 * dt;
            if (!f.kind.bottom) f.y = Math.max(30, Math.min(hgt - 40, f.y));
            // Swim back from the edges, and back down after a chase
            if (f.x < 30 && f.vx < 0) f.vx = Math.abs(f.vx) > 80 && f.shy > now ? f.vx : Math.abs(f.vx);
            if (f.x > w - 30 && f.vx > 0) f.vx = Math.abs(f.vx) > 80 && f.shy > now ? f.vx : -Math.abs(f.vx);
            if (f.kind.bottom && f.y < hgt - 34) f.y = Math.min(hgt - 34, f.y + 60 * dt);
        }
        f.node.style.transform = `translate(${f.x}px, ${f.y}px) translate(-50%, -50%)`;
        f.node.classList.toggle('right', f.vx > 0);
    });
    // Fish that swam off scared come back as new ones
    vs.fish.filter(f => f.x < -80 || f.x > w + 80).forEach(f => {
        f.node.remove();
        vs.fish.splice(vs.fish.indexOf(f), 1);
        vsSpawn(true);
    });

    // Line from the rod tip to the bobber on the surface, then down to the hook
    const r = water.getBoundingClientRect(), sr = document.getElementById('vsStage').getBoundingClientRect();
    const ox = r.left - sr.left, oy = r.top - sr.top;
    const hx = ox + h.x, hy = oy + Math.max(0, h.y);
    document.getElementById('vsLine').setAttribute('d', `M${ox + tip.x} ${tip.y} Q${(ox + tip.x + hx) / 2} ${oy - 10} ${hx} ${oy} L${hx} ${hy}`);
    const bob = document.getElementById('vsBobber');
    bob.style.transform = `translate(${hx}px, ${oy}px)`;
    document.getElementById('vsHook').style.transform = `translate(${hx}px, ${hy}px)`;
    vs.raf = requestAnimationFrame(vsFrame);
}

// The tip of the fishing rod, in stage px (x relative to the water, y relative to the stage)
function vsTip() {
    const rod = document.getElementById('vsRodTip').getBoundingClientRect();
    const sr = document.getElementById('vsStage').getBoundingClientRect();
    const wr = vsWater().getBoundingClientRect();
    return { x: rod.left + rod.width / 2 - wr.left, y: rod.top + rod.height / 2 - sr.top };
}

function openFishing() {
    vsOpen = true;
    vs.round++;
    vsOv.classList.add('open');
    document.getElementById('vsGirl').innerHTML = princessSVG('vs');
    applyLook();
    vsWater().querySelectorAll('.vs-fish').forEach(n => n.remove());
    vs.fish = [];
    vs.biter = null;
    vs.bucket = [];
    vsRenderBucket();
    vsRenderAlbum();
    for (let i = 0; i < VS_FISH; i++) vsSpawn(false);
    const tip = vsTip();
    Object.assign(vs.hook, { x: tip.x, y: 40, tx: tip.x, ty: 40, phase: 'idle' });
    vs.last = 0;
    cancelAnimationFrame(vs.raf);
    vs.raf = requestAnimationFrame(vsFrame);
    playMusicBox();
    speak('Tik in het water, dan gooi je je hengel uit!');
}

function closeFishing() {
    vsOpen = false;
    vs.round++;
    cancelAnimationFrame(vs.raf);
    vsOv.classList.remove('open');
    document.getElementById('vsBobber').classList.remove('dip');
    _playWhoosh();
}

vsWater().addEventListener('pointerdown', vsTap);
document.getElementById('vsBucket').addEventListener('pointerdown', vsRelease);
document.getElementById('vsClose').addEventListener('pointerdown', (e) => { e.stopPropagation(); closeFishing(); });
vsOv.addEventListener('pointerdown', (e) => e.stopPropagation());
