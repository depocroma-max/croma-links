import { renderToStaticMarkup } from 'react-dom/server';
import branchesJson from '@config/branches.json';
import globalJson from '@config/global.json';
import { absolute, branchMeta, renderHead, type Meta } from './lib/seo';
import { validateConfig } from './lib/validate';
import { BranchPage, InactiveBranchPage } from './pages/BranchPage';
import { HomePage, NotFoundPage } from './pages/HomePage';
import type { Branch, GlobalConfig, PageSpec } from './types';

const global = globalJson as GlobalConfig;
const branches = branchesJson as Branch[];

function page(path: string, status: number, meta: Meta, node: JSX.Element): PageSpec {
  return { path, status, html: renderToStaticMarkup(node), head: renderHead(global, meta) };
}

export function buildSite() {
  const errors = validateConfig(global, branches);
  const active = branches.filter((b) => b.active);
  const pages: PageSpec[] = [];

  pages.push(
    page(
      '/',
      200,
      {
        title: 'Croma | Redes sociales y sucursales',
        description:
          'Encontrá las redes sociales, WhatsApp, ubicación y tienda online de cada sucursal de Croma.',
        canonicalPath: '/',
        image: global.defaultOgImage,
      },
      <HomePage global={global} branches={active} />,
    ),
  );

  for (const b of branches) {
    pages.push(
      page(
        `/${b.slug}/`,
        200,
        branchMeta(global, b),
        b.active ? (
          <BranchPage global={global} branch={b} />
        ) : (
          <InactiveBranchPage global={global} branch={b} />
        ),
      ),
    );
  }

  pages.push(
    page(
      '/404.html',
      404,
      {
        title: 'Página no encontrada | Croma',
        description: 'La página que buscás no existe. Elegí tu sucursal de Croma.',
        canonicalPath: null,
        image: global.defaultOgImage,
        noindex: true,
      },
      <NotFoundPage />,
    ),
  );

  const urls = ['/', ...active.map((b) => `/${b.slug}/`)].map((p) => absolute(global, p));
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  const robots = `User-agent: *\nAllow: /\nSitemap: ${absolute(global, '/sitemap.xml')}\n`;

  return { errors, pages, sitemap, robots, host: new URL(global.siteUrl).hostname };
}
