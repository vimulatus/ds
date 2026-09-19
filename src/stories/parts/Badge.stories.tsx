import { CaretDown, Check } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeVariant, badgeTriggerClasses } from '@/components/Badge';
import { Button } from '@/components/Button';

const VARIANTS: BadgeVariant[] = ['ghost', 'outlined'];

/**
 * A small, non-interactive label for status, counts, and tags. Shares
 * Button's size scale so a badge and a button of the same size sit on the
 * same line cleanly.
 *
 * - **Do** keep badge text to a word or two.
 * - **Do** use `badgeTriggerClasses` when a badge needs to behave like a button.
 * - **Do** use a palette color for identity (tags, calendars) and a semantic
 *   color for state.
 * - **Don't** attach a click handler to `Badge` directly: it renders a `span`.
 * - **Don't** use a badge where a Tooltip would carry the information better.
 */
const meta = {
  title: 'Parts/Badge',
  component: Badge,
  args: { variant: 'outlined', size: 'md', children: 'Badge' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * `ghost` when the surrounding container already provides separation,
 * `outlined` when the badge needs its own edge.
 */
export const Variants: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-mono text-xs text-ink-subtle">{variant}</span>
          <Badge variant={variant}>Badge</Badge>
          <Badge variant={variant}>
            <Check />
            With icon
          </Badge>
        </div>
      ))}
    </div>
  ),
};

/** Matches the Button `sm` and `md` control sizes. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-3">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-col items-start gap-1.5">
          <span className="font-mono text-xs text-ink-subtle">{size}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outlined" size={size}>
              Badge
            </Badge>
            <Button variant="outlined" size={size}>
              Button
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Badges take arbitrary children: a color dot for a tag, a status glyph, a
 * caret when the badge is the visible half of a menu trigger.
 */
export const ComposedContent: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outlined" size="sm">
        <span aria-hidden className="size-2 rounded-full bg-blue" />
        design
      </Badge>
      <Badge variant="outlined" size="sm">
        <span aria-hidden className="size-2 rounded-full bg-pink" />
        tags-ux
      </Badge>
      <Badge variant="outlined" size="sm">
        <span className="inline-flex size-[1em] items-center justify-center rounded-full bg-green text-surface-4">
          <Check aria-hidden className="size-[0.65em]" />
        </span>
        Completed
        <CaretDown aria-hidden />
      </Badge>
    </div>
  ),
};

/**
 * `badgeTriggerClasses` gives a real `button` the badge shape with Button's
 * hover, press and focus states. Use it instead of a click handler on `Badge`.
 */
export const AsTrigger: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <button type="button" className={badgeTriggerClasses({ variant: 'outlined', size: 'sm' })}>
        <span aria-hidden className="size-2 rounded-full bg-violet" />
        In review
        <CaretDown aria-hidden />
      </button>
      <button type="button" className={badgeTriggerClasses({ size: 'sm' })}>
        3 more
      </button>
    </div>
  ),
};
