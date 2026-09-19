import type { Meta, StoryObj } from '@storybook/react-vite';
import { SwatchGrid } from './Swatch';

const PALETTE = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'blue',
  'violet',
  'purple',
  'pink',
];

/**
 * Every color is a semantic token, built in three steps of CSS:
 * `palette.css` holds the raw colors, `themes.css` assigns them to about 30
 * roles for `dark` and `light` (five surfaces, five content steps, two edges,
 * one accent, twelve hues and a few surfaces that differ), and `tokens.css`
 * maps the roles to utilities. Everything else (hover, selected, `-bg` tints,
 * entity colors) is derived with `color-mix` in OKLCH, so a theme change can
 * never break a component. Use the toolbar to switch themes.
 */
const meta = {
  title: 'Foundations/Color',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The background ramp, back (0) to front (4). Components reach it through Layer depth, not by name. */
export const Surfaces: Story = {
  render: () => (
    <SwatchGrid
      tokens={[
        { token: 'surface-0', note: 'Page, furthest back' },
        { token: 'surface-1', note: 'Panels, sidebars' },
        { token: 'surface-2', note: 'Menus, dialogs' },
        { token: 'surface-3', note: 'Raised chrome' },
        { token: 'surface-4', note: 'Closest to viewer' },
      ]}
    />
  ),
};

/** Five text steps. Hierarchy comes from ink, not from size or weight. */
export const Ink: Story = {
  render: () => (
    <SwatchGrid
      tokens={[
        { token: 'ink', note: 'Primary text' },
        { token: 'ink-muted', note: 'Secondary text' },
        { token: 'ink-subtle', note: 'Labels, captions' },
        { token: 'ink-disabled', note: 'Disabled' },
        { token: 'ink-placeholder', note: 'Empty inputs' },
      ]}
    />
  ),
};

/**
 * Interaction states are translucent ink or accent, so they read the same
 * on any surface: hover is ink at 3%, active 6%, selected accent at 8%.
 */
export const EdgesAndStates: Story = {
  render: () => (
    <SwatchGrid
      tokens={[
        { token: 'edge', note: 'Strong hairline' },
        { token: 'edge-muted', note: 'Default hairline' },
        { token: 'hover', note: 'ink 3%' },
        { token: 'active', note: 'ink 6%' },
        { token: 'selected', note: 'accent 8%' },
      ]}
    />
  ),
};

export const Semantic: Story = {
  render: () => (
    <SwatchGrid
      tokens={[
        { token: 'accent', note: 'Brand, focus, selection' },
        { token: 'success', note: 'green' },
        { token: 'warning', note: 'amber' },
        { token: 'failure', note: 'red' },
        { token: 'link', note: 'accent' },
      ]}
    />
  ),
};

/**
 * Twelve hues, each with a triad: the hue as ink, a 15% `-bg` tint and a
 * 20% `-hover` tint. A chip is ink on its own tint, never white on a
 * saturated fill. That is where the vibrancy comes from without the noise.
 */
export const Palette: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {PALETTE.map((hue) => (
        <div key={hue} className="flex flex-col gap-1.5">
          <div className="h-12 rounded-md" style={{ backgroundColor: `var(--color-${hue})` }} />
          <span
            className="w-fit rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              color: `var(--color-${hue}-ink)`,
              backgroundColor: `var(--color-${hue}-bg)`,
            }}
          >
            {hue}
          </span>
        </div>
      ))}
    </div>
  ),
};

const ENTITIES = [
  'write',
  'note',
  'task',
  'chat',
  'code',
  'pdf',
  'html',
  'canvas',
  'video',
  'snippet',
  'calendar',
  'folder',
];

/** Each content type owns a hue, so a document list is scannable by color alone. */
export const EntityColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {ENTITIES.map((entity) => (
        <span
          key={entity}
          className="flex items-center gap-1.5 rounded-lg border border-edge-muted px-2 py-1 text-sm text-ink-muted"
        >
          <span className="size-2 rounded-full" style={{ backgroundColor: `var(--color-${entity})` }} />
          {entity}
        </span>
      ))}
    </div>
  ),
};

/**
 * Why the palette feels vibrant but even. Dark pins every hue at
 * `oklch(0.75 0.2 h)`: the same lightness and chroma, only the hue turns.
 * OKLCH is perceptual, so no hue shouts louder than another. Light uses
 * Tailwind's 500 step, which reads better on a pale surface.
 */
export const BothThemes: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {(['dark', 'light'] as const).map((theme) => (
        // Derived tokens (bg-page, text-ink) resolve at :root, so a scoped
        // preview paints with the theme roles, which re-resolve here.
        <div
          key={theme}
          data-theme={theme}
          style={{ backgroundColor: 'var(--surface-0)', borderColor: 'var(--edge-muted)' }}
          className="flex flex-col gap-3 rounded-xl border p-3"
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--content-0)' }}>
            {theme}
          </span>
          <div className="flex h-6 overflow-hidden rounded-md">
            {PALETTE.map((hue) => (
              <div key={hue} className="flex-1" style={{ backgroundColor: `var(--${hue})` }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {['accent', 'green', 'blue', 'violet', 'pink'].map((hue) => (
              <span
                key={hue}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  color: `var(--${hue})`,
                  backgroundColor: `color-mix(in oklch, var(--${hue}) 15%, transparent)`,
                }}
              >
                {hue}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
