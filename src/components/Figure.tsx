import { useState, useEffect, useRef, type KeyboardEvent } from 'react';

export interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  expandable?: boolean;  // default true — click to open lightbox
  type?: 'default' | 'wireframe' | 'persona' | 'diagram' | 'screenshot';
  className?: string;
}

const typeLabels: Record<string, string> = {
  wireframe: 'Wireframe',
  persona: 'Persona',
  diagram: 'Diagram',
  screenshot: 'Screenshot',
};

export function Figure({
  src,
  alt,
  caption,
  expandable = true,
  type = 'default',
  className = '',
}: FigureProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const typeLabel = typeLabels[type];

  const openLightbox = () => {
    openerRef.current = document.activeElement as HTMLElement;
    setOpen(true);
  };

  const closeLightbox = () => {
    setOpen(false);
    // Restore focus after transition
    requestAnimationFrame(() => openerRef.current?.focus());
  };

  // Escape key + focus trap
  useEffect(() => {
    if (!open) return;
    const handle = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', handle);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      <figure className={`case-figure my-8 ${className}`}>
        {typeLabel && (
          <p
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-accent, #E8462C)',
              marginBottom: '0.75rem',
            }}
          >
            {typeLabel}
          </p>
        )}
        <div
          style={{
            borderRadius: 'var(--radius-md, 0.5rem)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            background: 'var(--color-elevated, #1A1515)',
            cursor: expandable ? 'zoom-in' : undefined,
          }}
          onClick={expandable ? openLightbox : undefined}
          role={expandable ? 'button' : undefined}
          tabIndex={expandable ? 0 : undefined}
          aria-label={expandable ? `Expand image: ${alt}` : undefined}
          onKeyDown={
            expandable
              ? (e: KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox();
                  }
                }
              : undefined
          }
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        {caption && (
          <figcaption
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-bone, #F0ECE4)',
              opacity: 0.6,
              textAlign: 'center',
              marginTop: '0.75rem',
            }}
          >
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            transition: prefersReduced ? 'none' : 'opacity 0.2s',
          }}
        >
          <button
            ref={closeRef}
            onClick={closeLightbox}
            aria-label="Close lightbox"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '0.375rem',
              color: '#F0ECE4',
              cursor: 'pointer',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
            }}
          >
            ✕ Close
          </button>
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md, 0.5rem)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}
    </>
  );
}
