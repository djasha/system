interface Token { slug: string; value: string; }
interface Related { slug: string; name?: string; }

export function MetaRail({
  tokens, related, a11yNotes, sourcePath,
}: {
  tokens: Token[];
  related: Related[];
  a11yNotes: string;
  sourcePath: string;
}) {
  const githubBase = 'https://github.com/djasha/system/blob/main';
  return (
    <div className="text-sm text-bone/70 space-y-6">
      <div>
        <h3 className="font-mono text-xs uppercase tracking-wide text-bone/50 mb-2">Tokens</h3>
        {tokens.length === 0 ? (
          <p className="text-xs text-bone/40">None.</p>
        ) : (
          <ul className="space-y-1">
            {tokens.map((t) => (
              <li key={t.slug}>
                <a href={`/tokens#${t.slug}`} className="hover:text-accent font-mono text-xs">
                  {t.slug} <span className="text-bone/40">— {t.value}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {related.length > 0 && (
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wide text-bone/50 mb-2">Related</h3>
          <ul className="space-y-1">
            {related.map((r) => (
              <li key={r.slug}><a href={`/components/${r.slug}`} className="hover:text-accent font-mono text-xs">{r.name ?? r.slug}</a></li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-wide text-bone/50 mb-2">A11y</h3>
        <p className="text-xs leading-relaxed">{a11yNotes}</p>
      </div>
      <div>
        <h3 className="font-mono text-xs uppercase tracking-wide text-bone/50 mb-2">Source</h3>
        <a href={`${githubBase}/${sourcePath}`} target="_blank" rel="noreferrer" className="hover:text-accent font-mono text-xs">{sourcePath}</a>
      </div>
    </div>
  );
}
