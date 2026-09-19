import { MagnifyingGlass } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';

/**
 * A short label on hover, after 400ms. It paints `bg-tooltip` at depth 3,
 * `rounded-lg`, `text-xs` in `text-ink-muted`, and flips to stay on screen.
 * `shortcut` renders the keys beside the label; an array is a chord, joined
 * by "then".
 *
 * A `Button` with `label` or `shortcut` wraps itself in a tooltip, so most
 * call sites never use `Tooltip` directly.
 *
 * A tooltip is a label, and hover has no thumb. Information the user must
 * reach on a phone is a `Callout`, which opens on tap.
 */
const meta = {
  title: 'Menus/Tooltip',
  component: Tooltip,
  parameters: { docs: { story: { inline: false, iframeHeight: 200 } } },
  args: { label: 'Search' },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placements: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-12">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Tooltip key={placement} label={`Placed ${placement}`} placement={placement}>
          <Button variant="outlined">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Shortcut: Story = {
  render: () => (
    <div className="flex gap-3">
      <Tooltip label="Search" shortcut="cmd+k">
        <Button variant="ghost" size="icon-sm" aria-label="Search">
          <MagnifyingGlass />
        </Button>
      </Tooltip>
      <Tooltip label="Go to projects" shortcut={['g', 'p']}>
        <Button variant="outlined">Projects</Button>
      </Tooltip>
    </div>
  ),
};

/** The Button shorthand: `label` names the button and becomes its tooltip. */
export const ViaButton: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button variant="outlined" size="icon-sm" label="Search" shortcut="cmd+k">
        <MagnifyingGlass />
      </Button>
      <Tooltip label="Permanently deletes the selection">
        <Button variant="ghost">Delete</Button>
      </Tooltip>
    </div>
  ),
};

/** `disabled` keeps the trigger and never opens the tooltip. */
export const Disabled: Story = {
  render: () => (
    <Tooltip label="You won't see this" disabled>
      <Button variant="outlined">No tooltip</Button>
    </Tooltip>
  ),
};
