// Prints raw and gzipped sizes of the built bundles. Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = new URL('../dist/', import.meta.url).pathname;
let files;
try {
  files = readdirSync(dist).filter((f) => /\.(js|cjs)$/.test(f));
} catch {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const rows = files
  .map((file) => {
    const raw = statSync(join(dist, file)).size;
    const gzip = gzipSync(readFileSync(join(dist, file))).length;
    return { file, raw, gzip };
  })
  .sort((a, b) => a.file.localeCompare(b.file));

const kb = (n) => `${(n / 1024).toFixed(2)} kB`;
console.log(`${'file'.padEnd(28)}${'raw'.padStart(12)}${'gzip'.padStart(12)}`);
for (const { file, raw, gzip } of rows) {
  console.log(`${file.padEnd(28)}${kb(raw).padStart(12)}${kb(gzip).padStart(12)}`);
}
const total = rows.filter((r) => r.file === 'index.js').map((r) => r.gzip)[0];
if (total !== undefined) console.log(`\nindex.js (ESM, everything) gzipped: ${kb(total)}`);
