import type React from 'react';
import { MagneticButton } from './MagneticButton';

export default function Demo(props: Partial<React.ComponentProps<typeof MagneticButton>> & { label?: string }) {
  const { label = 'Get in touch', ...rest } = props;
  return (
    <div className="flex items-center justify-center min-h-[240px]">
      <MagneticButton {...rest}>{label}</MagneticButton>
    </div>
  );
}
