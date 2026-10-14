// Orquesta el build: CSS (Vite) -> bundle SSR -> HTML por página.
// --demo compila demo/ (datos ficticios) en dist-demo/ sin tocar config/ ni dist/.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const demo = process.argv.includes('--demo');
const env = {
  ...process.env,
  CONFIG_DIR: demo ? 'demo' : 'config',
  OUT_DIR: demo ? 'dist-demo' : 'dist',
  SSR_DIR: demo ? 'dist-demo-ssr' : 'dist-ssr',
};
const vite = resolve(root, 'node_modules', 'vite', 'bin', 'vite.js');
const run = (args) => execFileSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' });

run([vite, 'build']);
run([vite, 'build', '--ssr', 'src/entry-server.tsx', '--outDir', env.SSR_DIR]);
run([resolve(root, 'scripts', 'prerender.mjs')]);

if (process.argv.includes('--serve')) {
  process.env.DIST = env.OUT_DIR;
  process.env.PORT ??= '4174';
  await import('./serve-dist.mjs');
}
