export const knobs = [
  { name: 'text', type: 'text', default: 'Designed for AI agents.' },
  { name: 'duration', type: 'range', min: 0.3, max: 2, step: 0.05, default: 0.9, unit: 's' },
  { name: 'delay', type: 'range', min: 0, max: 1.5, step: 0.05, default: 0, unit: 's' },
] as const;

export type KnobValues = { text: string; duration: number; delay: number };

export function toCode(v: KnobValues): string {
  return `<TextMaskReveal
  text="${v.text}"
  duration={${v.duration}}
  delay={${v.delay}}
  direction="up"
  as="h1"
/>`;
}
