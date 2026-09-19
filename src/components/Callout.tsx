import { Popover } from '@base-ui/react/popover';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
} from 'react';
import { cn } from '@/lib/cn';

export type CalloutVariant = 'default' | 'danger';
export type CalloutSide = 'top' | 'right' | 'bottom' | 'left';

const SURFACE: Record<CalloutVariant, string> = {
  default: 'bg-tooltip text-ink',
  danger: 'bg-tooltip-failure text-failure-ink',
};

/** The classes of a callout surface. */
export function calloutClasses(variant: CalloutVariant = 'default') {
  return cn(
    'max-w-64 rounded-lg border border-edge-muted p-2 text-xs shadow-lg',
    SURFACE[variant]
  );
}

export type CalloutProps = {
  /** The trigger. It must accept a ref and spread props. Give it no tooltip of its own. */
  children: ReactElement<Record<string, unknown>>;
  content: ReactNode;
  variant?: CalloutVariant;
  side?: CalloutSide;
};

/**
 * A short note anchored to a control, for information a phone must reach.
 * It opens on hover after 400ms and on tap or click; leaving, a tap away or
 * Escape closes it. Focus stays on the trigger.
 */
export function Callout({ children, content, variant = 'default', side = 'right' }: CalloutProps) {
  return (
    <Popover.Root>
      <Popover.Trigger openOnHover delay={400} render={children} />
      <Popover.Portal>
        <Popover.Positioner side={side} sideOffset={6} className="z-action-menu">
          <Popover.Popup
            initialFocus={false}
            className={cn(calloutClasses(variant), 'menu-open-animation outline-none')}
          >
            {content}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export type PinnedCalloutProps = ComponentProps<'div'> & {
  /** The element the callout points at. */
  anchor: RefObject<HTMLElement | null>;
  variant?: CalloutVariant;
  /**
   * Where it goes. `right` falls back to `bottom-start` when there is no
   * room; the others hold their side.
   */
  placement?: 'right' | 'bottom-start' | CalloutSide;
};

/**
 * A callout that stays while a state holds, such as a field error. It has
 * no trigger, moves no focus and never dismisses, so it never joins Base
 * UI's dismiss stack: Escape and a tap outside still reach the dialog
 * beneath it. It renders in place at `z-action-menu`, positioned with Floating
 * UI, so an open menu or toast still covers it.
 */
export function PinnedCallout({
  anchor,
  variant = 'default',
  placement = 'right',
  className,
  style,
  ref,
  ...props
}: PinnedCalloutProps) {
  const { refs, floatingStyles } = useFloating({
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      placement === 'right' && flip({ fallbackPlacements: ['bottom-start'], crossAxis: false }),
      shift({ padding: 8 }),
    ],
  });

  useLayoutEffect(() => {
    refs.setReference(anchor.current);
  }, [anchor, refs]);

  return (
    <div
      {...props}
      ref={(el) => {
        refs.setFloating(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={cn(calloutClasses(variant), 'z-action-menu', className)}
      style={{ ...floatingStyles, ...style }}
    />
  );
}
