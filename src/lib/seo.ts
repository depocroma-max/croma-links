import type { Branch, GlobalConfig } from '../types';

export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Une " - " con espacios duros y "word joiner" (U+2060, invisible) para que el guion
 * no quede colgado al final de una línea ni empiece la siguiente.
 */
export function glueDash(text: string): string {
  return text.replace(/ - /g, ' ⁠-⁠ ');
}

export function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export interface Meta {
  title: string;
  description: string;
  /** Ruta canónica (ej. "/paseo/") o null para no emitir canonical. */
  canonicalPath: string | null;
  image: string;
  noindex?: boolean;
}

export function absolute(global: GlobalConfig, path: string): string {
  return new URL(path, global.siteUrl.replace(/\/?$/, '/')).toString();
}

export function renderHead(global: GlobalConfig, meta: Meta): string {
  const image = absolute(global, meta.image);
  const url = meta.canonicalPath ? absolute(global, meta.canonicalPath) : null;
  const t = escapeAttr(meta.title);
  const d = escapeAttr(meta.description);
  const tags = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    meta.noindex ? `<meta name="robots" content="noindex, nofollow">` : '',
    url ? `<link rel="canonical" href="${escapeAttr(url)}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="es_AR">`,
    `<meta property="og:site_name" content="${escapeAttr(global.brand)}">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    url ? `<meta property="og:url" content="${escapeAttr(url)}">` : '',
    `<meta property="og:image" content="${escapeAttr(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    `<meta name="twitter:image" content="${escapeAttr(image)}">`,
  ];
  return tags.filter(Boolean).join('\n    ');
}

export function branchMeta(global: GlobalConfig, branch: Branch): Meta {
  const name = titleCase(branch.name);
  return {
    title: `${name} | Redes sociales y contacto`,
    description: `Encontrá las redes sociales, WhatsApp, ubicación y tienda online de ${name}.`,
    canonicalPath: `/${branch.slug}/`,
    image: branch.image ?? global.defaultOgImage,
    noindex: !branch.active,
  };
}
