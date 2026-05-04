import { describe, it, expect, vi } from 'vitest';
import {
  handleSearchComponents,
  handleGetComponent,
  handleGetBundle,
  handleListPatterns,
  handleListTokens,
  handleGetToken,
  handleFindByToken,
} from '../../../src/lib/mcp/tools/originals';

describe('handleSearchComponents', () => {
  const fetcher = {
    fetchSearchIndex: vi.fn().mockResolvedValue([
      { type: 'component', slug: 'magnetic-button', name: 'MagneticButton', description: 'Magnetic pull.', tags: ['motion'] },
      { type: 'component', slug: 'tilt-card', name: 'TiltCard', description: 'Tilt on hover.', tags: ['motion'] },
      { type: 'token', slug: 'color.accent', name: 'accent' },
    ]),
  };

  it('returns only components matching the query', async () => {
    const out = await handleSearchComponents({ query: 'magnetic' }, fetcher);
    expect(out).toHaveLength(1);
    expect(out[0].slug).toBe('magnetic-button');
  });

  it('respects limit', async () => {
    const out = await handleSearchComponents({ query: 'motion', limit: 1 }, fetcher);
    expect(out).toHaveLength(1);
  });

  it('excludes non-component types', async () => {
    const out = await handleSearchComponents({ query: 'accent' }, fetcher);
    expect(out.every((r: any) => r.type === 'component')).toBe(true);
  });
});

describe('handleGetComponent', () => {
  it('fetches the JSON for the slug', async () => {
    const fetcher = { fetchComponent: vi.fn().mockResolvedValue({ slug: 'magnetic-button', name: 'MagneticButton' }) };
    const out = await handleGetComponent({ slug: 'magnetic-button' }, fetcher);
    expect(fetcher.fetchComponent).toHaveBeenCalledWith('magnetic-button');
    expect(out.slug).toBe('magnetic-button');
  });
});

describe('handleGetBundle', () => {
  it('fetches the bundle markdown for the slug', async () => {
    const fetcher = { fetchBundle: vi.fn().mockResolvedValue('# MagneticButton\n\n...') };
    const out = await handleGetBundle({ slug: 'magnetic-button' }, fetcher);
    expect(out).toMatch(/^# MagneticButton/);
  });
});

describe('handleListPatterns', () => {
  it('returns the patterns array from the manifest', async () => {
    const fetcher = { fetchManifest: vi.fn().mockResolvedValue({ patterns: [{ slug: 'editorial-hero', name: 'Editorial Hero' }] }) };
    const out = await handleListPatterns({}, fetcher);
    expect(out).toHaveLength(1);
    expect(out[0].slug).toBe('editorial-hero');
  });
});

describe('handleListTokens', () => {
  const fetcher = {
    fetchTokens: vi.fn().mockResolvedValue({
      'color.accent': { name: 'accent', category: 'color', value: '#E8462C' },
      'space.4': { name: '4', category: 'space', value: '1rem' },
      'motion.duration-base': { name: 'duration-base', category: 'motion', value: '300ms' },
    }),
  };

  it('returns all tokens when no category given', async () => {
    const out = await handleListTokens({}, fetcher);
    expect(out).toHaveLength(3);
  });

  it('filters by category', async () => {
    const out = await handleListTokens({ category: 'color' }, fetcher);
    expect(out).toHaveLength(1);
    expect(out[0].category).toBe('color');
  });
});

describe('handleGetToken', () => {
  it('returns the token record for a slug', async () => {
    const fetcher = { fetchTokens: vi.fn().mockResolvedValue({ 'color.accent': { value: '#E8462C' } }) };
    const out = await handleGetToken({ slug: 'color.accent' }, fetcher);
    expect(out.value).toBe('#E8462C');
  });

  it('returns null for unknown slugs', async () => {
    const fetcher = { fetchTokens: vi.fn().mockResolvedValue({}) };
    const out = await handleGetToken({ slug: 'color.missing' }, fetcher);
    expect(out).toBeNull();
  });
});

describe('handleFindByToken', () => {
  it('returns components and patterns using the token', async () => {
    const fetcher = {
      fetchManifest: vi.fn().mockResolvedValue({
        components: [
          { slug: 'a', tokens_used: ['color.accent'] },
          { slug: 'b', tokens_used: ['space.4'] },
        ],
        patterns: [{ slug: 'p1', tokens_used: ['color.accent', 'space.4'] }],
      }),
    };
    const out = await handleFindByToken({ tokenSlug: 'color.accent' }, fetcher);
    expect(out.components.map((c: any) => c.slug)).toEqual(['a']);
    expect(out.patterns.map((p: any) => p.slug)).toEqual(['p1']);
  });
});
