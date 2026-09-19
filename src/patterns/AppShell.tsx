import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Canvas } from './Canvas';

export type AppShellProps = {
  /** A `SidebarRail`. */
  rail: ReactNode;
  /** The canvas content: a list, a resource detail. */
  children: ReactNode;
  className?: string;
};

/**
 * The window: the rail on the left, then the canvas, inset 8px from the
 * page on the other three sides. On touch the rail sheds and the canvas
 * fills the screen.
 */
export function AppShell({ rail, children, className }: AppShellProps) {
  return (
    <div className={cn('flex h-dvh w-full bg-page text-ink', className)}>
      {rail}
      <div className="flex min-w-0 flex-1 py-2 pr-2 touch:p-0">
        <Canvas>{children}</Canvas>
      </div>
    </div>
  );
}
