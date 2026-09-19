import { Dialog as Base } from '@base-ui/react/dialog';
import { Drawer } from '@base-ui/react/drawer';
import { type ComponentProps, createContext, type ReactNode, type Ref, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { useMobile } from '@/lib/mobile';
import { MobileDrawer } from './MobileDrawer';

// A dialog that opens within this window of another closing skips its entry
// animation, so hand-offs (cmd+k -> create) read as one surface.
const DIALOG_HANDOFF_WINDOW_MS = 180;

let openDialogCount = 0;
let lastAllDialogsClosedAt = Number.NEGATIVE_INFINITY;

/** Set inside the phone sheet, where the dialog's parts render as the drawer's. */
const DrawerContext = createContext(false);

export type DialogProps = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onOpenChange?: (open: boolean) => void;
  contentRef?: Ref<HTMLDivElement>;
  position?: 'top' | 'center';
  /** Edge-to-edge takeover: fills the viewport with no gutter or centering. */
  fullscreen?: boolean;
  children: ReactNode;
  className?: string;
  open: boolean;
  /** Desktop opening animation; mobile drawers own their transitions. */
  animate?: boolean;
};

/** Runs an old-style focus callback; `preventDefault()` in it keeps focus where it is. */
function focusHandler(callback?: (event: Event) => void) {
  if (!callback) return undefined;
  return () => {
    const event = new Event('focus', { cancelable: true });
    callback(event);
    return !event.defaultPrevented;
  };
}

/**
 * The modal. Floating dialogs are a pane of glass over an accent-tinted
 * scrim; `fullscreen` drops the glass because nothing shows through.
 * On a phone it renders as a bottom drawer instead.
 */
function DialogRoot(props: DialogProps) {
  const mobile = useMobile();
  if (mobile && !props.fullscreen) return <DialogDrawer {...props} />;
  return <DesktopDialog {...props} />;
}

function DialogDrawer(props: DialogProps) {
  return (
    <DrawerContext.Provider value>
      <MobileDrawer
        side="bottom"
        open={props.open}
        onOpenChange={(open) => props.onOpenChange?.(open)}
        onEscapeKeyDown={props.onEscapeKeyDown}
        noOutsidePointerEvents
      >
        <MobileDrawer.Portal>
          <MobileDrawer.Overlay />
          <MobileDrawer.Content
            ref={props.contentRef}
            maxHeight={100}
            initialFocus={focusHandler(props.onOpenAutoFocus)}
            finalFocus={focusHandler(props.onCloseAutoFocus)}
            className={cn('max-w-full', props.className)}
          >
            <MobileDrawer.Handle aria-hidden="true" />
            <MobileDrawer.ScrollBody>
              {/* Give desktop surfaces their natural height so their size-full
                  and overflow-clip styles cannot clip the drawer's scroll body. */}
              <div className="shrink-0 [&>[data-layer]>[data-surface]]:border-0! [&>[data-layer]>[data-surface]]:rounded-none [&>[data-layer]>[data-surface]]:bg-transparent">
                {props.children}
              </div>
            </MobileDrawer.ScrollBody>
          </MobileDrawer.Content>
        </MobileDrawer.Portal>
      </MobileDrawer>
    </DrawerContext.Provider>
  );
}

/** Whether this dialog animates in: only when asked, and not when it takes over from another dialog. */
function useAnimateOnOpen(open: boolean, animate: boolean | undefined) {
  // Decided while rendering the open, so the first painted frame already carries the animation.
  const [state, setState] = useState({ open: false, animate: false });
  if (state.open !== open) {
    const handoff = openDialogCount > 0 || performance.now() - lastAllDialogsClosedAt < DIALOG_HANDOFF_WINDOW_MS;
    setState({ open, animate: open && !handoff && Boolean(animate) });
  }

  useEffect(() => {
    if (!open) return;
    openDialogCount += 1;
    return () => {
      openDialogCount = Math.max(0, openDialogCount - 1);
      if (openDialogCount === 0) lastAllDialogsClosedAt = performance.now();
    };
  }, [open]);

  return state.animate;
}

function DesktopDialog(props: DialogProps) {
  const animateOnOpen = useAnimateOnOpen(props.open, props.animate);

  return (
    <Base.Root
      open={props.open}
      modal
      onOpenChange={(open, details) => {
        if (details.reason === 'escape-key') {
          props.onEscapeKeyDown?.(details.event);
          if (details.event.defaultPrevented) {
            details.cancel();
            return;
          }
        }
        props.onOpenChange?.(open);
      }}
    >
      <Base.Portal>
        <Base.Backdrop
          className={cn(
            // Every floating dialog dims the page behind it with the accent sheen.
            'fixed inset-0 z-modal scrim-glass',
            animateOnOpen && 'dialog-overlay-open-animation'
          )}
        />
        <Base.Viewport
          className={cn(
            'fixed top-0 bottom-(--virtual-keyboard-height,0) inset-x-0 z-modal flex',
            props.fullscreen
              ? 'inset-0'
              : cn('justify-center px-2', props.position === 'center' ? 'items-center' : 'items-start pt-[10vh]')
          )}
        >
          <Base.Popup
            ref={props.contentRef}
            initialFocus={focusHandler(props.onOpenAutoFocus)}
            finalFocus={focusHandler(props.onCloseAutoFocus)}
            className={cn(
              'portal-scope isolate rounded-xl bg-dialog',
              // Floating dialogs get the glass treatment; fullscreen fills the
              // viewport, so translucency and a cast shadow would just bleed the
              // page through the content. --color-dialog goes translucent inside
              // so nested bg-dialog chrome reads as the same pane.
              props.fullscreen
                ? 'size-full'
                : 'w-200 max-w-[calc(100vw-16px)] glass bg-menu-glass [--color-dialog:var(--color-menu-glass)] [&>[data-layer]>[data-surface]]:border-0!',
              animateOnOpen &&
                (props.fullscreen ? 'dialog-fullscreen-open-animation' : 'dialog-content-open-animation'),
              props.className
            )}
          >
            {props.children}
          </Base.Popup>
        </Base.Viewport>
      </Base.Portal>
    </Base.Root>
  );
}

type Classed<T> = Omit<T, 'className'> & { className?: string };

/** Closes the dialog. Renders nothing in the phone sheet, where a swipe or the scrim closes it. */
function DialogCloseButton(props: Classed<ComponentProps<typeof Base.Close>>) {
  if (useContext(DrawerContext)) return null;
  return <Base.Close {...props} />;
}

function DialogTitle(props: Classed<ComponentProps<typeof Base.Title>>) {
  if (useContext(DrawerContext)) return <Drawer.Title {...props} />;
  return <Base.Title {...props} />;
}

function DialogDescription(props: Classed<ComponentProps<typeof Base.Description>>) {
  if (useContext(DrawerContext)) return <Drawer.Description {...props} />;
  return <Base.Description {...props} />;
}

export const Dialog = Object.assign(DialogRoot, {
  CloseButton: DialogCloseButton,
  Description: DialogDescription,
  Title: DialogTitle,
});
