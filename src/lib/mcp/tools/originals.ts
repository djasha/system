import { z } from 'zod';
import Fuse from 'fuse.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface OriginalsFetcher {
  fetchSearchIndex?: () => Promise<any[]>;
  fetchComponent?: (slug: string) => Promise<any>;
  fetchBundle?: (slug: string) => Promise<string>;
  fetchManifest?: () => Promise<any>;
  fetchTokens?: () => Promise<any>;
}

const BASE = process.env.MCP_PUBLIC_BASE ?? 'https://system.djasha.me';

const httpFetcher: Required<OriginalsFetcher> = {
  fetchSearchIndex: async () => (await fetch(`${BASE}/search-index.json`)).json(),
  fetchComponent: async (slug) => (await fetch(`${BASE}/api/components/${slug}.json`)).json(),
  fetchBundle: async (slug) => (await fetch(`${BASE}/bundles/${slug}.md`)).text(),
  fetchManifest: async () => (await fetch(`${BASE}/api/index.json`)).json(),
  fetchTokens: async () => (await fetch(`${BASE}/tokens.json`)).json(),
};

export async function handleSearchComponents(
  args: { query: string; limit?: number },
  fetcher: OriginalsFetcher = httpFetcher,
) {
  const index = await fetcher.fetchSearchIndex!();
  const components = index.filter((e: any) => e.type === 'component');
  const fuse = new Fuse(components, { keys: ['name', 'description', 'tags'], threshold: 0.3 });
  const results = fuse.search(args.query).slice(0, args.limit ?? 20).map((r: any) => ({ ...r.item, score: r.score }));
  return results;
}

export async function handleGetComponent(args: { slug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  return fetcher.fetchComponent!(args.slug);
}

export async function handleGetBundle(args: { slug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  return fetcher.fetchBundle!(args.slug);
}

export async function handleListPatterns(_args: unknown, fetcher: OriginalsFetcher = httpFetcher) {
  const manifest = await fetcher.fetchManifest!();
  return manifest.patterns ?? [];
}

export async function handleListTokens(args: { category?: string }, fetcher: OriginalsFetcher = httpFetcher) {
  const tokens = await fetcher.fetchTokens!();
  const all = Object.values(tokens) as any[];
  return args.category ? all.filter((t) => t.category === args.category) : all;
}

export async function handleGetToken(args: { slug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  const tokens = await fetcher.fetchTokens!();
  return tokens[args.slug] ?? null;
}

export async function handleFindByToken(args: { tokenSlug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  const manifest = await fetcher.fetchManifest!();
  const components = (manifest.components ?? []).filter((c: any) => (c.tokens_used ?? []).includes(args.tokenSlug));
  const patterns = (manifest.patterns ?? []).filter((p: any) => (p.tokens_used ?? []).includes(args.tokenSlug));
  return { components, patterns };
}

export function registerOriginalsTools(server: McpServer) {
  server.tool(
    'search_components',
    {
      query: z.string().describe('Free-text query — name, description, tags'),
      limit: z.number().optional().describe('Max results, default 20'),
    },
    async (args) => {
      const results = await handleSearchComponents(args);
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    },
  );

  server.tool(
    'get_component',
    { slug: z.string() },
    async (args) => {
      const result = await handleGetComponent(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'get_bundle',
    { slug: z.string() },
    async (args) => {
      const result = await handleGetBundle(args);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  server.tool('list_patterns', {}, async () => {
    const result = await handleListPatterns({});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool(
    'list_tokens',
    { category: z.enum(['color', 'type', 'space', 'radius', 'shadow', 'motion']).optional() },
    async (args) => {
      const result = await handleListTokens(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool('get_token', { slug: z.string() }, async (args) => {
    const result = await handleGetToken(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('find_by_token', { tokenSlug: z.string() }, async (args) => {
    const result = await handleFindByToken(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });
}
