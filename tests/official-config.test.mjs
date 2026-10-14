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
// Fuente: https://www.cromashop.com.ar/info/locales (+ WhatsApp walink.co)
const OFFICIAL = {
  paseo: {
    id: '01', wa: 'https://walink.co/a9d0c6',
    address: 'Perito Moreno y Río Negro, Paseo del Sol Local 2, Neuquén Capital',
    maps: 'https://maps.app.goo.gl/LjE7Kt5ktZ3ZruFZ9',
    hours: ['Lunes a sábados, de 9:00 a 21:00'],
  },
  wave: {
    id: '05', wa: 'https://walink.co/f4bab9',
    address: 'Sarmiento 2, Neuquén Capital',
    maps: 'https://maps.app.goo.gl/hFMYzhR9UXG5tSaw7',
    hours: ['Lunes a sábados, de 9:00 a 21:00'],
  },
  perito: {
    id: '10', wa: 'https://walink.co/31ee7b',
    address: 'Perito Moreno 151, Neuquén Capital',
    maps: 'https://maps.app.goo.gl/cPHpAzmr7FDUTgQy5',
    hours: ['Lunes a sábados, de 9:30 a 13:30 y de 16:00 a 21:00'],
  },
  centenario: {
    id: '12', wa: 'https://walink.co/29aa5c',
    address: 'Antártida Argentina 300, Centenario, Neuquén',
    maps: 'https://maps.app.goo.gl/k7qSpD8bDVL3MAVH7',
    hours: ['Lunes a sábados, de 9:30 a 13:30 y de 16:30 a 21:00'],
  },
  roca: {
    id: '14', wa: 'https://walink.co/bb6a28',
    address: 'General Roca 180, Cipolletti, Río Negro',
    maps: 'https://maps.app.goo.gl/EHrnrgxj2Er2LvMa6',
    hours: [
      'Lunes a viernes, de 9:00 a 13:00 y de 16:00 a 21:00',
      'Sábados, de 9:00 a 13:30 y de 16:00 a 21:00',
    ],
  },
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

test('branches.json: dirección, Maps, horarios y WhatsApp oficiales', () => {
  for (const [slug, o] of Object.entries(OFFICIAL)) {
    const b = branches.find((x) => x.slug === slug);
    assert.equal(b.id, o.id);
    assert.equal(b.address, o.address);
    assert.equal(b.whatsapp, o.wa);
    assert.equal(b.mapsUrl, o.maps);
    assert.deepEqual(b.hours, o.hours);
    assert.equal(b.header, null);
    assert.equal(b.image, null);
    assert.deepEqual(b.extraLinks, []);
  }
});

test('nombres visibles oficiales; los slugs (y por lo tanto los QR) no cambian', () => {
  const names = Object.fromEntries(branches.map((b) => [b.slug, b.name]));
  assert.deepEqual(names, {
    paseo: 'CROMA PASEO - NEUQUÉN',
    wave: 'CROMA SARMIENTO - NEUQUÉN',
    perito: 'CROMA PERITO MORENO - NEUQUÉN',
    centenario: 'CROMA - CENTENARIO',
    roca: 'CROMA - CIPOLLETTI',
    cipo: 'CROMA CIPO SAN MARTÍN',
  });
});

test('horarios: sin domingos ni feriados inventados', () => {
  for (const b of branches) {
    for (const h of b.hours ?? []) {
      assert.doesNotMatch(h, /domingo|feriado|abierto|cerrado/i, `${b.slug}: ${h}`);
    }
  }
});

test('Cipo (09) inactiva y sin datos de contacto', () => {
  const cipo = branches.find((b) => b.id === '09');
  assert.equal(cipo.active, false);
  assert.equal(cipo.mapsUrl, null);
  assert.equal(cipo.hours, null);
});

test('config de producción sin datos ficticios', () => {
  const txt = JSON.stringify(global) + JSON.stringify(branches);
  assert.doesNotMatch(txt, /example\.com|FICTICIO|demo/i);
});

for (const [slug, o] of Object.entries(OFFICIAL)) {
  test(`/${slug}/: redes, WhatsApp, Maps exacto, dirección y horarios`, () => {
    const html = page(slug);
    for (const [label, url] of Object.entries(SOCIAL)) {
      assert.equal(hrefOf(html, label), url, `${label} en ${slug}`);
    }
    assert.equal(hrefOf(html, 'WhatsApp'), o.wa);
    assert.equal(hrefOf(html, 'Tienda online'), 'https://www.cromashop.com.ar/');
    assert.equal(hrefOf(html, 'Cómo llegar'), o.maps, 'botón Cómo llegar apunta al Maps oficial');
    assert.ok(body(html).includes(`<span>${o.address}</span>`), 'dirección en la tarjeta');
    // horarios: un <li> por línea, en orden
    const lis = [...body(html).matchAll(/<li[^>]*>([^<]+)<\/li>/g)].map((m) => m[1]);
    // los rangos llevan espacios duros para no cortarse entre líneas; el texto es el mismo
    assert.deepEqual(lis.map((t) => t.replace(/ /g, ' ')), o.hours);
    assert.ok(lis.every((t) => /\d{1,2}:\d{2} a \d{1,2}:\d{2}/.test(t)), 'rangos indivisibles');
    assert.ok(!body(html).includes('wa.me'), 'no se convierte a wa.me');
    assert.ok(!html.includes('<script'));
    // orden visual: redes (4) y luego contacto
    const labels = [...body(html).matchAll(/<span class="flex-1 text-left">([^<]+)<\/span>/g)].map((m) => m[1]);
    assert.deepEqual(labels, ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'WhatsApp', 'Tienda online', 'Cómo llegar']);
    // el aria-label no debe perderse: el botón indica que abre pestaña nueva
    assert.match(body(html), /aria-label="Cómo llegar \(se abre en una pestaña nueva\)"/);
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
  assert.equal(anchors.length, 7);
  for (const a of anchors) {
    assert.match(a, /href="https:\/\//);
    assert.match(a, /rel="noopener noreferrer"/);
  }
});
