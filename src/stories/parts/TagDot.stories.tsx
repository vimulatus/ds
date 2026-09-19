import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagDot } from '@/components/TagDot';
import { getHashedPaletteColor, PALETTE_COLORS } from '@/lib/hue';

const TAGS = ['design', 'engineering', 'launch', 'research', 'support'];

/**
 * A circular color marker. Supply one `fill`, or `fills` for up to four pie
 * slices. Repeated fills increase their share; distinct fills keep input
 * order. With no fill it falls back to `ink-extra-muted`.
 *
 * - **Do** pair the dot with a text label so color is not the only identifier.
 * - **Do** put the parent tag's fill first when summarizing a tag branch.
 */
const meta = {
  title: 'Parts/TagDot',
  component: TagDot,
  args: { size: 'md', fill: 'var(--color-blue)' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    fill: { control: 'text' },
  },
} satisfies Meta<typeof TagDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** One fill, two, and four. Past four distinct fills, the extras drop. */
export const Fills: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <TagDot />
      <TagDot fill="var(--color-blue)" />
      <TagDot fills={['var(--color-blue)', 'var(--color-yellow)']} />
      <TagDot fills={['var(--color-blue)', 'var(--color-blue)', 'var(--color-blue)', 'var(--color-yellow)']} />
      <TagDot fills={['var(--color-blue)', 'var(--color-yellow)', 'var(--color-red)', 'var(--color-green)']} />
    </div>
  ),
};

/** sm: 8px, md (default): 10px. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(['sm', 'md'] as const).map((size) => (
        <TagDot key={size} size={size} fill="var(--color-blue)" />
      ))}
    </div>
  ),
};

/** The twelve palette colors, in the stable order the hash indexes into. */
export const Palette: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
      {PALETTE_COLORS.map((color) => (
        <div key={color} className="flex items-center gap-2">
          <TagDot fill={`var(--color-${color})`} />
          <span className="font-mono text-xs text-ink-muted">{color}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * With a label, as tags render in lists. `getHashedPaletteColor` picks each
 * tag's color from its name, so it stays stable without being stored.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      {TAGS.map((tag) => (
        <div key={tag} className="flex items-center gap-2 text-sm text-ink">
          <TagDot fill={`var(--color-${getHashedPaletteColor(tag)})`} />
          {tag}
        </div>
      ))}
    </div>
  ),
};
