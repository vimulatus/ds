import { AlertDialog } from '@base-ui/react/alert-dialog';
import { useSyncExternalStore } from 'react';
import { useTouch } from '@/lib/touch';
import { Button } from './Button';
import { Drawer, DrawerContent } from './Drawer';

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** Runs after the dialog finishes animating out. */
  onClosed?: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** The confirm button turns `danger`, for work that removes something. */
  destructive?: boolean;
  /** Both buttons disable and the dialog ignores dismissal while work runs. */
  pending?: boolean;
};

/**
 * A yes-or-no question before an action that is hard to take back. The
 * confirm button is the `cta`, or `danger` when the action destroys
 * something. In touch mode it is a bottom sheet with full-width buttons,
 * confirm on top.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onClosed,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive,
  pending,
}: ConfirmDialogProps) {
  const touch = useTouch();
  const setOpen = (next: boolean) => {
    if (!pending) onOpenChange(next);
  };
  const onOpenChangeComplete = (next: boolean) => {
    if (!next) onClosed?.();
  };
  const confirm = (
    <Button
      variant={destructive ? 'danger' : 'cta'}
      disabled={pending}
      onClick={onConfirm}
      className="touch:h-11 touch:w-full touch:rounded-xl touch:text-base"
    >
      {confirmLabel}
    </Button>
  );
  const cancel = (
    <Button
      variant={touch ? 'outlined' : 'ghost'}
      disabled={pending}
      onClick={() => setOpen(false)}
      className="touch:h-11 touch:w-full touch:rounded-xl touch:text-base"
    >
      {cancelLabel}
    </Button>
  );
  const text = (
    <div className="flex flex-col gap-1">
      <AlertDialog.Title className="text-sm font-semibold text-ink touch:text-base">
        {title}
      </AlertDialog.Title>
      {description && (
        <AlertDialog.Description className="text-sm text-ink-muted">
          {description}
        </AlertDialog.Description>
      )}
    </div>
  );

  if (touch) {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        onOpenChangeComplete={onOpenChangeComplete}
        disablePointerDismissal={pending}
      >
        <DrawerContent role="alertdialog">
          {text}
          <div className="flex flex-col gap-2">
            {confirm}
            {cancel}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen} onOpenChangeComplete={onOpenChangeComplete}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="motion-fade fixed inset-0 z-dialog bg-scrim" />
        <AlertDialog.Viewport className="fixed inset-0 z-dialog grid place-items-center p-4">
          <AlertDialog.Popup className="motion-dialog flex w-96 max-w-full flex-col gap-4 rounded-xl border border-edge-muted bg-dialog p-4 text-ink shadow-2xl outline-none">
            {text}
            <div className="flex justify-end gap-2">
              {cancel}
              {confirm}
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type Request = ConfirmOptions & { resolve: (ok: boolean) => void };
type State = { request?: Request; open: boolean; ok?: boolean };

let state: State = { open: false };
const listeners = new Set<() => void>();
const setState = (next: State) => {
  state = next;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const settle = (ok: boolean) => setState({ ...state, open: false, ok });

function finish() {
  state.request?.resolve(state.ok ?? false);
  setState({ open: false });
}

/**
 * Asks a yes-or-no question from an event handler. Resolves `true` on
 * confirm and `false` on cancel or dismiss, once the dialog has finished
 * animating out, so the caller can open the next overlay cleanly. Needs
 * `<ConfirmHost />` mounted once.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  if (state.request) finish();
  return new Promise((resolve) => setState({ request: { ...options, resolve }, open: true }));
}

/** Renders the dialog that `confirm()` opens. Mount it once, near the root. */
export function ConfirmHost() {
  const { request, open } = useSyncExternalStore(subscribe, () => state, () => state);
  if (!request) return null;
  const { resolve: _, ...options } = request;
  return (
    <ConfirmDialog
      {...options}
      open={open}
      onOpenChange={(next) => {
        if (!next) settle(false);
      }}
      onConfirm={() => settle(true)}
      onClosed={finish}
    />
  );
}
