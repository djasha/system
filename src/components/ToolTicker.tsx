import { useRef, useEffect } from 'react';

export interface ToolEntry {
  name: string;
  icon?: string;  // SVG path `d` attribute string (24x24 viewBox)
  color?: string; // icon fill color
}

export interface ToolTickerProps {
  tools: Array<ToolEntry>;
  speed?: number;        // default 50 — pixels per second
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export function ToolTicker({
  tools,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: ToolTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Derive animation duration from track width / speed (same pattern as ScrollMarquee)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const group = track.querySelector<HTMLElement>('.tool-ticker-group');
    if (!group) return;

    const groupWidth = group.offsetWidth;
    if (groupWidth <= 0) return;

    const duration = groupWidth / speed;
    track.style.setProperty('--ticker-duration', `${duration}s`);
    track.style.setProperty('--ticker-direction', direction === 'right' ? 'reverse' : 'normal');
  }, [speed, direction]);

  const handleMouseEnter = pauseOnHover
    ? () => trackRef.current?.style.setProperty('animation-play-state', 'paused')
    : undefined;
  const handleMouseLeave = pauseOnHover
    ? () => trackRef.current?.style.setProperty('animation-play-state', 'running')
    : undefined;
  const handleFocus = pauseOnHover
    ? () => trackRef.current?.style.setProperty('animation-play-state', 'paused')
    : undefined;
  const handleBlur = pauseOnHover
    ? () => trackRef.current?.style.setProperty('animation-play-state', 'running')
    : undefined;

  // Duplicate set for seamless loop (3×)
  const sets = [0, 1, 2];

  return (
    <div
      aria-label="Scrolling list of tools and technologies"
      className={`tool-ticker-wrapper ${className}`}
      style={{
        overflow: 'hidden',
        position: 'relative',
        maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        ref={trackRef}
        style={{
          display: 'inline-flex',
          willChange: 'transform',
          animation: 'tool-ticker-scroll var(--ticker-duration, 20s) linear infinite var(--ticker-direction, normal)',
          padding: '1rem 0',
        }}
        aria-live="off"
      >
        {sets.map((i) => (
          <span
            key={i}
            className="tool-ticker-group"
            aria-hidden={i > 0 ? 'true' : undefined}
            style={{ display: 'inline-flex', flexShrink: 0, alignItems: 'center', gap: '1rem' }}
          >
            {tools.map((tool, idx) => (
              <span
                key={idx}
                title={tool.name}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '0.875rem',
                  background: 'var(--color-elevated, #1A1515)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  flexShrink: 0,
                  position: 'relative',
                  cursor: 'default',
                  transition: 'border-color 0.25s, transform 0.25s',
                  marginRight: '1rem',
                }}
              >
                {tool.icon ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill={tool.color ?? '#F0ECE4'}
                    aria-hidden="true"
                    style={{ width: '55%', height: '55%' }}
                  >
                    <path d={tool.icon} />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: tool.color ?? 'var(--color-bone, #F0ECE4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      textAlign: 'center',
                      padding: '0 0.25rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {tool.name.slice(0, 8)}
                  </span>
                )}
              </span>
            ))}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes tool-ticker-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-33.333%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tool-ticker-wrapper > div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
