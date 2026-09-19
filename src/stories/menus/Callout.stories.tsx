import { Info } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Callout } from '@/components/Callout';
import { Dialog } from '@/components/Dialog';
import { TextField } from '@/components/TextField';

/**
 * A short note anchored to a control. `default` paints the tooltip surface
 * and opens on hover or tap, so a phone can reach it. `danger` paints the failure hue
 * as a 15% tint over that surface, and is pinned: it stays while a state
 * holds. Every form control's `ErrorMessage` is a pinned danger callout.
 *
 * A callout goes right when there is room, else under its anchor. It never
 * covers the label above.
 */
const meta = {
  title: 'Menus/Callout',
  component: Callout,
  parameters: { docs: { story: { inline: false, iframeHeight: 240 } } },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or tap opens it. Leaving, a tap away or Escape closes it. Focus stays on the trigger. */
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-8">
      <span className="text-sm text-ink">Shared with the workspace</span>
      <Callout placement="right">
        <Callout.Trigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Why">
              <Info />
            </Button>
          }
        />
        <Callout.Content>
          Everyone in the workspace can open this file. Sharing settings live on the workspace.
        </Callout.Content>
      </Callout>
    </div>
  ),
};

/**
 * `TextField.ErrorMessage` pins a danger callout beside the input. Type a
 * valid value to clear it. Narrow the viewport and the callout drops under
 * the field.
 */
export const Danger: Story = {
  render: function Render() {
    const [value, setValue] = useState('code owner');
    const valid = /^[A-Za-z0-9_-]+$/.test(value);
    return (
      <div className="p-8">
        <TextField
          className="max-w-xs"
          value={value}
          onChange={setValue}
          validationState={valid ? 'valid' : 'invalid'}
        >
          <TextField.Label>Kind</TextField.Label>
          <TextField.Input spellCheck={false} />
          <TextField.Description>Letters, numbers, dashes and underscores.</TextField.Description>
          <TextField.ErrorMessage>Use letters, numbers, dashes and underscores.</TextField.ErrorMessage>
        </TextField>
      </div>
    );
  },
};

/** Pinned callouts around one anchor, one per placement. */
export const Placements: Story = {
  render: function Render() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
      <div className="flex items-center justify-center p-24">
        <div ref={setAnchor} className="rounded-md border border-edge px-4 py-2 text-sm text-ink">
          Anchor
        </div>
        {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
          <Callout key={placement} pinned open anchorRef={anchor} placement={placement} flip={false}>
            <Callout.Content variant={placement === 'bottom' ? 'danger' : 'default'}>
              Placed {placement}
            </Callout.Content>
          </Callout>
        ))}
      </div>
    );
  },
};

/**
 * A pinned callout never joins the dismiss stack, so Escape and a tap on
 * the scrim still close the dialog while a field is invalid.
 */
export const InADialog: Story = {
  name: 'In a dialog',
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button variant="outlined" onClick={() => setOpen(true)}>
          New kind
        </Button>
        <Dialog open={open} onOpenChange={setOpen} className="w-104">
          <div className="flex flex-col gap-4 p-4">
            <Dialog.Title className="text-sm font-semibold text-ink">New kind</Dialog.Title>
            <TextField validationState="invalid" defaultValue="code owner">
              <TextField.Label>Kind</TextField.Label>
              <TextField.Input spellCheck={false} />
              <TextField.ErrorMessage>Use letters, numbers, dashes and underscores.</TextField.ErrorMessage>
            </TextField>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="cta" disabled>
                Save
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  },
};
