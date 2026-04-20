import { CopyButton } from './CopyButton';

export function PromptPanel({ promptBody }: { promptBody: string }) {
  return (
    <div>
      <pre className="whitespace-pre-wrap font-mono text-sm bg-elevated p-4 rounded-md border border-bone/10">{promptBody}</pre>
      <div className="mt-3 flex gap-2 items-center">
        <CopyButton text={promptBody} label="Copy prompt" />
        <span className="text-xs text-bone/50">Paste into any AI agent.</span>
      </div>
    </div>
  );
}
