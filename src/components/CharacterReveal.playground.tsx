export const knobs = [
  { name: 'text', type: 'text', default: 'Built for AI.' },
  { name: 'stagger', type: 'range', min: 0, max: 0.2, step: 0.005, default: 0.02, unit: 's' },
  { name: 'duration', type: 'range', min: 0.1, max: 1.5, step: 0.05, default: 0.4, unit: 's' },
] as const;

export type KnobValues = { text: string; stagger: number; duration: number };

export function toCode(v: KnobValues): string {
  return `<CharacterReveal text="${v.text}" stagger={${v.stagger}} duration={${v.duration}} />`;
}
