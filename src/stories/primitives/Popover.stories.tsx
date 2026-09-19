import { Funnel } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { Popover } from '@/components/Popover';

const PALETTE = {
  red: 'bg-red-bg text-red-ink',
  amber: 'bg-amber-bg text-amber-ink',
  green: 'bg-green-bg text-green-ink',
  teal: 'bg-teal-bg text-teal-ink',
  blue: 'bg-blue-bg text-blue-ink',
  violet: 'bg-violet-bg text-violet-ink',
  pink: 'bg-pink-bg text-pink-ink',
};

/**
 * Anchored, interactive floating content. It paints the menu surface:
 * `glass` on `bg-menu-glass`, depth 2, radius `xl`, and the 120ms
 * `menu-open` animation growing from the trigger.
 */
const meta = {
  title: 'Primitives/Popover',
  component: Popover,
  parameters: { docs: { story: { inline: false, iframeHeight: 320 } } },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Popover gutter={6} placement="bottom-start">
      <Popover.Trigger render={<Button variant="outlined" />}>
        <Funnel />
        Filter
      </Popover.Trigger>
      <Popover.Content className="flex w-64 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Popover.Title>Filter by label</Popover.Title>
          <Popover.Description>Labels take a hue from the named palette.</Popover.Description>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PALETTE).map(([color, classes]) => (
            <span key={color} className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
              {color}
            </span>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  ),
};
