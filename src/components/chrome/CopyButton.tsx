import { useState } from 'react';
import clsx from 'clsx';

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 text-xs font-mono rounded-md border border-bone/15 bg-elevated hover:border-accent/60 transition-colors',
        className,
      )}
      aria-live="polite"
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
