import { User } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup } from '@/components/Avatar';
import { getHashedPaletteColor } from '@/lib/hue';

/** A flat head-and-shoulders portrait as an inline SVG, so stories load offline. */
function portrait(background: string, skin: string, hair: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${background}"/><ellipse cx="32" cy="62" rx="22" ry="16" fill="${hair}"/><circle cx="32" cy="27" r="12" fill="${skin}"/><path d="M20 25a12 12 0 0 1 24 0c-4-5-9-6-12-6s-8 1-12 6z" fill="${hair}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const TEO = portrait('#8fb3e0', '#f1c9a5', '#3b2a20');
const ADA = portrait('#e0a88f', '#c68c63', '#1d1a19');
const MIRA = portrait('#a5d6a7', '#f6d7bd', '#b0542b');
const BROKEN = 'data:image/png;base64,broken';

const PEOPLE = ['Teo Chen', 'Ada Okafor', 'Mira Sato', 'Jonas Berg', 'Lena Ruiz'];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

/**
 * A person: an image, initials or an icon. Set `size` and `shape` on the
 * root; `Avatar.Image` and `Avatar.Fallback` inherit them.
 *
 * - **Do** always render an `Avatar.Fallback` beside `Avatar.Image`: it is
 *   what shows when the source 404s.
 * - **Do** give `Avatar.Image` an `alt`, or `alt=""` when the name is already
 *   beside it.
 * - **Do** match the `size` on `AvatarGroup`, every child `Avatar`, and
 *   `AvatarGroup.Count`.
 * - **Do** override `--avatar-group-separator` when the background behind a
 *   group changes.
 * - **Don't** render `Avatar.Image` only when a URL exists, with the fallback
 *   otherwise: that covers a missing URL, not a broken one.
 * - **Don't** add a `ring-*` class to an Avatar: that slot belongs to
 *   AvatarGroup's separator. The edge hairline is an outline for this reason.
 * - **Don't** use `size="fill"` without giving the parent a size; the avatar
 *   collapses.
 * - **Don't** hand-roll a circular image; the hairline and fallback are the
 *   reason this component exists.
 */
const meta = {
  title: 'Parts/Avatar',
  component: Avatar,
  args: { size: 'lg', shape: 'rounded', highlightEdge: true },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['rounded', 'square'] },
  },
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Image src={TEO} alt="Teo" />
      <Avatar.Fallback>TC</Avatar.Fallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * `sm` (16px) is the list and inline default, `md` (24px) suits rows with
 * more room, `lg` (40px) is for profile headers. `fill` takes the size of its
 * container, so give that container the dimensions.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-1.5">
          <Avatar size={size}>
            <Avatar.Fallback>TC</Avatar.Fallback>
          </Avatar>
          <span className="font-mono text-xs text-ink-subtle">{size}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-1.5">
        <div className="size-16">
          <Avatar size="fill">
            <Avatar.Fallback>TC</Avatar.Fallback>
          </Avatar>
        </div>
        <span className="font-mono text-xs text-ink-subtle">fill</span>
      </div>
    </div>
  ),
};

/**
 * Render both children together. `Avatar.Image` covers the fallback once it
 * loads, and never shows if the source fails, so the fallback stays instead
 * of the browser's broken-image glyph. Fallback text scales with the size.
 */
export const ImageAndFallback: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      {[
        { caption: 'Image loads', src: TEO },
        { caption: 'No image', src: undefined },
        { caption: 'Image fails', src: BROKEN },
      ].map(({ caption, src }) => (
        <div key={caption} className="flex flex-col items-center gap-2">
          <Avatar size="lg">
            {src && <Avatar.Image src={src} alt="Teo" />}
            <Avatar.Fallback>TC</Avatar.Fallback>
          </Avatar>
          <span className="text-xs text-ink-subtle">{caption}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-2">
        <Avatar size="lg">
          <User />
        </Avatar>
        <span className="text-xs text-ink-subtle">Icon</span>
      </div>
    </div>
  ),
};

/**
 * `highlightEdge` draws a 1px inset hairline: dark on dark themes, light on
 * light ones, so the avatar settles into the page. It never changes the
 * avatar's footprint. It is off by default.
 */
export const EdgeHairline: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      {[true, false].map((edge) => (
        <div key={String(edge)} className="flex flex-col items-center gap-2">
          <div className="size-20">
            <Avatar size="fill" highlightEdge={edge}>
              <Avatar.Image src={TEO} alt="" />
            </Avatar>
          </div>
          <span className="text-xs text-ink-subtle">{edge ? 'With hairline' : 'Without'}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * `rounded` is the default circle. `square` steps its corner radius with the
 * size, `rounded-sm` at `sm` through `rounded-lg` at `lg`, so the corner stays
 * proportional.
 */
export const Shape: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['rounded', 'square'] as const).map((shape) => (
        <div key={shape} className="flex items-end gap-4">
          <span className="w-16 font-mono text-xs text-ink-subtle">{shape}</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col items-center gap-1.5">
              <Avatar size={size} shape={shape} highlightEdge>
                <Avatar.Image src={TEO} alt="Teo" />
              </Avatar>
              <span className="font-mono text-xs text-ink-subtle">{size}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * `getHashedPaletteColor` maps a stable id to one of the twelve palette
 * colors, so a person keeps the same color everywhere without storing one.
 */
export const HashedColors: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {PEOPLE.map((name) => (
        <div key={name} className="flex items-center gap-2">
          <Avatar size="md" style={{ backgroundColor: `var(--color-${getHashedPaletteColor(name)})` }}>
            <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
          </Avatar>
          <span className="text-sm text-ink">{name}</span>
          <span className="font-mono text-xs text-ink-subtle">{getHashedPaletteColor(name)}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * `AvatarGroup` overlaps its children and adds a separator ring sized to
 * match. `AvatarGroup.Count` closes out the overflow. Pass the same `size` to
 * the group and to every child.
 */
export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-8 font-mono text-xs text-ink-subtle">{size}</span>
          <AvatarGroup size={size}>
            {[TEO, ADA, MIRA].map((src) => (
              <Avatar key={src} size={size}>
                <Avatar.Image src={src} alt="" />
              </Avatar>
            ))}
            <AvatarGroup.Count size={size}>+3</AvatarGroup.Count>
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
};

/**
 * The separator ring defaults to `--color-surface`. When the row behind it
 * changes color, point `--avatar-group-separator` at the new background so
 * the ring keeps disappearing into it. Hover a row.
 */
export const GroupOnHover: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-1">
      {['Design review', 'Launch checklist'].map((label) => (
        <div
          key={label}
          className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-hover hover:[--avatar-group-separator:var(--color-hover)]"
        >
          <span className="text-sm text-ink">{label}</span>
          <AvatarGroup size="sm">
            <Avatar size="sm">
              <Avatar.Image src={TEO} alt="Teo" />
            </Avatar>
            <Avatar size="sm">
              <Avatar.Image src={ADA} alt="Ada" />
            </Avatar>
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
};
