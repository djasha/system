export const knobs = [
  { name: 'color', type: 'color', default: '#E8462C' },
  { name: 'size', type: 'range', min: 4, max: 32, step: 1, default: 12, unit: 'px' },
  { name: 'trailSize', type: 'range', min: 16, max: 80, step: 2, default: 40, unit: 'px' },
] as const;

export type KnobValues = { color: string; size: number; trailSize: number };

export function toCode(v: KnobValues): string {
  return `<CustomCursor color="${v.color}" size={${v.size}} trailSize={${v.trailSize}} />`;
}
