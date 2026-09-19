import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { hashHue } from '@/lib/hue';

/** A flat head-and-shoulders portrait as an inline SVG, so stories load offline. */
function portrait(background: string, skin: string, hair: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${background}"/><path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="${hair}"/><circle cx="32" cy="28" r="11" fill="${skin}"/><path d="M21 27c0-8 5-13 11-13s11 5 11 13c-3-4-7-6-11-6s-8 2-11 6z" fill="${hair}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const NINA = portrait('#9db8d9', '#eac4a3', '#4a3326');
const OMAR = portrait('#d9a58f', '#b98260', '#221c1a');
const LENA = portrait('#a9cfa4', '#f3d5bb', '#a8552f');
const BROKEN = 'data:image/png;base64,broken';

const PEOPLE = ['Nina Park', 'Omar Haddad', 'Lena Novak', 'Jonas Berg', 'Priya Shah', 'Theo Grant'];

/**
 * A person: the image once it loads, and until then, or when it fails, the
 * initials on a color hashed from the name.
 *
 * - **Do** always pass `name`: it is the alt text, the initials and the color.
 * - **Do** use `AvatarGroup` for a stack; it draws the parting ring.
 * - **Don't** hand-roll a round image: the fallback on a broken source is
 *   why this exists.
 */
const meta = {
  title: 'Parts/Avatar',
  component: Avatar,
  args: { name: 'Nina Park', src: NINA, size: 'lg', shape: 'circle' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['circle', 'square'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** `sm` (16px) sits inline and in list rows, `md` (24px) in roomier rows, `lg` (40px) in a header. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-1.5">
          <Avatar name="Nina Park" size={size} />
          <span className="font-mono text-xs text-ink-subtle">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** The image covers the initials once it loads. A broken source falls back to the initials, never a broken-image glyph. */
export const ImageAndFallback: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {[
        { caption: 'Image loads', src: NINA },
        { caption: 'No image', src: undefined },
        { caption: 'Image fails', src: BROKEN },
      ].map(({ caption, src }) => (
        <div key={caption} className="flex flex-col items-center gap-2">
          <Avatar name="Nina Park" src={src} size="lg" />
          <span className="text-xs text-ink-subtle">{caption}</span>
        </div>
      ))}
    </div>
  ),
};

/** `square` steps its corner with the size, so the corner stays in proportion. */
export const Shape: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['circle', 'square'] as const).map((shape) => (
        <div key={shape} className="flex items-end gap-4">
          <span className="w-14 font-mono text-xs text-ink-subtle">{shape}</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Avatar key={size} name="Omar Haddad" src={OMAR} size={size} shape={shape} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** The name picks one of the 12 hues, so a person keeps one color everywhere with nothing stored. */
export const HashedColors: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {PEOPLE.map((name) => (
        <div key={name} className="flex items-center gap-2">
          <Avatar name={name} size="md" />
          <span className="text-sm text-ink">{name}</span>
          <span className="font-mono text-xs text-ink-subtle">{hashHue(name)}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * A stack overlaps its avatars and parts them with a ring in `bg-surface`,
 * which follows the depth, so it disappears into a card at any depth. Past
 * `max`, the rest become a count.
 */
export const Group: Story = {
  render: () => (
    <Card className="w-fit gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-8 font-mono text-xs text-ink-subtle">{size}</span>
          <AvatarGroup
            size={size}
            people={[
              { name: 'Nina Park', src: NINA },
              { name: 'Omar Haddad', src: OMAR },
              { name: 'Lena Novak', src: LENA },
              { name: 'Jonas Berg' },
              { name: 'Priya Shah' },
            ]}
          />
        </div>
      ))}
    </Card>
  ),
};
