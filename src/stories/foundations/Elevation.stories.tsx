import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { type Depth, Layer } from '@/components/Layer';
import { SpecTable } from './Swatch';

/**
 * Elevation is a shade, not a shadow. A container sets a depth from 0 to 4
 * with `Layer`, and `bg-surface` inside it steps one shade toward the viewer.
 * Only what floats casts a shadow: menus, popovers, dialogs and toasts are
 * `glass`. A raised control is a `pane`.
 */
const meta = {
  title: 'Foundations/Elevation',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Level({ depth, children }: { depth: Depth; children?: ReactNode }) {
  return (
    <Layer depth={depth}>
      <div className="flex flex-col gap-2 rounded-xl border border-edge-muted bg-surface p-3">
        <span className="font-mono text-xs text-ink-subtle">depth={depth}</span>
        {children}
      </div>
    </Layer>
  );
}

/** Each level nests one step forward, so a card on a card still reads without a heavy border. */
export const Nesting: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Level depth={0}>
        <Level depth={1}>
          <Level depth={2}>
            <Level depth={3}>
              <Level depth={4} />
            </Level>
          </Level>
        </Level>
      </Level>
    </div>
  ),
};

/**
 * Glass is for floating surfaces only: a blur behind, a translucent fill, a
 * bright hairline on top and one soft cast shadow. Pair `glass` with
 * `bg-menu-glass` and `border-edge-muted`.
 */
export const Glass: Story = {
  render: () => (
    <div className="relative flex h-56 max-w-2xl items-center justify-center overflow-hidden rounded-xl border border-edge-muted bg-panel">
      <div className="absolute inset-0 grid grid-cols-4 gap-2 p-3">
        {['bg-blue', 'bg-pink', 'bg-green', 'bg-amber', 'bg-violet', 'bg-teal', 'bg-orange', 'bg-cyan'].map(
          (fill) => (
            <div key={fill} className={`${fill} rounded-lg opacity-60`} />
          )
        )}
      </div>
      <div className="glass relative flex w-56 flex-col gap-0.5 rounded-xl border border-edge-muted bg-menu-glass p-1 text-sm">
        {['Rename', 'Duplicate', 'Move to folder'].map((item) => (
          <div key={item} className="rounded-md px-2 py-1.5 text-ink hover:bg-hover">
            {item}
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * A pane is a raised control: a hairline rim on top and a small shadow.
 * Every button variant except `ghost` is a pane; `ghost` stays flat.
 */
export const Pane: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="pane flex h-16 w-40 items-center justify-center rounded-md bg-surface text-sm text-ink-muted">
          pane
        </div>
        <div className="flex h-16 w-40 items-center justify-center rounded-md bg-surface text-sm text-ink-muted">
          flat
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost">Ghost is flat</Button>
        <Button variant="outlined">Outlined is a pane</Button>
      </div>
    </div>
  ),
};

/** One stacking order, lowest first. Use the named utility, never a raw z-index. */
export const Stacking: Story = {
  render: () => (
    <SpecTable
      head={['Utility', 'z-index', 'Used for']}
      rows={[
        ['z-sticky', 10, 'Sticky headers'],
        ['z-action-menu', 30, 'Bars that float over content'],
        ['z-popover', 50, 'Menus, popovers, selects'],
        ['z-dialog', 60, 'Dialogs and sheets'],
        ['z-toast', 70, 'Toasts'],
        ['z-tooltip', 80, 'Tooltips'],
      ]}
    />
  ),
};
