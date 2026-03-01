/* Noor-Spel: Shared game utilities
   Eliminates duplicate JS across all 19 games. */

/** Fisher-Yates shuffle (in-place) */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/** Pick a random item from an array */
function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/** Lazy singleton AudioContext */
let _audioCtx = null;
function getAudioContext() {
    if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === 'suspended') {
        _audioCtx.resume();
    }
    return _audioCtx;
}

/** Play a simple oscillator tone */
function playTone(freq, duration = 0.3, volume = 0.3, type = 'sine') {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}

/** Play a frequency sweep (e.g. pop/whoosh sounds) */
function playFreqSweep(startFreq, endFreq, duration = 0.1, volume = 0.2) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
        osc.type = 'sine';
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}

/** Speak text using nl-NL speechSynthesis */
function speak(text, { rate = 0.6, pitch = 1.2 } = {}) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'nl-NL';
        utterance.rate = rate;
        utterance.pitch = pitch;
        speechSynthesis.speak(utterance);
    }
}

/* ── Standardized feedback sounds ── */

/** Short pop for taps (upward sweep) */
function playPop() {
    playFreqSweep(800, 1200, 0.08, 0.25);
}

/** Correct answer — ascending triad C5-E5-G5 */
function playCorrect() {
    try {
        const ctx = getAudioContext();
        [523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            const t = ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(t);
            osc.stop(t + 0.2);
        });
    } catch(e) {}
}

/** Wrong answer — short low buzz */
function playWrong() {
    playTone(150, 0.25, 0.2, 'square');
}

/** Win/completion fanfare — C5-E5-G5-C6 */
function playWin() {
    try {
        const ctx = getAudioContext();
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            const t = ctx.currentTime + i * 0.12;
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    } catch(e) {}
}

/* ── Game intro & exit animations ── */

/** Quick ascending two-note welcome chime */
function _playWelcomeChime() {
    try {
        const ctx = getAudioContext();
        [659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            const t = ctx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
            osc.start(t);
            osc.stop(t + 0.15);
        });
    } catch(e) {}
}

/** Reverse whoosh for back navigation */
function _playWhoosh() {
    playFreqSweep(1000, 400, 0.15, 0.2);
}

/* Auto-init on DOMContentLoaded: game-intro animation + back-button intercept */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.game-container');
    if (!container) return;

    /* Game intro: fade-in + slide-up container, title bounce */
    container.classList.add('game-intro');
    _playWelcomeChime();

    /* Intercept back button: play whoosh + exit animation before navigating */
    const backBtn = container.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            _playWhoosh();
            container.classList.remove('game-intro');
            container.classList.add('game-exit');
            const href = backBtn.href || '../index.html';
            setTimeout(() => { window.location.href = href; }, 300);
        });
    }
});
