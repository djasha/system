import { EmeraldButton, type EmeraldButtonProps } from './EmeraldButton';

export default function Demo(props: Partial<EmeraldButtonProps> & { label?: string }) {
  const { label = 'New deal', mode = 'dark', variant, size, ...rest } = props;
  return (
    <div className="flex items-center justify-center min-h-[240px] p-8" style={{ background: mode === 'dark' ? '#0a0d0c' : '#ffffff' }}>
      <EmeraldButton mode={mode} variant={variant as any} size={size as any} {...rest}>
        {label}
      </EmeraldButton>
    </div>
  );
}
