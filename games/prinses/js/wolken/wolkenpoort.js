/* ☁️ Wolkenpoort: aankomst, trampolinewolk, feetje en de regenboogglijbaan terug */
defineRoom({
    key: 'wolkenpoort',
    name: 'Wolkenpoort',
    icon: '☁️',
    say: 'De wolkenpoort',
    build(w0) {
        place(el('<div class="cloud-gate"><div class="cg-pearls"></div><span class="cg-star">⭐</span></div>'), w0 + 40, 110);
        scene.arriveX = w0 + 150;
        addObj('<div class="tramp-cloud"><div class="tc-puff"></div><div class="tap-hint" style="top:-36px">👇</div></div>', w0 + 300, 330, w0 + 385, trampolineBounce);
        const fairy = addObj('<div class="fairy">🧚</div>', w0 + 470, 190, w0 + 495, (node) => {
            bounceEl(node, 'wobble');
            const r = node.getBoundingClientRect();
            const c = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
            for (let i = 0; i < 40; i++) spawnSparkle(c.x, c.y, { hue: 280 + Math.random() * 80, speed: 180 });
            playSparkleSound();
        });
        fairy.style.zIndex = 4;
        place(el('<div class="door-sign">🌳 Naar beneden</div>'), w0 + 590, 120);
        // Six parallel bands: quarter circles around the bottom-left corner, so the slide
        // starts flat at the top and curves down to the right
        addObj(`<div class="rainbow-slide"><svg viewBox="0 0 220 280">
            ${['#ef4444', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a855f7'].map((c, i) => {
                const r = 205 - i * 13;
                return `<path d="M0 ${290 - r} A${r} ${r} 0 0 1 ${r} 290" stroke="${c}" stroke-width="13.5" fill="none"/>`;
            }).join('')}
            <path d="M0 78 A212 212 0 0 1 212 290" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
            </svg><div class="tap-hint" style="left:30px;top:20px">👇</div></div>`, w0 + 590, 150, w0 + 640, slideToEarth);
    }
});

function trampolineBounce(node) {
    if (state.busy) return;
    state.busy = true;
    node.classList.add('boing');
    [0, 600, 1200].forEach(t => setTimeout(() => playFreqSweep(200, 700, 0.3, 0.14), t));
    tween(1800, (t) => {
        const hop = Math.abs(Math.sin(t * Math.PI * 3));
        state.anim.dy = -170 * hop * (1 - t * 0.3);
        state.anim.rot = t > 0.66 ? 360 * ((t - 0.66) / 0.34) : 0;
        if (Math.random() < 0.4) spawnSparkle(state.x + (Math.random() - 0.5) * 60, FEET_Y - 60 + state.anim.dy, { hue: 200 + Math.random() * 100, speed: 60 });
    }, () => {
        resetAnim();
        node.classList.remove('boing');
        burst(state.x, 400, 30);
        state.busy = false;
    });
}
