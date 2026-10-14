import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Sitio 100% estático: el HTML de cada página lo genera scripts/prerender.mjs
// con React DOM Server. No se envía JavaScript al navegador.
// CONFIG_DIR / OUT_DIR permiten compilar la demo (datos ficticios) sin tocar config/.
const configDir = resolve(process.env.CONFIG_DIR ?? 'config');

export default defineConfig({
  base: '/',
  resolve: { alias: { '@config': configDir } },
  build: { outDir: process.env.OUT_DIR ?? 'dist', emptyOutDir: true },
});
