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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-3 px-4 pb-8 pt-4">
      <header className="rounded-3xl bg-croma-black px-5 py-5 text-center text-white">
        <div className="flex items-center justify-center gap-3">
          <img src="/tridente-192.png" alt="" width={44} height={44} className="h-11 w-11" />
          {/* mr negativo: anula el espaciado final de las letras para centrar la marca */}
          <p className="-mr-[0.2em] font-display text-5xl leading-none tracking-[0.2em]">CROMA</p>
        </div>
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.26em] text-white/70">
          {eyebrow}
        </p>
        <span aria-hidden className="mx-auto my-3 block h-[2px] w-9 rounded-full bg-croma-red" />
        <h1 className="font-display text-3xl leading-tight tracking-wider text-balance">
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
