export const knobs = [
  { name: 'color', type: 'color', default: '#E8462C' },
  { name: 'height', type: 'range', min: 1, max: 8, step: 1, default: 3, unit: 'px' },
] as const;

export type KnobValues = { color: string; height: number };

export function toCode(v: KnobValues): string {
  return `<ScrollProgress color="${v.color}" height={${v.height}} />`;
}
