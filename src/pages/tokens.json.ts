import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const tokens = await getCollection('tokens');
  const keyed: Record<string, any> = {};
  for (const t of tokens) {
    keyed[`${t.data.category}.${t.data.name}`] = t.data;
  }
  return new Response(JSON.stringify(keyed, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
