// Checks that every file the games need is precached by sw.js (so it works offline)
// and that every prinses js/css file is loaded by prinses.html. Run: node scripts/check-assets.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(root, f));
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);

const errors = [];

// 1. sw.js PRECACHE_URLS <-> files on disk
const sw = read('sw.js');
const list = sw.slice(sw.indexOf('PRECACHE_URLS'), sw.indexOf('];', sw.indexOf('PRECACHE_URLS')));
const precached = new Set([...list.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean));
const needed = [
    'index.html', 'manifest.json',
    ...walk('games').filter((f) => /\.(html|js|css)$/.test(f)),
    ...walk('kleurplaten').filter((f) => /\.(svg|json)$/.test(f)),
    ...walk('icons').filter((f) => f !== 'icons/icon.svg')
];
for (const f of needed) if (!precached.has(f)) errors.push(`sw.js: ${f} ontbreekt in PRECACHE_URLS`);
for (const f of precached) if (!exists(f)) errors.push(`sw.js: ${f} staat in PRECACHE_URLS maar bestaat niet`);

// 2. prinses.html <-> games/prinses/**
const page = read('games/prinses.html');
const refs = new Set([...page.matchAll(/(?:src|href)="(prinses\/[^"]+\.(?:js|css))"/g)].map((m) => 'games/' + m[1]));
for (const f of walk('games/prinses').filter((f) => /\.(js|css)$/.test(f))) {
    if (!refs.has(f)) errors.push(`prinses.html: ${f} wordt niet geladen`);
}
for (const f of refs) if (!exists(f)) errors.push(`prinses.html: laadt ${f}, maar dat bestand bestaat niet`);

// 3. The prinses scripts share one global scope: a name declared at top level in two files
// either breaks (let/const) or silently overrides (function)
const declared = new Map();
for (const f of ['games/shared.js', ...walk('games/prinses/js')].filter((f) => f.endsWith('.js'))) {
    for (const m of read(f).matchAll(/^(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) {
        if (declared.has(m[1]) && declared.get(m[1]) !== f) errors.push(`${f}: ${m[1]} is al gedeclareerd in ${declared.get(m[1])}`);
        else declared.set(m[1], f);
    }
}

// 4. Homepage game links
const index = read('index.html');
for (const m of index.matchAll(/url: '(games\/[^']+)'/g)) {
    if (!exists(m[1])) errors.push(`index.html: ${m[1]} bestaat niet`);
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}
console.log(`ok: ${precached.size} precached bestanden, ${refs.size} prinses-bestanden`);
