import { X } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { Input } from '@/components/Input';
import { PHONE } from '../phone';

/**
 * The modal (`Dialog` in code). A floating dialog is a pane of glass on the
 * menu color. Behind it, `scrim-glass` dims the page by a tenth and washes it
 * with the theme accent at single-digit strength, so the page warms toward
 * the accent instead of going gray.
 *
 * On a phone the same dialog is a bottom sheet: a glass drawer with a drag
 * handle, flush with the bottom of the screen. `Dialog.CloseButton` renders
 * nothing there, because a swipe or a tap on the scrim closes the sheet.
 */
const meta = {
  title: 'Primitives/Modal',
  component: Dialog,
  parameters: { docs: { story: { inline: false, iframeHeight: 420 } } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function RenameDialog({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen} animate className="w-104">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-sm font-semibold text-ink">Rename document</Dialog.Title>
              <Dialog.Description className="text-sm text-ink-muted">
                Everyone with access sees the new name.
              </Dialog.Description>
            </div>
            <Dialog.CloseButton
              className="rounded-md p-1 text-ink-muted hover:bg-hover hover:text-ink"
              aria-label="Close"
            >
              <X className="size-4" />
            </Dialog.CloseButton>
          </div>
          <Input defaultValue="Launch plan" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="cta" onClick={() => setOpen(false)}>
              Rename
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export const Default: Story = {
  render: () => <RenameDialog label="Rename" />,
};

/** The same rename dialog on a phone. Drag the handle down to dismiss. */
export const Phone: Story = {
  ...PHONE,
  render: () => <RenameDialog label="Rename" />,
};
