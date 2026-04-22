import { useRef, useState, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export interface TiltCardProps {
  children: React.ReactNode;
  maxTiltDeg?: number;     // default 10 — max rotation in degrees
  perspective?: number;    // default 800 — CSS perspective value in px
  className?: string;
}

const springConfig = { stiffness: 200, damping: 20 };

export function TiltCard({ children, maxTiltDeg = 10, perspective = 800, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    rotateX.set(-percentY * maxTiltDeg);
    rotateY.set(percentX * maxTiltDeg);
    glowX.set((x / rect.width) * 100);
    glowY.set((y / rect.height) * 100);
  }

  function handleMouseLeave() {
    setHovering(false);
    rotateX.set(0);
    rotateY.set(0);
  }

  function handleMouseEnter() {
    setHovering(true);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective,
        position: 'relative',
        overflow: 'hidden',
      }}
      className={className}
    >
      {children}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(255,255,255,0.08) 0%, transparent 60%)`,
          opacity: hovering ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        ref={(el) => {
          if (!el) return;
          const unsub1 = glowX.on('change', (v) =>
            el.style.setProperty('--glow-x', `${v}%`)
          );
          const unsub2 = glowY.on('change', (v) =>
            el.style.setProperty('--glow-y', `${v}%`)
          );
          return () => {
            unsub1();
            unsub2();
          };
        }}
      />
    </motion.div>
  );
}
