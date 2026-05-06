// NOTE: Astro components cannot render inside a React island.
// This preview rebuilds the composition using the underlying React primitives directly.
// The Code tab on the detail page shows the canonical FilterableWorkGrid.astro source.

import { ToolTicker } from './ToolTicker';
import { ProjectCard } from './ProjectCard';

export default function Demo() {
  const projects = [
    { title: 'Atlas', description: 'IA overhaul that doubled trial-to-paid conversion.', href: '#1', imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', imageAlt: 'Dashboard', tags: ['Research', 'IA'] },
    { title: 'Lighthouse', description: 'Onboarding redesign that cut activation time in half.', href: '#2', imageSrc: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', imageAlt: 'Workspace', tags: ['UX', 'B2B'] },
    { title: 'Compass', description: 'Brand system reset for a 50-person SaaS.', href: '#3', imageSrc: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80', imageAlt: 'Studio', tags: ['Brand', 'System'] },
  ];
  return (
    <div className="max-w-content mx-auto p-6">
      <header className="mb-6">
        <h1 className="font-display text-4xl tracking-tight mb-2">Selected work</h1>
        <p className="text-lg text-bone/70 max-w-xl">A few projects that show the range.</p>
      </header>
      <div className="-mx-6 overflow-hidden mb-8">
        <ToolTicker tools={[{ name: 'React' }, { name: 'Astro' }, { name: 'Tailwind' }, { name: 'Figma' }, { name: 'Claude' }]} speed={30} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => <ProjectCard key={p.href} {...p} />)}
      </div>
    </div>
  );
}
