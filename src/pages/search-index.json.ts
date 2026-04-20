import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const [components, patterns, tokens, voice] = await Promise.all([
    getCollection('components'),
    getCollection('patterns'),
    getCollection('tokens'),
    getCollection('voice'),
  ]);

  const entries = [
    ...components.map((c) => ({
      type: 'component',
      slug: c.id,
      name: c.data.name,
      description: c.data.description,
      tags: c.data.tags,
      category: c.data.category,
      body: c.body ?? '',
    })),
    ...patterns.map((p) => ({
      type: 'pattern',
      slug: p.id,
      name: p.data.name,
      description: p.data.description,
      tags: p.data.tags,
      category: p.data.category,
      body: p.body ?? '',
    })),
    ...tokens.map((t) => ({
      type: 'token',
      slug: `${t.data.category}.${t.data.name}`,
      name: t.data.name,
      description: t.data.description,
      category: t.data.category,
    })),
    ...voice.map((v) => ({
      type: 'voice',
      slug: v.id,
      name: v.data.topic,
      description: v.data.description,
    })),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};
