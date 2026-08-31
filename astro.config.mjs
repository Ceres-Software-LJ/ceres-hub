// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://www.cereshub.com.br';

/**
 * Data da última mudança real de conteúdo de cada página fixa.
 * É preenchida à mão de propósito: o Google só usa `lastmod` enquanto ele for
 * verdadeiro. Carimbar a data do build a cada deploy faz o campo ser ignorado.
 * Ao editar o conteúdo de uma destas páginas, atualize a data aqui.
 */
const LASTMOD_PAGINAS = {
  '/': '2026-08-31',
  '/sobre/': '2026-08-31',
  '/contato/': '2026-08-31',
  '/blog/': '2026-08-31',
  '/politica-de-privacidade/': '2026-08-31',
  '/termos-de-uso/': '2026-08-31',
};

/** Artigos: a data vem do frontmatter, então não há o que manter à mão. */
function lastmodDosArtigos() {
  const dir = './src/content/blog';
  const mapa = {};
  for (const arquivo of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const texto = fs.readFileSync(path.join(dir, arquivo), 'utf8');
    const frontmatter = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const campo = (nome) => frontmatter.match(new RegExp(`^${nome}:\\s*(\\S+)`, 'm'))?.[1];
    const data = campo('updatedAt') ?? campo('publishedAt');
    if (data) mapa[`/blog/${arquivo.replace(/\.md$/, '')}/`] = data;
  }
  return mapa;
}

const LASTMOD = { ...LASTMOD_PAGINAS, ...lastmodDosArtigos() };

/**
 * `priority` e `changefreq` são ignorados pelo Google desde 2015; ficam aqui
 * porque outros buscadores (Bing, Yandex) ainda os leem, e custam nada.
 */
function pesos(rota) {
  if (rota === '/') return { priority: 1.0, changefreq: 'monthly' };
  if (rota === '/blog/') return { priority: 0.8, changefreq: 'weekly' };
  if (rota.startsWith('/blog/')) return { priority: 0.7, changefreq: 'monthly' };
  if (rota === '/politica-de-privacidade/' || rota === '/termos-de-uso/')
    return { priority: 0.3, changefreq: 'yearly' };
  return { priority: 0.9, changefreq: 'monthly' };
}

export default defineConfig({
  // Obrigatorio para o @astrojs/sitemap e para as URLs absolutas do canonical/OG.
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // O arquivo de verificacao do Search Console nao e uma pagina do site.
      filter: (page) => !page.includes('googlead077be403c8c16e'),
      serialize(item) {
        const rota = new URL(item.url).pathname;
        const data = LASTMOD[rota];
        return {
          ...item,
          ...pesos(rota),
          ...(data ? { lastmod: new Date(`${data}T12:00:00Z`).toISOString() } : {}),
        };
      },
    }),
  ],
});
