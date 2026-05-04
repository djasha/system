import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderLlmsTxt } from '../lib/llms-txt';

export const GET: APIRoute = async () => {
  const [components, patterns, tokens, voice] = await Promise.all([
    getCollection('components'),
    getCollection('patterns'),
    getCollection('tokens'),
    getCollection('voice'),
  ]);

  // References, skills, directions collections may not exist yet (Phase 4 adds them).
  // Handle gracefully so this endpoint works at every phase.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCollectionSafe = getCollection as (name: string) => Promise<any[]>;
  let references: any[] = [];
  let skills: any[] = [];
  let directions: any[] = [];
  try { references = await getCollectionSafe('references'); } catch { /* not yet defined */ }
  try { skills = await getCollectionSafe('skills'); } catch { /* not yet defined */ }
  try { directions = await getCollectionSafe('directions'); } catch { /* not yet defined */ }

  const content = renderLlmsTxt({
    site: 'https://system.djasha.me',
    components: components.map((c) => ({ slug: c.id, name: c.data.name, description: c.data.description })),
    references: references.map((r: any) => ({ slug: r.id, name: r.data.name, owner: r.data.owner, description: r.data.description })),
    skills: skills.map((s: any) => ({ slug: s.id, name: s.data.name, mode: s.data.mode, description: s.data.description })),
    patterns: patterns.map((p) => ({ slug: p.id, name: p.data.name, description: p.data.description })),
    tokens: tokens.map((t) => ({ slug: `${t.data.category}.${t.data.name}`, value: t.data.value, description: t.data.description })),
    directions: directions.map((d: any) => ({ slug: d.id, name: d.data.name, description: d.data.description })),
    voice: voice.map((v) => ({ slug: v.id, topic: v.data.topic, description: v.data.description })),
  });

  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
