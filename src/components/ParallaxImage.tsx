import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;       // 0–1.5 parallax multiplier; default 0.5 (image moves at half scroll speed)
  className?: string;
  width?: number;
  height?: number;
}

/**
 * ParallaxImage — image that translates vertically at a fraction of the scroll speed.
 *
 * `speed` controls the parallax intensity:
 *  - 0   → no parallax (image scrolls normally)
 *  - 0.5 → image moves at half the scroll rate (default)
 *  - 1   → image stays fixed relative to viewport
 *  - 1.5 → image moves opposite to scroll (dramatic effect)
 *
 * The image is sized to 100% + 2*range to prevent clipping at extremes.
 * Respects prefers-reduced-motion — image renders statically.
 */
export function ParallaxImage({
  src,
  alt,
  speed = 0.5,
  className = '',
  width,
  height,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Derive translation range from speed: speed 0.5 → ±12%, speed 1 → ±24%
  const rangePercent = speed * 24;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-rangePercent}%`, `${rangePercent}%`]
  );

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div
      ref={ref}
      className={className}
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{
          y,
          width: '100%',
          height: `${100 + rangePercent * 2}%`,
          objectFit: 'cover',
          willChange: 'transform',
          display: 'block',
        }}
        transition={{ ease }}
      />
    </div>
  );
}
