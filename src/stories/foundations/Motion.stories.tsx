import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import { SpecTable } from './Swatch';

/**
 * Motion gets out of the way. A popup scales in from 96% over 150ms, a
 * dialog from 97% over 200ms, and a scrim fades over 200ms, all on one
 * fast-out curve. The `motion-*` utilities key off Base UI's
 * `data-starting-style` and `data-ending-style`. Under
 * `prefers-reduced-motion` every transition drops to 0ms.
 */
const meta = {
  title: 'Foundations/Motion',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Utilities: Story = {
  render: () => (
    <SpecTable
      head={['Utility', 'Duration', 'From', 'Used for']}
      rows={[
        ['motion-pop', '150ms', 'opacity 0, scale 0.96', 'Menus, popovers, tooltips'],
        ['motion-dialog', '200ms', 'opacity 0, scale 0.97', 'Dialogs'],
        ['motion-fade', '200ms', 'opacity 0', 'Scrims, toasts'],
      ]}
    />
  ),
};

/**
 * Mounts its child with `data-starting-style`, commits that style, then
 * clears it, as Base UI does on open.
 */
function Enter({ className, children }: { className: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [starting, setStarting] = useState(true);
  useEffect(() => {
    ref.current?.getBoundingClientRect();
    setStarting(false);
  }, []);
  return (
    <div ref={ref} data-starting-style={starting ? '' : undefined} className={className}>
      {children}
    </div>
  );
}

function Replay({ label, children }: { label: string; children: ReactNode }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="outlined" size="sm" onClick={() => setRun(run + 1)}>
        Replay {label}
      </Button>
      <div key={run} className="h-32">
        {children}
      </div>
    </div>
  );
}

/** Each utility's entrance. Press Replay to see it again. */
export const Entrances: Story = {
  render: () => (
    <div className="flex flex-wrap gap-10">
      <Replay label="motion-pop">
        <Enter className="motion-pop glass w-44 rounded-xl border border-edge-muted bg-menu-glass p-1 text-sm [--transform-origin:top_left]">
          {['Rename', 'Duplicate', 'Move to folder'].map((item) => (
            <div key={item} className="rounded-md px-2 py-1.5 text-ink">
              {item}
            </div>
          ))}
        </Enter>
      </Replay>
      <Replay label="motion-dialog">
        <Enter className="motion-dialog glass flex h-28 w-60 items-center justify-center rounded-xl border border-edge-muted bg-menu-glass text-sm text-ink">
          Rename the launch plan
        </Enter>
      </Replay>
      <Replay label="motion-fade">
        <Enter className="motion-fade flex h-28 w-60 items-center justify-center rounded-xl border border-edge-muted bg-surface text-sm text-ink">
          Task created
        </Enter>
      </Replay>
    </div>
  ),
};

const EASINGS = [
  { name: 'ease-out', className: 'ease-out', curve: 'cubic-bezier(0.23, 1, 0.32, 1)', use: 'Anything that enters' },
  { name: 'ease-in-out', className: 'ease-in-out', curve: 'cubic-bezier(0.77, 0, 0.175, 1)', use: 'A move on screen' },
  { name: 'ease-drawer', className: 'ease-drawer', curve: 'cubic-bezier(0.32, 0.72, 0, 1)', use: 'Sheets and drawers' },
];

/** Three curves, one duration. Press Move to run them side by side. */
export const Easings: Story = {
  render: function Render() {
    const [moved, setMoved] = useState(false);
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <Button variant="outlined" size="sm" className="self-start" onClick={() => setMoved(!moved)}>
          Move
        </Button>
        {EASINGS.map((easing) => (
          <div key={easing.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-ink">{easing.name}</span>
              <span className="font-mono text-xxs text-ink-subtle">{easing.curve}</span>
              <span className="text-xs text-ink-muted">{easing.use}</span>
            </div>
            <div className="@container h-6 rounded-md bg-surface p-1">
              <div
                className={cn(
                  'size-4 rounded-sm bg-accent transition-transform duration-500',
                  easing.className,
                  moved && 'translate-x-[calc(100cqw-1rem)]'
                )}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
};
