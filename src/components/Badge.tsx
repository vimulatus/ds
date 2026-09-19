import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { HUE_CLASSES, type Hue } from '@/lib/hue';

export type BadgeVariant = 'ghost' | 'outlined';
export type BadgeSize = 'sm' | 'md';

const VARIANT: Record<BadgeVariant, string> = {
  ghost: 'text-ink-muted',
  outlined: 'border border-edge text-ink-muted',
};

const SIZE: Record<BadgeSize, string> = {
  sm: 'h-5 min-w-5 gap-1 px-1.5 text-xs [&_svg]:size-3',
  md: 'h-6 min-w-6 gap-1.5 px-2 text-xs [&_svg]:size-3.5',
};

/** The classes of a badge, for a trigger that must look like one. */
export function badgeClasses({
  variant = 'outlined',
  size = 'md',
  hue,
}: { variant?: BadgeVariant; size?: BadgeSize; hue?: Hue | 'accent' } = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium tabular-nums [&_svg]:shrink-0',
    VARIANT[variant],
    SIZE[size],
    hue === 'accent' && 'border-transparent bg-accent-bg text-accent-ink',
    hue && hue !== 'accent' && cn('border-transparent', HUE_CLASSES[hue].tint)
  );
}

export type BadgeProps = ComponentProps<'span'> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** A tint for identity or state. A tinted badge drops its edge. */
  hue?: Hue | 'accent';
};

/**
 * A count or a short label: a word or two, never an action. `sm` and `md`
 * sit on the same line as a Button of the same size.
 */
export function Badge({ variant, size, hue, className, ...props }: BadgeProps) {
  return <span {...props} className={cn(badgeClasses({ variant, size, hue }), className)} />;
}
