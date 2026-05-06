// NOTE: Astro components cannot render inside a React island.
// This preview rebuilds the composition using the underlying React primitives directly.
// The Code tab on the detail page shows the canonical CaseStudyBody.astro source.

import { Figure } from './Figure';
import { Expandable } from './Expandable';
import { StackingCards } from './StackingCards';

export default function Demo() {
  return (
    <article className="max-w-content mx-auto p-8 space-y-10">
      <Figure
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
        alt="Analytics dashboard"
        caption="Final design — week 6"
        expandable={true}
      />
      <section>
        <h2 className="font-display text-2xl mb-4">How it came together</h2>
        <StackingCards
          cards={[
            { title: 'Discover', body: 'Interviewed 8 customers, identified the trial-to-paid drop.' },
            { title: 'Direction', body: 'Tested two IA proposals; one cut nav depth in half.' },
            { title: 'Ship', body: 'Rolled out behind a flag, doubled trial conversion in 2 weeks.' },
          ]}
          sticky={false}
        />
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-2xl mb-4">Notes</h2>
        <Expandable title="Why we cut the secondary nav">Body content for the disclosure.</Expandable>
      </section>
    </article>
  );
}
