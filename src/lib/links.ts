import type { Branch, GlobalConfig, LinkGroup, ResolvedLink } from '../types';

const SOCIAL_KEYS = new Set(['instagram', 'tiktok', 'facebook', 'youtube']);

/** Solo se aceptan URLs https con un hostname real. */
export function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname.includes('.') && !u.username && !u.password;
  } catch {
    return false;
  }
}

/**
 * El campo `whatsapp` acepta:
 *  - un enlace https oficial: `walink.co/<código>` o `wa.me/<número>` (se usa tal cual), o
 *  - solo dígitos en formato internacional (10 a 15), que se convierte a `wa.me`.
 * El hostname debe coincidir exactamente: se rechazan dominios parecidos
 * (walink.co.evil.com, xwalink.co, etc.), http, credenciales y puertos.
 */
export function resolveWhatsapp(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (/^\d{10,15}$/.test(value)) return `https://wa.me/${value}`;
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
  if (u.hostname === 'walink.co' && /^\/[A-Za-z0-9_-]{3,64}\/?$/.test(u.pathname)) return value;
  if (u.hostname === 'wa.me' && /^\/\d{10,15}\/?$/.test(u.pathname)) return value;
  return null;
}

export function isValidWhatsapp(value: unknown): value is string {
  return resolveWhatsapp(value) !== null;
}

/**
 * Arma los botones de una sucursal en el orden oficial.
 * Un botón sin URL válida simplemente no se genera.
 */
export function buildLinks(global: GlobalConfig, branch: Branch): ResolvedLink[] {
  const out: ResolvedLink[] = [];
  const add = (key: ResolvedLink['key'], label: string, href: string | null) => {
    if (isValidUrl(href))
      out.push({ key, label, href, group: SOCIAL_KEYS.has(key) ? 'social' : 'contact' });
  };
  add('instagram', 'Instagram', global.links.instagram);
  add('tiktok', 'TikTok', global.links.tiktok);
  add('facebook', 'Facebook', global.links.facebook);
  add('youtube', 'YouTube', global.links.youtube);
  add('whatsapp', 'WhatsApp', resolveWhatsapp(branch.whatsapp));
  add('store', 'Tienda online', global.links.store);
  add('maps', 'Cómo llegar', branch.mapsUrl);
  for (const extra of branch.extraLinks) add('extra', extra.label, extra.url);
  return out;
}

/**
 * Divide los enlaces en "redes sociales" y "contacto y servicios",
 * conservando el orden. Los grupos vacíos no se devuelven.
 */
export function buildLinkGroups(
  global: GlobalConfig,
  branch: Branch,
): { group: LinkGroup; links: ResolvedLink[] }[] {
  const links = buildLinks(global, branch);
  const groups: LinkGroup[] = ['social', 'contact'];
  return groups
    .map((group) => ({ group, links: links.filter((l) => l.group === group) }))
    .filter((g) => g.links.length > 0);
}

/** Texto opcional del encabezado: null si falta, está vacío o solo tiene espacios. */
export function cleanTagline(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
