import { motion, useReducedMotion } from 'motion/react';

export interface TextMaskRevealProps {
  text: string;
  duration?: number;   // default 0.9 — seconds
  delay?: number;      // default 0 — seconds before mask starts moving
  direction?: 'up' | 'down' | 'left' | 'right';  // default 'up' — direction the mask exits
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
}

// Map direction to the starting clip-path inset state.
// The mask exits in the specified direction, so it starts fully covered and opens toward that side.
function getInitialClipPath(direction: 'up' | 'down' | 'left' | 'right'): string {
  switch (direction) {
    case 'up':    return 'inset(100% 0 0 0)';   // covered from top; wipes upward to reveal
    case 'down':  return 'inset(0 0 100% 0)';   // covered from bottom; wipes downward to reveal
    case 'left':  return 'inset(0 100% 0 0)';   // covered from right; wipes leftward to reveal
    case 'right': return 'inset(0 0 0 100%)';   // covered from left; wipes rightward to reveal
  }
}

// ease-out-quart approximation via cubic-bezier
const easeOutQuart = [0.25, 1, 0.5, 1] as const;

export function TextMaskReveal({
  text,
  duration = 0.9,
  delay = 0,
  direction = 'up',
  as: Tag = 'h1',
  className,
}: TextMaskRevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion.create(Tag);

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <div style={{ overflow: 'hidden', display: 'inline-block' }}>
      <MotionTag
        className={className}
        initial={{ clipPath: getInitialClipPath(direction) }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          duration,
          delay,
          ease: easeOutQuart,
        }}
      >
        {text}
      </MotionTag>
    </div>
  );
}
