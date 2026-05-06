import { lazy, Suspense } from 'react';

const registry: Record<string, () => Promise<any>> = {
  'magnetic-button': () => import('../MagneticButton.preview'),
  'tilt-card': () => import('../TiltCard.preview'),
  'animated-text': () => import('../AnimatedText.preview'),
  'character-reveal': () => import('../CharacterReveal.preview'),
  'scroll-marquee': () => import('../ScrollMarquee.preview'),
  'custom-cursor': () => import('../CustomCursor.preview'),
  'stacking-cards': () => import('../StackingCards.preview'),
  'parallax-image': () => import('../ParallaxImage.preview'),
  'figure': () => import('../Figure.preview'),
  'tool-ticker': () => import('../ToolTicker.preview'),
  'scroll-progress': () => import('../ScrollProgress.preview'),
  'expandable': () => import('../Expandable.preview'),
  'project-card': () => import('../ProjectCard.preview'),
  'hero-gallery': () => import('../HeroGallery.preview'),
  'text-mask-reveal': () => import('../TextMaskReveal.preview'),
  'editorial-hero': () => import('../EditorialHero.preview'),
  'case-study-body': () => import('../CaseStudyBody.preview'),
};

export function PreviewIsland({ slug }: { slug: string }) {
  const loader = registry[slug];
  if (!loader) return <div className="text-bone/50 font-mono text-sm">No preview for &quot;{slug}&quot;.</div>;
  const Demo = lazy(loader);
  return (
    <Suspense fallback={<div className="text-bone/40 font-mono text-sm">Loading preview…</div>}>
      <div className="min-h-[320px] flex items-center justify-center border border-bone/10 rounded-lg bg-elevated/40">
        <Demo />
      </div>
    </Suspense>
  );
}
