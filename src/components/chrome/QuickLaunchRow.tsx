import { CopyButton } from './CopyButton';

export function QuickLaunchRow({ bundleUrl, bundleText }: { bundleUrl: string; bundleText: string }) {
  const v0 = `https://v0.dev/chat?q=${encodeURIComponent(bundleText)}`;
  const bolt = `https://bolt.new/?prompt=${encodeURIComponent(bundleText)}`;
  return (
    <div className="flex flex-wrap gap-2">
      <a href={v0} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-mono border border-bone/15 rounded-md hover:border-accent/60 transition-colors">Open in v0</a>
      <a href={bolt} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-mono border border-bone/15 rounded-md hover:border-accent/60 transition-colors">Open in Bolt</a>
      <CopyButton text={bundleText} label="Copy for Claude Code / Cursor" />
      <a href={bundleUrl} className="px-3 py-1.5 text-xs font-mono border border-bone/15 rounded-md hover:border-accent/60 transition-colors" download>Download .md</a>
    </div>
  );
}
