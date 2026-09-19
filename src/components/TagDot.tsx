import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { HUE_CLASSES, type Hue } from '@/lib/hue';

export type TagDotProps = ComponentProps<'span'> & {
  /** The dot's color. Without one the dot is `ink-extra-muted`. */
  hue?: Hue;
  size?: 'sm' | 'md';
};

/**
 * A colored dot before a label: a tag, a calendar, a project. Pass the label
 * as children so color is never the only thing that tells two tags apart.
 */
export function TagDot({ hue, size = 'md', className, children, ...props }: TagDotProps) {
  const dot = (
    <span
      aria-hidden
      className={cn(
        'shrink-0 rounded-full',
        size === 'sm' ? 'size-2' : 'size-2.5',
        hue ? HUE_CLASSES[hue].fill : 'bg-ink-extra-muted'
      )}
    />
  );
  if (children == null) return dot;
  return (
    <span {...props} className={cn('inline-flex min-w-0 items-center gap-2 text-sm text-ink', className)}>
      {dot}
      <span className="truncate">{children}</span>
    </span>
  );
}
