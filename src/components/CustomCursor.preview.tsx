import { CustomCursor } from './CustomCursor';

export default function Demo(props: { color?: string; size?: number; trailSize?: number }) {
  const { color = '#E8462C', size = 12, trailSize = 40 } = props;
  return (
    <div className="relative min-h-[320px] flex flex-col items-center justify-center gap-4 select-none">
      {/* CustomCursor mounts globally — preview shows the cursor sitewide while this demo is visible */}
      <CustomCursor color={color} size={size} trailSize={trailSize} />
      <p className="text-bone/70 text-sm font-mono">Move your mouse here to see the cursor</p>
      <div className="flex gap-4">
        <button type="button" className="px-4 py-2 rounded border border-accent/40 text-accent text-sm font-mono hover:bg-accent/10">
          Interactive
        </button>
        <a href="#" className="px-4 py-2 rounded border border-bone/20 text-bone/60 text-sm font-mono hover:bg-bone/5">
          Link
        </a>
      </div>
      <p className="text-bone/40 text-xs max-w-sm text-center">
        The custom cursor is active globally while this demo is mounted.
        Mount at your app root in production.
      </p>
    </div>
  );
}
