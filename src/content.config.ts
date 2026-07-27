import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const taxonomyTerm = z.string().trim().min(1);

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  lang: z.enum(['pt-br']).optional(),
  toc: z.union([z.boolean(), z.enum(['center', 'side'])]).optional(),
  comments: z.boolean().optional(),
  math: z.boolean().optional(),
  mermaid: z.boolean().optional(),
  gallery: z.boolean().optional(),
  lightbox: z.boolean().optional()
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema.extend({
    description: z.string().trim().min(50).max(160),
    pubDate: z.coerce.date(),
    author: z.string().trim().min(2),
    authorUrl: z.url().optional(),
    tags: z.array(taxonomyTerm).default([]),
    categories: z.array(taxonomyTerm).default([])
  })
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema.extend({
    tags: z.array(taxonomyTerm).default([]),
    links: z.array(z.object({
      label: z.string(),
      url: z.url(),
      icon: z.string().optional(),
      variant: z.enum(['primary', 'secondary']).default('secondary')
    })).default([]),
    featured: z.boolean().default(false)
  })
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema.extend({
    layout: z.enum(['page', 'timeline']).default('page')
  })
});

const series = defineCollection({
  loader: glob({ base: './src/content/series', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    lang: z.enum(['pt-br']).optional(),
    chapters: z.array(reference('posts')).min(2)
  })
});

export const collections = {
  posts,
  projects,
  pages,
  series
};
