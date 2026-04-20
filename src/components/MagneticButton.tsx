import { useRef, type MouseEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export interface MagneticButtonProps {
  children: ReactNode;
  accent?: string;
  pullStrength?: number;
  durationMs?: number;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function MagneticButton({
  children,
  accent = '#E8462C',
  pullStrength = 0.3,
  durationMs = 300,
  className = '',
  href,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const stiffness = Math.max(50, 600 - durationMs * 0.9);
  const damping = Math.max(10, 30 - durationMs * 0.01);
  const springConfig = { stiffness, damping, mass: 0.5 };

  const x = useSpring(useMotionValue(0), springConfig);
  const y = useSpring(useMotionValue(0), springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const distX = e.clientX - (rect.left + rect.width / 2);
    const distY = e.clientY - (rect.top + rect.height / 2);
    const maxDist = 8;
    const clamp = (v: number) => Math.max(-maxDist, Math.min(maxDist, v * pullStrength));
    x.set(clamp(distX));
    y.set(clamp(distY));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const defaultClass = 'px-5 py-2.5 text-sm font-mono rounded-md border bg-transparent transition-colors hover:bg-white/5';
  const mergedClass = className || defaultClass;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      <motion.div style={{ x, y }}>
        {href ? (
          <a href={href} className={mergedClass} style={{ borderColor: accent, color: accent }}>
            {children}
          </a>
        ) : (
          <button type="button" onClick={onClick} className={mergedClass} style={{ borderColor: accent, color: accent }}>
            {children}
          </button>
        )}
      </motion.div>
    </div>
  );
}
