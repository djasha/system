import { ParallaxImage } from './ParallaxImage';

export default function Demo(props: { speed?: number }) {
  return (
    <div className="min-h-[320px] overflow-hidden rounded-lg">
      <ParallaxImage
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80"
        alt="Mountain landscape reflected in a calm lake"
        speed={props.speed ?? 0.5}
        className="w-full h-64 object-cover rounded-lg"
      />
    </div>
  );
}
