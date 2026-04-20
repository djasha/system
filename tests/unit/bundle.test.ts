import { describe, it, expect } from 'vitest';
import { composeBundle } from '../../src/lib/bundle';

describe('composeBundle', () => {
  const input = {
    name: 'MagneticButton',
    description: 'Button with cursor-proximity magnetic pull.',
    promptBody: 'Create a button that pulls toward the cursor when hovered within 100px.',
    usageBody: 'Use for primary CTAs where subtle motion draws attention.',
    tokens: [{ slug: 'color.accent', value: '#E8462C' }],
    a11yNotes: 'Respects prefers-reduced-motion.',
    sourcePath: 'src/components/MagneticButton.tsx',
    sourceCode: 'export function MagneticButton() { return null; }',
    sourceLanguage: 'tsx',
  };

  it('includes the component name as H1', () => {
    expect(composeBundle(input)).toMatch(/^# MagneticButton\n/);
  });

  it('includes description below the name', () => {
    expect(composeBundle(input)).toContain('Button with cursor-proximity magnetic pull.');
  });

  it('includes the prompt under ## Prompt', () => {
    const bundle = composeBundle(input);
    expect(bundle).toContain('## Prompt');
    expect(bundle).toContain('Create a button that pulls toward the cursor');
  });

  it('includes resolved tokens with values', () => {
    expect(composeBundle(input)).toMatch(/## Tokens[\s\S]*color\.accent[\s\S]*#E8462C/);
  });

  it('includes source in a fenced code block tagged with language', () => {
    expect(composeBundle(input)).toMatch(/```tsx\nexport function MagneticButton\(\) \{ return null; \}\n```/);
  });

  it('includes a11y notes', () => {
    expect(composeBundle(input)).toContain('prefers-reduced-motion');
  });
});
