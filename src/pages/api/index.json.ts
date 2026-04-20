import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const [components, patterns, tokens, voice] = await Promise.all([
    getCollection('components'),
    getCollection('patterns'),
    getCollection('tokens'),
    getCollection('voice'),
  ]);

  const manifest = {
    generated_at: new Date().toISOString(),
    counts: {
      components: components.length,
      patterns: patterns.length,
      tokens: tokens.length,
      voice: voice.length,
    },
    components: components.map((c) => ({
      slug: c.id,
      name: c.data.name,
      description: c.data.description,
      category: c.data.category,
      tags: c.data.tags,
      status: c.data.status,
    })),
    patterns: patterns.map((p) => ({
      slug: p.id,
      name: p.data.name,
      description: p.data.description,
      category: p.data.category,
      tags: p.data.tags,
      status: p.data.status,
    })),
    tokens: tokens.map((t) => ({
      slug: `${t.data.category}.${t.data.name}`,
      value: t.data.value,
      category: t.data.category,
      description: t.data.description,
    })),
    voice: voice.map((v) => ({
      slug: v.id,
      topic: v.data.topic,
      description: v.data.description,
    })),
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
