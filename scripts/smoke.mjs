// Smoke test: opens every game, then walks the princess through every room of every world,
// taps every object, presses some buttons in each activity and closes it again.
// Fails on any JavaScript error. Run: node scripts/smoke.mjs  (add --only=<scene> to test one world)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404).end();
        return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const errors = [];
const warnings = [];

async function newPage(label) {
    // iPad landscape, like Noor plays it
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
    const page = await ctx.newPage();
    page.where = '';
    // Google Fonts etc.: answer locally so the test doesn't depend on the internet
    await page.route((url) => !url.href.startsWith(base), (route) =>
        route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    page.on("pageerror", (e) => errors.push(`[${label}${page.where}] ${e.message}\n      ${(e.stack || "").split("\n").slice(1, 4).join("\n      ")}`));
    page.on('requestfailed', (r) => errors.push(`[${label}${page.where}] laden mislukt: ${r.url()} ${r.failure()?.errorText}`));
    page.on('response', (r) => {
        if (r.status() >= 400) errors.push(`[${label}${page.where}] ${r.status()}: ${r.url()}`);
    });
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`[${label}${page.where}] console.error: ${m.text()}`);
    });
    return page;
}

// 1. The homepage and every standalone game
async function smokeGames() {
    const page = await newPage('index');
    await page.goto(base + 'index.html');
    const games = await page.evaluate(() => Object.values(GAMES).map((g) => g.url));
    for (const url of games.filter((u) => !u.includes('prinses'))) {
        page.where = ' ' + url;
        await page.goto(base + url);
        await page.waitForTimeout(400);
        // Tap the middle of the screen a few times
        for (let i = 0; i < 3; i++) await page.touchscreen.tap(590, 450 + i * 40);
        await page.waitForTimeout(300);
    }
    await page.context().close();
}

// 2. The princess castle, one page per world
const IN_PAGE = () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const until = async (fn, ms) => {
        const t = performance.now();
        while (performance.now() - t < ms) {
            if (fn()) return true;
            await sleep(50);
        }
        return false;
    };
    const visible = (n) => {
        const r = n.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(n).visibility !== 'hidden';
    };
    const tap = (n) => {
        const r = n.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerId: 1, isPrimary: true };
        n.dispatchEvent(new PointerEvent('pointerdown', o));
        n.dispatchEvent(new PointerEvent('pointerup', o));
        n.dispatchEvent(new MouseEvent('click', o));
    };
    // Walking is not what we test here: arrive instantly
    window.walkTo = (x, action) => {
        state.x = state.targetX = clampX(x);
        state.pending = null;
        if (action) action();
    };
    async function goTo(sceneKey, idx) {
        await until(() => !state.busy && !overlayOpen(), 20000);
        travelTo(sceneKey, idx);
        await until(() => !state.busy, 5000);
        await sleep(150);
    }
    async function closeOverlay(warn) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
        if (await until(() => !overlayOpen(), 600)) return true;
        warn('Escape sluit de overlay niet');
        for (const c of [...document.querySelectorAll('.scope-close')].filter(visible).reverse()) {
            tap(c);
            if (await until(() => !overlayOpen(), 1500)) return true;
        }
        return false;
    }
    return { sleep, until, visible, tap, goTo, closeOverlay };
};

async function smokeScene(sceneKey) {
    const page = await newPage(sceneKey);
    await page.goto(base + 'games/prinses.html');
    await page.waitForFunction(() => typeof travelTo === 'function' && typeof SCENES !== 'undefined' && SCENES.hal && SCENES.hal.rooms);
    const rooms = await page.evaluate((k) => SCENES[k].rooms.map((r) => r.key), sceneKey);
    for (let idx = 0; idx < rooms.length; idx++) {
        const key = rooms[idx];
        page.where = ' ' + key;
        const result = await page.evaluate(async ({ sceneKey, idx, key, helpers }) => {
            const { sleep, until, visible, tap, goTo, closeOverlay } = eval(`(${helpers})`)();
            const log = [];
            await goTo(sceneKey, idx);
            const objs = [...SCENES[sceneKey].el.querySelectorAll('.obj')].filter((n) =>
                n.dataset.room === key && !n.matches('.lift, .castle-door'));
            for (let i = 0; i < objs.length; i++) {
                const n = objs[i];
                const name = n.className.split(' ')[0];
                const warn = (m) => log.push(`warn ${key} ${name}: ${m}`);
                if (!document.contains(n)) continue;
                if (scene.key !== sceneKey) await goTo(sceneKey, idx);
                await until(() => !state.busy && !overlayOpen(), 15000);
                tap(n);
                await sleep(400);
                // Some activities open after a little walk or animation (e.g. dinner once Mama and Papa sit down)
                await until(() => overlayOpen() || !state.busy, 15000);
                if (overlayOpen()) {
                    await sleep(400);
                    // Press up to 10 buttons in the activity (not the close button)
                    const ov = [...document.querySelectorAll('.open, .show')].filter((o) =>
                        visible(o) && o.querySelector('.scope-close')).pop();
                    if (ov) {
                        const btns = [...ov.querySelectorAll('button, [role=button], .tool-btn, .bd-btn')]
                            .filter((b) => visible(b) && !b.matches('.scope-close')).slice(0, 10);
                        for (const b of btns) {
                            if (!overlayOpen()) break;
                            tap(b);
                            await sleep(120);
                        }
                    }
                    await sleep(200);
                    if (overlayOpen() && !(await closeOverlay(warn))) {
                        log.push(`error ${key} ${name}: overlay gaat niet dicht`);
                        return log;
                    }
                }
                await until(() => !state.busy, 20000) || log.push(`error ${key} ${name}: blijft bezig (state.busy)`);
            }
            return log;
        }, { sceneKey, idx, key, helpers: IN_PAGE.toString() });
        for (const line of result) (line.startsWith('error') ? errors : warnings).push(`[${sceneKey}] ${line}`);
    }
    await page.context().close();
}

const t0 = Date.now();
const scenes = ['hal', 'mooi', 'speel', 'toren', 'out', 'sea', 'dorp', 'dierentuin', 'wolken', 'ruimte'];
await Promise.all([only ? null : smokeGames(), ...scenes.filter((s) => !only || s === only).map(smokeScene)]);
await browser.close();
server.close();

for (const w of [...new Set(warnings)]) console.log('⚠️ ', w);
for (const e of [...new Set(errors)]) console.log('❌', e);
console.log(`${errors.length ? 'FOUT' : 'ok'}: ${errors.length} fouten, ${warnings.length} waarschuwingen in ${Math.round((Date.now() - t0) / 1000)}s`);
process.exit(errors.length ? 1 : 0);
