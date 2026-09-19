import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { isMobile, useMobile } from '@/lib/mobile';
import { Button } from './Button';
import { ConfirmDrawer } from './ConfirmDrawer';
import { Dialog, type DialogProps } from './Dialog';
import { type ManagedDialogProps, type OpenDialogOptions, openDialog, type PropsSource } from './ImperativeDialog';
import { Surface } from './Surface';

/** Presentation options for the shared confirmation dialog. */
export type ConfirmDialogDisplayProps = {
  title: ReactNode;
  /** Dialog copy. `children` is used when `body` is omitted. */
  body?: ReactNode;
  children?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  tone?: 'default' | 'danger' | 'success';
  /** Dialog presentation only; the mobile drawer ignores it. */
  position?: DialogProps['position'];
  /** Dialog presentation only; the mobile drawer ignores it. */
  className?: string;
};

const TONE_VARIANT = {
  default: 'accent',
  danger: 'danger',
  success: 'cta',
} as const;

export type ConfirmDialogProps = ManagedDialogProps &
  ConfirmDialogDisplayProps & {
    onConfirm: () => void;
    pending?: boolean;
  };

/** Controlled confirmation UI: a dialog on desktop, a drawer on mobile. */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const mobile = useMobile();
  if (mobile) return <ConfirmDrawer {...props} />;
  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !props.pending && props.onOpenChange(open)}
      position={props.position}
      className={cn('w-[90%] max-w-120', props.className)}
    >
      <Surface depth={2} className="rounded-xl text-ink">
        <div className="flex flex-col gap-1 px-5 py-4">
          <Dialog.Title className="text-base font-semibold">{props.title}</Dialog.Title>
          <Dialog.Description render={<div />} className="text-sm leading-5 text-ink-muted">
            {props.body ?? props.children}
          </Dialog.Description>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            depth={2}
            className="rounded-lg"
            disabled={props.pending}
            onClick={() => props.onOpenChange(false)}
          >
            {props.cancelLabel ?? 'Cancel'}
          </Button>
          <Button
            type="button"
            variant={TONE_VARIANT[props.tone ?? 'default']}
            depth={2}
            className="rounded-lg"
            disabled={props.pending}
            onClick={props.onConfirm}
          >
            {props.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </Surface>
    </Dialog>
  );
}

/** Slide-out length; keep at least the sheet's 200ms transition. */
const CLOSE_MS = 250;

type ManagedConfirmProps = ManagedDialogProps & ConfirmDialogDisplayProps & { onChoice: (confirmed: boolean) => void };

/** The confirm dialog under the imperative host: it closes itself, then hands dismissal back. */
function ManagedConfirm({ onChoice, open: managedOpen, onOpenChange, ...display }: ManagedConfirmProps) {
  const [open, setOpen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const close = (choice: boolean) => {
    if (!open) return;
    setOpen(false);
    const finalize = () => {
      onChoice(choice);
      onOpenChange(false);
    };
    // The host unmounts at once. Let the phone sheet slide away first.
    if (isMobile()) timer.current = setTimeout(finalize, CLOSE_MS);
    else finalize();
  };

  return (
    <ConfirmDialog
      {...display}
      open={managedOpen && open}
      onOpenChange={(next) => !next && close(false)}
      onConfirm={() => close(true)}
    />
  );
}

/**
 * Opens the shared confirmation UI and resolves with the person's choice:
 * this dialog on desktop, a bottom drawer (`ConfirmDrawer`) on a phone.
 * Needs `<ImperativeDialogHost />` mounted once.
 */
export async function confirmDialog(
  props: PropsSource<ConfirmDialogDisplayProps>,
  options?: OpenDialogOptions
): Promise<boolean> {
  let confirmed = false;
  const display = typeof props === 'function' ? props : () => props;
  const handle = openDialog(
    ManagedConfirm,
    () => ({
      ...display(),
      onChoice: (choice: boolean) => {
        confirmed = choice;
      },
    }),
    options
  );
  await handle.closed;
  return confirmed;
}
