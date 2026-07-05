import { TypeRoles, type TypeRolesProps } from './TypeRoles';

export default function Demo(props: Partial<TypeRolesProps>) {
  const { mode = 'dark', ...rest } = props;
  return (
    <div className="flex items-center justify-center min-h-[240px] p-8 w-full" style={{ background: mode === 'dark' ? '#0a0d0c' : '#ffffff' }}>
      <TypeRoles mode={mode} {...rest} />
    </div>
  );
}
