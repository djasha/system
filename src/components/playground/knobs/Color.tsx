export function ColorKnob({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 py-2">
      <span className="text-xs font-mono text-bone/70">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 border-0 bg-transparent cursor-pointer" />
    </label>
  );
}
