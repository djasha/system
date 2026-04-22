import { ScrollMarquee } from './ScrollMarquee';

export default function Demo(props: { speed?: number; text?: string }) {
  const { speed = 50, text = '★ Shipping fast · ★ Copying prompts · ★ Paste into any agent' } = props;
  return (
    <div className="w-full py-8 bg-elevated/20 rounded-lg overflow-hidden">
      <ScrollMarquee speed={speed}>
        <span className="px-12 font-mono text-sm tracking-wide text-bone/80">{text}</span>
      </ScrollMarquee>
    </div>
  );
}
