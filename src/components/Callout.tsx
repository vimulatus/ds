import { Popover } from '@base-ui/react/popover';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useId,
  useLayoutEffect,
  useRef,
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
        <Popover.Positioner side={side} sideOffset={6} className="z-popover">
          <Popover.Popup
            initialFocus={false}
            className={cn(calloutClasses(variant), 'motion-pop outline-none')}
          >
            {content}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export type PinnedCalloutProps = Omit<ComponentProps<'div'>, 'popover'> & {
  /** The element the callout points at. */
  anchor: RefObject<HTMLElement | null>;
  variant?: CalloutVariant;
  /**
   * Where it goes. `right` falls back to `bottom-start` when there is no
   * room; the others hold their side.
   */
  placement?: 'right' | 'bottom-start' | CalloutSide;
};

const AREA: Record<NonNullable<PinnedCalloutProps['placement']>, string> = {
  right: 'right span-bottom',
  'bottom-start': 'bottom span-right',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
};

const OFFSET: Record<NonNullable<PinnedCalloutProps['placement']>, string> = {
  right: 'ms-1.5',
  'bottom-start': 'mt-1.5',
  top: 'mb-1.5',
  bottom: 'mt-1.5',
  left: 'me-1.5',
};

/**
 * A callout that stays while a state holds, such as a field error. It has
 * no trigger, moves no focus and never dismisses. It is a manual popover in
 * the top layer placed with CSS anchor positioning, so it never joins Base
 * UI's dismiss stack: Escape and a tap outside still reach the dialog
 * beneath it.
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
  const name = `--callout-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useLayoutEffect(() => {
    const target = anchor.current;
    if (!target) return;
    const names = () =>
      (target.style.getPropertyValue('anchor-name') || '')
        .split(',')
        .map((n) => n.trim())
        .filter((n) => n && n !== name);
    target.style.setProperty('anchor-name', [...names(), name].join(', '));
    return () => {
      const rest = names();
      if (rest.length) target.style.setProperty('anchor-name', rest.join(', '));
      else target.style.removeProperty('anchor-name');
    };
  }, [anchor, name]);

  const own = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = own.current;
    if (!el || el.matches(':popover-open')) return;
    el.showPopover();
  });

  return (
    <div
      {...props}
      ref={(el) => {
        own.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      popover="manual"
      className={cn(
        calloutClasses(variant),
        'fixed inset-auto m-0 overflow-visible',
        OFFSET[placement],
        placement === 'right' && 'callout-fallback-bottom-start',
        className
      )}
      style={
        {
          positionAnchor: name,
          positionArea: AREA[placement],
          ...style,
        } as CSSProperties
      }
    />
  );
}
