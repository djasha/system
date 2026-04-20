import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

export interface Tab { id: string; label: string; content: ReactNode; }

export function Tabs({ tabs, initial = 0 }: { tabs: Tab[]; initial?: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-bone/10">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={clsx(
              'px-4 py-2 text-sm font-mono border-b-2 -mb-px transition-colors',
              i === active ? 'border-accent text-bone' : 'border-transparent text-bone/60 hover:text-bone',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="py-6">{tabs[active].content}</div>
    </div>
  );
}
