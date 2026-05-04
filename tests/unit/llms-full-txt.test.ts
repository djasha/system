import { describe, it, expect } from 'vitest';
import { renderLlmsFullTxt } from '../../src/lib/llms-full-txt';

describe('renderLlmsFullTxt', () => {
  it('concatenates entries with --- separators', () => {
    const out = renderLlmsFullTxt({
      site: 'https://system.djasha.me',
      bundles: [
        { slug: 'a', kind: 'component', markdown: '# A\n\nFoo.' },
        { slug: 'b', kind: 'component', markdown: '# B\n\nBar.' },
      ],
    });
    expect(out).toMatch(/# A[\s\S]+---[\s\S]+# B/);
  });

  it('includes a manifest header listing all entries', () => {
    const out = renderLlmsFullTxt({
      site: 'https://system.djasha.me',
      bundles: [{ slug: 'a', kind: 'component', markdown: '# A' }],
    });
    expect(out).toMatch(/## Manifest[\s\S]+- a \(component\)/);
  });
});
