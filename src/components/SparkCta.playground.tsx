export const knobs = [
  { name: 'label', type: 'text', default: 'Start Free' },
  { name: 'idleSeconds', type: 'range', min: 2, max: 10, step: 0.5, default: 4.5, unit: 's' },
  { name: 'hoverSeconds', type: 'range', min: 1, max: 5, step: 0.2, default: 2.2, unit: 's' },
  { name: 'mode', type: 'text', default: 'dark' },
] as const;

export type KnobValues = {
  label: string;
  idleSeconds: number;
  hoverSeconds: number;
  mode: string;
};

export function toCode(v: KnobValues): string {
  return `<SparkCta
  label="${v.label}"
  idleSeconds={${v.idleSeconds}}
  hoverSeconds={${v.hoverSeconds}}
  mode="${v.mode}"
/>`;
}
