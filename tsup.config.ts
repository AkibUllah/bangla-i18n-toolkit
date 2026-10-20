import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/numerals.ts',
    'src/currency.ts',
    'src/date.ts',
    'src/relative-time.ts',
    'src/plural.ts',
    'src/ordinal.ts',
    'src/words.ts',
    'src/phone.ts',
    'src/nid.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: 'es2020',
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
});
