import { Toast as Base } from '@base-ui/react/toast';
import { CheckCircle, CircleNotch, WarningCircle, X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useTouch } from '@/lib/touch';
import { buttonClasses } from './Button';

const manager = Base.createToastManager();

/** Holds the toast queue. Mount it once around the app, with `ToastViewport` inside. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Base.Provider toastManager={manager} timeout={4000} limit={3}>
      {children}
    </Base.Provider>
  );
}

const ICON: Record<string, ReactNode> = {
  success: <CheckCircle weight="fill" className="text-success" />,
  failure: <WarningCircle weight="fill" className="text-failure" />,
  error: <WarningCircle weight="fill" className="text-failure" />,
  loading: <CircleNotch weight="bold" className="animate-spin text-ink-muted" />,
};

/**
 * Where toasts appear: bottom right, newest at the bottom. In touch mode
 * they span the bottom of the screen and a sideways swipe dismisses one.
 */
export function ToastViewport() {
  const { toasts } = Base.useToastManager();
  const touch = useTouch();
  return (
    <Base.Portal>
      <Base.Viewport
        className={cn(
          'fixed right-4 bottom-4 z-toast flex w-90 flex-col-reverse gap-2 outline-none',
          'touch:inset-x-3 touch:bottom-[max(env(safe-area-inset-bottom),0.75rem)] touch:w-auto'
        )}
      >
        {toasts.map((item) => (
          <Base.Root
            key={item.id}
            toast={item}
            swipeDirection={touch ? ['left', 'right'] : ['right', 'down']}
            className={cn(
              'glass rounded-lg border border-edge-muted bg-menu-glass p-3 text-ink select-none',
              '[transform:translate(var(--toast-swipe-movement-x),var(--toast-swipe-movement-y))]',
              'transition-[opacity,translate,transform] duration-300 ease-out data-swiping:duration-0',
              'data-starting-style:translate-y-3 data-starting-style:opacity-0',
              'data-ending-style:opacity-0 data-limited:hidden',
              'data-ending-style:data-[swipe-direction=right]:translate-x-full',
              'data-ending-style:data-[swipe-direction=left]:-translate-x-full',
              'data-ending-style:data-[swipe-direction=down]:translate-y-full'
            )}
          >
            <Base.Content className="flex items-start gap-2.5">
              {item.type && ICON[item.type] && (
                <span className="flex pt-0.5 [&_svg]:size-4">{ICON[item.type]}</span>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Base.Title className="text-sm font-medium text-ink" />
                <Base.Description className="text-sm text-ink-muted" />
              </div>
              {item.actionProps && (
                <Base.Action className={buttonClasses({ variant: 'outlined', size: 'sm' })} />
              )}
              <Base.Close aria-label="Dismiss" className={cn(buttonClasses({ size: 'icon-sm' }), '-my-0.5')}>
                <X />
              </Base.Close>
            </Base.Content>
          </Base.Root>
        ))}
      </Base.Viewport>
    </Base.Portal>
  );
}

export type ToastOptions = {
  description?: ReactNode;
  /** One button beside the text. The toast closes after it runs. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it dismisses itself; `0` waits for the person. */
  timeout?: number;
  /** Reuses a toast: a second call with the same id replaces the first. */
  id?: string;
};

type ToastType = 'success' | 'failure' | 'loading';

function show(title: ReactNode, options: ToastOptions = {}, type?: ToastType) {
  const { action, ...rest } = options;
  return manager.add({
    ...rest,
    title,
    type,
    actionProps: action && { children: action.label, onClick: action.onClick },
  });
}

/**
 * Shows transient feedback from anywhere, including outside React. Write
 * the title as what happened ("Link copied"), not as a status code.
 *
 * - `toast.success`: an action completed.
 * - `toast.failure`: an action failed.
 * - `toast.loading`: work is running; it stays until updated or dismissed.
 * - `toast.promise`: a loading toast that becomes success or failure.
 */
export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => show(title, options), {
  success: (title: ReactNode, options?: ToastOptions) => show(title, options, 'success'),
  failure: (title: ReactNode, options?: ToastOptions) => show(title, options, 'failure'),
  loading: (title: ReactNode, options?: ToastOptions) => show(title, options, 'loading'),
  promise: <T,>(promise: Promise<T>, titles: { loading: ReactNode; success: ReactNode; error: ReactNode }) =>
    manager.promise(promise, {
      loading: { title: titles.loading },
      success: { title: titles.success },
      error: { title: titles.error },
    }),
  dismiss: (id?: string) => manager.close(id),
});
