/* ─────────── Overlays ───────────
   Every full-screen activity registers itself next to its open-flag:
       let fooOpen = false;
       registerOverlay(() => fooOpen, closeFoo);
   Then overlayOpen() knows about it and Escape closes it. */
const OVERLAYS = [];
function registerOverlay(isOpen, close) { OVERLAYS.push({ isOpen, close }); }

// True while any full-screen overlay (map, lift or a room activity) is open
function overlayOpen() { return OVERLAYS.some(o => o.isOpen()); }

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    // The last registered open one is on top (e.g. the photo viewer over the photo studio)
    const top = OVERLAYS.filter(o => o.isOpen()).pop();
    if (top) top.close();
});

/* ─────────── Helpers for things inside an overlay ─────────── */
// Fly a little thing inside an overlay from one element to another (with a small arc)
function ovFly(ov, fromEl, toEl, html, ms = 600) {
    const o = ov.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const f = el(`<div class="ov-fly">${html}</div>`);
    f.style.left = (a.left + a.width / 2 - o.left) + 'px';
    f.style.top = (a.top + a.height / 2 - o.top) + 'px';
    f.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms cubic-bezier(.5,-0.7,.6,1)`;
    ov.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        f.style.left = (b.left + b.width / 2 - o.left) + 'px';
        f.style.top = (b.top + b.height / 2 - o.top) + 'px';
    }));
    return new Promise(res => setTimeout(() => { f.remove(); res(); }, ms));
}

// Hearts/stars bursting out of an element inside an overlay
function ovCheer(ov, node, kinds = ['💖', '✨', '⭐', '🎉']) {
    const o = ov.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        const sp = document.createElement('span');
        sp.className = 'scope-spark';
        sp.textContent = randomPick(kinds);
        const a = Math.random() * Math.PI * 2;
        const d = 50 + Math.random() * 80;
        sp.style.left = (r.left - o.left + r.width / 2) + 'px';
        sp.style.top = (r.top - o.top + r.height / 3) + 'px';
        sp.style.setProperty('--dx', Math.cos(a) * d + 'px');
        sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
        ov.appendChild(sp);
        setTimeout(() => sp.remove(), 900);
    }
}

// Replay a short bounce animation (v-jump, v-nope, v-pulse, v-wobble in overlay.css)
function bounceEl(node, kind = 'jump') {
    const cls = 'v-' + kind;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
}

// Is a dragged point (px, py) within r of an item (x, y)?
function near(item, pt, r) {
    return Math.hypot(item.x - pt.px, item.y - pt.py) < r;
}
