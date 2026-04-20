export const knobs = [
  { name: 'accent', type: 'color', default: '#E8462C' },
  { name: 'pullStrength', type: 'range', min: 0, max: 1, step: 0.05, default: 0.3 },
  { name: 'durationMs', type: 'range', min: 100, max: 1200, step: 50, default: 300, unit: 'ms' },
  { name: 'label', type: 'text', default: 'Get in touch' },
] as const;

export type KnobValues = {
  accent: string;
  pullStrength: number;
  durationMs: number;
  label: string;
};

export function toCode(v: KnobValues): string {
  return `<MagneticButton
  accent="${v.accent}"
  pullStrength={${v.pullStrength}}
  durationMs={${v.durationMs}}
>
  ${v.label}
</MagneticButton>`;
}
