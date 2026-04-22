import { CharacterReveal } from './CharacterReveal';

export default function Demo(props: { text?: string; stagger?: number; duration?: number }) {
  const { text = 'Built for AI.', ...rest } = props;
  return (
    <div className="flex items-center justify-center min-h-[240px] p-8">
      <CharacterReveal
        text={text}
        className="text-4xl font-display tracking-tight"
        {...rest}
      />
    </div>
  );
}
