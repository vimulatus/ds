import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Canvas } from './Canvas';

export type AppShellProps = {
  /** A `SidebarRail`. On touch it renders as the bottom bar, under the canvas. */
  rail: ReactNode;
  /** The canvas content: a list, a resource detail. */
  children: ReactNode;
  className?: string;
};

/**
 * The window: the rail on the left, then the canvas, inset 8px from the
 * page on the other three sides. On touch the rail moves under the canvas as
 * a bottom bar, and the canvas stays a floating pane, inset 8px on all four
 * sides and clear of the top safe area.
 */
export function AppShell({ rail, children, className }: AppShellProps) {
  return (
    <div className={cn('flex h-dvh w-full bg-page text-ink touch:flex-col-reverse', className)}>
      {rail}
      <div className="flex min-w-0 flex-1 py-2 pr-2 touch:min-h-0 touch:px-2 touch:pt-[max(--spacing(2),var(--safe-top))]">
        <Canvas>{children}</Canvas>
      </div>
    </div>
  );
}
