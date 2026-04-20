import { useState, type ComponentType } from 'react';
import { ColorKnob } from './knobs/Color';
import { RangeKnob } from './knobs/Range';
import { TextKnob } from './knobs/Text';
import { CopyButton } from '../chrome/CopyButton';

export interface KnobSpec {
  name: string;
  type: 'color' | 'range' | 'text';
  default: any;
  min?: number; max?: number; step?: number; unit?: string;
}

export function Playground<Values extends Record<string, any>>({
  Demo,
  knobs,
  toCode,
}: {
  Demo: ComponentType<Partial<Values>>;
  knobs: readonly KnobSpec[];
  toCode: (values: Values) => string;
}) {
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(knobs.map((k) => [k.name, k.default])) as Values,
  );
  const [bg, setBg] = useState<'dark' | 'light' | 'grid'>('dark');
  const bgClass = { dark: 'bg-ink', light: 'bg-bone text-ink', grid: 'bg-[repeating-linear-gradient(45deg,_transparent_0_8px,_rgba(255,255,255,0.04)_8px_16px)]' }[bg];

  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-6 border border-bone/10 rounded-lg overflow-hidden">
      <div className={`min-h-[320px] flex items-center justify-center ${bgClass}`}>
        <Demo {...values} />
      </div>
      <aside className="p-4 bg-elevated/50 border-l border-bone/10">
        <div className="flex gap-1 mb-4 text-xs font-mono">
          {(['dark', 'light', 'grid'] as const).map((b) => (
            <button key={b} onClick={() => setBg(b)} className={`px-2 py-1 rounded ${bg === b ? 'bg-accent text-ink' : 'bg-bone/5 text-bone/70'}`}>{b}</button>
          ))}
        </div>
        {knobs.map((k) => {
          if (k.type === 'color') return <ColorKnob key={k.name} label={k.name} value={values[k.name]} onChange={(v) => set(k.name as any, v as any)} />;
          if (k.type === 'range') return <RangeKnob key={k.name} label={k.name} value={values[k.name]} min={k.min!} max={k.max!} step={k.step!} unit={k.unit} onChange={(v) => set(k.name as any, v as any)} />;
          if (k.type === 'text') return <TextKnob key={k.name} label={k.name} value={values[k.name]} onChange={(v) => set(k.name as any, v as any)} />;
          return null;
        })}
        <div className="mt-4 pt-4 border-t border-bone/10">
          <CopyButton text={toCode(values)} label="Copy tweaked code" />
        </div>
      </aside>
    </div>
  );
}
