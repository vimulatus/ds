import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { type Depth, Layer } from '@/components/Layer';
import { cn } from '@/lib/cn';

/**
 * Elevation is depth, not shadow. A container declares a depth from 0
 * (back) to 4 (front) and its children read `bg-surface` relative to it.
 * Shadows are reserved for things that float: menus, popovers, dialogs.
 * Those float as glass: a blur, a specular rim and one soft cast shadow.
 */
const meta = {
  title: 'Foundations/Elevation',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A depth-aware box with a hairline, the shape these stories draw depth with. */
function Panel({ depth, className, children }: { depth: Depth; className?: string; children: ReactNode }) {
  return (
    <Layer depth={depth}>
      <div
        className={cn('relative rounded-md overflow-clip size-full grid min-h-0 min-w-0 bg-panel', className)}
        style={{
          border: 'var(--app-border-width, 0.5px) solid var(--color-edge)',
          gridTemplateAreas: '"header" "toolbar" "body" "footer"',
          gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
          gridTemplateColumns: 'minmax(0, 1fr)',
        }}
      >
        {children}
      </div>
    </Layer>
  );
}

function PanelHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-none items-center min-h-10 px-2 border-b border-edge-muted overflow-hidden',
        className
      )}
      style={{ gridArea: 'header' }}
    >
      {children}
    </div>
  );
}

function PanelBody({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('relative min-h-0 min-w-0 overflow-clip', className)} style={{ gridArea: 'body' }}>
      {children}
    </div>
  );
}

const DEPTHS: Depth[] = [0, 1, 2, 3, 4];

export const DepthScale: Story = {
  render: () => (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-5">
      {DEPTHS.map((depth) => (
        <Panel key={depth} depth={depth} className="min-h-28 bg-surface">
          <PanelHeader className="px-3">
            <span className="font-mono text-xs text-ink-subtle">depth={depth}</span>
          </PanelHeader>
          <PanelBody className="p-3">
            <p className="text-sm text-ink-muted">Surface {depth}</p>
          </PanelBody>
        </Panel>
      ))}
    </div>
  ),
};

/** Each level steps forward, so nesting stays legible without heavy borders. */
export const Nesting: Story = {
  render: () => (
    <Panel depth={0} className="w-full bg-surface p-3">
      <p className="mb-2 font-mono text-xs text-ink-subtle">depth 0</p>
      <Panel depth={1} className="bg-surface p-3">
        <p className="mb-2 font-mono text-xs text-ink-subtle">depth 1</p>
        <Panel depth={2} className="bg-surface p-3">
          <p className="mb-2 font-mono text-xs text-ink-subtle">depth 2</p>
          <Panel depth={3} className="bg-surface p-3">
            <p className="font-mono text-xs text-ink-subtle">depth 3</p>
          </Panel>
        </Panel>
      </Panel>
    </Panel>
  ),
};

/** A layer offset steps relative to the parent, clamped to 0..4. */
export const RelativeLayers: Story = {
  render: () => (
    <Panel depth={2} className="max-w-sm bg-surface p-3">
      <div className="flex flex-col gap-2">
        {[-2, -1, 0, 1, 2].map((offset) => (
          <Layer key={offset} depth={Math.min(4, Math.max(0, 2 + offset)) as Depth}>
            <div className="rounded-sm bg-surface p-2 text-xs text-ink-muted">
              offset={offset > 0 ? `+${offset}` : offset}
            </div>
          </Layer>
        ))}
      </div>
    </Panel>
  ),
};

/**
 * Glass: a translucent fill, a 1px rim that is bright at the top-left and
 * fades along its length, and a tight cast shadow. Light themes take the
 * lift from white instead of ink. `ghost` buttons stay flat on purpose.
 */
export const Glass: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="glass flex h-24 w-48 items-center justify-center rounded-xl bg-menu-glass text-sm text-ink-muted">
          glass
        </div>
        <div className="glass-input flex h-24 w-48 items-center justify-center rounded-xl bg-composer text-sm text-ink-muted">
          glass-input
        </div>
        <div className="flex h-24 w-48 items-center justify-center rounded-xl bg-menu text-sm text-ink-muted shadow-menu">
          shadow-menu
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost">ghost: flat</Button>
        <Button variant="outlined">outline: glass</Button>
        <Button variant="cta">cta: glass</Button>
      </div>
    </div>
  ),
};

/** The dialog scrim: black at 10%, an accent wash from the top, a 2px blur. */
export const Scrim: Story = {
  render: () => (
    <div className="relative h-64 overflow-hidden rounded-xl border border-edge-muted">
      <div className="grid h-full grid-cols-3 gap-2 p-3">
        {['write', 'task', 'chat', 'pdf', 'code', 'note'].map((entity) => (
          <div key={entity} className="flex items-center gap-2 rounded-lg bg-panel p-3 text-sm text-ink-muted">
            <span className="size-2 rounded-full" style={{ backgroundColor: `var(--color-${entity})` }} />
            {entity}
          </div>
        ))}
      </div>
      <div className="scrim-glass absolute inset-0" />
      <div className="glass absolute inset-x-16 top-10 flex h-24 items-center justify-center rounded-xl bg-menu-glass text-sm text-ink">
        dialog
      </div>
    </div>
  ),
};

const Z_BANDS = [
  ['0-99', 'in page', 'viewer internals 0-19, app chrome 20-30, floating widgets 90'],
  ['100-199', 'modal stack', 'overlay 100, modal 110, content 120, drag 130, menus 150'],
  ['200-299', 'always on top', 'tooltips 200, nested menus 205, toasts 250'],
];

/** One z-index scale, in bands. Page-level stacking uses a named token, never a raw number. */
export const StackingBands: Story = {
  render: () => (
    <table className="w-full max-w-2xl text-sm">
      <tbody>
        {Z_BANDS.map(([range, band, members]) => (
          <tr key={range} className="border-b border-edge-muted">
            <td className="py-2 font-mono text-xs text-ink">{range}</td>
            <td className="py-2 text-xs text-ink">{band}</td>
            <td className="py-2 text-xs text-ink-muted">{members}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
