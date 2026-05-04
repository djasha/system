export const knobs = [
  { name: 'layout', type: 'range', min: 0, max: 1, step: 1, default: 1, unit: '' },
] as const;

export type KnobValues = { layout: number };

export function toCode(v: KnobValues): string {
  const layout = v.layout === 1 ? 'asymmetric' : 'grid';
  return `<HeroGallery
  layout="${layout}"
  images={[
    { src: '/hero-1.jpg', alt: 'Hero one', aspect: 'landscape' },
    { src: '/hero-2.jpg', alt: 'Hero two', aspect: 'portrait' },
    { src: '/hero-3.jpg', alt: 'Hero three', aspect: 'square' },
  ]}
/>`;
}
