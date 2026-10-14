// Pruebas unitarias de src/lib/links.ts (Node ejecuta TypeScript directamente).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLinkGroups, buildLinks, cleanTagline, resolveWhatsapp } from '../src/lib/links.ts';

const global = (links = {}) => ({
  brand: 'Croma', siteUrl: 'https://links.example.com', locale: 'es-AR', defaultOgImage: '/og.png',
  links: { instagram: null, tiktok: null, facebook: null, youtube: null, store: null, ...links },
});
const branch = (o = {}) => ({
  id: '99', name: 'CROMA TEST', slug: 'test', active: true, address: null, whatsapp: null,
  mapsUrl: null, hours: null, image: null, extraLinks: [], header: null, ...o,
});

test('walink.co: enlaces legítimos se aceptan tal cual (sin convertir a wa.me)', () => {
  for (const url of [
    'https://walink.co/a9d0c6', 'https://walink.co/f4bab9', 'https://walink.co/31ee7b',
    'https://walink.co/29aa5c', 'https://walink.co/bb6a28',
  ]) {
    assert.equal(resolveWhatsapp(url), url);
  }
});

test('walink.co: se rechazan dominios parecidos, http y variantes maliciosas', () => {
  const bad = [
    'http://walink.co/a9d0c6',                    // sin HTTPS
    'https://walink.com/a9d0c6',                  // otro TLD
    'https://xwalink.co/a9d0c6',                  // prefijo
    'https://walink.co.evil.com/a9d0c6',          // subdominio de otro dominio
    'https://evil.com/walink.co/a9d0c6',          // dominio en el path
    'https://walink.co@evil.com/a9d0c6',          // credenciales
    'https://user:pass@walink.co/a9d0c6',         // credenciales
    'https://walink.co:8443/a9d0c6',              // puerto
    'https://sub.walink.co/a9d0c6',               // subdominio no previsto
    'https://walink.co/',                         // sin código
    'https://walink.co/a9d0c6/extra/path',        // path inesperado
    'https://walink.co//evil.com',                // path que parece protocolo
    'javascript:alert(1)',
    'walink.co/a9d0c6',                           // sin esquema
    '',
  ];
  for (const u of bad) assert.equal(resolveWhatsapp(u), null, `debe rechazarse: ${u}`);
});

test('walink.co: el enlace se conserva sin modificar (incluida su query si existe)', () => {
  assert.equal(resolveWhatsapp('https://walink.co/a9d0c6?utm=qr'), 'https://walink.co/a9d0c6?utm=qr');
});

test('wa.me y dígitos internacionales siguen funcionando; no se inventan números', () => {
  assert.equal(resolveWhatsapp('https://wa.me/5492990000000'), 'https://wa.me/5492990000000');
  assert.equal(resolveWhatsapp('5492990000000'), 'https://wa.me/5492990000000');
  assert.equal(resolveWhatsapp('https://wa.me/abc'), null);
  assert.equal(resolveWhatsapp('12345'), null);
  assert.equal(resolveWhatsapp(null), null);
  assert.equal(resolveWhatsapp(undefined), null);
});

test('botón WhatsApp usa el enlace walink original', () => {
  const l = buildLinks(global(), branch({ whatsapp: 'https://walink.co/a9d0c6' }));
  assert.deepEqual(l.map((x) => [x.key, x.href]), [['whatsapp', 'https://walink.co/a9d0c6']]);
});

test('sin WhatsApp (null) no hay botón; sin mapsUrl no hay "Cómo llegar"', () => {
  const labels = buildLinks(global({ store: 'https://www.cromashop.com.ar/' }), branch()).map((x) => x.label);
  assert.deepEqual(labels, ['Tienda online']);
});

test('grupos: sin redes no existe el grupo social; sin contacto no existe el de contacto', () => {
  assert.deepEqual(
    buildLinkGroups(global({ store: 'https://www.cromashop.com.ar/' }), branch()).map((g) => g.group),
    ['contact'],
  );
  assert.deepEqual(
    buildLinkGroups(global({ instagram: 'https://www.instagram.com/x/' }), branch()).map((g) => g.group),
    ['social'],
  );
  assert.deepEqual(buildLinkGroups(global(), branch()), []);
});

test('grupos: orden fijo y reparto correcto', () => {
  const g = global({
    youtube: 'https://www.youtube.com/@x', instagram: 'https://www.instagram.com/x/',
    store: 'https://www.cromashop.com.ar/',
  });
  const groups = buildLinkGroups(g, branch({ whatsapp: 'https://walink.co/a9d0c6', mapsUrl: 'https://maps.google.com/?q=x' }));
  assert.deepEqual(groups.map((x) => [x.group, x.links.map((l) => l.label)]), [
    ['social', ['Instagram', 'YouTube']],
    ['contact', ['WhatsApp', 'Tienda online', 'Cómo llegar']],
  ]);
});

test('descripción: null, vacía o con espacios se descarta; el texto se recorta', () => {
  assert.equal(cleanTagline(null), null);
  assert.equal(cleanTagline(undefined), null);
  assert.equal(cleanTagline(''), null);
  assert.equal(cleanTagline('   \n '), null);
  assert.equal(cleanTagline('  Hola  '), 'Hola');
});
