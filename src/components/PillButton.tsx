import { Toggle } from '@base-ui/react/toggle';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PillButtonProps = Omit<ComponentProps<typeof Toggle>, 'className'> & {
  className?: string;
  size?: 'sm' | 'md';
  /** A count after the label, such as the items the filter would show. */
  count?: ReactNode;
};

/**
 * A rounded filter pill that stays pressed while its filter is on. A row
 * of them narrows one list; each toggles on its own.
 */
export function PillButton({ size = 'md', count, className, children, ...props }: PillButtonProps) {
  return (
    <Toggle
      {...props}
      className={cn(
        'inline-flex shrink-0 select-none items-center gap-1.5 whitespace-nowrap rounded-full border border-edge font-medium text-ink-muted outline-none transition-colors',
        'hover:bg-hover hover:text-ink focus-visible:focus-ring [&_svg]:shrink-0',
        'data-pressed:border-transparent data-pressed:bg-accent-bg data-pressed:text-accent-ink',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        size === 'sm' ? 'h-6 px-2.5 text-xs [&_svg]:size-3.5' : 'h-8 px-3 text-sm [&_svg]:size-4',
        className
      )}
    >
      {children}
      {count != null && <span className="text-xs tabular-nums opacity-70">{count}</span>}
    </Toggle>
  );
}
