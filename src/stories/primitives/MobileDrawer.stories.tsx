import { ArrowSquareOut, Copy, PencilSimple, PushPin, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { MobileDrawer } from '@/components/MobileDrawer';
import { PHONE } from '../phone';

/**
 * The phone sheet, on Base UI's drawer. It sits flush on the bottom and side
 * edges of the screen, rounds only its top corners (`mobile-sheet`), and is
 * the same glass as a desktop menu. Parts: `Handle`, `Section` (a tinted
 * group of rows), `Label` (the group's heading), `Item` (a 44px row) and
 * `ScrollBody`, which scrolls when the content outgrows 80% of the screen.
 *
 * `Dialog` and `ConfirmDialog` render through this on a phone.
 */
const meta = {
  title: 'Primitives/MobileDrawer',
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const ROW_ICON = 'size-5 text-ink-muted';

function ActionSheetDemo() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <MobileDrawer open={open} onOpenChange={setOpen} side="bottom">
      <MobileDrawer.Trigger render={<Button variant="outlined" />}>Document actions</MobileDrawer.Trigger>
      <MobileDrawer.Portal>
        <MobileDrawer.Overlay />
        <MobileDrawer.Content>
          <MobileDrawer.Handle />
          <MobileDrawer.Title className="sr-only">Launch plan</MobileDrawer.Title>
          <MobileDrawer.ScrollBody className="gap-4">
            <MobileDrawer.Section>
              <MobileDrawer.Item onClick={close}>
                <ArrowSquareOut className={ROW_ICON} />
                Open in new tab
              </MobileDrawer.Item>
              <MobileDrawer.Item onClick={close}>
                <Copy className={ROW_ICON} />
                Copy link
              </MobileDrawer.Item>
              <MobileDrawer.Item onClick={close}>
                <PushPin className={ROW_ICON} />
                Pin to sidebar
              </MobileDrawer.Item>
            </MobileDrawer.Section>
            <div>
              <MobileDrawer.Label>Edit</MobileDrawer.Label>
              <MobileDrawer.Section>
                <MobileDrawer.Item onClick={close}>
                  <PencilSimple className={ROW_ICON} />
                  Rename
                </MobileDrawer.Item>
                <MobileDrawer.Item className="text-failure" onClick={close}>
                  <Trash className="size-5" />
                  Move to Trash
                </MobileDrawer.Item>
              </MobileDrawer.Section>
            </div>
          </MobileDrawer.ScrollBody>
        </MobileDrawer.Content>
      </MobileDrawer.Portal>
    </MobileDrawer>
  );
}

/** A document's action sheet: two groups of rows, the destructive one last. */
export const ActionSheet: Story = {
  ...PHONE,
  render: () => <ActionSheetDemo />,
};
