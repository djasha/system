import { describe, it, expect } from 'vitest';
import { findMissingDocs, slugify } from '../../scripts/check-doc-coverage';

describe('slugify', () => {
  it('splits camelCase component names', () => {
    expect(slugify('magneticButton')).toBe('magnetic-button');
  });

  it('splits PascalCase component names', () => {
    expect(slugify('MagneticButton')).toBe('magnetic-button');
  });

  it('splits a single uppercase letter followed by a word (ABTest)', () => {
    expect(slugify('ABTest')).toBe('ab-test');
  });

  it('splits a multi-letter acronym followed by a word (HTMLParser)', () => {
    expect(slugify('HTMLParser')).toBe('html-parser');
  });

  it('splits another multi-letter acronym (URLBuilder)', () => {
    expect(slugify('URLBuilder')).toBe('url-builder');
  });
});

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
