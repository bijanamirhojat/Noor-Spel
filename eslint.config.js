// The princess game is ~85 classic scripts that share one global scope, so every top-level
// name declared in one file is a global in all others. Collect them so no-undef still catches typos.
import fs from 'node:fs';
import path from 'node:path';
import js from '@eslint/js';
import globals from 'globals';

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
}

const pageScripts = ['games/shared.js', ...walk('games/prinses/js')].filter((f) => f.endsWith('.js'));
const shared = {};
for (const f of pageScripts) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/^(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) {
        shared[m[1]] = 'writable';
    }
}

export default [
    { ignores: ['node_modules/**', '.opencode/**', '.claude/**'] },
    js.configs.recommended,
    {
        files: ['games/**/*.js'],
        languageOptions: {
            sourceType: 'script',
            ecmaVersion: 'latest',
            globals: { ...globals.browser, ...shared }
        },
        rules: {
            // Functions are often defined in one file and used in another
            'no-unused-vars': 'off',
            // Each file re-declaring its own names is fine; duplicates across files are caught by check-assets.mjs
            'no-redeclare': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }]
        }
    },
    {
        files: ['sw.js'],
        languageOptions: { sourceType: 'script', globals: globals.serviceworker }
    },
    {
        files: ['scripts/**/*.mjs', 'eslint.config.js'],
        languageOptions: { sourceType: 'module', globals: globals.node }
    },
    {
        // Parts of the smoke test run inside the game page
        files: ['scripts/smoke.mjs'],
        languageOptions: { globals: { ...globals.node, ...globals.browser, ...shared, GAMES: 'readonly' } }
    }
];
