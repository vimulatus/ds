import { Dialog } from '@base-ui/react/dialog';
import { Drawer as Base } from '@base-ui/react/drawer';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type DrawerProps = ComponentProps<typeof Base.Root>;

/**
 * The phone sheet: a panel anchored to the bottom of the screen with a flat
 * bottom edge and rounded top corners. Drag the handle down, or tap the
 * scrim, to dismiss. `Dialog` and `ConfirmDialog` render through it in
 * touch mode; use it directly for an action sheet.
 */
export function Drawer({ swipeDirection = 'down', ...props }: DrawerProps) {
  return <Base.Root swipeDirection={swipeDirection} {...props} />;
}

export const DrawerTrigger = Base.Trigger;
export const DrawerClose = Dialog.Close;

/** The grip at the top of a sheet that says it can be dragged. */
export function DrawerHandle({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('mx-auto mt-2 mb-3 h-1 w-9 shrink-0 rounded-full bg-ink/20', className)}
    />
  );
}

export type DrawerContentProps = Omit<ComponentProps<typeof Base.Popup>, 'className'> & {
  className?: string;
  children?: ReactNode;
};

/**
 * The sheet itself: scrim, handle and a glass popup flush with the bottom
 * and side edges. The body scrolls once it outgrows 85% of the screen, and
 * the bottom padding clears the home indicator.
 */
export function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  return (
    <Base.Portal>
      <Base.Backdrop className="dialog-overlay-open-animation fixed inset-0 z-modal-overlay scrim-glass opacity-[calc(1-var(--drawer-swipe-progress,0))] data-swiping:duration-0" />
      <Base.Viewport className="fixed inset-0 z-modal flex items-end justify-center">
        <Base.Popup
          {...props}
          className={cn(
            'motion-sheet glass flex max-h-[85dvh] w-full flex-col rounded-t-3xl rounded-b-none border-t border-edge-muted bg-menu-glass text-ink outline-none',
            'pb-[max(env(safe-area-inset-bottom),1rem)]'
          )}
        >
          <DrawerHandle />
          <Base.Content
            className={cn(
              'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4',
              className
            )}
          >
            {children}
          </Base.Content>
        </Base.Popup>
      </Base.Viewport>
    </Base.Portal>
  );
}

type TextProps = { className?: string; children?: ReactNode };

export function DrawerTitle({ className, children }: TextProps) {
  return (
    <Dialog.Title className={cn('text-base font-semibold text-ink', className)}>
      {children}
    </Dialog.Title>
  );
}

export function DrawerDescription({ className, children }: TextProps) {
  return (
    <Dialog.Description className={cn('text-sm text-ink-muted', className)}>
      {children}
    </Dialog.Description>
  );
}

/** A heading above a section of sheet rows. */
export function DrawerLabel({ className, children }: TextProps) {
  return (
    <div className={cn('px-3 pb-1.5 text-xs font-medium text-ink-subtle', className)}>
      {children}
    </div>
  );
}

/** A tinted group of rows. Rows inside share one rounded surface. */
export function DrawerSection({ className, children }: TextProps) {
  return (
    <div
      className={cn(
        'flex flex-col divide-y divide-edge-muted overflow-hidden rounded-xl bg-ink/5',
        className
      )}
    >
      {children}
    </div>
  );
}

export type DrawerItemProps = Omit<ComponentProps<'button'>, 'className'> & {
  className?: string;
  /** Red text for an action that removes something. */
  destructive?: boolean;
};

/** A 44px row in a sheet: an icon and a label, for one tap. */
export function DrawerItem({ className, destructive, ...props }: DrawerItemProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'flex h-11 w-full items-center gap-3 px-3 text-left text-base text-ink outline-none',
        'active:bg-ink/5 focus-visible:bg-ink/5 disabled:opacity-50',
        '[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-ink-muted',
        destructive && 'text-failure-ink [&_svg]:text-failure-ink',
        className
      )}
    />
  );
}
