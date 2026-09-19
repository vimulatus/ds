import { MagnifyingGlass } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';

/**
 * A short label on hover or focus, after 400ms. It paints `bg-tooltip`,
 * `rounded-md`, `text-xs`, and flips to stay on screen. `shortcut` renders
 * the keys after the label.
 *
 * A `Button` with `label` wraps itself in a tooltip, so most call sites never
 * use `Tooltip` directly. A tooltip is a label, and hover has no thumb:
 * never put information a person needs on a phone only in a tooltip.
 */
const meta = {
  title: 'Menus/Tooltip',
  component: Tooltip,
  parameters: { docs: { story: { inline: false, iframeHeight: 200 } } },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj;

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-12">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} content={`Placed ${side}`} side={side}>
          <Button variant="outlined">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Shortcut: Story = {
  render: () => (
    <Tooltip content="Search" shortcut="⌘K">
      <Button variant="ghost" size="icon-sm" aria-label="Search">
        <MagnifyingGlass />
      </Button>
    </Tooltip>
  ),
};

/** The Button shorthand: `label` names the button and becomes its tooltip. */
export const ViaButton: Story = {
  render: () => (
    <Button variant="outlined" size="icon-sm" label="Search" shortcut="⌘K">
      <MagnifyingGlass />
    </Button>
  ),
};

/** `disabled` keeps the trigger and never opens the tooltip. */
export const Disabled: Story = {
  render: () => (
    <Tooltip content="You won't see this" disabled>
      <Button variant="outlined">No tooltip</Button>
    </Tooltip>
  ),
};
