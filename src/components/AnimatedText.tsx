import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedTextProps {
  text: string;
  stagger?: number;        // default 0.05 — seconds between word animations
  duration?: number;       // default 0.6 — seconds per word
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

const ease = [0.25, 0.1, 0.25, 1] as const;

export function AnimatedText({
  text,
  stagger = 0.05,
  duration = 0.6,
  className,
  as: Tag = 'p',
}: AnimatedTextProps) {
  const reduced = useReducedMotion();
  const words = text.split(' ');
  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.3em' }}
    >
      {words.map((word, i) => (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={reduced ? { opacity: 1, y: '0%' } : { opacity: 0, y: '100%' }}
            whileInView={{ opacity: 1, y: '0%' }}
            viewport={{ once: true, margin: '-50px' }}
            transition={reduced ? { duration: 0 } : {
              duration,
              ease,
              delay: i * stagger,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
