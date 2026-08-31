// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Obrigatorio para o @astrojs/sitemap e para as URLs absolutas do canonical/OG.
  site: 'https://www.cereshub.com.br',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // O arquivo de verificacao do Search Console nao e uma pagina do site.
      filter: (page) => !page.includes('googlead077be403c8c16e'),
    }),
  ],
});
