import type { Branch, GlobalConfig } from '../types';
import { isValidUrl, isValidWhatsapp } from './links';

/** Devuelve la lista de errores de configuración (vacía si todo está bien). */
export function validateConfig(global: GlobalConfig, branches: Branch[]): string[] {
  const errors: string[] = [];
  const url = (where: string, v: string | null) => {
    if (v !== null && !isValidUrl(v)) errors.push(`${where}: URL inválida (se requiere https): ${v}`);
  };

  if (!isValidUrl(global.siteUrl)) errors.push(`global.siteUrl inválida: ${global.siteUrl}`);
  for (const [k, v] of Object.entries(global.links)) url(`global.links.${k}`, v);

  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const b of branches) {
    const w = `sucursal ${b.id} (${b.slug})`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.slug)) errors.push(`${w}: slug inválido`);
    if (['404', 'qr', 'assets'].includes(b.slug)) errors.push(`${w}: slug reservado`);
    if (slugs.has(b.slug)) errors.push(`${w}: slug repetido`);
    if (ids.has(b.id)) errors.push(`${w}: id repetido`);
    slugs.add(b.slug);
    ids.add(b.id);
    if (!b.name.trim()) errors.push(`${w}: nombre vacío`);
    if (b.header && b.header.tagline != null && typeof b.header.tagline !== 'string')
      errors.push(`${w}: header.tagline debe ser texto o null`);
    if (b.whatsapp !== null && !isValidWhatsapp(b.whatsapp))
      errors.push(`${w}: whatsapp debe ser un enlace https de walink.co o wa.me, o dígitos internacionales (10 a 15)`);
    url(`${w}.mapsUrl`, b.mapsUrl);
    for (const e of b.extraLinks) {
      if (!e.label.trim()) errors.push(`${w}: enlace adicional sin etiqueta`);
      url(`${w}.extraLinks`, e.url);
    }
  }
  return errors;
}
