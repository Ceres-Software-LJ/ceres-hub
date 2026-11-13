// Metadados de cada tela do site. A mesma tabela serve para o <head> da rota
// aberta e para o JS atualizar título/canonical quando a pessoa navega sem recarregar.
import { SITE } from '../lib/schema.js';

export const VIEWS = {
  home: {
    path: '/',
    title: 'Criação de Sites em Campo Grande, MS | Céres Hub',
    description:
      'Agência digital em Campo Grande, MS. Sites a partir de R$ 800 com entrega em 30 dias: rápidos e feitos para converter. Domínio, SEO local e suporte.',
    ogDescription:
      'Sites a partir de R$ 800, entregues em 30 dias. Agência digital em Campo Grande, MS: domínio, SEO local e suporte, do primeiro contato ao lançamento.',
    twitterDescription: 'Sites a partir de R$ 800 com entrega em 30 dias. Agência digital em Campo Grande, MS.',
  },
  library: {
    path: '/portfolio/',
    title: 'Portfólio de Sites | Céres Hub, Campo Grande, MS',
    description:
      'Sites que a Céres Hub já colocou no ar: FlowBloc, FinBloc, Kura Lab, Cutelaria Estância Gaúcha, MP Engenharia, Axa Foto, Viva Espaço de Beleza e Amaná Makramiya.',
  },
  about: {
    path: '/sobre/',
    title: 'Sobre a Céres Hub | Agência digital em Campo Grande, MS',
    description:
      'Quem faz a Céres Hub: uma dupla de Campo Grande, MS, que cria sites do domínio ao lançamento. Conheça a equipe, o processo de 4 etapas e como trabalhamos.',
  },
};

/** Tabela serializável para o cliente, com a URL canônica absoluta. */
export const viewsMeta = Object.fromEntries(
  Object.entries(VIEWS).map(([k, v]) => [
    k,
    { title: v.title, description: v.description, canonical: new URL(v.path, SITE).href },
  ]),
);
