import { Plus } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { cn } from '@/lib/cn';

/**
 * Controls come in two heights, and every control reads the same scale.
 * A bigger box gets a bigger radius.
 */
const meta = {
  title: 'Foundations/Sizing',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `sm` is 24px and `md` is 32px. Pick one size for a row of controls and
 * their tops and bottoms match. In touch mode an `md` field or button is 40px tall, and an `sm` button is 32px.
 */
export const ControlHeights: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(
        [
          { name: 'sm', px: 24, size: 'sm' },
          { name: 'md', px: 32, size: 'md' },
        ] as const
      ).map((row) => (
        <div key={row.name} className="grid grid-cols-[4rem_3rem_1fr] items-center gap-3">
          <span className="font-mono text-xs text-ink">{row.name}</span>
          <span className="text-xs text-ink-subtle">{row.px}px</span>
          <div className="flex max-w-md items-center gap-2">
            <Input size={row.size} placeholder="Title" />
            <Button variant="outlined" size={row.size}>
              <Plus />
              Add
            </Button>
          </div>
        </div>
      ))}
      <div className="grid grid-cols-[4rem_3rem_1fr] items-center gap-3">
        <span className="font-mono text-xs text-ink">touch</span>
        <span className="text-xs text-ink-subtle">40px</span>
        <div className="max-w-md">
          <Input placeholder="Title" className="h-10 text-base" />
        </div>
      </div>
    </div>
  ),
};

const RADII = [
  { name: 'rounded-sm', className: 'rounded-sm', px: 4, use: 'Chips, small marks' },
  { name: 'rounded-md', className: 'rounded-md', px: 6, use: 'Buttons, inputs, menu rows' },
  { name: 'rounded-lg', className: 'rounded-lg', px: 8, use: 'List rows, tiles' },
  { name: 'rounded-xl', className: 'rounded-xl', px: 12, use: 'Cards, menus, dialogs' },
  { name: 'rounded-full', className: 'rounded-full', px: 9999, use: 'Pills, avatars' },
];

/** Nested corners step up: `rounded-md` for a row, `rounded-xl` for its container. */
export const Radius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {RADII.map((radius) => (
        <div key={radius.name} className="flex w-36 flex-col gap-1.5">
          <div className={cn('h-16 border border-edge bg-surface', radius.className)} />
          <span className="font-mono text-xs text-ink">{radius.name}</span>
          <span className="text-xs text-ink-subtle">
            {radius.px === 9999 ? 'full' : `${radius.px}px`}, {radius.use}
          </span>
        </div>
      ))}
    </div>
  ),
};

/** Icons follow the control: 14px in `sm`, 16px in `md`. */
export const Icons: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="icon-sm" variant="outlined" label="Add, small">
        <Plus />
      </Button>
      <Button size="icon-md" variant="outlined" label="Add">
        <Plus />
      </Button>
    </div>
  ),
};
