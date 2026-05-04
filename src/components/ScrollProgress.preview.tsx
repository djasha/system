import { useRef } from 'react';
import { ScrollProgress } from './ScrollProgress';

export default function Demo(props: { color?: string; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] overflow-y-auto border border-bone/10 rounded-lg"
    >
      <ScrollProgress
        color={props.color}
        height={props.height}
        scrollContainer={containerRef}
      />
      <div className="p-8 space-y-4">
        <p className="text-bone/70">Scroll this container to see the bar fill.</p>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="text-bone/50">
            Lorem ipsum dolor sit amet — line {i + 1}.
          </p>
        ))}
      </div>
    </div>
  );
}
