export const knobs = [
  { name: 'speed', type: 'range', min: 10, max: 200, step: 5, default: 50, unit: 'px/s' },
  { name: 'text', type: 'text', default: '★ Shipping fast · ★ Copying prompts · ★ Paste into any agent' },
] as const;

export type KnobValues = { speed: number; text: string };

export function toCode(v: KnobValues): string {
  return `<ScrollMarquee speed={${v.speed}}>${v.text}</ScrollMarquee>`;
}
