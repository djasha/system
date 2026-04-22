import { StackingCards } from './StackingCards';

const DEMO_CARDS = [
  { title: 'Research', body: 'Interviews, journey maps, and shadowing users in the wild. Design decisions trace back to evidence.' },
  { title: 'Prototype', body: 'High-fidelity interactions in the real medium. Ship rough and real, then polish against feedback.' },
  { title: 'Validate', body: 'Measure against the hypothesis. A 10% improvement compounds. A 44% lift changes the roadmap.' },
];

export default function Demo() {
  return (
    <div className="w-full max-w-lg mx-auto py-8">
      {/* Note: sticky effect requires real page scroll; this preview shows static layout */}
      <StackingCards cards={DEMO_CARDS} sticky={false} />
      <p className="mt-6 text-bone/40 text-xs font-mono text-center">
        Embed in a full-height page to see the scroll-pinned effect
      </p>
    </div>
  );
}
