import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagDot } from '@/components/TagDot';
import { HUES, hashHue } from '@/lib/hue';

const TAGS = ['design', 'engineering', 'launch', 'research', 'support'];

/**
 * A colored dot before a label. Without a `hue` it falls back to
 * `ink-extra-muted`.
 *
 * - **Do** pass the label as children, so color is not the only thing that
 *   tells two tags apart.
 * - **Do** hash the hue from the tag's name when the tag has no color of its own.
 */
const meta = {
  title: 'Parts/TagDot',
  component: TagDot,
  args: { hue: 'blue', size: 'md', children: 'design' },
  argTypes: {
    hue: { control: 'select', options: [undefined, ...HUES] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof TagDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** `sm` is 8px, `md` 10px. Without children it renders the dot alone. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <TagDot hue="blue" size="sm" />
      <TagDot hue="blue" />
      <TagDot />
    </div>
  ),
};

/** The 12 hues, in the order the hash indexes into. */
export const Hues: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-x-6 gap-y-2 sm:grid-cols-4">
      {HUES.map((hue) => (
        <TagDot key={hue} hue={hue}>
          <span className="font-mono text-xs text-ink-muted">{hue}</span>
        </TagDot>
      ))}
    </div>
  ),
};

/** Tags as a list shows them, each colored from its name. */
export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      {TAGS.map((tag) => (
        <TagDot key={tag} hue={hashHue(tag)}>
          {tag}
        </TagDot>
      ))}
    </div>
  ),
};
