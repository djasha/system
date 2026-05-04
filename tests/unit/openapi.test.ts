import { describe, it, expect } from 'vitest';
import { buildOpenApiSpec } from '../../src/lib/openapi';

describe('buildOpenApiSpec', () => {
  const spec = buildOpenApiSpec({ baseUrl: 'https://system.djasha.me' });

  it('declares OpenAPI 3.1', () => {
    expect(spec.openapi).toBe('3.1.0');
  });

  it('declares info with title + version', () => {
    expect(spec.info.title).toBe('Djasha System');
    expect(spec.info.version).toBeDefined();
  });

  it('lists the manifest endpoint', () => {
    expect(spec.paths['/api/index.json']).toBeDefined();
    expect(spec.paths['/api/index.json'].get).toBeDefined();
  });

  it('lists per-component endpoint with slug param', () => {
    expect(spec.paths['/api/components/{slug}.json']).toBeDefined();
  });

  it('lists per-reference and per-skill endpoints', () => {
    expect(spec.paths['/api/references/{slug}.json']).toBeDefined();
    expect(spec.paths['/api/skills/{slug}.json']).toBeDefined();
  });

  it('lists bundle endpoint with markdown response', () => {
    const bundle = spec.paths['/bundles/{slug}.md'].get;
    expect(bundle.responses['200'].content['text/markdown']).toBeDefined();
  });

  it('declares the MCP endpoint', () => {
    expect(spec.paths['/mcp']).toBeDefined();
  });
});
