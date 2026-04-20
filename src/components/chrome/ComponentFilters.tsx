import { useMemo, useState } from 'react';
import clsx from 'clsx';

interface Item { slug: string; name: string; description: string; category: string; tags: string[]; tokens_used: string[]; }

export function ComponentFilters({ items }: { items: Item[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [tokens, setTokens] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => [...new Set(items.flatMap((i) => i.tags))].sort(), [items]);
  const allTokens = useMemo(() => [...new Set(items.flatMap((i) => i.tokens_used))].sort(), [items]);
  const allCategories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items]);

  const filtered = items.filter(
    (i) =>
      (!category || i.category === category) &&
      (tags.size === 0 || [...tags].every((t) => i.tags.includes(t))) &&
      (tokens.size === 0 || [...tokens].every((t) => i.tokens_used.includes(t))),
  );

  const toggle = (set: Set<string>, val: string, setFn: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    setFn(next);
  };

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-6 text-sm">
        <Group title="Category">
          <button
            onClick={() => setCategory(null)}
            className={clsx('block text-left w-full py-1', !category && 'text-accent')}
          >
            All
          </button>
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={clsx('block text-left w-full py-1 capitalize', category === c && 'text-accent')}
            >
              {c}
            </button>
          ))}
        </Group>
        <Group title="Tags">
          {allTags.length === 0 && <p className="text-xs text-bone/40">None.</p>}
          {allTags.map((t) => (
            <label key={t} className="flex gap-2 py-1 cursor-pointer">
              <input type="checkbox" checked={tags.has(t)} onChange={() => toggle(tags, t, setTags)} />
              <span>{t}</span>
            </label>
          ))}
        </Group>
        <Group title="Uses token">
          {allTokens.length === 0 && <p className="text-xs text-bone/40">None.</p>}
          {allTokens.map((t) => (
            <label key={t} className="flex gap-2 py-1 cursor-pointer font-mono text-xs">
              <input type="checkbox" checked={tokens.has(t)} onChange={() => toggle(tokens, t, setTokens)} />
              <span>{t}</span>
            </label>
          ))}
        </Group>
      </aside>
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((i) => (
          <a
            key={i.slug}
            href={`/components/${i.slug}`}
            className="block p-5 border border-bone/10 rounded-lg bg-elevated/40 hover:border-accent/60 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2 gap-3">
              <h3 className="font-display text-lg group-hover:text-accent transition-colors">{i.name}</h3>
              <span className="text-xs font-mono text-bone/50 uppercase shrink-0">{i.category}</span>
            </div>
            <p className="text-sm text-bone/70 mb-3 leading-relaxed">{i.description}</p>
            <div className="flex flex-wrap gap-1">
              {i.tags.map((t) => (
                <span key={t} className="text-xs font-mono text-bone/50">#{t}</span>
              ))}
            </div>
          </a>
        ))}
        {filtered.length === 0 && <p className="text-bone/50 col-span-full">No components match these filters.</p>}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-mono text-xs uppercase tracking-wide text-bone/50 mb-2">{title}</h4>
      {children}
    </div>
  );
}
