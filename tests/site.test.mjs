// Requiere `npm run build` y `npm run qr` previos (npm test los ejecuta antes).
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const read = (p) => readFileSync(join(dist, p), 'utf8');
const global = JSON.parse(readFileSync(join(root, 'config/global.json'), 'utf8'));
const branches = JSON.parse(readFileSync(join(root, 'config/branches.json'), 'utf8'));
const active = branches.filter((b) => b.active);

test('las 5 sucursales activas son las confirmadas y CIPO 09 está inactiva', () => {
  assert.deepEqual(active.map((b) => b.id), ['01', '05', '10', '12', '14']);
  assert.equal(branches.find((b) => b.id === '09')?.active, false);
});

test('el dominio configurado es links.cromashop.com.ar', () => {
  assert.equal(global.siteUrl, 'https://links.cromashop.com.ar');
});

for (const b of active) {
  test(`/${b.slug}/ es HTML completo sin JavaScript`, () => {
    const html = read(`${b.slug}/index.html`);
    assert.doesNotMatch(html, /<script/i, 'no debe incluir <script>');
    assert.match(html, /<html lang="es-AR">/);
    assert.ok(html.includes(`<h1`) && html.replace(/⁠/g, '').replace(/ /g, ' ').includes(b.name), 'encabezado con el nombre');
    assert.ok(html.includes('SEGUINOS EN NUESTRAS REDES') || /Seguinos en nuestras redes/i.test(html));
    // Tienda online presente como enlace real
    assert.match(html, /<a [^>]*href="https:\/\/www\.cromashop\.com\.ar\/"[^>]*rel="noopener noreferrer"/);
    // Canonical y Open Graph en el HTML
    assert.ok(html.includes(`<link rel="canonical" href="${global.siteUrl}/${b.slug}/">`));
    assert.match(html, /<meta property="og:title" content="[^"]+Redes sociales y contacto"/);
    assert.ok(html.includes(`<meta property="og:image" content="${global.siteUrl}/og-default.png">`));
    assert.ok(html.includes('<meta property="og:url"'));
    assert.match(html, /<meta name="description" content="Encontrá las redes sociales/);
  });
}

test('"Cómo llegar" aparece solo si la sucursal tiene mapsUrl', () => {
  for (const b of active) {
    const body = read(`${b.slug}/index.html`).split('<body>')[1];
    assert.equal(body.includes('Cómo llegar'), b.mapsUrl !== null, `${b.slug}`);
    assert.ok(body.includes('Tienda online'));
  }
});

test('home lista solo sucursales activas', () => {
  const html = read('index.html');
  for (const b of active) assert.ok(html.includes(`href="/${b.slug}/"`));
  assert.ok(!html.includes('href="/cipo/"'));
});

test('sucursal inactiva: página informativa, noindex, fuera del sitemap', () => {
  const html = read('cipo/index.html');
  assert.match(html, /noindex/);
  assert.match(html, /ya no está disponible/);
  assert.ok(!read('sitemap.xml').includes('/cipo/'));
});

test('404 personalizado y archivos de despliegue', () => {
  assert.match(read('404.html'), /ESTA PÁGINA NO EXISTE/);
  assert.equal(read('CNAME').trim(), 'links.cromashop.com.ar');
  assert.ok(existsSync(join(dist, '.nojekyll')));
  assert.match(read('robots.txt'), /Sitemap: https:\/\/links\.cromashop\.com\.ar\/sitemap\.xml/);
  assert.ok(!existsSync(join(dist, 'src')), 'no debe filtrarse código fuente');
});

test('el CSS compilado está enlazado y existe', () => {
  const html = read('paseo/index.html');
  const m = html.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"/);
  assert.ok(m, 'enlace al CSS compilado');
  assert.ok(existsSync(join(dist, m[1])));
});

test('fuentes alojadas localmente: sin Google Fonts ni pedidos externos de CSS/fuentes', () => {
  const css = readdirSync(join(dist, 'assets')).find((f) => f.endsWith('.css'));
  const cssText = read(`assets/${css}`);
  for (const f of ['paseo/index.html', 'index.html', '404.html', `assets/${css}`]) {
    assert.doesNotMatch(read(f), /fonts\.(googleapis|gstatic)\.com/, f);
  }
  assert.match(cssText, /font-family:\s*['"]?Bebas Neue/);
  assert.match(cssText, /font-family:\s*['"]?DM Sans/);
  assert.doesNotMatch(cssText, /url\(\s*['"]?https?:/);
  const fonts = readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.woff2'));
  assert.ok(fonts.some((f) => f.startsWith('bebas-neue')) && fonts.some((f) => f.startsWith('dm-sans')));
});

for (const b of active) {
  test(`QR de ${b.slug}: PNG y SVG existen`, () => {
    const png = readFileSync(join(root, 'qr', `${b.slug}.png`));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.ok(readFileSync(join(root, 'qr', `${b.slug}.svg`), 'utf8').includes('<svg'));
  });
}
