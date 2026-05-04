import { ProjectCard } from './ProjectCard';

export default function Demo(props: { title?: string; description?: string }) {
  return (
    <div className="w-full max-w-md p-8">
      <ProjectCard
        title={props.title ?? 'Project Atlas'}
        description={props.description ?? 'A research-driven IA overhaul that doubled trial-to-paid conversion.'}
        href="#demo"
        imageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
        imageAlt="Analytics dashboard on a laptop screen"
        tags={['Research', 'IA', 'B2B']}
      />
    </div>
  );
}
