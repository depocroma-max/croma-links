export interface GlobalConfig {
  brand: string;
  siteUrl: string;
  locale: string;
  defaultOgImage: string;
  links: {
    instagram: string | null;
    tiktok: string | null;
    facebook: string | null;
    youtube: string | null;
    store: string | null;
  };
}

export interface ExtraLink {
  label: string;
  url: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  address: string | null;
  /** Número en formato internacional, solo dígitos (ej. 5492990000000). */
  whatsapp: string | null;
  mapsUrl: string | null;
  /** Una línea por tramo, ej. "Lun a Sáb · 10 a 20 hs". */
  hours: string[] | null;
  /** Ruta de una imagen en /public para vista previa (Open Graph). */
  image: string | null;
  extraLinks: ExtraLink[];
  /** Personalización opcional del encabezado. */
  header: { tagline?: string | null } | null;
}

export type LinkKey =
  | 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'whatsapp' | 'store' | 'maps' | 'extra';

export type LinkGroup = 'social' | 'contact';

export interface ResolvedLink {
  key: LinkKey;
  label: string;
  href: string;
  group: LinkGroup;
}

export interface PageSpec {
  /** Ruta de salida, ej. "/paseo/" o "/404.html". */
  path: string;
  status: number;
  html: string;
  head: string;
}
