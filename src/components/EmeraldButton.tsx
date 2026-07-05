import type { ReactNode } from 'react';

/**
 * EmeraldButton — the DealDash flagship button, ported as a self-contained
 * component with every token value resolved inline. Linear-style: compact
 * 36px control row, 6px radius, hairline elevation from --shadow-btn-*
 * tokens, motion on 120ms + cubic-bezier(0.22, 1, 0.36, 1).
 * Hover BRIGHTENS with a soft brand glow (never scales); press sinks 1px
 * and darkens. Swap the token block below to re-theme every button at once.
 */

export type EmeraldButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type EmeraldButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
export type EmeraldMode = 'light' | 'dark';

export interface EmeraldButtonProps {
  children: ReactNode;
  variant?: EmeraldButtonVariant;
  size?: EmeraldButtonSize;
  /** Emerald theme mode — controls which token values apply. */
  mode?: EmeraldMode;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

/* DealDash Emerald tokens, resolved. Light values on the scope, dark values
 * on [data-mode="dark"]. In the host app these live on :root / .dark. */
const css = `
.dd-emerald-scope{
  --primary:#1a7a5e; --primary-foreground:#ffffff;
  --foreground:#0e1512; --card:#fafbfa;
  --secondary:#f1f3f2; --secondary-foreground:#0e1512;
  --accent:#e7f6ef; --accent-foreground:#0f6a4f;
  --destructive:#dc2626; --border:#e6e9e7; --ring:#1a7a5e;
  --shadow-btn-highlight:inset 0 1px 0 0 #ffffff2e;
  --shadow-btn-drop:0 1px 2px 0 #0a140f40;
  --shadow-btn-drop-subtle:0 1px 2px 0 #0a140f0d;
  --duration-fast:120ms; --ease-standard:cubic-bezier(0.22, 1, 0.36, 1);
  display:inline-block;
}
.dd-emerald-scope[data-mode="dark"]{
  --foreground:#f4f6f5; --card:#121615;
  --secondary:#1a201d; --secondary-foreground:#f4f6f5;
  --accent:#15241e; --accent-foreground:#34d399;
  --destructive:#f87171; --border:#212824;
  --shadow-btn-highlight:inset 0 1px 0 0 #ffffff1f;
  --shadow-btn-drop:0 1px 2px 0 #00000066;
  --shadow-btn-drop-subtle:0 1px 2px 0 #00000040;
}
.dd-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  white-space:nowrap; border-radius:6px; /* controls = --radius(8px) - 2px */
  font:500 14px/1 Inter, ui-sans-serif, system-ui, sans-serif;
  border:1px solid transparent; cursor:pointer; text-decoration:none;
  transition:all var(--duration-fast) var(--ease-standard);
  outline:none; -webkit-font-smoothing:antialiased;
}
.dd-btn:active{ filter:brightness(0.95); transform:translateY(1px); }
.dd-btn:focus-visible{
  border-color:var(--ring);
  box-shadow:0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
}
.dd-btn[disabled]{ pointer-events:none; opacity:0.5; box-shadow:none; }
/* Sizes — 36px control row standard; sm 32, lg 40. Never mix in one row. */
.dd-btn--default{ height:36px; padding:0 16px; }
.dd-btn--sm{ height:32px; padding:0 12px; gap:6px; }
.dd-btn--lg{ height:40px; padding:0 20px; }
.dd-btn--icon{ width:36px; height:36px; padding:0; }
.dd-btn--icon-sm{ width:32px; height:32px; padding:0; }
.dd-btn--icon-lg{ width:40px; height:40px; padding:0; }
/* Variants */
.dd-btn--v-default{
  background:var(--primary); color:var(--primary-foreground);
  box-shadow:var(--shadow-btn-highlight), var(--shadow-btn-drop);
}
.dd-btn--v-default:hover{
  filter:brightness(1.08);
  box-shadow:var(--shadow-btn-highlight), var(--shadow-btn-drop), 0 0 20px -6px var(--primary);
}
.dd-btn--v-destructive{
  background:var(--destructive); color:#ffffff;
  box-shadow:var(--shadow-btn-highlight), var(--shadow-btn-drop);
}
.dd-btn--v-destructive:hover{ filter:brightness(1.08); }
.dd-emerald-scope[data-mode="dark"] .dd-btn--v-destructive{
  background:color-mix(in oklab, var(--destructive) 70%, transparent);
}
.dd-btn--v-outline{
  background:var(--card); color:var(--foreground);
  border-color:var(--border); box-shadow:var(--shadow-btn-drop-subtle);
}
.dd-btn--v-outline:hover{
  background:var(--accent); color:var(--accent-foreground);
  border-color:color-mix(in oklab, var(--primary) 25%, transparent);
}
.dd-btn--v-secondary{
  background:var(--secondary); color:var(--secondary-foreground);
  box-shadow:var(--shadow-btn-highlight), var(--shadow-btn-drop-subtle);
}
.dd-btn--v-secondary:hover{ background:color-mix(in oklab, var(--secondary) 80%, transparent); }
.dd-btn--v-ghost{ background:transparent; color:var(--foreground); box-shadow:none; }
.dd-btn--v-ghost:hover{ background:var(--accent); color:var(--accent-foreground); }
.dd-btn--v-link{ background:transparent; color:var(--primary); box-shadow:none; padding:0; height:auto; }
.dd-btn--v-link:hover{ text-decoration:underline; text-underline-offset:4px; }
.dd-btn--v-link:active{ transform:none; }
@media (prefers-reduced-motion: reduce){ .dd-btn{ transition:none; } }
`;

export function EmeraldButton({
  children,
  variant = 'default',
  size = 'default',
  mode = 'dark',
  disabled = false,
  href,
  onClick,
  ...rest
}: EmeraldButtonProps) {
  const cls = `dd-btn dd-btn--${size} dd-btn--v-${variant}`;
  return (
    <span className="dd-emerald-scope" data-mode={mode}>
      <style>{css}</style>
      {href && !disabled ? (
        <a href={href} className={cls} aria-label={rest['aria-label']}>
          {children}
        </a>
      ) : (
        <button type="button" className={cls} disabled={disabled} onClick={onClick} aria-label={rest['aria-label']}>
          {children}
        </button>
      )}
    </span>
  );
}

export default EmeraldButton;
