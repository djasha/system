import { SparkCta, type SparkCtaProps } from './SparkCta';

export default function Demo(props: Partial<SparkCtaProps>) {
  const { mode = 'dark', ...rest } = props;
  return (
    <div className="flex items-center justify-center min-h-[240px] p-8" style={{ background: mode === 'dark' ? '#0a0d0c' : '#ffffff' }}>
      <SparkCta mode={mode} {...rest} />
    </div>
  );
}
