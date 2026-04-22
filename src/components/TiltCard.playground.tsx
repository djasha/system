export const knobs = [
  { name: 'maxTiltDeg', type: 'range', min: 0, max: 30, step: 1, default: 10, unit: '°' },
  { name: 'perspective', type: 'range', min: 200, max: 2000, step: 50, default: 800, unit: 'px' },
  { name: 'label', type: 'text', default: 'Hover me' },
] as const;

export type KnobValues = { maxTiltDeg: number; perspective: number; label: string };

export function toCode(v: KnobValues): string {
  return `<TiltCard maxTiltDeg={${v.maxTiltDeg}} perspective={${v.perspective}}>
  ${v.label}
</TiltCard>`;
}
