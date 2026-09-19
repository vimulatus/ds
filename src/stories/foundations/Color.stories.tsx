import type { Meta, StoryObj } from '@storybook/react-vite';
import { type Depth, Layer } from '@/components/Layer';
import { cn } from '@/lib/cn';
import { SwatchGrid } from './Swatch';

/**
 * Every color is a role, built in three steps. `palette.css` holds the raw
 * colors. `themes.css` assigns them to roles for `dark` and `light`.
 * `tokens.css` maps each role to a utility and derives the rest (hover,
 * input, ink and tints) with `color-mix`. A component names a role, never a
 * raw color, so a theme change cannot break it. Switch themes in the toolbar.
 */
const meta = {
  title: 'Foundations/Color',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page and the panel sit furthest back. Floating surfaces have their own roles. */
export const Surfaces: Story = {
  render: () => (
    <SwatchGrid
      entries={[
        { name: 'bg-page', className: 'bg-page', note: 'The page, furthest back' },
        { name: 'bg-panel', className: 'bg-panel', note: 'The canvas and the rail' },
        { name: 'bg-surface', className: 'bg-surface', note: 'A card; follows Layer depth' },
        { name: 'bg-hover', className: 'bg-hover', note: 'A row or control under the pointer' },
        { name: 'bg-input', className: 'bg-input', note: 'A text field' },
        { name: 'bg-menu', className: 'bg-menu', note: 'Menus and popovers' },
        { name: 'bg-menu-glass', className: 'bg-menu-glass', note: 'The translucent menu fill' },
        { name: 'bg-dialog', className: 'bg-dialog', note: 'Dialogs' },
        { name: 'bg-composer', className: 'bg-composer', note: 'A compose box' },
        { name: 'bg-tooltip', className: 'bg-tooltip', note: 'Tooltips' },
        { name: 'bg-toast', className: 'bg-toast', note: 'Toasts' },
        { name: 'bg-chrome', className: 'bg-chrome', note: 'Window chrome' },
        { name: 'scrim-glass', className: 'scrim-glass', note: 'Behind a dialog' },
        { name: 'bg-skeleton', className: 'bg-skeleton', note: 'A loading placeholder' },
      ]}
    />
  ),
};

/**
 * `bg-surface` is one utility with five shades. `Layer depth` picks the
 * shade, and `bg-hover` and `bg-input` follow it.
 */
export const SurfaceByDepth: Story = {
  render: () => (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5">
      {([0, 1, 2, 3, 4] as Depth[]).map((depth) => (
        <Layer key={depth} depth={depth}>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex h-12 overflow-hidden rounded-md border border-edge-muted bg-surface">
              <div className="mt-auto ml-auto h-5 w-1/2 rounded-tl-md bg-hover" />
            </div>
            <span className="font-mono text-xs text-ink">depth={depth}</span>
            <span className="text-xs text-ink-subtle">bg-surface, bg-hover</span>
          </div>
        </Layer>
      ))}
    </div>
  ),
};

const INKS = [
  { name: 'text-ink', className: 'text-ink', note: 'Primary text' },
  { name: 'text-ink-muted', className: 'text-ink-muted', note: 'Secondary text, quiet labels' },
  { name: 'text-ink-subtle', className: 'text-ink-subtle', note: 'Captions, breadcrumbs' },
  { name: 'text-ink-extra-muted', className: 'text-ink-extra-muted', note: 'Carets, hints' },
  { name: 'text-ink-placeholder', className: 'text-ink-placeholder', note: 'An empty field' },
  { name: 'text-ink-disabled', className: 'text-ink-disabled', note: 'A disabled control' },
];

/** Six ink steps, strongest first. Use a lighter ink to demote text before you shrink it. */
export const Ink: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      {INKS.map((ink) => (
        <div key={ink.name} className="grid grid-cols-[11rem_1fr] items-baseline gap-3">
          <span className="font-mono text-xs text-ink-subtle">{ink.name}</span>
          <span className={cn('text-sm', ink.className)}>
            The launch plan is ready for review. <span className="text-xs">{ink.note}</span>
          </span>
        </div>
      ))}
    </div>
  ),
};

/** Two hairlines. `edge` bounds a control; `edge-muted` divides regions and bounds a card. */
export const Edges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {[
        { name: 'border-edge', className: 'border-edge', note: 'Outlined controls' },
        { name: 'border-edge-muted', className: 'border-edge-muted', note: 'Cards, dividers, glass' },
      ].map((edge) => (
        <div key={edge.name} className="flex w-48 flex-col gap-1.5">
          <div className={cn('h-16 rounded-xl border bg-surface', edge.className)} />
          <span className="font-mono text-xs text-ink">{edge.name}</span>
          <span className="text-xs text-ink-subtle">{edge.note}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * One accent. As a fill it carries `accent-contrast` text and marks the
 * screen's one `cta`. As a tint it carries `accent-ink`.
 */
export const Accent: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-12 w-64 items-center justify-center rounded-md bg-accent font-mono text-xs font-medium text-accent-contrast">
        bg-accent, text-accent-contrast
      </div>
      <div className="flex h-12 w-64 items-center justify-center rounded-md bg-accent-bg font-mono text-xs font-medium text-accent-ink">
        bg-accent-bg, text-accent-ink
      </div>
      <div className="flex h-12 w-64 items-center justify-center rounded-md border border-edge font-mono text-xs text-ink focus-ring">
        focus-ring
      </div>
    </div>
  ),
};

const HUES = [
  { name: 'red', fill: 'bg-red', chip: 'bg-red-bg text-red-ink' },
  { name: 'orange', fill: 'bg-orange', chip: 'bg-orange-bg text-orange-ink' },
  { name: 'amber', fill: 'bg-amber', chip: 'bg-amber-bg text-amber-ink' },
  { name: 'yellow', fill: 'bg-yellow', chip: 'bg-yellow-bg text-yellow-ink' },
  { name: 'lime', fill: 'bg-lime', chip: 'bg-lime-bg text-lime-ink' },
  { name: 'green', fill: 'bg-green', chip: 'bg-green-bg text-green-ink' },
  { name: 'teal', fill: 'bg-teal', chip: 'bg-teal-bg text-teal-ink' },
  { name: 'cyan', fill: 'bg-cyan', chip: 'bg-cyan-bg text-cyan-ink' },
  { name: 'blue', fill: 'bg-blue', chip: 'bg-blue-bg text-blue-ink' },
  { name: 'violet', fill: 'bg-violet', chip: 'bg-violet-bg text-violet-ink' },
  { name: 'purple', fill: 'bg-purple', chip: 'bg-purple-bg text-purple-ink' },
  { name: 'pink', fill: 'bg-pink', chip: 'bg-pink-bg text-pink-ink' },
];

const STATUS = [
  { name: 'success', fill: 'bg-success', chip: 'bg-success-bg text-success-ink' },
  { name: 'failure', fill: 'bg-failure', chip: 'bg-failure-bg text-failure-ink' },
  { name: 'warning', fill: 'bg-warning', chip: 'bg-warning-bg text-warning-ink' },
  { name: 'write', fill: 'bg-write', chip: 'bg-blue-bg text-blue-ink' },
];

function HueGrid({ hues }: { hues: typeof HUES }) {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      {hues.map((hue) => (
        <div key={hue.name} className="flex min-w-0 flex-col gap-1.5">
          <div className={cn('h-12 rounded-md', hue.fill)} />
          <span className={cn('w-fit rounded-full px-2 py-0.5 text-xs font-medium', hue.chip)}>
            {hue.name}
          </span>
          <span className="font-mono text-xxs text-ink-subtle">
            {hue.name}, {hue.name}-ink on {hue.name}-bg
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Twelve hues at one lightness and chroma, so no hue shouts. Each has a
 * `-bg` tint at 15% and an `-ink` for text on that tint. A label pairs the
 * two: `text-<hue>-ink` on `bg-<hue>-bg`.
 */
export const Hues: Story = {
  render: () => <HueGrid hues={HUES} />,
};

/** Status roles point at a hue, so a theme can move them without touching a component. */
export const Status: Story = {
  render: () => <HueGrid hues={STATUS} />,
};
