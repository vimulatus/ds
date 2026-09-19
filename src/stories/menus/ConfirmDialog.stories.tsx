import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { ConfirmDialog, confirmDialog } from '@/components/ConfirmDialog';
import { PHONE } from '../phone';

/**
 * The shared yes-or-no dialog. It sits on the modal's glass, a depth-2
 * surface inside. `tone` sets the confirm button's variant: `accent` by
 * default, `danger` for destructive work, and `success` (a `cta` button) for
 * a positive commit. While `pending`, both buttons disable and the dialog
 * ignores dismissal.
 *
 * On a phone the same props render `ConfirmDrawer`, a bottom sheet with two
 * full-width pill buttons. `confirmDialog()` opens either one from code and
 * resolves with the choice.
 */
const meta = {
  title: 'Menus/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { docs: { story: { inline: false, iframeHeight: 320 } } },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj;

function Demo(props: {
  trigger: string;
  tone?: 'default' | 'danger' | 'success';
  title: string;
  body: string;
  confirmLabel: string;
  slow?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const confirm = () => {
    if (!props.slow) return setOpen(false);
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setOpen(false);
    }, 1500);
  };
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {props.trigger}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={confirm}
        pending={pending}
        tone={props.tone}
        title={props.title}
        body={props.body}
        confirmLabel={props.confirmLabel}
      />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Demo
      trigger="Leave workspace"
      title="Leave Design?"
      body="You lose access to its documents until someone invites you back."
      confirmLabel="Leave"
    />
  ),
};

export const Danger: Story = {
  render: () => (
    <Demo
      trigger="Delete document"
      tone="danger"
      title="Delete Launch plan?"
      body="This can't be undone."
      confirmLabel="Delete"
    />
  ),
};

/** Confirm runs for 1.5 seconds. Escape and the scrim do nothing meanwhile. */
export const Pending: Story = {
  render: () => (
    <Demo
      trigger="Publish"
      tone="success"
      title="Publish to the web?"
      body="Anyone with the link can read it."
      confirmLabel="Publish"
      slow
    />
  ),
};

function ImperativeDemo() {
  const [result, setResult] = useState<string>();
  const archive = async () => {
    const ok = await confirmDialog({
      title: 'Archive 3 tasks?',
      body: 'They leave your list. You can find them in Archive.',
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
 * `confirmDialog()` opens the dialog from an event handler and resolves
 * `true` or `false`. It needs `ImperativeDialogHost` mounted once; an app
 * mounts it at the root, and so does this Storybook.
 */
export const Imperative: Story = {
  render: () => <ImperativeDemo />,
};

/** The phone sheet. The tone tints the confirm pill instead of filling it. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <Demo
        trigger="Delete document"
        tone="danger"
        title="Delete Launch plan?"
        body="This can't be undone."
        confirmLabel="Delete"
      />
      <Demo
        trigger="Publish"
        tone="success"
        title="Publish to the web?"
        body="Anyone with the link can read it."
        confirmLabel="Publish"
        slow
      />
    </div>
  ),
};

/** `confirmDialog()` on a phone waits for the sheet to slide away before it resolves. */
export const PhoneImperative: Story = {
  ...PHONE,
  render: () => <ImperativeDemo />,
};
