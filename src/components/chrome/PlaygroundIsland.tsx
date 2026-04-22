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
