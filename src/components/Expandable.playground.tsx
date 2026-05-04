export const knobs = [
  { name: 'title', type: 'text', default: 'What does this do?' },
  { name: 'defaultOpen', type: 'range', min: 0, max: 1, step: 1, default: 0 },
] as const;

export type KnobValues = { title: string; defaultOpen: number };

export function toCode(v: KnobValues): string {
  return `<Expandable title="${v.title}" defaultOpen={${v.defaultOpen === 1}}>
  Body content goes here.
</Expandable>`;
}
