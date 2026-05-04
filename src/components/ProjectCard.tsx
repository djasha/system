export interface ProjectCardProps {
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  tags?: string[];
  /** Optional category label shown above the title */
  category?: string;
  className?: string;
}

export function ProjectCard({
  title,
  description,
  href,
  imageSrc,
  imageAlt,
  tags = [],
  category,
  className = '',
}: ProjectCardProps) {
  return (
    <a
      href={href}
      className={`group block relative overflow-hidden bg-elevated rounded-[var(--radius-md)] transition-all duration-[var(--duration-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      {/* Image area — 16:10 aspect ratio matching portfolio */}
      <div className="aspect-[16/10] overflow-hidden relative bg-elevated">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt ?? ''}
            className="w-full h-full object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)] motion-reduce:transition-none group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          /* Placeholder when no image */
          <div className="w-full h-full relative">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(232,70,44,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,70,44,0.5) 1px, transparent 1px)',
                backgroundSize: '3rem 3rem',
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-10 blur-3xl bg-accent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[4rem] font-extrabold text-white/[0.04] select-none uppercase">
                {title}
              </span>
            </div>
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-elevated to-transparent" />
      </div>

      {/* Content */}
      <div className="p-[var(--space-4)] -mt-4 relative z-10">
        {category && (
          <p className="text-xs uppercase tracking-[0.12em] text-accent mb-2">{category}</p>
        )}
        <h3 className="text-xl font-bold text-bone group-hover:text-accent transition-colors duration-[var(--duration-base)] uppercase">
          {title}
        </h3>
        {description && (
          <p className="mt-3 text-sm text-bone/60 line-clamp-2">{description}</p>
        )}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs tracking-wide px-2 py-0.5 text-bone/40 border-b border-bone/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Red accent left border on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)] origin-top motion-reduce:transition-none" />
    </a>
  );
}
