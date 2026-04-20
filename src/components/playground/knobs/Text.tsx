export function TextKnob({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="py-2 block">
      <span className="text-xs font-mono text-bone/70 block mb-1">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-elevated border border-bone/10 rounded-md px-2 py-1 text-sm" />
    </label>
  );
}
