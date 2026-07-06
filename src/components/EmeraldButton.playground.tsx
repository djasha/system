export const knobs = [
  { name: 'variant', type: 'text', default: 'default' },
  { name: 'size', type: 'text', default: 'default' },
  { name: 'mode', type: 'text', default: 'dark' },
  { name: 'label', type: 'text', default: 'New deal' },
] as const;

export type KnobValues = {
  variant: string;
  size: string;
  mode: string;
  label: string;
};

export function toCode(v: KnobValues): string {
  return `<EmeraldButton
  variant="${v.variant}"
  size="${v.size}"
  mode="${v.mode}"
>
  ${v.label}
</EmeraldButton>`;
}
