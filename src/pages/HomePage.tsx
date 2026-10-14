import { Layout } from '../components/Layout';
import { InternalButton, LinkButton } from '../components/LinkButton';
import { titleCase } from '../lib/seo';
import type { Branch, GlobalConfig } from '../types';

export function HomePage({ global, branches }: { global: GlobalConfig; branches: Branch[] }) {
  return (
    <Layout eyebrow="Seguinos en nuestras redes" title="ELEGÍ TU SUCURSAL">
      <div className="flex flex-col gap-5">
        <div data-group="branches" className="flex flex-col gap-3">
          {branches.map((b) => (
            <InternalButton key={b.slug} href={`/${b.slug}/`} label={titleCase(b.name)} />
          ))}
        </div>
        {global.links.store ? (
          <div data-group="store">
            <LinkButton
              link={{ key: 'store', label: 'Tienda online', href: global.links.store, group: 'contact' }}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export function NotFoundPage() {
  return (
    <Layout eyebrow="Página no encontrada" title="ESTA PÁGINA NO EXISTE">
      <p className="rounded-2xl border border-croma-line bg-white px-4 py-5 text-center text-sm leading-relaxed text-croma-black">
        El enlace que abriste no corresponde a ninguna sucursal de Croma.
      </p>
      <InternalButton href="/" label="Ver sucursales" />
    </Layout>
  );
}
