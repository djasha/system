import { describe, it, expect } from 'vitest';
import { renderLlmsTxt } from '../../src/lib/llms-txt';

describe('renderLlmsTxt', () => {
  const fixture = {
    site: 'https://system.djasha.me',
    components: [
      { slug: 'magnetic-button', name: 'MagneticButton', description: 'Button with magnetic pull.' },
    ],
    references: [],
    skills: [],
    tokens: [{ slug: 'color.accent', value: '#E8462C', description: 'Primary accent.' }],
    voice: [{ slug: 'headlines', topic: 'Headlines', description: 'How to write headings.' }],
    patterns: [],
    directions: [],
  };

  it('starts with the site name as H1', () => {
    expect(renderLlmsTxt(fixture)).toMatch(/^# Djasha System\n/);
  });

  it('includes the tagline as a blockquote', () => {
    expect(renderLlmsTxt(fixture)).toMatch(/^> .+/m);
  });

  it('lists components with absolute URLs', () => {
    expect(renderLlmsTxt(fixture)).toContain('[MagneticButton](https://system.djasha.me/components/magnetic-button)');
  });

  it('lists tokens with values', () => {
    expect(renderLlmsTxt(fixture)).toMatch(/color\.accent.*#E8462C/);
  });

  it('includes API endpoints in primary section (NOT optional)', () => {
    const out = renderLlmsTxt(fixture);
    expect(out).toContain('/api/index.json');
    expect(out).toContain('/mcp');
    expect(out).toContain('/openapi.json');
  });

  it('includes voice in optional section', () => {
    const out = renderLlmsTxt(fixture);
    expect(out).toMatch(/## Optional[\s\S]*\/voice/);
  });
});
