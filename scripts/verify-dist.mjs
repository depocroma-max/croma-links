// Verifica que dist/ sea publicable: solo el sitio, con el dominio definitivo,
// sin referencias locales, sin datos de demo y sin archivos de desarrollo.
// Uso: node scripts/verify-dist.mjs   (requiere `npm run build`)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const global = JSON.parse(readFileSync(join(root, 'config/global.json'), 'utf8'));
const branches = JSON.parse(readFileSync(join(root, 'config/branches.json'), 'utf8'));
const site = global.siteUrl.replace(/\/+$/, '');
const host = new URL(site).hostname;

const problems = [];
const fail = (m) => problems.push(m);

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = walk(dist).map((p) => relative(dist, p).replace(/\\/g, '/'));

// 1. Nada de desarrollo dentro del sitio publicado.
const forbidden = /^(src|demo|capturas|qr|tests|scripts|docs|node_modules|\.github)\/|(^|\/)(package(-lock)?\.json|tsconfig\.json|\.env.*|.*\.map)$/;
for (const f of files) if (forbidden.test(f)) fail(`archivo no publicable en dist/: ${f}`);

// 2. Páginas y archivos de despliegue esperados.
const expected = ['index.html', '404.html', 'sitemap.xml', 'robots.txt', 'CNAME', '.nojekyll', 'og-default.png', 'favicon.png'];
for (const b of branches) expected.push(`${b.slug}/index.html`);
for (const e of expected) if (!files.includes(e)) fail(`falta en dist/: ${e}`);

// 3. CNAME exacto.
try {
  if (readFileSync(join(dist, 'CNAME'), 'utf8').trim() !== host) fail(`CNAME distinto de ${host}`);
} catch { /* ya informado */ }

// 4. Contenido textual: sin localhost, sin demo, sin JS, dominio definitivo.
const text = files.filter((f) => /\.(html|css|xml|txt)$/.test(f));
for (const f of text) {
  const c = readFileSync(join(dist, f), 'utf8');
  if (/localhost|127\.0\.0\.1|\[::1\]/.test(c)) fail(`${f}: referencia local`);
  if (/example\.com|DATO FICTICIO|demo\.example/i.test(c)) fail(`${f}: dato de demo`);
  if (f.endsWith('.html') && /<script/i.test(c)) fail(`${f}: contiene <script>`);
  if (/fonts\.(googleapis|gstatic)\.com/.test(c)) fail(`${f}: depende de Google Fonts`);
}

// 5. Metadatos con el dominio definitivo en cada página.
for (const b of branches) {
  const f = `${b.slug}/index.html`;
  if (!files.includes(f)) continue;
  const c = readFileSync(join(dist, f), 'utf8');
  const url = `${site}/${b.slug}/`;
  if (!c.includes(`<link rel="canonical" href="${url}">`)) fail(`${f}: canonical incorrecta`);
  if (!c.includes(`<meta property="og:url" content="${url}">`)) fail(`${f}: og:url incorrecta`);
  if (!c.includes(`<meta property="og:image" content="${site}/`)) fail(`${f}: og:image sin dominio`);
}

if (problems.length) {
  console.error('dist/ NO es publicable:\n - ' + problems.join('\n - '));
  process.exit(1);
}
console.log(`dist/ OK: ${files.length} archivos, dominio ${host}, sin referencias locales ni de demo.`);
