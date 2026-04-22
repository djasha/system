import { useEffect, useRef } from 'react';

export interface CustomCursorProps {
  color?: string;       // default '#E8462C'
  size?: number;        // default 12 — dot diameter in px
  trailSize?: number;   // default 40 — trailing ring diameter in px
  disabled?: boolean;   // default false
}

/**
 * CustomCursor — replaces the default pointer with a branded dot + trailing ring.
 *
 * Mount at the app root so it's active sitewide.  In the playground, it applies
 * globally while the demo is mounted (which is fine for previewing).
 *
 * On touch devices (pointer:coarse) the component renders nothing.
 * When prefers-reduced-motion is set the cursor renders as a plain dot (no trail spring).
 *
 * Cleans up all event listeners and CSS mutations on unmount.
 */
export function CustomCursor({
  color = '#E8462C',
  size = 12,
  trailSize = 40,
  disabled = false,
}: CustomCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    // Touch devices — don't mount cursor
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dot = dotRef.current!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ring = ringRef.current!;
    if (!dot || !ring) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hide native cursor globally
    document.documentElement.classList.add('ds-custom-cursor');

    let mouseX = -999;
    let mouseY = -999;
    let ringX = -999;
    let ringY = -999;
    let raf = 0;
    let visible = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpFactor = prefersReduced ? 1 : 0.12;

    function tick() {
      if (prefersReduced) {
        ring.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      } else {
        ringX = lerp(ringX, mouseX, lerpFactor);
        ringY = lerp(ringY, mouseY, lerpFactor);
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      if (!visible) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        if (ringX === -999) { ringX = mouseX; ringY = mouseY; }
        visible = true;
      }
    }

    function onMouseLeave() {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      visible = false;
    }

    function onMouseEnter() {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      visible = true;
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, label');
      const isText = !interactive && target.closest('p, span, h1, h2, h3, h4, h5, h6, li, td, th, blockquote');

      if (interactive) {
        dot.classList.add('is-interactive');
        dot.classList.remove('is-text');
        ring.classList.add('is-interactive');
        ring.classList.remove('is-text');
      } else if (isText) {
        dot.classList.add('is-text');
        dot.classList.remove('is-interactive');
        ring.classList.add('is-text');
        ring.classList.remove('is-interactive');
      } else {
        dot.classList.remove('is-interactive', 'is-text');
        ring.classList.remove('is-interactive', 'is-text');
      }
    }

    raf = requestAnimationFrame(tick);
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
      document.documentElement.classList.remove('ds-custom-cursor');
    };
  }, [disabled, color, size, trailSize]);

  if (disabled) return null;

  return (
    <>
      <style>{`
        html.ds-custom-cursor,
        html.ds-custom-cursor *:not(input):not(textarea):not([contenteditable]) {
          cursor: none !important;
        }
        html.ds-custom-cursor input,
        html.ds-custom-cursor textarea,
        html.ds-custom-cursor [contenteditable] {
          cursor: auto !important;
        }
      `}</style>
      {/* Dot — instant follow */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          pointerEvents: 'none',
          zIndex: 10001,
          opacity: 0,
          willChange: 'transform',
          transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s ease',
        }}
      />
      {/* Ring — lerp trail */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: trailSize,
          height: trailSize,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: 0,
          willChange: 'transform',
          transition: 'width 0.25s cubic-bezier(0.23, 1, 0.32, 1), height 0.25s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease',
          mixBlendMode: 'exclusion',
        }}
      />
    </>
  );
}
