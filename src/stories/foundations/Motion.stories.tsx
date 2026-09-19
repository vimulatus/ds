import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import { SpecTable } from './Swatch';

/**
 * Motion is short and does not ask for attention. A menu grows in over
 * 120ms, a dialog rises and settles over 160ms, and a scrim fades over
 * 120ms, on one fast-out curve. Each utility plays a keyframe once when the
 * element mounts. The phone sheet (`motion-sheet`) follows the finger with
 * Base UI's drawer variables. Under `prefers-reduced-motion` the animations
 * are off.
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
        ['menu-open-animation', '120ms', 'opacity 0, 2px up, scale 0.96', 'Menus, popovers, tooltips, selects'],
        ['dialog-content-open-animation', '160ms', 'opacity 0, 4px down, scale 0.98', 'Dialogs'],
        ['dialog-overlay-open-animation', '120ms', 'opacity 0', 'Scrims, field errors'],
        ['dialog-fullscreen-open-animation', '160ms', 'opacity 0, 6px down', 'Full-screen dialogs'],
        ['mobile-sheet-open-animation', '340ms', 'off the bottom edge', 'Phone sheets'],
        ['motion-sheet', '400ms', 'off the bottom edge, then the finger', 'The Base UI phone sheet'],
      ]}
    />
  ),
};

/** Plays a mount animation: each replay mounts the element again. */
function Enter({ className, children }: { className: string; children?: ReactNode }) {
  return <div className={className}>{children}</div>;
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

/** Each utility as it opens. Replay runs it again. */
export const Entrances: Story = {
  render: () => (
    <div className="flex flex-wrap gap-10">
      <Replay label="menu-open-animation">
        <Enter className="menu-open-animation glass w-44 rounded-xl border border-edge-muted bg-menu-glass p-1 text-sm [--transform-origin:top_left]">
          {['Rename', 'Duplicate', 'Move to folder'].map((item) => (
            <div key={item} className="rounded-md px-2 py-1.5 text-ink">
              {item}
            </div>
          ))}
        </Enter>
      </Replay>
      <Replay label="dialog-content-open-animation">
        <Enter className="dialog-content-open-animation glass flex h-28 w-60 items-center justify-center rounded-xl border border-edge-muted bg-menu-glass text-sm text-ink">
          Rename the launch plan
        </Enter>
      </Replay>
      <Replay label="dialog-overlay-open-animation">
        <Enter className="dialog-overlay-open-animation flex h-28 w-60 items-center justify-center rounded-xl border border-edge-muted bg-surface text-sm text-ink">
          Task created
        </Enter>
      </Replay>
    </div>
  ),
};

const EASINGS = [
  { name: 'ease-[cubic-bezier(0.16,1,0.3,1)]', className: 'ease-[cubic-bezier(0.16,1,0.3,1)]', curve: 'cubic-bezier(0.16, 1, 0.3, 1)', use: 'Menus and dialogs as they open' },
  { name: 'ease-out', className: 'ease-out', curve: 'cubic-bezier(0, 0, 0.2, 1)', use: 'Scrims and small state changes' },
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
