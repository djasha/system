import { QuickLaunchRow } from './QuickLaunchRow';

export function BundlePanel({ bundle, slug }: { bundle: string; slug: string }) {
  return (
    <div>
      <pre className="whitespace-pre-wrap font-mono text-xs bg-elevated p-4 rounded-md border border-bone/10 max-h-[360px] overflow-auto">{bundle}</pre>
      <div className="mt-3 space-y-3">
        <QuickLaunchRow bundleUrl={`/bundles/${slug}.md`} bundleText={bundle} />
        <p className="text-xs text-bone/50">Paste into Claude Code, Cursor, v0, or Bolt to port this into your stack.</p>
      </div>
    </div>
  );
}
