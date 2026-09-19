import { ArrowSquareOut, Share } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import { ToastRegion } from '@/components/ToastRegion';
import { PHONE } from '../phone';

/**
 * Transient feedback, bottom right. A toast is a glass card on `bg-toast`,
 * and it dismisses itself after 3 seconds. Hover pauses the timer. Only one
 * transient toast shows at a time: a new one replaces the last without the
 * slide-in, and the same message within 3 seconds replaces itself instead
 * of stacking.
 *
 * - `toast.success`: an action completed.
 * - `toast.failure`: an action failed, because of us.
 * - `toast.alert`: an action failed, because of the person.
 * - `toast.promise`: a spinner while the work runs, then the result.
 *
 * On a phone, toasts stack bottom center, above the dock, and a swipe left
 * dismisses one.
 *
 * An app mounts `ToastRegion` once at the root. Each story mounts its own.
 */
const meta = {
  title: 'Menus/Toast',
  parameters: { docs: { story: { inline: false, iframeHeight: 280 } } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function Stage({ children }: { children: ReactNode }) {
  return (
    <>
      <ToastRegion />
      <div className="flex flex-wrap gap-2">{children}</div>
    </>
  );
}

const prompt = () =>
  toast.custom(
    {
      title: 'A new version is ready',
      color: 'var(--color-accent)',
      content: () => <p className="text-sm text-ink-muted">Reload to get the latest changes.</p>,
      actions: [{ label: 'Reload', onClick: () => {} }],
    },
    { persistent: true }
  );

const exportPdf = (fail: boolean) =>
  toast
    .promise(
      new Promise((resolve, reject) => setTimeout(() => (fail ? reject(new Error('export')) : resolve(null)), 1500)),
      {
        loading: 'Exporting PDF',
        success: 'PDF exported',
        error: "Couldn't export PDF",
      }
    )
    .catch(() => {});

export const Tones: Story = {
  render: () => (
    <Stage>
      <Button variant="outlined" onClick={() => toast.success('Link copied')}>
        Success
      </Button>
      <Button variant="outlined" onClick={() => toast.failure("Couldn't save changes")}>
        Failure
      </Button>
      <Button variant="outlined" onClick={() => toast.alert('File is larger than 100 MB')}>
        Alert
      </Button>
    </Stage>
  ),
};

/** `subtext` adds a muted second line. `actions` add outline buttons. */
export const WithActions: Story = {
  render: () => (
    <Stage>
      <Button
        variant="outlined"
        onClick={() =>
          toast.success('Document shared', {
            subtext: 'Everyone in Design can edit.',
            actions: [
              { label: 'Open', icon: ArrowSquareOut, onClick: () => {} },
              { label: 'Share', icon: Share, onClick: () => {} },
            ],
          })
        }
      >
        Share document
      </Button>
    </Stage>
  ),
};

/** The loading toast stays until the promise settles. */
export const Promise_: Story = {
  name: 'Promise',
  render: () => (
    <Stage>
      <Button variant="outlined" onClick={() => exportPdf(false)}>
        Export
      </Button>
      <Button variant="outlined" onClick={() => exportPdf(true)}>
        Export, then fail
      </Button>
    </Stage>
  ),
};

/**
 * `toast.custom` swaps the icon, title and accent color but keeps the
 * chrome. A persistent one waits for the person to close it.
 */
export const Custom: Story = {
  render: () => (
    <Stage>
      <Button variant="outlined" onClick={prompt}>
        Show prompt
      </Button>
    </Stage>
  ),
};

/** Every kind on a phone: tones, actions, a promise, and a persistent prompt. */
export const Phone: Story = {
  ...PHONE,
  render: () => (
    <Stage>
      <Button variant="outlined" onClick={() => toast.success('Link copied')}>
        Success
      </Button>
      <Button variant="outlined" onClick={() => toast.failure("Couldn't save changes")}>
        Failure
      </Button>
      <Button
        variant="outlined"
        onClick={() =>
          toast.success('Document shared', {
            subtext: 'Everyone in Design can edit.',
            actions: [{ label: 'Open', icon: ArrowSquareOut, onClick: () => {} }],
          })
        }
      >
        With action
      </Button>
      <Button variant="outlined" onClick={() => exportPdf(false)}>
        Promise
      </Button>
      <Button variant="outlined" onClick={prompt}>
        Prompt
      </Button>
    </Stage>
  ),
};
