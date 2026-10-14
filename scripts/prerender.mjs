// Toma el index.html compilado por Vite (con el CSS) y genera un HTML completo
// por página usando React DOM Server (dist-ssr). No se publica JavaScript.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, process.env.OUT_DIR ?? 'dist');

const { buildSite } = await import(pathToFileURL(join(root, process.env.SSR_DIR ?? 'dist-ssr', 'entry-server.js')).href);
const site = buildSite();

if (site.errors.length) {
  console.error('Configuración inválida:\n - ' + site.errors.join('\n - '));
  process.exit(1);
}

const template = await readFile(join(dist, 'index.html'), 'utf8');
for (const marker of ['<!--head-tags-->', '<!--app-html-->']) {
  if (!template.includes(marker)) {
    console.error(`El template compilado perdió el marcador ${marker}`);
    process.exit(1);
  }
}

for (const p of site.pages) {
  const out = p.path.endsWith('/') ? join(dist, p.path, 'index.html') : join(dist, p.path);
  await mkdir(dirname(out), { recursive: true });
  const html = template
    .replace('<!--head-tags-->', () => p.head)
    .replace('<!--app-html-->', () => p.html);
  await writeFile(out, html, 'utf8');
  console.log(`  ${p.status} ${p.path}`);
}

await writeFile(join(dist, 'sitemap.xml'), site.sitemap, 'utf8');
await writeFile(join(dist, 'robots.txt'), site.robots, 'utf8');
await writeFile(join(dist, 'CNAME'), site.host + '\n', 'utf8');
await writeFile(join(dist, '.nojekyll'), '', 'utf8');
await rm(join(root, process.env.SSR_DIR ?? 'dist-ssr'), { recursive: true, force: true });
console.log(`Listo: ${site.pages.length} páginas en dist/`);
