import { CaretDown, Check } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, badgeClasses } from '@/components/Badge';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import { HUES } from '@/lib/hue';

/**
 * A count or a short label for status and tags. It shares Button's size
 * scale, so a badge and a button of one size sit on one line.
 *
 * - **Do** keep it to a word or two.
 * - **Do** use a hue for identity (a tag, a team) and `success`-style
 *   meaning only through its words.
 * - **Don't** put a click handler on `Badge`: it is a `span`. Use
 *   `badgeClasses` on a real button.
 */
const meta = {
  title: 'Parts/Badge',
  component: Badge,
  args: { children: 'In review', variant: 'outlined', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'outlined'] },
    size: { control: 'select', options: ['sm', 'md'] },
    hue: { control: 'select', options: [undefined, 'accent', ...HUES] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** `ghost` when the container already separates it, `outlined` when it needs its own edge. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['ghost', 'outlined'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-16 font-mono text-xs text-ink-subtle">{variant}</span>
          <Badge variant={variant}>Draft</Badge>
          <Badge variant={variant}>
            <Check />
            Approved
          </Badge>
        </div>
      ))}
    </div>
  ),
};

/** Heights match Button `sm` (20px badge in a 24px row) and `md`. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Badge size={size}>Badge</Badge>
          <Button variant="outlined" size={size}>
            Button
          </Button>
        </div>
      ))}
    </div>
  ),
};

/** A count uses tabular figures on the accent tint. */
export const Count: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge hue="accent" size="sm">
        3
      </Badge>
      <Badge hue="accent" size="sm">
        12
      </Badge>
      <Badge hue="accent" size="sm">
        99+
      </Badge>
    </div>
  ),
};

/** A tinted badge drops its edge. Each hue reads in both themes. */
export const Hues: Story = {
  render: () => (
    <div className="flex max-w-lg flex-wrap gap-2">
      <Badge hue="accent">accent</Badge>
      {HUES.map((hue) => (
        <Badge key={hue} hue={hue}>
          {hue}
        </Badge>
      ))}
    </div>
  ),
};

/** `badgeClasses` gives a real button the badge shape, for the visible half of a menu trigger. */
export const AsTrigger: Story = {
  render: () => (
    <button type="button" className={cn(badgeClasses({ size: 'sm' }), 'hover:bg-hover hover:text-ink')}>
      In review
      <CaretDown />
    </button>
  ),
};
