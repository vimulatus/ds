import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ItemProps = Omit<ComponentProps<'button'>, 'children'> & {
  icon?: ReactNode;
  label: ReactNode;
  /** A quieter second line under the label. */
  description?: ReactNode;
  /** Trailing: a count, a time, a hotkey. */
  meta?: ReactNode;
  /** Set it, even to false, and the row becomes selectable. */
  selected?: boolean;
};

/**
 * A list row: an icon, a label, trailing meta. Hover lifts it to `bg-hover`;
 * a selected row keeps that fill and turns its ink up. It is a button, so
 * give it `onClick` or `selected`.
 */
export function Item({ icon, label, description, meta, selected, className, ...props }: ItemProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...props}
      className={cn(
        'flex w-full min-w-0 select-none items-center gap-2 rounded-md px-2 text-left text-sm text-ink-muted outline-none transition-colors',
        description ? 'py-1.5' : 'h-8',
        'hover:bg-hover hover:text-ink focus-visible:focus-ring',
        'aria-pressed:bg-hover aria-pressed:text-ink touch:min-h-11',
        'disabled:pointer-events-none disabled:text-ink-disabled',
        className
      )}
    >
      {icon && <span className="flex shrink-0 text-ink-subtle [&_svg]:size-4">{icon}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{label}</span>
        {description && <span className="truncate text-xs text-ink-subtle">{description}</span>}
      </span>
      {meta && <span className="shrink-0 text-xs text-ink-subtle tabular-nums">{meta}</span>}
    </button>
  );
}
