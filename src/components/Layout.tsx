import type { ReactNode } from 'react';
import { glueDash } from '../lib/seo';

interface Props {
  /** Línea bajo "CROMA". */
  eyebrow: string;
  /** Nombre grande (sucursal o título de la página). */
  title: string;
  tagline?: string;
  children: ReactNode;
}

export function Layout({ eyebrow, title, tagline, children }: Props) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 pb-10 pt-5">
      <header className="rounded-3xl bg-croma-black px-6 py-8 text-center text-white">
        <img src="/tridente-192.png" alt="" width={56} height={56} className="mx-auto mb-3 h-14 w-14" />
        <p className="font-display text-6xl leading-none tracking-[0.2em] pl-[0.2em]">CROMA</p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.28em] text-white/70">
          {eyebrow}
        </p>
        <span aria-hidden className="mx-auto my-5 block h-[3px] w-10 rounded-full bg-croma-red" />
        <h1 className="font-display text-4xl leading-tight tracking-wider text-balance">
          {glueDash(title)}
        </h1>
        {tagline ? (
          <p data-tagline className="mt-2 text-sm text-white/70">
            {tagline}
          </p>
        ) : null}
      </header>
      <div className="flex flex-col gap-3">{children}</div>
      <footer className="mt-auto pt-6 text-center text-xs text-[#666660]">
        <p>© Croma</p>
      </footer>
    </main>
  );
}
