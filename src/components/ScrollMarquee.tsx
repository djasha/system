import { useRef, useEffect, type ReactNode } from 'react';

export interface ScrollMarqueeProps {
  children: ReactNode;
  speed?: number;          // pixels per second, default 50
  direction?: 'left' | 'right'; // default 'left'
  pauseOnHover?: boolean;  // default true
  className?: string;
}

export function ScrollMarquee({
  children,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: ScrollMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Derive animation duration from track width / speed
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const group = track.querySelector<HTMLElement>('.marquee-group');
    if (!group) return;

    const groupWidth = group.offsetWidth;
    if (groupWidth <= 0) return;

    const duration = groupWidth / speed;
    track.style.setProperty('--marquee-duration', `${duration}s`);
    track.style.setProperty('--marquee-direction', direction === 'right' ? 'reverse' : 'normal');
  }, [speed, direction]);

  return (
    <div
      className={`scroll-marquee-wrapper ${className}`}
      style={{ overflow: 'hidden', position: 'relative' }}
      onMouseEnter={pauseOnHover ? () => trackRef.current?.style.setProperty('animation-play-state', 'paused') : undefined}
      onMouseLeave={pauseOnHover ? () => trackRef.current?.style.setProperty('animation-play-state', 'running') : undefined}
      onFocus={pauseOnHover ? () => trackRef.current?.style.setProperty('animation-play-state', 'paused') : undefined}
      onBlur={pauseOnHover ? () => trackRef.current?.style.setProperty('animation-play-state', 'running') : undefined}
    >
      <div
        ref={trackRef}
        className="marquee-track"
        style={{
          display: 'inline-flex',
          willChange: 'transform',
          animation: 'scroll-marquee-scroll var(--marquee-duration, 20s) linear infinite var(--marquee-direction, normal)',
          whiteSpace: 'nowrap',
        }}
        aria-live="off"
      >
        {/* Duplicate 3× for seamless loop */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="marquee-group"
            aria-hidden={i > 0 ? 'true' : undefined}
            style={{ display: 'inline-flex', flexShrink: 0 }}
          >
            {children}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll-marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-33.333%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
