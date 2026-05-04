import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const manifest = {
    name: 'Djasha System',
    description: 'The agent-first index of design systems and skills.',
    endpoint: 'https://system.djasha.me/api/mcp',
    version: '2.0.0',
    transport: 'http-streaming',
    tools_count: 7,
    schema: 'https://modelcontextprotocol.io/schemas/discovery/v1',
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
