import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Vira a meta description do artigo: escreva para a SERP, não para o site. */
    description: z.string(),
    /** Rótulo curto exibido no card. */
    category: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** Um artigo por vez pode ocupar o card largo no topo do índice. */
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
