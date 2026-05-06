import { TextMaskReveal } from './TextMaskReveal';

export default function Demo(props: { text?: string; duration?: number; delay?: number }) {
  // Re-key on knob change so the reveal animation re-plays in the playground
  const replayKey = `${props.text}-${props.duration}-${props.delay}`;
  return (
    <div className="flex items-center justify-center min-h-[320px] p-12">
      <TextMaskReveal
        key={replayKey}
        text={props.text ?? 'Designed for AI agents.'}
        duration={props.duration ?? 0.9}
        delay={props.delay ?? 0}
        direction="up"
        as="h1"
        className="font-display text-5xl md:text-6xl tracking-tight"
      />
    </div>
  );
}
