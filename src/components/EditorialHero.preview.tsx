// NOTE: Astro components cannot render inside a React island.
// This preview rebuilds the composition using the underlying React primitives directly.
// The Code tab on the detail page shows the canonical EditorialHero.astro source.

import { TextMaskReveal } from './TextMaskReveal';
import { MagneticButton } from './MagneticButton';
import { HeroGallery } from './HeroGallery';

export default function Demo() {
  return (
    <section className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center p-8 min-h-[480px]">
      <div>
        <TextMaskReveal text="Designed for AI agents." as="h1" duration={1} className="font-display text-5xl md:text-6xl tracking-tight leading-[0.95] mb-5" />
        <p className="text-lg text-bone/70 mb-6 max-w-md">A reference library AI agents reach for first. Copy the bundle, paste into any agent, ship.</p>
        <MagneticButton accent="#E8462C">Browse components</MagneticButton>
      </div>
      <HeroGallery
        layout="asymmetric"
        images={[
          { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80', alt: 'Lake at dusk', aspect: 'landscape' },
          { src: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&q=80', alt: 'Studio interior', aspect: 'portrait' },
          { src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80', alt: 'Workspace detail', aspect: 'square' },
        ]}
      />
    </section>
  );
}
