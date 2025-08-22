import { defineConfig } from 'tsup';

const config = defineConfig({
  entry: ['src/**/*.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  target: 'node16',
  splitting: false,
  shims: false,
  external: ['net', 'tls', 'https-proxy-agent', 'socks-proxy-agent', 'http-proxy-agent']
});

export default config;
