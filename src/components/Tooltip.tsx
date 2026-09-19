import { Tooltip as Base } from '@base-ui/react/tooltip';
import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { fromPlacement, type Placement } from '@/lib/placement';
import { Hotkey } from './Hotkey';
import { Surface } from './Surface';

export type TooltipProps = {
  children?: ReactNode;
  label: string;
  /** Keyboard shortcut(s) to render in the tooltip (e.g. "cmd+enter"). An array is a chord. */
  shortcut?: string | string[];
  placement?: Placement;
  /** The element that wraps the trigger. */
  as?: 'div' | 'span';
  className?: string;
  disabled?: boolean;
};

export type TooltipClassOptions = {
  className?: string;
};

/** Canonical classes for tooltip content and tooltip-like static hints. */
export function tooltipClasses(options: TooltipClassOptions = {}): string {
  return cn(
    'flex items-center justify-center rounded-lg bg-tooltip p-2 text-xs text-ink-muted wrap-break-word',
    options.className
  );
}

/**
 * A short label on hover, after 400ms. The trigger is a wrapper around
 * `children`.
 *
 * @example
 * <Tooltip label="Search" shortcut="cmd+k">
 *   <Button>…</Button>
 * </Tooltip>
 */
export function Tooltip({ children, label, shortcut, placement = 'bottom', as = 'div', className, disabled }: TooltipProps) {
  const shortcuts = shortcut == null ? [] : Array.isArray(shortcut) ? shortcut : [shortcut];
  const Wrapper = as;
  return (
    <Base.Root disabled={disabled}>
      <Base.Trigger
        delay={400}
        closeDelay={0}
        render={<Wrapper />}
        className={cn('inline-flex items-center', className)}
      >
        {children}
      </Base.Trigger>
      <Base.Portal>
        <Base.Positioner {...fromPlacement(placement)} sideOffset={4} collisionPadding={16} className="z-tool-tip">
          <Base.Popup className="z-tool-tip max-w-[calc(100vw-32px)]">
            <Surface className={tooltipClasses()} depth={3}>
              <div className="flex flex-row items-center gap-2">
                <div className="text-xs">{label}</div>
                {shortcuts.length > 0 && (
                  <div className="ml-auto flex items-center gap-1">
                    {shortcuts.map((keys, index) => (
                      <Fragment key={index}>
                        <Hotkey shortcut={keys} variant="inline" />
                        {index < shortcuts.length - 1 && <span className="text-ink-extra-muted">then</span>}
                      </Fragment>
                    ))}
                  </div>
                )}
              </div>
            </Surface>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
