/* ─────────── Sounds shared by several rooms ─────────── */
// Looping filtered noise for the shower and the hair dryer
let noise = null;
function startNoise(kind) {
    stopNoise();
    try {
        const ctx = getAudioContext();
        const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = kind === 'shower' ? 'highpass' : 'bandpass';
        filter.frequency.value = kind === 'shower' ? 2500 : 700;
        const gain = ctx.createGain();
        gain.gain.value = kind === 'shower' ? 0.05 : 0.07;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        noise = { src, gain, ctx };
    } catch (e) {}
}
function stopNoise() {
    if (!noise) return;
    try {
        noise.gain.gain.setTargetAtTime(0, noise.ctx.currentTime, 0.05);
        noise.src.stop(noise.ctx.currentTime + 0.2);
    } catch (e) {}
    noise = null;
}

// Altijd is Kortjakje ziek, at bedtime (slaapkamer, and Mama and Papa singing at the bed)
function playLullaby() {
    const notes = [523, 523, 784, 784, 880, 880, 784, 0, 698, 698, 659, 659, 587, 587, 523];
    notes.forEach((f, i) => { if (f) setTimeout(() => playTone(f, 0.4, 0.12, 'sine'), i * 420); });
}
