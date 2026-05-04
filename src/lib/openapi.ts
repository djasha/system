export interface OpenApiOptions { baseUrl: string }

export function buildOpenApiSpec(opts: OpenApiOptions) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Djasha System',
      version: '2.0.0',
      description: 'The agent-first index of design systems and skills. Originals + curated public design systems + agent workflows + visual directions.',
      contact: { name: 'Diaa Asha', url: 'https://djasha.me', email: 'me@djasha.me' },
      license: { name: 'See repo', url: 'https://github.com/djasha/system/blob/main/LICENSE' },
    },
    servers: [{ url: opts.baseUrl, description: 'Production' }],
    paths: {
      '/api/index.json': {
        get: {
          summary: 'Full manifest',
          description: 'All components, patterns, tokens, voice, references, skills, directions with summary fields.',
          responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Manifest' } } } } },
        },
      },
      '/api/components/{slug}.json': {
        get: {
          summary: 'Full component record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Component' } } } } },
        },
      },
      '/api/patterns/{slug}.json': {
        get: {
          summary: 'Full pattern record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/references/{slug}.json': {
        get: {
          summary: 'Full reference (vendored design system) record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/skills/{slug}.json': {
        get: {
          summary: 'Full skill (vendored agent workflow) record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/bundles/{slug}.md': {
        get: {
          summary: 'Markdown bundle (one-paste for AI agents)',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK', content: { 'text/markdown': { schema: { type: 'string' } } } } },
        },
      },
      '/tokens.json': { get: { summary: 'All tokens keyed by <category>.<name>', responses: { '200': { description: 'OK' } } } },
      '/search-index.json': { get: { summary: 'Fuse.js search index', responses: { '200': { description: 'OK' } } } },
      '/llms.txt': { get: { summary: 'LLM-readable site index (llms.txt spec)', responses: { '200': { description: 'OK' } } } },
      '/llms-full.txt': { get: { summary: 'Full content dump for non-crawling agents', responses: { '200': { description: 'OK' } } } },
      '/mcp': { post: { summary: 'Model Context Protocol endpoint (HTTP streaming)', responses: { '200': { description: 'MCP response' } } } },
    },
    components: {
      schemas: {
        Manifest: { type: 'object' },
        Component: { type: 'object' },
      },
    },
  };
}
