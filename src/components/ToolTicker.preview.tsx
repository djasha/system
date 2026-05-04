import { ToolTicker } from './ToolTicker';

export default function Demo(props: { speed?: number }) {
  return (
    <div className="w-full overflow-hidden py-8">
      <ToolTicker
        tools={[
          { name: 'React' },
          { name: 'Astro' },
          { name: 'Tailwind' },
          { name: 'TypeScript' },
          { name: 'Vercel' },
          { name: 'Figma' },
          { name: 'Claude' },
          { name: 'Cursor' },
        ]}
        speed={props.speed ?? 50}
      />
    </div>
  );
}
