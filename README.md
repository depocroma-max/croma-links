# Croma Links

Páginas de enlaces por sucursal (alternativa propia a Linktree). Sitio 100% estático: el HTML de
cada página se genera en el build con React DOM Server y **no envía JavaScript** al navegador.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run build` | Compila CSS + genera `dist/<slug>/index.html`, `404.html`, sitemap, robots, CNAME |
| `npm run preview` | Sirve `dist/` en http://localhost:4173 (se comporta como GitHub Pages) |
| `npm run qr` | Genera PNG + SVG por sucursal en `qr/` (+ `qr/index.html` con descargas) |
| `npm test` | Verifica HTML, metadatos, ausencia de JS y QR (requiere build y qr previos) |
| `npm run check` | typecheck + build + qr + test |

## Configuración

- `config/global.json`: dominio (`siteUrl`), redes y tienda. `null` = el botón no se muestra.
- `config/branches.json`: sucursales. `active: false` muestra una página informativa (noindex).
- Agregar una sucursal = sumar un objeto al JSON y rebuildear. No se toca la interfaz.
- Los datos se validan en el build (URLs https, slugs únicos, WhatsApp solo dígitos).

## Estado

QR **provisionales**: no imprimir hasta configurar y probar `links.cromashop.com.ar`.
Si cambia `siteUrl` hay que regenerar los QR.
