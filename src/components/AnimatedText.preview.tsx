import { AnimatedText } from './AnimatedText';

export default function Demo(props: { text?: string; stagger?: number; duration?: number }) {
  const { text = 'Design systems that talk to AI agents.', ...rest } = props;
  return (
    <div className="flex items-center justify-center min-h-[240px] p-8">
      <AnimatedText
        text={text}
        as="h2"
        className="text-2xl font-display text-center max-w-sm"
        {...rest}
      />
    </div>
  );
}
