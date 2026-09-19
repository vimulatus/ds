import { ArrowSquareOut, Copy, PencilSimple, PushPin, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import {
  Drawer,
  DrawerContent,
  DrawerItem,
  DrawerLabel,
  DrawerSection,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/Drawer';
import { PHONE } from '../phone';

/**
 * The phone sheet, on Base UI's Drawer. It sits flush on the bottom and side
 * edges of the screen with a flat bottom edge, rounds only its top corners,
 * and is the same glass as a menu. It follows the finger: drag it down past
 * the threshold, or flick it, to dismiss. The bottom padding clears the home
 * indicator, and the body scrolls past 85% of the screen.
 *
 * Parts: `DrawerSection` (a tinted group of rows), `DrawerLabel` (the
 * group's heading) and `DrawerItem` (a 44px row). `Dialog` and
 * `ConfirmDialog` render through this sheet in touch mode.
 */
const meta = {
  title: 'Primitives/Drawer',
  component: Drawer,
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function DocumentActions() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<Button variant="outlined" />}>Document actions</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Launch plan</DrawerTitle>
        <DrawerSection>
          <DrawerItem onClick={close}>
            <ArrowSquareOut />
            Open in new tab
          </DrawerItem>
          <DrawerItem onClick={close}>
            <Copy />
            Copy link
          </DrawerItem>
          <DrawerItem onClick={close}>
            <PushPin />
            Pin to sidebar
          </DrawerItem>
        </DrawerSection>
        <div>
          <DrawerLabel>Edit</DrawerLabel>
          <DrawerSection>
            <DrawerItem onClick={close}>
              <PencilSimple />
              Rename
            </DrawerItem>
            <DrawerItem destructive onClick={close}>
              <Trash />
              Move to Trash
            </DrawerItem>
          </DrawerSection>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** A document's action sheet: two groups of rows, the destructive one last. */
export const ActionSheet: Story = {
  ...PHONE,
  render: () => <DocumentActions />,
};

/** The sheet works with a mouse too: drag it down to dismiss. */
export const Desktop: Story = {
  render: () => <DocumentActions />,
};
