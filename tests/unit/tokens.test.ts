import { describe, it, expect } from 'vitest';
import { resolveTokens } from '../../src/lib/tokens';

const known = new Map([
  ['color.accent', { slug: 'color.accent', name: 'accent', category: 'color', value: '#E8462C' }],
  ['motion.duration-base', { slug: 'motion.duration-base', name: 'duration-base', category: 'motion', value: '300ms' }],
]);

describe('resolveTokens', () => {
  it('resolves each slug to its full record', () => {
    const result = resolveTokens(['color.accent'], known);
    expect(result).toEqual([{ slug: 'color.accent', name: 'accent', category: 'color', value: '#E8462C' }]);
  });

  it('throws on unknown slug', () => {
    expect(() => resolveTokens(['color.missing'], known)).toThrow(/color\.missing/);
  });
});
