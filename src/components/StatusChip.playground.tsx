export const knobs = [
  { name: 'status', type: 'text', default: 'success' },
  { name: 'label', type: 'text', default: 'Paid' },
  { name: 'mode', type: 'text', default: 'dark' },
] as const;

export type KnobValues = {
  status: string;
  label: string;
  mode: string;
};

export function toCode(v: KnobValues): string {
  return `<StatusChip status="${v.status}" mode="${v.mode}" label="${v.label}" />`;
}
