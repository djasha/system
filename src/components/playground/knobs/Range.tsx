export function RangeKnob({
  label, value, min, max, step, unit = '', onChange,
}: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label className="py-2 block">
      <div className="flex justify-between text-xs font-mono text-bone/70">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-accent" />
    </label>
  );
}
