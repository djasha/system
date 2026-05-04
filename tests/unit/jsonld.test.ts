import { describe, it, expect } from 'vitest';
import { jsonLdForWebsite, jsonLdForComponent, jsonLdForReference, jsonLdForSkill, jsonLdForBreadcrumbs } from '../../src/lib/jsonld';

describe('jsonLdForWebsite', () => {
  it('emits a WebSite type with the right URL', () => {
    const out = jsonLdForWebsite({ url: 'https://system.djasha.me' });
    expect(out['@type']).toBe('WebSite');
    expect(out.url).toBe('https://system.djasha.me');
    expect(out.publisher).toBeDefined();
  });
});

describe('jsonLdForComponent', () => {
  const c = {
    name: 'MagneticButton',
    slug: 'magnetic-button',
    description: 'Cursor-pull button.',
    sourcePath: 'src/components/MagneticButton.tsx',
    tags: ['motion', 'button'],
    site: 'https://system.djasha.me',
    githubBase: 'https://github.com/djasha/system',
    license: 'See repo',
  };

  it('emits a SoftwareSourceCode', () => {
    const out = jsonLdForComponent(c);
    expect(out['@type']).toBe('SoftwareSourceCode');
    expect(out.name).toBe('MagneticButton');
    expect(out.codeRepository).toContain('github.com/djasha/system');
  });

  it('lists tags as keywords', () => {
    const out = jsonLdForComponent(c);
    expect(out.keywords).toEqual('motion, button');
  });
});

describe('jsonLdForReference', () => {
  const r = {
    name: 'Linear',
    slug: 'linear',
    owner: 'Linear Team',
    description: 'SaaS task tracker design system.',
    site: 'https://system.djasha.me',
    sourceUrl: 'https://linear.app',
    upstream: 'https://github.com/nexu-io/open-design',
    upstreamSha: 'abc123',
  };

  it('emits a CreativeWork type', () => {
    const out = jsonLdForReference(r);
    expect(out['@type']).toBe('CreativeWork');
    expect(out.name).toContain('Linear');
  });

  it('includes isBasedOn pointing at upstream', () => {
    const out = jsonLdForReference(r);
    expect(out.isBasedOn).toMatchObject({ url: 'https://github.com/nexu-io/open-design' });
  });
});

describe('jsonLdForBreadcrumbs', () => {
  it('emits a BreadcrumbList', () => {
    const out = jsonLdForBreadcrumbs([
      { name: 'Home', url: 'https://system.djasha.me' },
      { name: 'Components', url: 'https://system.djasha.me/components' },
      { name: 'MagneticButton', url: 'https://system.djasha.me/components/magnetic-button' },
    ]);
    expect(out['@type']).toBe('BreadcrumbList');
    expect(out.itemListElement).toHaveLength(3);
    expect(out.itemListElement[0].position).toBe(1);
  });
});
