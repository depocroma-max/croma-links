// Preparación para publicación: dominio, rutas, metadatos, enlaces internos, QR y workflow.
// Requiere `npm run build` (y `npm run qr`) previos.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import QRCode from 'qrcode';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const global = JSON.parse(readFileSync(join(root, 'config/global.json'), 'utf8'));
const branches = JSON.parse(readFileSync(join(root, 'config/branches.json'), 'utf8'));
const active = branches.filter((b) => b.active);
const SITE = 'https://links.cromashop.com.ar';
const read = (p) => readFileSync(join(dist, p), 'utf8');
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

test('dominio definitivo y CNAME', () => {
  assert.equal(global.siteUrl, SITE);
  assert.equal(read('CNAME').trim(), 'links.cromashop.com.ar');
});

test('canonical, og:url y og:image apuntan al dominio definitivo (y la imagen existe)', () => {
  for (const b of active) {
    const html = read(`${b.slug}/index.html`);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE}/${b.slug}/">`), b.slug);
    assert.ok(html.includes(`<meta property="og:url" content="${SITE}/${b.slug}/">`), b.slug);
    const img = html.match(/<meta property="og:image" content="([^"]+)"/)[1];
    assert.ok(img.startsWith(`${SITE}/`), img);
    assert.ok(existsSync(join(dist, new URL(img).pathname)), `existe ${img}`);
  }
  const home = read('index.html');
  assert.ok(home.includes(`<link rel="canonical" href="${SITE}/">`));
});

test('sin referencias a localhost ni a la demo en la compilación de producción', () => {
  for (const f of walk(dist).filter((p) => /\.(html|css|xml|txt)$/.test(p))) {
    const c = readFileSync(f, 'utf8');
    assert.doesNotMatch(c, /localhost|127\.0\.0\.1|example\.com|DATO FICTICIO/i, f);
  }
});

test('sitemap: home y las 5 activas con dominio definitivo; sin Cipo', () => {
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, [`${SITE}/`, ...active.map((b) => `${SITE}/${b.slug}/`)]);
  assert.match(read('robots.txt'), new RegExp(`Sitemap: ${SITE}/sitemap\\.xml`));
});

test('rutas: cada sucursal (activa o inactiva) y el 404 existen como archivo', () => {
  for (const b of branches) assert.ok(existsSync(join(dist, b.slug, 'index.html')), b.slug);
  assert.ok(existsSync(join(dist, '404.html')));
});

test('enlaces internos: todo href que empieza con "/" resuelve a un archivo de dist/', () => {
  const htmls = walk(dist).filter((p) => p.endsWith('.html'));
  assert.ok(htmls.length >= 7);
  for (const f of htmls) {
    for (const [, href] of readFileSync(f, 'utf8').matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
      const target = href.endsWith('/') ? join(dist, href, 'index.html') : join(dist, href);
      assert.ok(existsSync(target), `${f} -> ${href}`);
    }
  }
});

test('enlaces absolutos externos son https', () => {
  for (const f of walk(dist).filter((p) => p.endsWith('.html'))) {
    for (const [, href] of readFileSync(f, 'utf8').matchAll(/href="(https?:[^"]+)"/g)) {
      assert.ok(href.startsWith('https://'), `${f}: ${href}`);
    }
  }
});

for (const b of active) {
  test(`QR de ${b.slug}: contiene exactamente ${SITE}/${b.slug}/`, async () => {
    const expected = await QRCode.toString(`${SITE}/${b.slug}/`, {
      type: 'svg', errorCorrectionLevel: 'H', margin: 4, color: { dark: '#000000', light: '#ffffff' },
    });
    const actual = readFileSync(join(root, 'qr', `${b.slug}.svg`), 'utf8');
    assert.equal(actual.replace(/\r\n/g, '\n'), expected.replace(/\r\n/g, '\n'));
  });
}

test('verify-dist.mjs aprueba el sitio compilado', () => {
  const out = execFileSync(process.execPath, [join(root, 'scripts/verify-dist.mjs')], { encoding: 'utf8' });
  assert.match(out, /dist\/ OK/);
});

test('workflow: solo disparo manual, permisos mínimos, npm ci, deploy con confirmación', () => {
  const y = readFileSync(join(root, '.github/workflows/deploy.yml'), 'utf8');
  const code = y.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.match(code, /on:\s*\n\s+workflow_dispatch:/);
  assert.doesNotMatch(code, /^\s+(push|pull_request|pull_request_target|schedule|release|workflow_run):/m);
  assert.match(code, /npm ci/);
  assert.match(code, /npm run check/);
  assert.match(code, /path: dist/);
  assert.match(code, /actions\/deploy-pages@v4/);
  assert.match(code, /inputs\.confirmar == 'PUBLICAR'/);
  assert.match(code, /^permissions:\s*\n\s+contents: read/m);
  assert.match(code, /pages: write/);
  assert.match(code, /id-token: write/);
  assert.doesNotMatch(code, /contents: write|secrets\./);
});
