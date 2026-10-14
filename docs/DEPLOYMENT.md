# Croma Links — Guía de despliegue

> **Estado:** el proyecto está preparado, **no publicado**. Nada de esta guía se
> ejecutó todavía: no hay repositorio remoto, ni DNS configurado, ni GitHub Pages activo.
> Cada paso con efecto externo requiere autorización expresa.

Dominio definitivo: **`https://links.cromashop.com.ar`**
Páginas: `/` · `/paseo/` · `/wave/` · `/perito/` · `/centenario/` · `/roca/`
(`/cipo/` existe como página informativa de sucursal cerrada, `noindex`).

---

## 1. Requisitos previos

- Cuenta u organización de GitHub donde vivirá el repo (a definir) con permiso para
  habilitar GitHub Pages. **GitHub Pages en repos privados requiere un plan de pago**;
  en plan gratuito el repo debe ser público. El repo no contiene secretos ni datos
  privados (solo enlaces y direcciones públicas), pero decidir esto antes de crearlo.
- Acceso a la **zona DNS de `cromashop.com.ar`**. Confirmar dónde está gestionada
  (no asumirlo) antes de pedir el cambio.
- Node.js 22.18 o superior (el workflow usa Node 24) y Git, para probar en local.
- Antes de cualquier publicación, en local:

```bash
npm ci
npm run check      # typecheck + build + build demo + QR + tests
```

Debe terminar con **todas las pruebas aprobadas** (hoy 60+) y `dist/ OK`.

## 2. Creación del repositorio remoto

Sugerido: `croma-links` (nombre a confirmar). Desde la carpeta del proyecto:

```bash
# Solo después de la autorización expresa.
gh repo create <cuenta-u-org>/croma-links --public --source=. --remote=origin
git push -u origin master
```

- La rama por defecto es `master`; si se prefiere `main`, renombrarla antes del primer push
  (`git branch -m main`). El workflow no depende del nombre de la rama.
- Al subir, **no** se publica nada: el workflow solo corre manualmente.
- `dist/`, `dist-demo/` y `node_modules/` están en `.gitignore`.
  `demo/`, `capturas/` y `qr/` viajan en el repo pero **no** entran al sitio
  (`scripts/verify-dist.mjs` lo comprueba y el workflow falla si algo se filtra).

## 3. Configuración de GitHub Pages

En el repositorio: **Settings → Pages**

1. **Build and deployment → Source:** `GitHub Actions` (no "Deploy from a branch").
2. **Custom domain:** `links.cromashop.com.ar` → *Save*.
   - GitHub verificará el DNS (paso 5); mientras no esté el registro mostrará un aviso.
   - El archivo `CNAME` ya se genera en cada build con ese valor.
3. **Enforce HTTPS:** se habilita solo cuando el certificado esté emitido (puede tardar
   desde minutos hasta unas horas tras propagar el DNS).
4. **Recomendado:** verificar el dominio a nivel cuenta/organización
   (**Settings → Pages → Add a domain**, registro TXT `_github-pages-challenge-…`).
   Evita que otra cuenta reclame el subdominio si el repo se elimina.

## 4. Configuración del subdominio

Se crea **un registro nuevo** para `links`. No se modifica ni se elimina ningún otro
registro (en particular los de `www` y el dominio raíz, que sirven la tienda).

Antes de crearlo, comprobar que no exista ya un registro `links`:

```bash
nslookup -type=CNAME links.cromashop.com.ar
```

## 5. Registros DNS que se necesitarán

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| `CNAME` | `links` | `<cuenta-u-org>.github.io` | 3600 (o el predeterminado) |
| `TXT` *(opcional, verificación)* | `_github-pages-challenge-<cuenta-u-org>.links` | *(valor que muestra GitHub)* | 3600 |

Notas:
- El valor del `CNAME` es **el usuario u organización**, sin el nombre del repo.
- Es un subdominio, así que **no** se usan registros `A`/`AAAA` ni se toca el apex.
- Si la zona la gestiona un proveedor que exige el nombre completo, usar
  `links.cromashop.com.ar.`
- No cargar estos registros hasta que el repo y Pages estén creados y haya autorización.

## 6. Verificación HTTPS

```bash
nslookup -type=CNAME links.cromashop.com.ar        # debe apuntar a <cuenta>.github.io
curl -sI https://links.cromashop.com.ar/paseo/      # HTTP/2 200
curl -sI http://links.cromashop.com.ar/paseo/       # 301 a https (con Enforce HTTPS)
curl -sI https://links.cromashop.com.ar/noexiste/   # 404 con la página personalizada
```

Comprobar en el navegador que el candado es válido y que el certificado corresponde a
`links.cromashop.com.ar`. Confirmar que **`https://www.cromashop.com.ar` no cambió**.

## 7. Pruebas de enlaces

Para cada sucursal (`paseo`, `wave`, `perito`, `centenario`, `roca`), desde un celular:

- [ ] Carga sin errores y muestra el nombre correcto.
- [ ] **Instagram, TikTok, Facebook, YouTube** abren los perfiles de Croma.
- [ ] **WhatsApp** abre el chat de *esa* sucursal (mensaje "Hola Croma …").
- [ ] **Tienda online** abre `https://www.cromashop.com.ar/`.
- [ ] **Cómo llegar** abre Google Maps en la ubicación correcta.
- [ ] Dirección y horarios coinciden con `https://www.cromashop.com.ar/info/locales`.
- [ ] "Ver todas las sucursales" vuelve al listado; el listado muestra 5 sucursales, sin Cipo.
- [ ] Desde el navegador interno de Instagram y de WhatsApp (abrir el enlace desde un chat).
- [ ] `https://links.cromashop.com.ar/cipo/` muestra "Sucursal no disponible".

## 8. Validación de los cinco QR

Los QR están en `qr/` (PNG 2048 px y SVG). **Son provisionales hasta completar la
verificación de esta guía. No imprimir antes.**

1. Con el sitio ya publicado, abrir `qr/index.html` (hoja con las cinco sucursales).
2. Escanear **cada** QR con la cámara de un iPhone y de un Android.
3. Confirmar que cada uno abre su página (`/paseo/`, `/wave/`, …) y no otra.
4. Probar el PNG impreso de prueba al tamaño final (mín. recomendado 3 × 3 cm) con
   distintas luces.
5. Regenerar solo si cambia `siteUrl` en `config/global.json`:

```bash
npm run qr
```

Los QR codifican únicamente `https://links.cromashop.com.ar/<slug>/`; cambiar redes,
WhatsApp o Maps **no** obliga a reimprimirlos.

## 9. Procedimiento de actualización

1. Editar `config/global.json` (redes) o `config/branches.json` (sucursales).
   Agregar una sucursal = agregar un objeto; desactivarla = `"active": false`.
2. Verificar en local:

```bash
npm run check
npm run preview        # http://localhost:4173
```

3. Commit y push a la rama principal.
4. En GitHub: **Actions → Deploy Croma Links → Run workflow**.
   - Dejar el campo vacío: solo **verifica y compila** (no publica).
   - Escribir `PUBLICAR`: además **despliega**.
5. Repetir la verificación de la sección 7 en las páginas afectadas.

El workflow nunca se dispara solo; si en el futuro se quiere publicar automáticamente
al hacer push, es una decisión explícita (agregar `push` a `on:`).

## 10. Procedimiento de reversión

**Opción A — volver a una versión anterior (la más rápida):**

1. En **Actions → Deploy Croma Links → Run workflow**, elegir como **Branch/Tag** un
   commit o etiqueta anterior que estaba bien (crear etiquetas en cada publicación:
   `git tag publicado-2026-xx-xx && git push --tags`).
2. Escribir `PUBLICAR` y ejecutar.

**Opción B — revertir el cambio:**

```bash
git revert <hash-del-commit-con-problema>
git push
```

y ejecutar el workflow con `PUBLICAR`.

**Opción C — emergencia (sacar el sitio):**
Settings → Pages → *Unpublish site*. Los QR dejan de funcionar hasta republicar; es
reversible. No tocar DNS salvo que sea imprescindible.

**Datos:** si el problema es un dato (enlace, horario), alcanza con corregir `config/` y
republicar; los QR no cambian.

---

### Resumen de pasos restantes (requieren autorización)

1. Crear el repo remoto y hacer el primer push.
2. Settings → Pages: Source = GitHub Actions, dominio personalizado.
3. Solicitar el registro `CNAME links → <cuenta>.github.io` (y TXT opcional).
4. Ejecutar el workflow (primero sin `PUBLICAR`, luego con `PUBLICAR`).
5. Habilitar Enforce HTTPS y completar las secciones 6, 7 y 8.
6. Recién entonces imprimir los QR.
