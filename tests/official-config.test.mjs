// Configuración oficial (Fase 6A) y su reflejo en el HTML generado (dist/).
// Requiere `npm run build` previo.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '..');
const global = JSON.parse(readFileSync(join(root, 'config/global.json'), 'utf8'));
const branches = JSON.parse(readFileSync(join(root, 'config/branches.json'), 'utf8'));
const page = (slug) => readFileSync(join(root, 'dist', slug, 'index.html'), 'utf8');
const body = (html) => html.split('<body>')[1];

const SOCIAL = {
  Instagram: 'https://www.instagram.com/cromask7/?hl=es',
  TikTok: 'https://www.tiktok.com/@cromask7',
  Facebook: 'https://www.facebook.com/cromask7',
  YouTube: 'https://www.youtube.com/@Cromanews-TV',
};
const OFFICIAL = {
  paseo: { id: '01', address: 'Paseo del Sol, Local 2 — Neuquén Capital', wa: 'https://walink.co/a9d0c6' },
  wave: { id: '05', address: 'Sarmiento 2 — Neuquén Capital', wa: 'https://walink.co/f4bab9' },
  perito: { id: '10', address: 'Perito Moreno 151 — Neuquén Capital', wa: 'https://walink.co/31ee7b' },
  centenario: { id: '12', address: 'Antártida Argentina 300 — Centenario', wa: 'https://walink.co/29aa5c' },
  roca: { id: '14', address: 'Roca 180 — Cipolletti', wa: 'https://walink.co/bb6a28' },
};

const hrefOf = (html, label) => {
  const re = new RegExp(`<a [^>]*href="([^"]+)"[^>]*aria-label="${label} \\(`);
  return body(html).match(re)?.[1];
};

test('global.json: redes y tienda oficiales', () => {
  assert.deepEqual(global.links, {
    instagram: SOCIAL.Instagram, tiktok: SOCIAL.TikTok, facebook: SOCIAL.Facebook,
    youtube: SOCIAL.YouTube, store: 'https://www.cromashop.com.ar/',
  });
  assert.equal(global.siteUrl, 'https://links.cromashop.com.ar');
});

test('branches.json: ids, slugs y orden sin cambios; Cipo inactiva', () => {
  assert.deepEqual(branches.map((b) => [b.id, b.slug, b.active]), [
    ['01', 'paseo', true], ['05', 'wave', true], ['10', 'perito', true],
    ['12', 'centenario', true], ['14', 'roca', true], ['09', 'cipo', false],
  ]);
});

test('branches.json: direcciones y WhatsApp oficiales; mapsUrl, horarios e imagen sin inventar', () => {
  for (const [slug, o] of Object.entries(OFFICIAL)) {
    const b = branches.find((x) => x.slug === slug);
    assert.equal(b.id, o.id);
    assert.equal(b.address, o.address);
    assert.equal(b.whatsapp, o.wa);
    assert.equal(b.mapsUrl, null);
    assert.equal(b.hours, null);
    assert.equal(b.header, null);
  }
});

test('config de producción sin datos ficticios', () => {
  const txt = JSON.stringify(global) + JSON.stringify(branches);
  assert.doesNotMatch(txt, /example\.com|FICTICIO|demo/i);
});

for (const [slug, o] of Object.entries(OFFICIAL)) {
  test(`/${slug}/: 4 redes, WhatsApp walink original, dirección y sin "Cómo llegar"`, () => {
    const html = page(slug);
    for (const [label, url] of Object.entries(SOCIAL)) {
      assert.equal(hrefOf(html, label), url, `${label} en ${slug}`);
    }
    assert.equal(hrefOf(html, 'WhatsApp'), o.wa);
    assert.equal(hrefOf(html, 'Tienda online'), 'https://www.cromashop.com.ar/');
    assert.ok(!body(html).includes('Cómo llegar'));
    assert.ok(body(html).includes(`<span>${o.address}</span>`), 'dirección en la tarjeta');
    assert.ok(!body(html).includes('wa.me'), 'no se convierte a wa.me');
    assert.ok(!html.includes('<script'));
    // orden visual: redes (4) y luego contacto
    const labels = [...body(html).matchAll(/<span class="flex-1 text-left">([^<]+)<\/span>/g)].map((m) => m[1]);
    assert.deepEqual(labels, ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'WhatsApp', 'Tienda online']);
  });
}

test('las cinco sucursales activas tienen WhatsApp; Cipo no figura en el home', () => {
  const active = branches.filter((b) => b.active);
  assert.equal(active.length, 5);
  assert.ok(active.every((b) => b.whatsapp?.startsWith('https://walink.co/')));
  assert.ok(!body(readFileSync(join(root, 'dist/index.html'), 'utf8')).includes('/cipo/'));
});

test('enlaces externos seguros: https, nueva pestaña y noopener', () => {
  const html = body(page('paseo'));
  const anchors = [...html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
  assert.equal(anchors.length, 6);
  for (const a of anchors) {
    assert.match(a, /href="https:\/\//);
    assert.match(a, /rel="noopener noreferrer"/);
  }
});
