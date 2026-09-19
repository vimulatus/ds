import { Funnel } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/Popover';

const HUES = {
  red: 'bg-red-bg text-red-ink',
  amber: 'bg-amber-bg text-amber-ink',
  green: 'bg-green-bg text-green-ink',
  teal: 'bg-teal-bg text-teal-ink',
  blue: 'bg-blue-bg text-blue-ink',
  violet: 'bg-violet-bg text-violet-ink',
  pink: 'bg-pink-bg text-pink-ink',
};

/**
 * Interactive content anchored to a trigger: a filter, a picker, a short
 * form. It paints the menu's surface: glass on `bg-menu-glass`, `rounded-lg`,
 * growing from the trigger with `motion-pop`. Use `Tooltip` for a label and
 * `Menu` for a list of actions.
 */
const meta = {
  title: 'Primitives/Popover',
  component: Popover,
  parameters: { docs: { story: { inline: false, iframeHeight: 320 } } },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Funnel />
        Filter
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-1">
          <PopoverTitle>Filter by label</PopoverTitle>
          <PopoverDescription>Labels take a hue from the named palette.</PopoverDescription>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(HUES).map(([hue, classes]) => (
            <span key={hue} className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
              {hue}
            </span>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  ),
};
