// Agrupación de enlaces, descripción opcional, footer y orden.
// Usa dist/ (config real, datos null) y dist-demo/ (datos ficticios).
// Requiere `npm run build` y `npm run build:demo` previos.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '..');
const real = (p) => readFileSync(join(root, 'dist', p), 'utf8');
const demo = (p) => readFileSync(join(root, 'dist-demo', p), 'utf8');
const body = (html) => html.split('<body>')[1];

/** Devuelve [{group, labels[]}] en orden de aparición dentro del <body>. */
function groupsOf(html) {
  const out = [];
  const re = /<div data-group="([a-z]+)"[^>]*>([\s\S]*?)<\/div>(?=<\/div>|<div data-group)/g;
  let m;
  while ((m = re.exec(body(html)))) {
    const labels = [...m[2].matchAll(/<span class="flex-1 text-left">([^<]+)<\/span>/g)].map((x) => x[1]);
    out.push({ group: m[1], labels });
  }
  return out;
}

test('1. enlaces separados en grupos: redes y contacto, en orden', () => {
  const g = groupsOf(demo('paseo/index.html'));
  assert.deepEqual(g, [
    { group: 'social', labels: ['Instagram', 'TikTok', 'Facebook', 'YouTube'] },
    { group: 'contact', labels: ['WhatsApp', 'Tienda online', 'Cómo llegar', 'Catálogo de ejemplo'] },
  ]);
});

test('1b. separación de 24 px (gap-6) solo entre grupos; botones con gap-3', () => {
  const html = body(demo('paseo/index.html'));
  assert.match(html, /<div class="flex flex-col gap-6"><div data-group="social" class="flex flex-col gap-3">/);
});

test('2. sin grupos vacíos: sin redes no hay grupo social', () => {
  const g = groupsOf(real('paseo/index.html'));
  assert.deepEqual(g, [{ group: 'contact', labels: ['Tienda online'] }]);
  assert.ok(!body(real('paseo/index.html')).includes('data-group="social"'));
});

test('2b. sin WhatsApp ni mapa, el grupo contacto solo tiene la tienda (Roca demo)', () => {
  assert.deepEqual(groupsOf(demo('roca/index.html')), [
    { group: 'social', labels: ['Instagram', 'TikTok', 'Facebook', 'YouTube'] },
    { group: 'contact', labels: ['Tienda online'] },
  ]);
});

test('3. descripción: aparece si existe; null, vacía o con espacios no deja elemento', () => {
  assert.match(body(demo('paseo/index.html')), /<p data-tagline[^>]*>Texto de ejemplo del encabezado<\/p>/);
  for (const page of ['wave', 'perito', 'centenario'].map((s) => demo(`${s}/index.html`)).concat(real('paseo/index.html'))) {
    assert.ok(!page.includes('data-tagline'), 'no debe haber elemento de descripción');
  }
  // sin párrafo vacío residual en el encabezado
  assert.ok(!/<h1[^>]*>[^<]*<\/h1><p[^>]*><\/p>/.test(real('paseo/index.html')));
});

test('4. footer: "© Croma" en DM Sans, sin "CROMA" decorativo ni font-display', () => {
  for (const html of [real('paseo/index.html'), real('index.html'), real('404.html'), real('cipo/index.html')]) {
    const footer = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);
    assert.ok(footer, 'tiene footer');
    assert.match(footer[1], /<p>© Croma<\/p>/);
    assert.ok(!footer[0].includes('font-display'));
  }
  assert.match(real('paseo/index.html'), /Ver todas las sucursales/);
});

test('5. home: orden de sucursales, tienda separada, sin Cipo', () => {
  const html = body(real('index.html'));
  const hrefs = [...html.matchAll(/href="(\/[a-z]+\/)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, ['/paseo/', '/wave/', '/perito/', '/centenario/', '/roca/']);
  const labels = [...html.matchAll(/<span class="flex-1 text-left">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(labels, ['Croma Paseo', 'Croma Wave', 'Croma Perito Moreno', 'Croma Centenario', 'Croma Roca', 'Tienda online']);
  assert.ok(html.indexOf('data-group="branches"') < html.indexOf('data-group="store"'));
  assert.match(html, /<div class="flex flex-col gap-5"><div data-group="branches"/);
  assert.ok(!html.includes('Cipo') && !html.includes('CIPO'));
});

test('6. sin JavaScript: ni <script>, ni onclick, ni modulepreload; enlaces <a> reales', () => {
  for (const html of [real('paseo/index.html'), real('index.html'), demo('paseo/index.html'), real('cipo/index.html')]) {
    assert.doesNotMatch(html, /<script|onclick=|modulepreload/i);
  }
  const html = demo('paseo/index.html');
  for (const href of ['https://example.com/demo/instagram', 'https://wa.me/5490000000001', 'https://www.cromashop.com.ar/']) {
    assert.match(html, new RegExp(`<a [^>]*href="${href.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"`));
  }
});
