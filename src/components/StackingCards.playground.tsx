export const knobs = [] as const;
export type KnobValues = {};
export function toCode(_v: KnobValues): string {
  return `<StackingCards cards={[
  { title: 'One', body: 'Your first card.' },
  { title: 'Two', body: 'Your second card.' },
  { title: 'Three', body: 'Your third card.' },
]} />`;
}
