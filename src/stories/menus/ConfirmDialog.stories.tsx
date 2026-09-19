import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { ConfirmDialog, confirm } from '@/components/ConfirmDialog';
import { PHONE } from '../phone';

/**
 * A yes-or-no question before an action that is hard to take back, on Base
 * UI's AlertDialog. The confirm button is the `cta`, or `danger` with
 * `destructive`. While `pending`, both buttons disable and the dialog
 * ignores Escape and the scrim.
 *
 * In touch mode the same props render the phone sheet with full-width
 * buttons, confirm on top. `confirm()` opens either one from code and
 * resolves with the choice.
 */
const meta = {
  title: 'Menus/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { docs: { story: { inline: false, iframeHeight: 320 } } },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj;

type DemoProps = {
  trigger: string;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  slow?: boolean;
};

function Demo({ trigger, slow, ...props }: DemoProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const onConfirm = () => {
    if (!slow) return setOpen(false);
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setOpen(false);
    }, 1500);
  };
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <ConfirmDialog {...props} open={open} onOpenChange={setOpen} onConfirm={onConfirm} pending={pending} />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Demo
      trigger="Leave team"
      title="Leave Design?"
      description="You lose access to its documents until someone invites you back."
      confirmLabel="Leave"
    />
  ),
};

/** `destructive` turns the confirm button `danger`. */
export const Destructive: Story = {
  render: () => (
    <Demo
      trigger="Delete document"
      title="Delete Launch plan?"
      description="This can't be undone."
      confirmLabel="Delete"
      destructive
    />
  ),
};

/** Confirm runs for 1.5 seconds. Escape and the scrim do nothing meanwhile. */
export const Pending: Story = {
  render: () => (
    <Demo
      trigger="Publish"
      title="Publish to the web?"
      description="Anyone with the link can read it."
      confirmLabel="Publish"
      slow
    />
  ),
};

function Imperative() {
  const [result, setResult] = useState<string>();
  const archive = async () => {
    const ok = await confirm({
      title: 'Archive 3 tasks?',
      description: 'They leave your list. You can find them in Archive.',
      confirmLabel: 'Archive',
    });
    setResult(ok ? 'Archived' : 'Cancelled');
  };
  return (
    <div className="flex items-center gap-3">
      <Button variant="outlined" onClick={archive}>
        Archive tasks
      </Button>
      <span className="text-sm text-ink-muted">{result}</span>
    </div>
  );
}

/**
 * `confirm()` opens the dialog from an event handler and resolves `true` or
 * `false` once it has animated out. It needs `<ConfirmHost />` mounted once;
 * this Storybook mounts it in the preview.
 */
export const FromCode: Story = { render: () => <Imperative /> };

/** The phone sheet: stacked full-width buttons, confirm on top. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <Demo
        trigger="Delete document"
        title="Delete Launch plan?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
      />
      <Demo
        trigger="Publish"
        title="Publish to the web?"
        description="Anyone with the link can read it."
        confirmLabel="Publish"
        slow
      />
    </div>
  ),
};

/** `confirm()` on a phone resolves after the sheet slides away. */
export const PhoneFromCode: Story = {
  ...PHONE,
  render: () => <Imperative />,
};
