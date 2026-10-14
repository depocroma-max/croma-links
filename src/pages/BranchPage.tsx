import { Clock, MapPin } from 'lucide-react';
import { Layout } from '../components/Layout';
import { InternalButton, LinkButton } from '../components/LinkButton';
import { buildLinkGroups, cleanTagline } from '../lib/links';
import type { Branch, GlobalConfig } from '../types';

const NBSP = ' ';

/** Evita que un rango horario ("de 9:30 a 13:30") se corte entre dos líneas. */
function keepRangesTogether(text: string): string {
  return text.replace(
    /(?:de )?\d{1,2}:\d{2} a \d{1,2}:\d{2}/g,
    (range) => range.replace(/ /g, NBSP),
  );
}

export function BranchPage({ global, branch }: { global: GlobalConfig; branch: Branch }) {
  const groups = buildLinkGroups(global, branch);
  const hasHours = !!branch.hours && branch.hours.length > 0;
  return (
    <Layout
      eyebrow="Seguinos en nuestras redes"
      title={branch.name}
      tagline={cleanTagline(branch.header?.tagline) ?? undefined}
    >
      {groups.length > 0 ? (
        <div className="flex flex-col gap-6">
          {groups.map(({ group, links }) => (
            <div key={group} data-group={group} className="flex flex-col gap-3">
              {links.map((l, i) => (
                <LinkButton key={`${l.key}-${i}`} link={l} />
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {branch.address || hasHours ? (
        <section className="mt-1 rounded-2xl border border-croma-line bg-white px-4 py-4 text-sm text-croma-black">
          {branch.address ? (
            <p className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-croma-black/60" aria-hidden />
              <span>{branch.address}</span>
            </p>
          ) : null}
          {hasHours ? (
            <div className={`flex items-start gap-3 ${branch.address ? 'mt-3' : ''}`}>
              <Clock size={18} className="mt-0.5 shrink-0 text-croma-black/60" aria-hidden />
              <ul className="space-y-0.5">
                {branch.hours!.map((h) => (
                  <li key={h} className="text-balance">
                    {keepRangesTogether(h)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
      <a
        href="/"
        className="mt-2 text-center text-sm text-croma-black/60 underline underline-offset-4 hover:text-croma-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-croma-red"
      >
        Ver todas las sucursales
      </a>
    </Layout>
  );
}

export function InactiveBranchPage({ global, branch }: { global: GlobalConfig; branch: Branch }) {
  return (
    <Layout eyebrow="Sucursal no disponible" title={branch.name}>
      <p className="rounded-2xl border border-croma-line bg-white px-4 py-5 text-center text-sm leading-relaxed text-croma-black">
        Esta sucursal ya no está disponible. Podés seguir comprando en nuestra tienda online o
        elegir otra sucursal.
      </p>
      {global.links.store ? (
        <LinkButton link={{ key: 'store', label: 'Tienda online', href: global.links.store, group: 'contact' }} />
      ) : null}
      <InternalButton href="/" label="Ver sucursales" />
    </Layout>
  );
}
