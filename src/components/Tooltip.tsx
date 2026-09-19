import { Tooltip as Base } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const TooltipProvider = Base.Provider;

export type TooltipProps = {
  /** The trigger. It must accept a ref and spread props. */
  children: ReactElement<Record<string, unknown>>;
  content: ReactNode;
  /** A key combination shown after the content, such as "⌘K". */
  shortcut?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
};

/** A label on hover or focus. Never the only way to reach information: use Callout for that. */
export function Tooltip({ children, content, shortcut, side = 'top', disabled }: TooltipProps) {
  return (
    <Base.Root disabled={disabled}>
      <Base.Trigger render={children} />
      <Base.Portal>
        <Base.Positioner side={side} sideOffset={6} className="z-tooltip">
          <Base.Popup
            className={cn(
              'motion-pop flex items-center gap-2 rounded-md border border-edge-muted bg-tooltip px-2 py-1 text-xs text-ink shadow-lg',
              'data-instant:transition-none'
            )}
          >
            {content}
            {shortcut && (
              <kbd className="font-sans text-xxs text-ink-subtle">{shortcut}</kbd>
            )}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
