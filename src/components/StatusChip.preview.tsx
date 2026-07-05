import { StatusChip, type StatusChipProps, type ChipStatus } from './StatusChip';

export default function Demo(props: Partial<StatusChipProps> & { status?: string; label?: string }) {
  const { mode = 'dark', status, label } = props;
  const statuses: ChipStatus[] = ['success', 'warning', 'info', 'danger'];
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 min-h-[240px] p-8 w-full"
      style={{ background: mode === 'dark' ? '#0a0d0c' : '#ffffff' }}
    >
      <StatusChip mode={mode} status={status as ChipStatus} label={label} />
      <div className="flex flex-wrap items-center justify-center gap-2">
        {statuses.map((s) => (
          <StatusChip key={s} mode={mode} status={s} label={s} />
        ))}
      </div>
    </div>
  );
}
