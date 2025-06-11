import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

/** @type {import('rolldown').defineConfig} */
export default defineConfig({
  input: 'index.ts',
  external: ['zod'],
  output: {
    format: 'esm',
    dir: 'dist',
    sourcemap: true,
    minify: true,
  },
  plugins: [dts()],
});
