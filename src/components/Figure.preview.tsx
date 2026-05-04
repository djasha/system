import { Figure } from './Figure';

export default function Demo(props: { caption?: string; expandable?: number }) {
  return (
    <div className="flex items-center justify-center min-h-[320px] p-8">
      <Figure
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80"
        alt="A serene mountain lake at dusk."
        caption={props.caption}
        expandable={props.expandable !== 0}
        className="max-w-md"
      />
    </div>
  );
}
