import { Spinner, X } from '@phosphor-icons/react';
import { useId } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import type { ConfirmDialogProps } from './ConfirmDialog';
import { MobileDrawer } from './MobileDrawer';

/** Controlled confirmation sheet; pending actions remain visible until resolved. */
export function ConfirmDrawer(props: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const close = () => {
    if (!props.pending) props.onOpenChange(false);
  };
  return (
    <MobileDrawer
      side="bottom"
      open={props.open}
      onOpenChange={(open) => !open && close()}
      closeOnOutsidePointer={!props.pending}
      closeOnEscapeKeyDown={!props.pending}
    >
      <MobileDrawer.Portal>
        <MobileDrawer.Overlay />
        <MobileDrawer.Content aria-labelledby={titleId} aria-describedby={descriptionId} className="overflow-hidden">
          <MobileDrawer.Handle className="pb-1" />
          <div className="flex shrink-0 items-center justify-between gap-3 px-6 pb-4">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {props.title}
            </h2>
            <Button
              variant="ghost"
              size="icon-md"
              aria-label="Close confirmation"
              className="rounded-full bg-ink/6"
              disabled={props.pending}
              onClick={close}
            >
              <X className="size-5" />
            </Button>
          </div>
          <MobileDrawer.ScrollBody>
            <div id={descriptionId} className="px-6 pb-5 text-base leading-6 text-ink-muted">
              {props.body ?? props.children}
            </div>
            <div className="flex gap-3 px-6 pb-2">
              <Button
                variant="ghost"
                size="md"
                className="min-w-0 flex-1 rounded-full bg-ink/6"
                disabled={props.pending}
                onClick={close}
              >
                {props.cancelLabel ?? 'Cancel'}
              </Button>
              <Button
                variant="ghost"
                size="md"
                className={cn(
                  'min-w-0 flex-1 rounded-full',
                  props.tone === 'danger'
                    ? 'bg-failure-bg text-failure'
                    : props.tone === 'success'
                      ? 'bg-accent text-accent-contrast'
                      : 'bg-accent-bg text-accent'
                )}
                disabled={props.pending}
                onClick={() => !props.pending && props.onConfirm()}
              >
                {props.pending && <Spinner className="size-4 animate-spin" />}
                {props.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </MobileDrawer.ScrollBody>
        </MobileDrawer.Content>
      </MobileDrawer.Portal>
    </MobileDrawer>
  );
}
