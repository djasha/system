import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';

interface Entry { type: string; slug: string; name: string; description?: string; category?: string; tags?: string[]; body?: string; }

function linkFor(r: Entry): string {
  if (r.type === 'component') return `/components/${r.slug}`;
  if (r.type === 'pattern') return `/patterns/${r.slug}`;
  if (r.type === 'token') return `/tokens#${r.slug}`;
  return '/voice';
}

export function CommandK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    fetch('/search-index.json').then((r) => r.json()).then(setEntries).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fuse = useMemo(
    () => new Fuse(entries, { keys: ['name', 'description', 'tags', 'body'], threshold: 0.3 }),
    [entries],
  );
  const results = q ? fuse.search(q).slice(0, 20).map((r) => r.item) : entries.slice(0, 20);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-start justify-center pt-32 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-elevated border border-bone/15 rounded-lg w-full max-w-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search components, tokens, patterns…"
          className="w-full bg-transparent px-4 py-3 font-mono text-sm border-b border-bone/10 outline-none"
        />
        <ul className="max-h-[60vh] overflow-auto">
          {results.length === 0 && (
            <li className="px-4 py-3 text-xs text-bone/50 font-mono">No results for "{q}"</li>
          )}
          {results.map((r) => (
            <li key={`${r.type}-${r.slug}`}>
              <a
                href={linkFor(r)}
                className="flex items-baseline justify-between px-4 py-2 hover:bg-accent/10 font-mono text-sm"
              >
                <span>{r.name}</span>
                <span className="text-bone/50 text-xs">{r.type}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
