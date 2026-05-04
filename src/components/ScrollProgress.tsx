import { useState, useEffect, useRef, type RefObject } from 'react';

export interface ScrollProgressProps {
  color?: string;       // default '#E8462C'
  height?: number;      // default 3 — px
  position?: 'top' | 'bottom';
  scrollContainer?: RefObject<HTMLElement | null>;  // scroll target; defaults to window
  className?: string;
}

export function ScrollProgress({
  color = '#E8462C',
  height = 3,
  position = 'top',
  scrollContainer,
  className = '',
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const getProgress = () => {
      const el = scrollContainer?.current;
      if (el) {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        return scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      }
      // Window fallback
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      return docHeight > 0 ? scrollTop / docHeight : 0;
    };

    const handleScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setProgress(getProgress());
      });
    };

    const target = scrollContainer?.current ?? window;
    (target as EventTarget).addEventListener('scroll', handleScroll, { passive: true });

    // Initial read
    setProgress(getProgress());

    return () => {
      (target as EventTarget).removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollContainer]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: scrollContainer?.current ? 'absolute' : 'fixed',
        [position === 'top' ? 'top' : 'bottom']: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        background: color,
        transformOrigin: 'left',
        transform: `scaleX(${progress})`,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
