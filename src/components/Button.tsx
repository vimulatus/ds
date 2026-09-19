import { Button as Base } from '@base-ui/react/button';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Tooltip, type TooltipProps } from './Tooltip';

export type ButtonVariant = 'ghost' | 'outlined' | 'accent' | 'danger' | 'cta';
export type ButtonSize = 'sm' | 'md' | 'icon-sm' | 'icon-md';

const VARIANT: Record<ButtonVariant, string> = {
  ghost: 'text-ink-muted hover:bg-hover hover:text-ink data-popup-open:bg-hover data-popup-open:text-ink',
  outlined: 'glass bg-surface/70 text-ink-muted hover:bg-hover hover:text-ink data-popup-open:bg-hover',
  accent: 'glass bg-accent-bg text-accent-ink hover:bg-accent/25',
  danger: 'glass bg-failure-bg text-failure-ink hover:bg-failure/25',
  cta: 'glass bg-accent text-accent-contrast hover:bg-accent/90',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-6 gap-1 px-2 text-xs touch:h-8 touch:px-3 [&_svg]:size-3',
  md: 'h-8 gap-2 px-2 text-sm touch:h-10 touch:px-4 [&_svg]:size-3.5',
  'icon-sm': 'size-6 touch:size-8 [&_svg]:size-3.5',
  'icon-md': 'size-8 touch:size-10 [&_svg]:size-4',
};

/** The classes of a button, for an element that must stay a link or a trigger. */
export function buttonClasses({
  variant = 'ghost',
  size = 'md',
}: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-md font-medium outline-none transition-colors',
    'focus-visible:focus-ring [&_svg]:shrink-0',
    'disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50',
    VARIANT[variant],
    SIZE[size]
  );
}

export type ButtonProps = Omit<ComponentProps<typeof Base>, 'className'> & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The accessible name and tooltip. Required for an icon-only button. */
  label?: string;
  /** A key combination shown in the tooltip, such as "⌘K". */
  shortcut?: string;
  /** Which side of the button the tooltip opens on. */
  tooltipSide?: TooltipProps['side'];
};

/**
 * Triggers an action. `variant` carries emphasis, `size` carries density.
 * Give a screen at most one `cta`.
 */
export function Button({ variant, size, label, shortcut, tooltipSide, className, ...props }: ButtonProps) {
  const button = (
    <Base
      aria-label={label}
      {...props}
      className={cn(buttonClasses({ variant, size }), className)}
    />
  );
  if (!label) return button;
  return (
    <Tooltip content={label} shortcut={shortcut} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
