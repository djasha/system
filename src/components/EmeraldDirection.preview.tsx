import { EmeraldButton } from './EmeraldButton';
import { SparkCta } from './SparkCta';
import { StatusChip } from './StatusChip';

/** Composed specimen of the DealDash Emerald direction: elevation ramp
 * (bg → card), hairline borders, one green accent, soft chips, one spark. */
export default function Demo({ mode = 'dark' }: { mode?: 'light' | 'dark' }) {
  const dark = mode === 'dark';
  const surface = {
    background: dark ? '#0a0d0c' : '#ffffff',
    color: dark ? '#f4f6f5' : '#0e1512',
  };
  const card = {
    background: dark ? '#121615' : '#fafbfa',
    border: `1px solid ${dark ? '#212824' : '#e6e9e7'}`,
    borderRadius: 8,
  };
  return (
    <div className="w-full p-8" style={{ ...surface, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div className="p-5" style={card}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.025em', color: dark ? '#8f9a94' : '#66716c' }}>
              Q3 pipeline
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', marginTop: 4 }}>
              Nike x @creator — usage rights
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip mode={mode} status="success" label="Paid" />
            <StatusChip mode={mode} status="warning" label="Pending" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          <SparkCta mode={mode} label="Start Free" />
          <EmeraldButton mode={mode} variant="outline">View deals</EmeraldButton>
          <EmeraldButton mode={mode} variant="ghost">Dismiss</EmeraldButton>
        </div>
      </div>
    </div>
  );
}
