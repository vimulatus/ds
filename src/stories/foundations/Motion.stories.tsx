import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/Button';

/**
 * Motion gets out of the way. Surfaces open in 120 to 160ms on one curve,
 * `cubic-bezier(0.16, 1, 0.3, 1)`: fast out of the gate, soft on landing.
 * Hover changes are instant. Loops are kept for progress and live states,
 * and every animation stops under `prefers-reduced-motion`.
 */
const meta = {
  title: 'Foundations/Motion',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TOKENS = [
  ['menu-open', '120ms', 'cubic-bezier(0.16, 1, 0.3, 1)', 'menus, popovers'],
  ['dialog-overlay-open', '120ms', 'ease-out', 'dialog scrim'],
  ['dialog-content-open', '160ms', 'cubic-bezier(0.16, 1, 0.3, 1)', 'dialog panel'],
  ['slide-in', '150ms', 'cubic-bezier(0.16, 1, 0.3, 1)', 'entering rows'],
  ['accordion-down / up', '150ms', 'ease-out', 'disclosures'],
  ['collapse (JS)', '140ms', 'ease-out', 'sidebar sections'],
  ['motion-sheet', '400ms', 'cubic-bezier(0.32, 0.72, 0, 1)', 'phone sheet, follows the finger'],
  ['hover', '0ms', 'none', 'every hover state'],
];

/** The whole motion vocabulary. Durations sit between 120 and 160ms; the phone sheet takes 400ms. */
export const Tokens: Story = {
  render: () => (
    <table className="w-full max-w-3xl text-sm">
      <thead>
        <tr className="border-b border-edge-muted text-left text-xs text-ink-subtle">
          <th className="py-1.5 font-medium">Animation</th>
          <th className="py-1.5 font-medium">Duration</th>
          <th className="py-1.5 font-medium">Easing</th>
          <th className="py-1.5 font-medium">Used for</th>
        </tr>
      </thead>
      <tbody>
        {TOKENS.map(([name, duration, easing, use]) => (
          <tr key={name} className="border-b border-edge-muted">
            <td className="py-1.5 font-mono text-xs text-ink">{name}</td>
            <td className="py-1.5 text-xs text-ink-muted">{duration}</td>
            <td className="py-1.5 font-mono text-xs text-ink-muted">{easing}</td>
            <td className="py-1.5 text-xs text-ink-subtle">{use}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** Replays an entry animation by remounting its child. */
function Replay({ label, children }: { label: string; children: ReactNode }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="outlined" size="sm" onClick={() => setRun(run + 1)}>
        Replay {label}
      </Button>
      <div key={run} className="h-28">
        {children}
      </div>
    </div>
  );
}

/** Each surface's real entry animation. Press Replay to see it again. */
export const Entrances: Story = {
  render: () => (
    <div className="flex flex-wrap gap-10">
      <Replay label="menu">
        <div className="menu-open-animation glass w-44 rounded-xl bg-menu-glass p-1.5 text-sm">
          {['Rename', 'Duplicate', 'Move to folder'].map((item) => (
            <div key={item} className="rounded-lg px-2 py-1.5 text-ink">
              {item}
            </div>
          ))}
        </div>
      </Replay>
      <Replay label="dialog">
        <div className="dialog-content-open-animation glass flex h-24 w-56 items-center justify-center rounded-xl bg-menu-glass text-sm text-ink">
          Rename document
        </div>
      </Replay>
      <Replay label="row">
        <div className="animate-slide-in w-56 rounded-lg bg-hover px-3 py-2 text-sm text-ink">New task added</div>
      </Replay>
    </div>
  ),
};

/** Progress loops: an indeterminate bar, a pulsing dot, and the skeleton shimmer. */
export const Progress: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="relative h-1 w-48 overflow-hidden rounded-full bg-hover">
        <div className="animate-indeterminate-bar absolute inset-y-0 w-1/3 rounded-full bg-accent" />
      </div>
      <span className="animate-todo-pulse size-2 rounded-full bg-accent" />
      <div className="skeleton-shimmer h-4 w-40 rounded-md bg-skeleton" />
    </div>
  ),
};
