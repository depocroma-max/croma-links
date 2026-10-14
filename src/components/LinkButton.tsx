import { ChevronRight, ExternalLink, MapPin, ShoppingBag, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from '../icons/BrandIcons';
import { glueDash } from '../lib/seo';
import type { LinkKey, ResolvedLink } from '../types';

const ICONS: Record<LinkKey, ReactNode> = {
  instagram: <InstagramIcon />,
  tiktok: <TikTokIcon />,
  facebook: <FacebookIcon />,
  youtube: <YouTubeIcon />,
  whatsapp: <WhatsAppIcon />,
  store: <ShoppingBag size={24} strokeWidth={1.8} aria-hidden />,
  maps: <MapPin size={24} strokeWidth={1.8} aria-hidden />,
  extra: <ExternalLink size={24} strokeWidth={1.8} aria-hidden />,
};

const BRANCH_ICON = <Store size={24} strokeWidth={1.8} aria-hidden />;

const BTN =
  'link-btn group flex min-h-[56px] w-full items-center gap-4 rounded-2xl border border-croma-line ' +
  'bg-croma-soft px-4 py-2 text-base font-medium text-croma-black no-underline ' +
  'hover:border-croma-black hover:bg-white focus-visible:outline focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-croma-red';

function Row({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-croma-black">
        {icon}
      </span>
      <span className="flex-1 text-left">{glueDash(label)}</span>
      <ChevronRight
        className="arrow shrink-0 text-croma-black/40 group-hover:text-croma-red"
        size={22}
        aria-hidden
      />
    </>
  );
}

/** Botón hacia un enlace externo (se abre en pestaña nueva, de forma segura). */
export function LinkButton({ link }: { link: ResolvedLink }) {
  return (
    <a
      className={BTN}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${link.label} (se abre en una pestaña nueva)`}
    >
      <Row icon={ICONS[link.key]} label={link.label} />
    </a>
  );
}

/** Botón hacia otra página del propio sitio. */
export function InternalButton({ href, label }: { href: string; label: string }) {
  return (
    <a className={BTN} href={href}>
      <Row icon={BRANCH_ICON} label={label} />
    </a>
  );
}
