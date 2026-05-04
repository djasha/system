import { useState, useId } from 'react';

export interface ExpandableProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Expandable({
  title,
  children,
  defaultOpen = false,
  className = '',
}: ExpandableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className={`border-t border-bone/10 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-4 text-left text-sm font-medium text-accent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* Chevron rotates on open */}
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)]"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {title}
      </button>

      {/* Grid-row height animation: 0fr → 1fr */}
      <div
        id={bodyId}
        role="region"
        aria-label={title}
        className="grid overflow-hidden transition-[grid-template-rows] duration-[var(--duration-base)] ease-[var(--ease-out-quart)] motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="min-h-0">
          <div className="pb-6 text-bone/70 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
