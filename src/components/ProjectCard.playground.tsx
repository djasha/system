export const knobs = [
  { name: 'title', type: 'text', default: 'Project Atlas' },
  { name: 'description', type: 'text', default: 'A research-driven IA overhaul that doubled trial-to-paid conversion.' },
] as const;

export type KnobValues = { title: string; description: string };

export function toCode(v: KnobValues): string {
  return `<ProjectCard
  title="${v.title}"
  description="${v.description}"
  href="/work/atlas"
  imageSrc="/atlas-hero.jpg"
  imageAlt="Atlas product screenshot"
  tags={['Research', 'IA', 'B2B']}
/>`;
}
