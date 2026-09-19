import { Info } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Callout, PinnedCallout } from '@/components/Callout';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Dialog';
import { TextField } from '@/components/TextField';

/**
 * A short note anchored to a control. `default` paints the tooltip surface
 * and opens on hover or tap, so a phone can reach it. `danger` paints the
 * failure hue as a 15% tint over that surface. A pinned callout stays while
 * a state holds: every field error is a pinned danger callout.
 *
 * A field error goes right when there is room, else under its control. It
 * never covers the label above.
 */
const meta = {
  title: 'Menus/Callout',
  component: Callout,
  args: {
    content: 'Everyone on the team can open this file. Sharing settings live on the team page.',
    variant: 'default',
    side: 'right',
    children: (
      <Button size="icon-sm" aria-label="Why">
        <Info />
      </Button>
    ),
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'danger'] },
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    children: { control: false },
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 240 } } },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Hover for 400ms or tap to open. Leaving, a tap away or Escape closes it.
 * Focus stays on the trigger, and the trigger has no tooltip of its own.
 */
export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 p-8">
      <span className="text-sm text-ink">Shared with the team</span>
      <Callout {...args} />
    </div>
  ),
};

/**
 * A field error pins a danger callout beside the input. Type a valid value
 * to clear it. Narrow the viewport and the callout drops under the field.
 */
export const Danger: Story = {
  render: function Render() {
    const [value, setValue] = useState('launch plan');
    const valid = /^[A-Za-z0-9_-]+$/.test(value);
    return (
      <div className="p-8">
        <TextField
          fieldClassName="max-w-xs"
          label="Tag"
          description="Letters, numbers, dashes and underscores."
          value={value}
          onValueChange={setValue}
          invalid={!valid}
          error="Use letters, numbers, dashes and underscores."
          spellCheck={false}
        />
      </div>
    );
  },
};

/** Pinned callouts around one anchor, one per side. */
export const Placements: Story = {
  render: function Render() {
    const anchor = useRef<HTMLDivElement>(null);
    return (
      <div className="flex items-center justify-center p-24">
        <div ref={anchor} className="rounded-md border border-edge px-4 py-2 text-sm text-ink">
          Anchor
        </div>
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <PinnedCallout
            key={side}
            anchor={anchor}
            placement={side}
            variant={side === 'bottom' ? 'danger' : 'default'}
          >
            Placed {side}
          </PinnedCallout>
        ))}
      </div>
    );
  },
};

/**
 * A pinned callout never joins the dismiss stack, so Escape and a tap on
 * the backdrop still close the dialog while a field is invalid.
 */
export const InADialog: Story = {
  name: 'In a dialog',
  render: () => (
    <div className="p-8">
      <Dialog>
        <DialogTrigger render={<Button variant="outlined" />}>New tag</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New tag</DialogTitle>
          </DialogHeader>
          <TextField
            label="Tag"
            defaultValue="launch plan"
            invalid
            error="Use letters, numbers, dashes and underscores."
            spellCheck={false}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button variant="cta" disabled>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};
