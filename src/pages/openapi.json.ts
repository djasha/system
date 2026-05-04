import type { APIRoute } from 'astro';
import { buildOpenApiSpec } from '../lib/openapi';

export const GET: APIRoute = async () => {
  const spec = buildOpenApiSpec({ baseUrl: 'https://system.djasha.me' });
  return new Response(JSON.stringify(spec, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
