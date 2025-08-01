import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    '@alta/core',
    '@alta/types',
    '@alta/firebase',
    '@alta/logger'
  ]
});
