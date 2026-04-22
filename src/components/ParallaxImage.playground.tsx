export const knobs = [
  { name: 'speed', type: 'range', min: 0.1, max: 1.5, step: 0.05, default: 0.5 },
] as const;

export type KnobValues = { speed: number };

export function toCode(v: KnobValues): string {
  return `<ParallaxImage src="/demo.jpg" alt="Demo" speed={${v.speed}} />`;
}
