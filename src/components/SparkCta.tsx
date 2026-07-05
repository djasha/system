import type { ReactNode } from 'react';

/**
 * SparkCta — DealDash's signature CTA effect: a comet of light orbiting the
 * button edge. Two pure-CSS layers over a faint always-on track:
 *   ::before — crisp 1px ring: dim track + long-tail comet, head near-white mint.
 *   ::after  — the same comet blurred into a soft bloom outside the edge,
 *              so the light reads as emissive, not painted.
 * Only the registered --spark-angle custom property animates (GPU-cheap, no
 * layout). Orbit is slow and cinematic at rest (4.5s), quickens on hover
 * (2.2s). Reduced motion renders a static soft ring.
 *
 * RULES: at most ONE spark per view, primary CTA only (hero "Start Free",
 * featured plan, final CTA). It is brand garnish, not a component default.
 */

export interface SparkCtaProps {
  children?: ReactNode;
  label?: string;
  /** Idle orbit period in seconds (DealDash standard: 4.5). */
  idleSeconds?: number;
  /** Hover orbit period in seconds (DealDash standard: 2.2). */
  hoverSeconds?: number;
  mode?: 'light' | 'dark';
  href?: string;
  onClick?: () => void;
}

/* Resolved DealDash Emerald tokens: --primary #1a7a5e, --chart-1 #34d399
 * (comet), --shadow-btn-* elevation, 120ms/ease-standard motion. */
const css = `
@property --spark-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
@keyframes spark-orbit { to { --spark-angle: 360deg; } }
.dd-spark-scope{
  --primary:#1a7a5e; --primary-foreground:#ffffff; --chart-1:#34d399;
  --ring:#1a7a5e;
  --shadow-btn-highlight:inset 0 1px 0 0 #ffffff2e;
  --shadow-btn-drop:0 1px 2px 0 #0a140f40;
  --duration-fast:120ms; --ease-standard:cubic-bezier(0.22, 1, 0.36, 1);
  display:inline-block;
}
.dd-spark-scope[data-mode="dark"]{
  --shadow-btn-highlight:inset 0 1px 0 0 #ffffff1f;
  --shadow-btn-drop:0 1px 2px 0 #00000066;
}
.dd-spark-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:40px; padding:0 20px; border-radius:6px; border:none; cursor:pointer;
  font:500 14px/1 Inter, ui-sans-serif, system-ui, sans-serif;
  background:var(--primary); color:var(--primary-foreground);
  box-shadow:var(--shadow-btn-highlight), var(--shadow-btn-drop);
  transition:all var(--duration-fast) var(--ease-standard);
  text-decoration:none; outline:none;
}
.dd-spark-btn:hover{
  filter:brightness(1.08);
  box-shadow:var(--shadow-btn-highlight), var(--shadow-btn-drop), 0 0 20px -6px var(--primary);
}
.dd-spark-btn:active{ filter:brightness(0.95); transform:translateY(1px); }
.dd-spark-btn:focus-visible{
  box-shadow:0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
}
/* The spark itself. Put .btn-spark on any button (asChild anchors too). */
.btn-spark{ position:relative; isolation:isolate; }
.btn-spark::before,
.btn-spark::after{
  content:"";
  position:absolute;
  border-radius:inherit;
  pointer-events:none;
  background:
    conic-gradient(
        from var(--spark-angle),
        transparent 0deg,
        transparent 240deg,
        color-mix(in oklab, var(--primary) 30%, transparent) 290deg,
        color-mix(in oklab, var(--chart-1) 80%, transparent) 328deg,
        color-mix(in oklab, #eafff5 92%, var(--chart-1)) 340deg,
        color-mix(in oklab, var(--chart-1) 60%, transparent) 347deg,
        transparent 353deg
      )
      border-box,
    conic-gradient(
        color-mix(in oklab, var(--chart-1) 12%, transparent) 0deg,
        color-mix(in oklab, var(--chart-1) 12%, transparent) 360deg
      )
      border-box;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: spark-orbit var(--spark-idle, 4.5s) linear infinite;
}
.btn-spark::before{ inset:-1px; padding:1px; z-index:-1; }
.btn-spark::after{ inset:-2px; padding:2px; z-index:-2; filter:blur(6px); opacity:0.6; }
.btn-spark:hover::before,
.btn-spark:hover::after{ animation-duration: var(--spark-hover, 2.2s); }
.btn-spark:hover::after{ opacity:0.85; }
@media (prefers-reduced-motion: reduce){
  .btn-spark::before,
  .btn-spark::after{
    animation:none;
    background: color-mix(in oklab, var(--chart-1) 28%, transparent);
  }
  .btn-spark::after{ display:none; }
  .dd-spark-btn{ transition:none; }
}
`;

export function SparkCta({
  children,
  label = 'Start Free',
  idleSeconds = 4.5,
  hoverSeconds = 2.2,
  mode = 'dark',
  href,
  onClick,
}: SparkCtaProps) {
  const speed = {
    ['--spark-idle' as string]: `${idleSeconds}s`,
    ['--spark-hover' as string]: `${hoverSeconds}s`,
  };
  const content = children ?? label;
  return (
    <span className="dd-spark-scope" data-mode={mode} style={speed}>
      <style>{css}</style>
      {href ? (
        <a href={href} className="dd-spark-btn btn-spark">{content}</a>
      ) : (
        <button type="button" className="dd-spark-btn btn-spark" onClick={onClick}>{content}</button>
      )}
    </span>
  );
}

export default SparkCta;
