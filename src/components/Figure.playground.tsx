export const knobs = [
  { name: 'caption', type: 'text', default: 'A short caption describing the image.' },
  { name: 'expandable', type: 'range', min: 0, max: 1, step: 1, default: 1, unit: '' },
] as const;

export type KnobValues = { caption: string; expandable: number };

export function toCode(v: KnobValues): string {
  return `<Figure
  src="/demo.jpg"
  alt="Demo image"
  caption="${v.caption}"
  expandable={${v.expandable === 1 ? 'true' : 'false'}}
/>`;
}
