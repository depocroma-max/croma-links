// Servidor estático local para revisar dist/ con el mismo comportamiento que
// GitHub Pages: /paseo -> 301 a /paseo/, y 404.html con status 404.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];
const dist = resolve(import.meta.dirname, '..', arg('dist') ?? process.env.DIST ?? 'dist');
const port = Number(arg('port') ?? process.env.PORT ?? 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
};

async function send(res, file, status = 200) {
  const body = await readFile(file);
  res.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(body);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    let file = join(dist, rel);
    if (!file.startsWith(dist)) throw new Error('fuera de dist');
    const s = await stat(file).catch(() => null);
    if (s?.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { location: url.pathname + '/' + url.search });
        return res.end();
      }
      file = join(file, 'index.html');
    }
    if (await stat(file).catch(() => null)) return await send(res, file);
    return await send(res, join(dist, '404.html'), 404);
  } catch {
    res.writeHead(500);
    res.end('error');
  }
}).listen(port, () => console.log(`Croma Links en http://localhost:${port}/`));
