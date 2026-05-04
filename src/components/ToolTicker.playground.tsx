export const knobs = [
  { name: 'speed', type: 'range', min: 10, max: 200, step: 5, default: 50, unit: 'px/s' },
] as const;

export type KnobValues = { speed: number };

export function toCode(v: KnobValues): string {
  return `<ToolTicker
  tools={[
    { name: 'React' }, { name: 'Astro' }, { name: 'Tailwind' },
    { name: 'TypeScript' }, { name: 'Vercel' }, { name: 'Figma' },
  ]}
  speed={${v.speed}}
/>`;
}
