import { describe, it, expect } from 'vitest';
import { findOrphanReferences } from '../../scripts/check-reference-integrity';

describe('findOrphanReferences', () => {
  const knownTokens = new Set(['color.accent', 'color.ink', 'motion.ease-out-quart']);
  const knownComponents = new Set(['magnetic-button', 'tilt-card']);

  it('returns empty when all references resolve', () => {
    const entries = [
      { file: 'a.mdx', tokens_used: ['color.accent'], related: ['tilt-card'], components_used: [] },
    ];
    expect(findOrphanReferences(entries, knownTokens, knownComponents)).toEqual([]);
  });

  it('flags orphan tokens with file + missing slug', () => {
    const entries = [
      { file: 'a.mdx', tokens_used: ['color.missing'], related: [], components_used: [] },
    ];
    expect(findOrphanReferences(entries, knownTokens, knownComponents)).toEqual([
      { file: 'a.mdx', field: 'tokens_used', slug: 'color.missing' },
    ]);
  });

  it('flags orphan related components', () => {
    const entries = [
      { file: 'b.mdx', tokens_used: [], related: ['nonexistent'], components_used: [] },
    ];
    expect(findOrphanReferences(entries, knownTokens, knownComponents)).toEqual([
      { file: 'b.mdx', field: 'related', slug: 'nonexistent' },
    ]);
  });
});
