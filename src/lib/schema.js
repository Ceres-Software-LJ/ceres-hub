// Helpers de JSON-LD. Os nos grandes e estaveis vivem em src/data/*.json;
// aqui ficam so os que dependem da pagina.

export const SITE = 'https://www.cereshub.com.br';

/** @id do no da organizacao, para as outras paginas referenciarem sem duplicar. */
export const ORG_ID = `${SITE}/#organizacao`;
export const orgRef = { '@id': ORG_ID };

/**
 * BreadcrumbList a partir da trilha da pagina.
 * "Início" entra sozinho como primeiro item.
 * @param {{ label: string, href: string }[]} crumbs
 */
export function breadcrumb(crumbs) {
  const items = [{ label: 'Início', href: '/' }, ...crumbs];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: new URL(c.href, SITE).href,
    })),
  };
}

/**
 * No de pagina generico (AboutPage, ContactPage, WebPage...).
 * @param {string} type
 * @param {{ path: string, name: string, description: string }} page
 */
export function webPage(type, { path, name, description }) {
  return {
    '@type': type,
    '@id': new URL(path, SITE).href,
    url: new URL(path, SITE).href,
    name,
    description,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': `${SITE}/#website` },
    about: orgRef,
  };
}

/** Artigo do blog. */
export function blogPosting({ path, title, description, publishedAt, updatedAt, image }) {
  const url = new URL(path, SITE).href;
  return {
    '@type': 'BlogPosting',
    '@id': url,
    url,
    mainEntityOfPage: url,
    headline: title,
    description,
    inLanguage: 'pt-BR',
    datePublished: publishedAt.toISOString().slice(0, 10),
    dateModified: (updatedAt ?? publishedAt).toISOString().slice(0, 10),
    author: orgRef,
    publisher: orgRef,
    image: new URL(image ?? '/assets/images/brand/logo.png', SITE).href,
  };
}
