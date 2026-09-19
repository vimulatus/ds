import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Outlined buttons joined into one control: one rim, shared hairlines,
 * rounded only at the ends. For a few actions on the same thing, such as
 * previous and next. Name the group with `aria-label`.
 */
export function ButtonGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="group"
      {...props}
      className={cn(
        'inline-flex items-center',
        '*:rounded-none *:first:rounded-l-md *:last:rounded-r-md [&>*+*]:-ml-px',
        '*:focus-visible:relative *:focus-visible:z-10',
        className
      )}
    />
  );
}
