import { Popover as Base } from '@base-ui/react/popover';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { type ButtonSize, type ButtonVariant, buttonClasses } from './Button';

/**
 * Interactive content anchored to a trigger: a filter, a picker, a short
 * form. It paints the menu's glass surface. Use `Tooltip` for a label and
 * `Menu` for a list of actions.
 */
export const Popover = Base.Root;
export const PopoverClose = Base.Close;

export type PopoverTriggerProps = Omit<ComponentProps<typeof Base.Trigger>, 'className'> & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** Opens the popover. Styled as a `Button`, and lit while it is open. */
export function PopoverTrigger({ variant = 'outlined', size = 'md', className, ...props }: PopoverTriggerProps) {
  return <Base.Trigger {...props} className={cn(buttonClasses({ variant, size }), className)} />;
}

export type PopoverContentProps = Omit<ComponentProps<typeof Base.Popup>, 'className'> & {
  className?: string;
  side?: ComponentProps<typeof Base.Positioner>['side'];
  align?: ComponentProps<typeof Base.Positioner>['align'];
};

export function PopoverContent({ side, align = 'start', className, ...props }: PopoverContentProps) {
  return (
    <Base.Portal>
      <Base.Positioner side={side} align={align} sideOffset={6} className="z-popover outline-none">
        <Base.Popup
          {...props}
          className={cn(
            'motion-pop glass flex w-64 flex-col gap-3 rounded-lg border border-edge-muted bg-menu-glass p-3 text-sm text-ink outline-none',
            className
          )}
        />
      </Base.Positioner>
    </Base.Portal>
  );
}

type TextProps = { className?: string; children?: ReactNode };

export function PopoverTitle({ className, children }: TextProps) {
  return <Base.Title className={cn('text-sm font-medium text-ink', className)}>{children}</Base.Title>;
}

export function PopoverDescription({ className, children }: TextProps) {
  return (
    <Base.Description className={cn('text-sm text-ink-muted', className)}>{children}</Base.Description>
  );
}
