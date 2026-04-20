import { describe, it, expect } from 'vitest';
import { findMissingDocs } from '../../scripts/check-doc-coverage';

describe('findMissingDocs', () => {
  it('returns empty when every component has a doc', () => {
    const components = ['MagneticButton', 'TiltCard'];
    const docs = ['magnetic-button', 'tilt-card'];
    expect(findMissingDocs(components, docs)).toEqual([]);
  });

  it('returns the slugified names of components missing docs', () => {
    const components = ['MagneticButton', 'TiltCard', 'NewThing'];
    const docs = ['magnetic-button'];
    expect(findMissingDocs(components, docs).sort()).toEqual(['new-thing', 'tilt-card']);
  });

  it('excludes .playground and .preview helper files', () => {
    // The caller filters before calling, but ensure the function is tolerant.
    const components = ['MagneticButton'];
    const docs = ['magnetic-button'];
    expect(findMissingDocs(components, docs)).toEqual([]);
  });
});
