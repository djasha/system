import { useState, useRef, type ReactNode, type KeyboardEvent } from 'react';
import clsx from 'clsx';

export interface Tab { id: string; label: string; content: ReactNode; }

export function Tabs({ tabs, initial = 0, idPrefix = 'tab' }: { tabs: Tab[]; initial?: number; idPrefix?: string }) {
  const [active, setActive] = useState(initial);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (i: number) => {
    const next = (i + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLElement>, i: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusTab(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusTab(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusTab(0); }
    else if (e.key === 'End') { e.preventDefault(); focusTab(tabs.length - 1); }
  };

  const panelId = `${idPrefix}-panel-${tabs[active].id}`;

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-bone/10">
        {tabs.map((t, i) => {
          const tabId = `${idPrefix}-${t.id}`;
          const thisPanelId = `${idPrefix}-panel-${t.id}`;
          return (
            <button
              key={t.id}
              id={tabId}
              ref={(el) => { tabRefs.current[i] = el; }}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={thisPanelId}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => handleKey(e, i)}
              className={clsx(
                'px-4 py-2 text-sm font-mono border-b-2 -mb-px transition-colors',
                i === active ? 'border-accent text-bone' : 'border-transparent text-bone/60 hover:text-bone',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${idPrefix}-${tabs[active].id}`}
        tabIndex={0}
        className="py-6"
      >
        {tabs[active].content}
      </div>
    </div>
  );
}
