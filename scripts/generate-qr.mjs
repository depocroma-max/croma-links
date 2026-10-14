// Genera los QR (PNG + SVG) de cada sucursal activa, 100% local.
// El QR contiene solo la URL permanente de la página: siteUrl + /slug/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import QRCode from 'qrcode';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'qr');
const global = JSON.parse(await readFile(join(root, 'config', 'global.json'), 'utf8'));
const branches = JSON.parse(await readFile(join(root, 'config', 'branches.json'), 'utf8'));
const base = global.siteUrl.replace(/\/+$/, '');

const opts = { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#000000', light: '#ffffff' } };
await mkdir(out, { recursive: true });

const rows = [];
for (const b of branches.filter((x) => x.active)) {
  const url = `${base}/${b.slug}/`;
  await QRCode.toFile(join(out, `${b.slug}.png`), url, { ...opts, type: 'png', width: 2048 });
  await writeFile(join(out, `${b.slug}.svg`), await QRCode.toString(url, { ...opts, type: 'svg' }), 'utf8');
  rows.push({ name: b.name, slug: b.slug, url });
  console.log(`  ${b.slug}: ${url}`);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sheet = `<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><title>Croma Links · QR (PROVISORIOS)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:system-ui,sans-serif;background:#f7f7f5;color:#0d0d0d;margin:0;padding:24px}
.warn{background:#fff3cd;border:1px solid #e0c36a;padding:12px 16px;border-radius:8px;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.card{background:#fff;border:1px solid #ddddd8;border-radius:16px;padding:16px;text-align:center}
.card img{width:100%;height:auto}.card a{margin:0 6px}
code{font-size:12px;word-break:break-all}
</style></head><body>
<h1>Croma Links · códigos QR</h1>
<p class="warn"><strong>PROVISORIOS.</strong> No imprimir hasta que el dominio ${esc(new URL(base).hostname)} esté configurado y probado.</p>
<div class="grid">
${rows
  .map(
    (r) => `<div class="card"><h2>${esc(r.name)}</h2><img src="${r.slug}.svg" alt="QR de ${esc(r.name)}">
<p><code>${esc(r.url)}</code></p><a href="${r.slug}.png" download>PNG</a><a href="${r.slug}.svg" download>SVG</a></div>`,
  )
  .join('\n')}
</div></body></html>
`;
await writeFile(join(out, 'index.html'), sheet, 'utf8');
await writeFile(
  join(out, 'LEEME.md'),
  `# QR de Croma Links — PROVISORIOS\n\nGenerados con \`npm run qr\` a partir de \`config/global.json\` (siteUrl) y \`config/branches.json\`.\n\n` +
    `**No imprimir** hasta que ${new URL(base).hostname} esté configurado y probado.\n\n` +
    rows.map((r) => `- ${r.name}: ${r.url}`).join('\n') +
    `\n\nSi cambia \`siteUrl\`, hay que regenerar y reimprimir los QR.\n`,
  'utf8',
);
console.log(`Listo: ${rows.length} QR en qr/`);
