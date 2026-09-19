import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Dialog';
import { Input } from '@/components/Input';
import { PHONE } from '../phone';

/**
 * A modal task. On desktop it is a `bg-dialog` panel, `rounded-xl`, over a
 * `scrim-glass` that fades in while the panel scales up with `dialog-content-open-animation`.
 *
 * In touch mode the same parts render as the phone sheet (`Drawer`): flush
 * with the bottom and sides of the screen, rounded only on top, with a drag
 * handle. The header's close button drops out there, because a swipe or a
 * tap on the scrim closes the sheet.
 */
const meta = {
  title: 'Primitives/Dialog',
  component: Dialog,
  parameters: { docs: { story: { inline: false, iframeHeight: 420 } } },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function RenameDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outlined" />}>Rename</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>Everyone with access sees the new name.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Input defaultValue="Launch plan" aria-label="Name" />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button variant="cta" onClick={() => setOpen(false)}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = { render: () => <RenameDialog /> };

/** The same dialog on a phone. Drag the handle down to dismiss. */
export const Phone: Story = {
  ...PHONE,
  render: () => <RenameDialog />,
};
