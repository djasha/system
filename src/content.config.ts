import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES, STATUSES, TOKEN_CATEGORIES } from './lib/types';

const componentSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  description: z.string(),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).default([]),
  tokens_used: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  status: z.enum(STATUSES).default('experimental'),
  source_path: z.string(),
  a11y_notes: z.string(),
  created: z.coerce.date(),
});

const components = defineCollection({
  loader: glob({
    pattern: '**/*.doc.mdx',
    base: './src/content/components',
    generateId: ({ entry }) => entry.replace(/\.doc\.mdx$/, ''),
  }),
  schema: componentSchema,
});

const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.doc.mdx',
    base: './src/content/patterns',
    generateId: ({ entry }) => entry.replace(/\.doc\.mdx$/, ''),
  }),
  schema: componentSchema.extend({
    components_used: z.array(z.string()).default([]),
  }),
});

const tokens = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/tokens',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    category: z.enum(TOKEN_CATEGORIES),
    value: z.string(),
    tailwind_class: z.string().optional(),
    css_var: z.string(),
    description: z.string(),
  }),
});

const voice = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/voice',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    topic: z.string(),
    description: z.string(),
    rules: z.array(z.string()),
    examples: z.array(z.object({ good: z.string(), bad: z.string() })).default([]),
  }),
});

export const collections = { components, patterns, tokens, voice };
