import { lazy, Suspense, use } from 'react';
import { Playground } from '../playground/Playground';

// A registry keyed by slug; each entry dynamically imports the playground config + preview.
const registry: Record<string, { loadConfig: () => Promise<any>; loadDemo: () => Promise<any> }> = {
  'magnetic-button': {
    loadConfig: () => import('../MagneticButton.playground'),
    loadDemo: () => import('../MagneticButton.preview'),
  },
  'tilt-card': {
    loadConfig: () => import('../TiltCard.playground'),
    loadDemo: () => import('../TiltCard.preview'),
  },
  'animated-text': {
    loadConfig: () => import('../AnimatedText.playground'),
    loadDemo: () => import('../AnimatedText.preview'),
  },
  'character-reveal': {
    loadConfig: () => import('../CharacterReveal.playground'),
    loadDemo: () => import('../CharacterReveal.preview'),
  },
  'scroll-marquee': {
    loadConfig: () => import('../ScrollMarquee.playground'),
    loadDemo: () => import('../ScrollMarquee.preview'),
  },
  'custom-cursor': {
    loadConfig: () => import('../CustomCursor.playground'),
    loadDemo: () => import('../CustomCursor.preview'),
  },
  'stacking-cards': {
    loadConfig: () => import('../StackingCards.playground'),
    loadDemo: () => import('../StackingCards.preview'),
  },
  'parallax-image': {
    loadConfig: () => import('../ParallaxImage.playground'),
    loadDemo: () => import('../ParallaxImage.preview'),
  },
  'figure': {
    loadConfig: () => import('../Figure.playground'),
    loadDemo: () => import('../Figure.preview'),
  },
  'tool-ticker': {
    loadConfig: () => import('../ToolTicker.playground'),
    loadDemo: () => import('../ToolTicker.preview'),
  },
  'scroll-progress': {
    loadConfig: () => import('../ScrollProgress.playground'),
    loadDemo: () => import('../ScrollProgress.preview'),
  },
  'expandable': {
    loadConfig: () => import('../Expandable.playground'),
    loadDemo: () => import('../Expandable.preview'),
  },
  'project-card': {
    loadConfig: () => import('../ProjectCard.playground'),
    loadDemo: () => import('../ProjectCard.preview'),
  },
  'hero-gallery': {
    loadConfig: () => import('../HeroGallery.playground'),
    loadDemo: () => import('../HeroGallery.preview'),
  },
  'text-mask-reveal': {
    loadConfig: () => import('../TextMaskReveal.playground'),
    loadDemo: () => import('../TextMaskReveal.preview'),
  },
};

function PlaygroundAsync({ configPromise, Demo }: { configPromise: Promise<any>; Demo: any }) {
  const config = use(configPromise);
  return <Playground Demo={Demo.default ?? Demo} knobs={config.knobs} toCode={config.toCode} />;
}

export function PlaygroundIsland({ slug }: { slug: string }) {
  const entry = registry[slug];
  if (!entry) return <div className="text-bone/50 font-mono text-sm">No playground for &quot;{slug}&quot;.</div>;
  const Demo = lazy(entry.loadDemo);
  const configPromise = entry.loadConfig();

  return (
    <Suspense fallback={<div className="text-bone/40 font-mono text-sm">Loading playground…</div>}>
      <PlaygroundAsync configPromise={configPromise} Demo={Demo} />
    </Suspense>
  );
}
