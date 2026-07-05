/**
 * TypeRoles — the DealDash `t-*` typography roles as a live specimen.
 * ONE named scale: Inter variable everywhere (titles use the display optical
 * size via the opsz axis with Linear-style tight tracking; body stays at text
 * optical size), JetBrains Mono for code/log/mono contexts only.
 *
 * Use the roles. Never hand-roll a title.
 *
 * Body text renders antialiased with font-feature-settings
 * "liga" 1, "calt" 1, "cv05" 1 — set once globally, don't repeat per element.
 */

export interface TypeRolesProps {
  sample?: string;
  mode?: 'light' | 'dark';
}

const css = `
.dd-type-scope{
  --foreground:#0e1512; --muted-foreground:#66716c; --border:#e6e9e7;
  color:var(--foreground);
  font-family:Inter, ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing:antialiased;
  font-feature-settings:"liga" 1, "calt" 1, "cv05" 1;
  display:block; width:100%; max-width:560px;
}
.dd-type-scope[data-mode="dark"]{
  --foreground:#f4f6f5; --muted-foreground:#8f9a94; --border:#212824;
}
.dd-type-row{
  display:grid; grid-template-columns:120px 1fr; gap:16px; align-items:baseline;
  padding:10px 0; border-bottom:1px solid var(--border);
}
.dd-type-row:last-child{ border-bottom:none; }
.dd-type-label{
  font-family:"JetBrains Mono", ui-monospace, monospace;
  font-size:11px; color:var(--muted-foreground);
}
/* The seven roles — exact recipes from the DealDash platform standard. */
.t-page-title{
  font-size:24px; font-weight:600; line-height:1.25;      /* sm+: 30px */
  font-optical-sizing:auto; font-variation-settings:"opsz" 28;
  letter-spacing:-0.02em;
}
@media (min-width:640px){ .t-page-title{ font-size:30px; } }
.t-section-title{
  font-size:18px; font-weight:600; line-height:1.375;
  font-optical-sizing:auto; font-variation-settings:"opsz" 22;
  letter-spacing:-0.015em;
}
.t-card-title{ font-size:16px; font-weight:600; line-height:1; }
.t-body{ font-size:14px; font-weight:400; line-height:1.625; }
.t-small{ font-size:14px; color:var(--muted-foreground); }
.t-caption{ font-size:12px; font-weight:500; line-height:1; }
.t-overline{
  font-size:12px; font-weight:500; text-transform:uppercase;
  letter-spacing:0.025em; color:var(--muted-foreground);
}
`;

const ROLES: Array<{ cls: string; use: string }> = [
  { cls: 't-page-title', use: 'One per page (PageHeader)' },
  { cls: 't-section-title', use: 'Section h2' },
  { cls: 't-card-title', use: 'CardTitle default' },
  { cls: 't-body', use: 'Prose, descriptions' },
  { cls: 't-small', use: 'Secondary lines' },
  { cls: 't-caption', use: 'Labels, stat captions' },
  { cls: 't-overline', use: 'Eyebrows, column labels' },
];

export function TypeRoles({ sample = 'Deals move faster in green', mode = 'dark' }: TypeRolesProps) {
  return (
    <div className="dd-type-scope" data-mode={mode}>
      <style>{css}</style>
      {ROLES.map((r) => (
        <div className="dd-type-row" key={r.cls}>
          <span className="dd-type-label" title={r.use}>.{r.cls}</span>
          <span className={r.cls}>{sample}</span>
        </div>
      ))}
    </div>
  );
}

export default TypeRoles;
