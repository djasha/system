import { TiltCard } from './TiltCard';

export default function Demo(props: { maxTiltDeg?: number; perspective?: number; label?: string }) {
  const { label = 'Hover me', ...rest } = props;
  return (
    <div className="flex items-center justify-center min-h-[320px] p-8">
      <TiltCard {...rest} className="w-64 p-8 bg-elevated border border-bone/15 rounded-lg">
        <div className="text-center">
          <p className="font-display text-xl mb-2">{label}</p>
          <p className="text-sm text-bone/60">Tilt on hover</p>
        </div>
      </TiltCard>
    </div>
  );
}
