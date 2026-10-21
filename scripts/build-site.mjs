// Assembles the static playground into _site/: the page from site/ plus the built ESM bundle.
// Run after `npm run build` (the `site` npm script does both).
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const dist = `${root}dist/`;
const out = `${root}_site/`;

if (!existsSync(`${dist}index.js`)) {
  console.error('dist/index.js not found. Run `npm run build` first.');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}lib`, { recursive: true });
cpSync(`${root}site/`, out, { recursive: true });
for (const file of ['index.js', 'index.js.map', 'index.d.ts']) {
  cpSync(`${dist}${file}`, `${out}lib/${file}`);
}
// GitHub Pages must not run Jekyll over the output.
writeFileSync(`${out}.nojekyll`, '');
console.log('Playground written to _site/ (open _site/index.html through any static server).');
