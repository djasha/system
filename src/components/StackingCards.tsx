import { useEffect, useRef, type CSSProperties } from 'react';

export interface StackingCard {
  title: string;
  body?: string;
  color?: string;
}

export interface StackingCardsProps {
  cards: StackingCard[];
  sticky?: boolean;  // default true
  className?: string;
}

const STACK_OFFSET = 16; // px — how much each card is offset from the one below
const TOP_OFFSET = 80;   // px — distance from viewport top when pinned

/**
 * StackingCards — scroll-pinned cards that layer on top of each other as you scroll.
 *
 * Each card becomes `position: sticky` at a progressively lower `top` value so they
 * appear to stack. An IntersectionObserver drives the entrance animation (fade + slide).
 *
 * Respects prefers-reduced-motion: renders as a simple vertical list without sticky or
 * entrance animations.
 */
export function StackingCards({ cards, sticky = true, className = '' }: StackingCardsProps) {
  const containerRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>('.stacking-card-item'));
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.1 }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [cards]);

  const prefersReducedStatic =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  return (
    <ol
      ref={containerRef}
      className={`stacking-cards-list ${className}`}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        position: 'relative',
      }}
    >
      {cards.map((card, i) => {
        const accent = card.color ?? '#E8462C';
        const topValue = sticky && !prefersReducedStatic
          ? TOP_OFFSET + i * STACK_OFFSET
          : 'auto';

        const cardStyle: CSSProperties = {
          position: sticky && !prefersReducedStatic ? 'sticky' : 'relative',
          top: topValue,
          zIndex: i + 1,
          marginBottom: sticky && !prefersReducedStatic ? '1.5rem' : '1rem',
          // Entrance animation initial state
          opacity: prefersReducedStatic ? 1 : 0,
          transform: prefersReducedStatic ? 'none' : 'translateY(24px)',
          transition: prefersReducedStatic
            ? 'none'
            : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'opacity, transform',
        };

        const innerStyle: CSSProperties = {
          borderRadius: '12px',
          border: '1px solid rgba(240,236,228,0.10)',
          background: `linear-gradient(135deg, #15110F 0%, #0B0908 100%)`,
          padding: '2rem 2.5rem',
          boxShadow: `0 2px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px ${accent}18`,
        };

        return (
          <li key={i} className="stacking-card-item" style={cardStyle}>
            <div style={innerStyle}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: accent,
                  marginBottom: '1.25rem',
                  opacity: 0.9,
                }}
              />
              <h3
                style={{
                  margin: '0 0 0.625rem',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#F5F1EC',
                  lineHeight: 1.2,
                }}
              >
                {card.title}
              </h3>
              {card.body && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9375rem',
                    color: 'rgba(245,241,236,0.55)',
                    lineHeight: 1.65,
                  }}
                >
                  {card.body}
                </p>
              )}
              <div
                style={{
                  marginTop: '1.5rem',
                  fontSize: '0.6875rem',
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: accent,
                  opacity: 0.7,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
