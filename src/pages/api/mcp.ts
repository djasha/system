import type { APIRoute } from 'astro';
import { createMcpServer } from '../../lib/mcp/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session tracking
    enableJsonResponse: true,      // return JSON directly instead of SSE for unary calls
  });

  await server.connect(transport);

  return transport.handleRequest(request);
};

export const GET: APIRoute = async () => {
  return new Response('MCP endpoint. POST JSON-RPC requests here.', {
    status: 405,
    headers: { 'Content-Type': 'text/plain', Allow: 'POST' },
  });
};
