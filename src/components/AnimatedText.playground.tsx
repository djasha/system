export const knobs = [
  { name: 'text', type: 'text', default: 'Design systems that talk to AI agents.' },
  { name: 'stagger', type: 'range', min: 0, max: 0.3, step: 0.01, default: 0.05, unit: 's' },
  { name: 'duration', type: 'range', min: 0.1, max: 2, step: 0.1, default: 0.6, unit: 's' },
] as const;

export type KnobValues = { text: string; stagger: number; duration: number };

export function toCode(v: KnobValues): string {
  return `<AnimatedText text="${v.text}" stagger={${v.stagger}} duration={${v.duration}} />`;
}
