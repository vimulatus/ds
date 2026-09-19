import type { ComponentProps } from 'react';
import { buttonClasses } from '@/components/Button';
import { cn } from '@/lib/cn';

export type BadgeVariant = 'ghost' | 'outlined';
export type BadgeSize = 'sm' | 'md';
export type BadgeVariantProps = { variant?: BadgeVariant; size?: BadgeSize };

const VARIANT: Record<BadgeVariant, string> = {
  ghost: 'bg-transparent text-ink-muted',
  outlined: 'bg-transparent text-ink-muted border-edge-muted',
};

/** Button's control sizes, so a badge and a button of one size share a line. */
const SIZE: Record<BadgeSize, string> = {
  sm: "h-6 gap-1 px-2 text-xs [&>svg:not([class*='size-'])]:size-3",
  md: "h-8 gap-2 px-2 text-sm [&>svg:not([class*='size-'])]:size-3.5",
};

/** The badge's base and variant classes. */
export function badgeVariants({ variant = 'ghost', size = 'md' }: BadgeVariantProps = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap',
    'rounded-full border border-transparent font-medium',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    VARIANT[variant],
    SIZE[size]
  );
}

export type BadgeClassOptions = BadgeVariantProps & { className?: string };

/** The classes of a badge, for an element that must look like one. */
export function badgeClasses({ variant, size, className }: BadgeClassOptions = {}) {
  return cn(badgeVariants({ variant, size }), className, 'rounded-full');
}

/** Button's hover, press and focus states in a badge's shape, for a badge that is a trigger. */
export function badgeTriggerClasses({ variant = 'ghost', size = 'md', className }: BadgeClassOptions = {}) {
  return cn(
    buttonClasses({ variant, size, noTouchResize: true, className }),
    'focus-visible:ring-2 focus-visible:ring-accent/20',
    'rounded-full'
  );
}

export type BadgeProps = ComponentProps<'span'> & BadgeVariantProps;

/**
 * A short, non-interactive label for a status, a count or a tag, on
 * Button's size scale. For a badge that acts, put `badgeTriggerClasses` on
 * a real button.
 */
export function Badge({ variant = 'ghost', size = 'md', className, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      {...props}
      className={badgeClasses({ variant, size, className })}
    />
  );
}
