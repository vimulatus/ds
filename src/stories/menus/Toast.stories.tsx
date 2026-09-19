import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import { PHONE } from '../phone';

/**
 * Transient feedback, bottom right. A toast is a glass card on
 * `bg-menu-glass` with an icon for its type, and it dismisses itself after 4
 * seconds; hover pauses the timer. At most three show at once.
 *
 * - `toast.success`: an action completed.
 * - `toast.failure`: an action failed.
 * - `toast.loading` and `toast.promise`: a spinner while work runs, then the result.
 *
 * In touch mode toasts span the bottom of the screen and a sideways swipe
 * dismisses one. `ToastProvider` and `ToastViewport` mount once at the root;
 * this Storybook mounts them in the preview.
 */
const meta = {
  title: 'Menus/Toast',
  parameters: { docs: { story: { inline: false, iframeHeight: 280 } } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const success = () => toast.success('Link copied');
const failure = () => toast.failure("Couldn't save changes", { description: 'Check your connection and try again.' });
const withAction = () =>
  toast.success('Document shared', {
    description: 'Everyone on the Design team can edit.',
    action: { label: 'Open', onClick: () => {} },
  });
const prompt = () =>
  toast('A new version is ready', {
    description: 'Reload to get the latest changes.',
    action: { label: 'Reload', onClick: () => {} },
    timeout: 0,
  });
const exportPdf = (fail: boolean) =>
  toast
    .promise(new Promise((resolve, reject) => setTimeout(fail ? reject : resolve, 1500)), {
      loading: 'Exporting PDF',
      success: 'PDF exported',
      error: "Couldn't export PDF",
    })
    .catch(() => {});

export const Types: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outlined" onClick={success}>
        Success
      </Button>
      <Button variant="outlined" onClick={failure}>
        Failure
      </Button>
      <Button variant="outlined" onClick={() => toast('Moved to Roadmap')}>
        Plain
      </Button>
    </div>
  ),
};

/** `description` adds a muted second line; `action` adds one outlined button. */
export const WithAction: Story = {
  render: () => (
    <Button variant="outlined" onClick={withAction}>
      Share document
    </Button>
  ),
};

/** The loading toast stays until the promise settles. */
export const Promise_: Story = {
  name: 'Promise',
  render: () => (
    <div className="flex gap-2">
      <Button variant="outlined" onClick={() => exportPdf(false)}>
        Export
      </Button>
      <Button variant="outlined" onClick={() => exportPdf(true)}>
        Export, then fail
      </Button>
    </div>
  ),
};

/** `timeout: 0` keeps a toast until the person closes it. */
export const Persistent: Story = {
  render: () => (
    <Button variant="outlined" onClick={prompt}>
      Show prompt
    </Button>
  ),
};

/** Every kind on a phone, stacked across the bottom of the screen. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outlined" onClick={success}>
        Success
      </Button>
      <Button variant="outlined" onClick={failure}>
        Failure
      </Button>
      <Button variant="outlined" onClick={withAction}>
        With action
      </Button>
      <Button variant="outlined" onClick={() => exportPdf(false)}>
        Promise
      </Button>
      <Button variant="outlined" onClick={prompt}>
        Prompt
      </Button>
    </div>
  ),
};
