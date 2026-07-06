export const knobs = [
  { name: 'sample', type: 'text', default: 'Deals move faster in green' },
  { name: 'mode', type: 'text', default: 'dark' },
] as const;

export type KnobValues = {
  sample: string;
  mode: string;
};

export function toCode(v: KnobValues): string {
  return `<TypeRoles sample="${v.sample}" mode="${v.mode}" />`;
}
