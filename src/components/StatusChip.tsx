import type { ReactNode } from 'react';

/**
 * StatusChip — DealDash's sanctioned soft status chip recipe:
 *
 *   bg-{status}/10  text-{status}  border-{status}/20   (15% fill for warning)
 *
 * Status maps to exactly four semantic tokens — success/positive = --primary,
 * warning = --warning, info = --info, danger = --destructive. No emerald,
 * amber, blue, zinc, or raw-hex palette classes in pages — ever. Status maps
 * live in one const per page, typed against the status union.
 */

export type ChipStatus = 'success' | 'warning' | 'info' | 'danger';

export interface StatusChipProps {
  status?: ChipStatus;
  children?: ReactNode;
  label?: string;
  /** Rounded-full pill instead of the default 4px (rounded-sm). */
  pill?: boolean;
  mode?: 'light' | 'dark';
}

/* Resolved DealDash Emerald status tokens (light / dark):
 * success --primary  #1a7a5e / #1a7a5e   warning --warning #b45309 / #fbbf24
 * info    --info     #1d4ed8 / #60a5fa   danger  --destructive #dc2626 / #f87171 */
const css = `
.dd-chip-scope{
  --primary:#1a7a5e; --warning:#b45309; --info:#1d4ed8; --destructive:#dc2626;
  display:inline-block;
}
.dd-chip-scope[data-mode="dark"]{
  --warning:#fbbf24; --info:#60a5fa; --destructive:#f87171;
}
.dd-chip{
  display:inline-flex; align-items:center; gap:6px;
  height:22px; padding:0 8px; border-radius:4px; /* chips: rounded-sm or full */
  font:500 12px/1 Inter, ui-sans-serif, system-ui, sans-serif;
  background:color-mix(in oklab, var(--chip-color) 10%, transparent);
  color:var(--chip-color);
  border:1px solid color-mix(in oklab, var(--chip-color) 20%, transparent);
  white-space:nowrap; -webkit-font-smoothing:antialiased;
}
.dd-chip--pill{ border-radius:9999px; }
.dd-chip--success{ --chip-color:var(--primary); }
.dd-chip--warning{
  --chip-color:var(--warning);
  background:color-mix(in oklab, var(--chip-color) 15%, transparent); /* 15 for warning fills */
}
.dd-chip--info{ --chip-color:var(--info); }
.dd-chip--danger{ --chip-color:var(--destructive); }
`;

export function StatusChip({
  status = 'success',
  children,
  label,
  pill = false,
  mode = 'dark',
}: StatusChipProps) {
  const safeStatus: ChipStatus = (['success', 'warning', 'info', 'danger'] as const).includes(status as ChipStatus)
    ? status
    : 'success';
  return (
    <span className="dd-chip-scope" data-mode={mode}>
      <style>{css}</style>
      <span className={`dd-chip dd-chip--${safeStatus}${pill ? ' dd-chip--pill' : ''}`}>
        {children ?? label ?? safeStatus}
      </span>
    </span>
  );
}

export default StatusChip;
