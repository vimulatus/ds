import { Dialog as Base } from '@base-ui/react/dialog';
import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useTouch } from '@/lib/touch';
import { buttonClasses } from './Button';
import { Drawer, DrawerContent } from './Drawer';

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Runs after the open or close animation finishes. */
  onOpenChangeComplete?: (open: boolean) => void;
  /** Keeps the dialog open on a click outside it. */
  disablePointerDismissal?: boolean;
  children?: ReactNode;
};

/**
 * A modal task: a centered panel over a scrim. In touch mode the same parts
 * render as a bottom sheet, so a phone gets a thumb-reachable surface that
 * swipes away. Compose `DialogContent` from `DialogHeader`, `DialogBody` and
 * `DialogFooter`.
 */
export function Dialog(props: DialogProps) {
  const touch = useTouch();
  if (touch) return <Drawer {...props} />;
  return <Base.Root {...props} />;
}

export const DialogTrigger = Base.Trigger;
export const DialogClose = Base.Close;

export type DialogContentProps = { className?: string; children?: ReactNode };

/** The panel: `bg-dialog`, `rounded-xl`, 26rem wide unless `className` says otherwise. */
export function DialogContent({ className, children }: DialogContentProps) {
  const touch = useTouch();
  if (touch) return <DrawerContent>{children}</DrawerContent>;
  return (
    <Base.Portal>
      <Base.Backdrop className="dialog-overlay-open-animation fixed inset-0 z-modal-overlay scrim-glass" />
      <Base.Viewport className="fixed inset-0 z-modal grid place-items-center p-4">
        <Base.Popup
          className={cn(
            'dialog-content-open-animation flex w-104 max-w-full flex-col gap-4 rounded-xl border border-edge-muted bg-dialog p-4 text-ink shadow-2xl outline-none',
            className
          )}
        >
          {children}
        </Base.Popup>
      </Base.Viewport>
    </Base.Portal>
  );
}

type PartProps = { className?: string; children?: ReactNode };

/**
 * The title block. On desktop it carries a close button in its corner; a
 * sheet drops it, because a swipe or a tap on the scrim closes the sheet.
 */
export function DialogHeader({ className, children }: PartProps) {
  const touch = useTouch();
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
      {!touch && (
        <Base.Close aria-label="Close" className={cn(buttonClasses({ size: 'icon-sm' }), '-mt-0.5 -mr-1')}>
          <X />
        </Base.Close>
      )}
    </div>
  );
}

export function DialogTitle({ className, children }: PartProps) {
  return (
    <Base.Title className={cn('text-sm font-semibold text-ink touch:text-base', className)}>
      {children}
    </Base.Title>
  );
}

export function DialogDescription({ className, children }: PartProps) {
  return (
    <Base.Description className={cn('text-sm text-ink-muted', className)}>
      {children}
    </Base.Description>
  );
}

export function DialogBody({ className, children }: PartProps) {
  return <div className={cn('flex flex-col gap-3', className)}>{children}</div>;
}

/**
 * The actions row, right-aligned: the dismissive action first, the commit
 * last. In touch mode its buttons grow to 40px for a thumb.
 */
export function DialogFooter({ className, children }: PartProps) {
  return (
    <div className={cn('flex justify-end gap-2 touch:[&>*]:h-10 touch:[&>*]:px-4 touch:[&>*]:text-base', className)}>
      {children}
    </div>
  );
}
