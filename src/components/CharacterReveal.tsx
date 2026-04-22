import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

export interface CharacterRevealProps {
  text: string;
  stagger?: number;   // default 0.02 — seconds between characters
  duration?: number;  // default 0.4 — seconds per character
  className?: string;
}

// Spitzer-style expo.out — matches --ease-expo-out token
const charEase = [0.16, 1, 0.3, 1] as const;

/**
 * Split text into wrappable segments — keeps words together
 * but allows breaks at spaces and after hyphens.
 * e.g. "Human-centered design" → ["Human-", "centered ", "design"]
 */
function splitIntoSegments(text: string): string[] {
  const segments: string[] = [];
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    current += char;
    if (char === '-' || char === ' ') {
      segments.push(current);
      current = '';
    }
  }
  if (current) segments.push(current);
  return segments;
}

export function CharacterReveal({
  text,
  stagger = 0.02,
  duration = 0.4,
  className = '',
}: CharacterRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReduced = useReducedMotion();

  const segments = splitIntoSegments(text);
  let charIndex = 0;

  if (prefersReduced) {
    return (
      <span ref={ref} className={`block ${className}`}>
        {text}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={`block ${className}`}
      style={{ display: 'block', position: 'relative', overflowY: 'clip' }}
    >
      {segments.map((segment, si) => {
        const trimmed = segment.trimEnd();
        const hasTrailingSpace = segment !== trimmed;

        return (
          <span
            key={si}
            style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}
          >
            {trimmed.split('').map((char) => {
              const i = charIndex++;
              return (
                <motion.span
                  key={i}
                  style={{ display: 'inline-block', willChange: 'transform' }}
                  initial={{ y: '110%' }}
                  animate={isInView ? { y: '0%' } : { y: '110%' }}
                  transition={{
                    duration,
                    ease: charEase,
                    delay: i * stagger,
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
            {hasTrailingSpace && (
              <motion.span
                key={`sp-${si}`}
                style={{ display: 'inline-block', width: '0.3em' }}
                initial={{ y: '110%' }}
                animate={isInView ? { y: '0%' } : { y: '110%' }}
                transition={{
                  duration,
                  ease: charEase,
                  delay: charIndex++ * stagger,
                }}
              >
                {'\u00A0'}
              </motion.span>
            )}
          </span>
        );
      })}
    </span>
  );
}
