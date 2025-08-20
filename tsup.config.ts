import { defineConfig } from 'tsup';

const config = defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  target: 'node16',
  splitting: false,
  shims: false
});

export default config;
