import { Expandable } from './Expandable';

export default function Demo(props: { title?: string; defaultOpen?: number }) {
  return (
    <div className="w-full max-w-md p-8">
      <Expandable
        title={props.title ?? 'What does this do?'}
        defaultOpen={props.defaultOpen === 1}
      >
        <p className="text-bone/70 text-sm leading-relaxed">
          The body content slides open with a smooth height animation. Click the header to toggle.
          The trick uses CSS grid-template-rows transitioning from 0fr to 1fr — a modern technique
          that animates to <code>height: auto</code> without JavaScript measurements.
        </p>
      </Expandable>
    </div>
  );
}
