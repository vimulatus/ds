import { Drawer as Base } from '@base-ui/react/drawer';
import {
  type ComponentProps,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  useEffect,
} from 'react';
import { cn } from '@/lib/cn';
import { Layer } from './Layer';

let scrollTimer: ReturnType<typeof setTimeout> | undefined;

function isEditableInput(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly;
  if (el instanceof HTMLInputElement) {
    return !el.readOnly && !['button', 'checkbox', 'radio', 'submit', 'reset', 'file', 'range', 'color'].includes(el.type);
  }
  return false;
}

/**
 * Call this from a scroll container's `onFocus` to smoothly scroll a focused
 * input or textarea to `offset` px from the container's top edge, once the
 * phone keyboard has finished pushing the page.
 */
export function scrollToFocusedInput(event: FocusEvent<HTMLElement>, offset = 40) {
  const input = event.target;
  if (!isEditableInput(input) || scrollTimer !== undefined) return;
  const container = input.closest<HTMLElement>('[data-drawer-scroll-body]') ?? event.currentTarget;
  scrollTimer = setTimeout(() => {
    scrollTimer = undefined;
    const inputRect = input.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    container.scrollTo({
      top: container.scrollTop + (inputRect.top - containerRect.top) - offset,
      behavior: 'smooth',
    });
  }, 300);
}

type Side = 'top' | 'right' | 'bottom' | 'left';

const SWIPE: Record<Side, 'up' | 'right' | 'down' | 'left'> = {
  top: 'up',
  right: 'right',
  bottom: 'down',
  left: 'left',
};

export type MobileDrawerProps = Omit<ComponentProps<typeof Base.Root>, 'swipeDirection'> & {
  /** The edge the sheet sits on; a swipe toward it dismisses. */
  side?: Side;
  /** Close on a tap outside the sheet. Defaults to true. */
  closeOnOutsidePointer?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscapeKeyDown?: boolean;
  /** Block pointer events outside the sheet. Focus is trapped either way. */
  noOutsidePointerEvents?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

/** The phone sheet on Base UI's drawer. Styling lives on `Content`. */
function MobileDrawerRoot({
  side = 'bottom',
  closeOnOutsidePointer = true,
  closeOnEscapeKeyDown = true,
  noOutsidePointerEvents = false,
  onEscapeKeyDown,
  onOpenChange,
  ...props
}: MobileDrawerProps) {
  return (
    <Base.Root
      swipeDirection={SWIPE[side]}
      disablePointerDismissal={!closeOnOutsidePointer}
      modal={noOutsidePointerEvents ? true : 'trap-focus'}
      {...props}
      onOpenChange={(open, details) => {
        if (details.reason === 'escape-key') {
          onEscapeKeyDown?.(details.event);
          if (!closeOnEscapeKeyDown || details.event.defaultPrevented) {
            details.cancel();
            return;
          }
        }
        onOpenChange?.(open, details);
      }}
    />
  );
}

export type MobileDrawerContentProps = Omit<ComponentProps<typeof Base.Popup>, 'className'> & {
  className?: string;
  /** Maximum height as a percentage of the viewport (vh). Clamped to 100. Defaults to 80, or `targetHeight` when that is larger. */
  maxHeight?: number;
  /** Initial height as a percentage of the viewport (vh). Clamped to 100. Fits content when omitted. */
  targetHeight?: number;
};

/**
 * The sheet: flush on the screen's bottom edge, glass, rounded on top only.
 * When a `MobileDrawer.ScrollBody` is present it hands the safe-area padding
 * to it, so the scroll viewport reaches the sheet's bottom edge.
 */
function MobileDrawerContent({ className, maxHeight, targetHeight, style, onFocus, ...props }: MobileDrawerContentProps) {
  const max = Math.min(100, maxHeight ?? Math.max(80, targetHeight ?? 0));
  const target = targetHeight != null ? Math.min(100, targetHeight) : undefined;

  useEffect(
    () => () => {
      clearTimeout(scrollTimer);
      scrollTimer = undefined;
    },
    []
  );

  return (
    <Layer depth={0}>
      <Base.Popup
        {...props}
        onFocus={(event) => {
          onFocus?.(event);
          scrollToFocusedInput(event);
        }}
        style={{
          '--drawer-max-h': `${max}dvh`,
          ...(target != null ? { '--drawer-h': `${target}dvh` } : {}),
          ...(style as CSSProperties),
        } as CSSProperties}
        className={cn(
          'portal-scope',
          'fixed! inset-x-0 bottom-(--virtual-keyboard-height,0px) z-modal mobile-sheet glass bg-menu-glass [--color-dialog:var(--color-menu-glass)] flex flex-col max-h-[min(var(--drawer-max-h),calc(100dvh-var(--safe-top,0px)-var(--virtual-keyboard-height,0px)-8px))] data-transitioning:transition-transform data-transitioning:duration-200 ease-out motion-reduce:transition-none',
          // Base UI marks enter, exit and drag with its own attributes; this carries the slide.
          'motion-sheet',
          target != null ? 'h-(--drawer-h)' : 'h-fit',
          'pb-[max(16px,var(--mobile-sheet-safe-padding))] has-[[data-drawer-scroll-body]]:pb-0',
          className
        )}
      />
    </Layer>
  );
}

function MobileDrawerOverlay({ className, ...props }: Omit<ComponentProps<typeof Base.Backdrop>, 'className'> & { className?: string }) {
  return <Base.Backdrop {...props} className={cn('fixed inset-0 z-modal-overlay scrim-glass motion-sheet-scrim', className)} />;
}

function MobileDrawerItem({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 rounded-[20px] px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-ink/6 active:bg-ink/10 aria-checked:bg-ink/8 aria-pressed:bg-ink/8 aria-[checked=mixed]:bg-ink/8 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40',
        className
      )}
    />
  );
}

type ExtendDiv = ComponentProps<'div'> & { as?: ElementType };

/** The heading above a section of rows. */
function MobileDrawerSectionLabel({ as: Tag = 'div', className, ...props }: ExtendDiv) {
  return <Tag {...props} className={cn('px-6 pb-2 text-xs font-medium text-ink-extra-muted', className)} />;
}

/** A tinted group of rows. */
function MobileDrawerSection({ as: Tag = 'div', className, ...props }: ExtendDiv) {
  return (
    <Layer depth={2}>
      <Tag {...props} className={cn('rounded-3xl mx-3 p-1 bg-ink/3 overflow-clip', className)} />
    </Layer>
  );
}

/**
 * The scrolling body, between the pinned chrome (Handle, headers) and the
 * sheet's bottom edge. `flex-auto`, not `flex-1`: a basis-0 child of a
 * fit-content column collapses the sheet. It pads its content for the home
 * indicator, so the scroll viewport still reaches the sheet's bottom edge.
 */
function MobileDrawerScrollBody({ as: Tag = 'div', className, ...props }: ExtendDiv) {
  return (
    <Tag
      data-drawer-scroll-body=""
      {...props}
      className={cn(
        'flex min-h-0 flex-auto flex-col overflow-y-auto',
        'pb-[max(16px,var(--mobile-sheet-safe-padding))]',
        className
      )}
    />
  );
}

/** The drag handle at the top of a sheet. */
function MobileDrawerHandle({ as: Tag = 'div', className, children, ...props }: ExtendDiv) {
  return (
    <Tag {...props} className={cn('flex justify-center pt-2 pb-3 shrink-0', className)}>
      {children ?? <div className="w-9 h-1 rounded-full bg-ink/15" />}
    </Tag>
  );
}

/**
 * The phone sheet: flat bottom, rounded top, swipe toward its edge to
 * dismiss. `Dialog` and `ConfirmDialog` render through it on a phone.
 */
export const MobileDrawer = Object.assign(MobileDrawerRoot, {
  Trigger: Base.Trigger,
  Portal: Base.Portal,
  Overlay: MobileDrawerOverlay,
  Content: MobileDrawerContent,
  Close: Base.Close,
  Title: Base.Title,
  Description: Base.Description,
  ScrollBody: MobileDrawerScrollBody,
  Handle: MobileDrawerHandle,
  Section: MobileDrawerSection,
  Label: MobileDrawerSectionLabel,
  Item: MobileDrawerItem,
});
